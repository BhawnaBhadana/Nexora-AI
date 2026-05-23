const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const multer = require("multer");
const pdfParse = require("pdf-parse");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/ask", async (req, res) => {
  try {
    const { system, message } = req.body;
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1500,
      messages: [
        { role: "system", content: system },
        { role: "user", content: message }
      ]
    });
    res.json({ result: response.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ message: "AI error", error: err.message });
  }
});

router.post("/stream", async (req, res) => {
  try {
    const { system, message } = req.body;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1500,
      stream: true,
      messages: [
        { role: "system", content: system },
        { role: "user", content: message }
      ]
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

router.post("/image", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    const response = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      max_tokens: 1500,
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          { type: "text", text: "You are Nexora AI, a study assistant for Indian college students. Analyze this image which contains a question or problem. Solve it step by step. Explain clearly and simply." }
        ]
      }]
    });
    res.json({ result: response.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ message: "Image AI error", error: err.message });
  }
});

router.post("/resume", async (req, res) => {
  try {
    const { userData } = req.body;
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
      messages: [
        {
          role: "system",
          content: `You are Nexora AI resume builder for Indian college students.
          Generate a professional ATS-friendly resume in clean HTML.
          Use only inline styles. Make it look like a real professional resume.
          Use this color scheme: #1a1a1a text, #7F77DD for headings/accents, clean white background.
          Structure: Header with name+contact, Objective, Education, Skills, Projects, Experience, Achievements.
          Return ONLY the HTML div content, no explanation, no markdown backticks.`
        },
        { role: "user", content: `Generate a professional resume: ${JSON.stringify(userData)}` }
      ]
    });
    res.json({ result: response.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ message: "Resume error", error: err.message });
  }
});

router.post("/pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No PDF uploaded" });
    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text.slice(0, 4000);

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
      messages: [
        {
          role: "system",
          content: `You are Nexora AI PDF analyzer for Indian college students.
          Analyze the provided PDF text and:
          1. Give a clear summary
          2. List key concepts
          3. Generate 5 practice questions
          Format EXACTLY:
          SUMMARY:
          [2-3 line summary]
          KEY CONCEPTS:
          [bullet points of main concepts]
          PRACTICE QUESTIONS:
          Q1: [question]
          Q2: [question]
          Q3: [question]
          Q4: [question]
          Q5: [question]`
        },
        { role: "user", content: `Analyze this PDF content: ${text}` }
      ]
    });
    res.json({ result: response.choices[0].message.content, pages: pdfData.numpages });
  } catch (err) {
    res.status(500).json({ message: "PDF error", error: err.message });
  }
});

module.exports = router;