
const express = require('express');
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');
const OpenAI = require('openai');

const router = express.Router();
const { protect: authMiddleware } = require('../middleware/authmiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and DOCX files are allowed'));
  }
});

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com'
});

async function extractTextFromFile(file) {
  if (file.mimetype === 'application/pdf') {
    const parser = new PDFParse({ data: file.buffer });
    const result = await parser.getText();
    return result.text;
  }
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }
  throw new Error('Unsupported file type');
}

const ATS_PROMPT = `You are an expert ATS (Applicant Tracking System) resume auditor. Analyze the resume text below and return ONLY valid JSON (no markdown fences, no preamble) matching this exact shape:

{
  "overallScore": <integer 0-100>,
  "verdict": "<one short headline, e.g. 'Good shape, a few quick fixes'>",
  "breakdown": {
    "formatting": <integer 0-100>,
    "keywords": <integer 0-100>,
    "sections": <integer 0-100>,
    "readability": <integer 0-100>
  },
  "strengths": ["<short bullet>", ...max 4],
  "issues": ["<short, specific, actionable bullet>", ...max 6],
  "missingKeywords": ["<keyword>", ...max 10]
}

Scoring guidance:
- formatting: penalizes tables, columns, images, headers/footers, unusual fonts, non-standard section order — things that break ATS parsing.
- keywords: how well the resume's terms match the job description (if provided) or general role-relevant keywords (if not).
- sections: presence of standard sections (contact, summary, experience, education, skills) with clear headers.
- readability: clarity, bullet usage, quantified achievements, consistent tense, length.

Resume text:
"""
{{RESUME_TEXT}}
"""

{{JOB_DESC_BLOCK}}

Return ONLY the JSON object.`;

router.post('/score', authMiddleware, upload.single('resumeFile'), async (req, res) => {
  try {
    let resumeText = req.body.resumeText || '';
    const jobDescription = req.body.jobDescription || '';

    if (req.file) {
      const fileText = await extractTextFromFile(req.file);
      // Prefer extracted file text; fall back to pasted text if extraction is thin
      resumeText = fileText && fileText.trim().length > 50 ? fileText : resumeText;
    }

    resumeText = resumeText.trim();
    if (!resumeText) {
      return res.status(400).json({ error: 'No resume text found. Paste text or upload a readable PDF/DOCX.' });
    }
    if (resumeText.length > 15000) {
      resumeText = resumeText.slice(0, 15000);
    }

    const jobDescBlock = jobDescription
      ? `Target job description:\n"""\n${jobDescription.slice(0, 4000)}\n"""`
      : 'No job description provided — score against general best practices for the resume\'s apparent role.';

    const prompt = ATS_PROMPT
      .replace('{{RESUME_TEXT}}', resumeText)
      .replace('{{JOB_DESC_BLOCK}}', jobDescBlock);

    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      max_tokens: 1200,
      temperature: 0.3,
      messages: [
        { role: 'system', content: 'You are an expert ATS (Applicant Tracking System) resume auditor. Always return ONLY valid JSON, no markdown fences, no preamble.' },
        { role: 'user', content: prompt }
      ]
    });
    let raw = response.choices[0].message.content.trim();

    // Strip accidental markdown fences
    raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error('ATS JSON parse failed:', raw);
      return res.status(502).json({ error: 'AI returned an unexpected format. Please try again.' });
    }

    // Basic shape safety net
    parsed.overallScore = Math.max(0, Math.min(100, Number(parsed.overallScore) || 0));

    return res.json(parsed);
  } catch (err) {
    console.error('ATS score error:', err);
    if (err.message && err.message.includes('Only PDF')) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to analyze resume. Please try again.' });
  }
});

module.exports = router;