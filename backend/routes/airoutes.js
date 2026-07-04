const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require("multer");
const pdfParse = require("pdf-parse");

// ─── Clients ───────────────────────────────────────────────────────────────
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com"
});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ─── DEEPSEEK: Text Chat (non-streaming) ──────────────────────────────────
router.post("/ask", async (req, res) => {
  try {
    const { system, message } = req.body;
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
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

// ─── DEEPSEEK: Text Chat (streaming) ──────────────────────────────────────
router.post("/stream", async (req, res) => {
  try {
    const { system, message } = req.body;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const stream = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      max_tokens: 1500,
      stream: true,
      messages: [
        { role: "system", content: system },
        { role: "user", content: message }
      ]
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// ─── GEMINI: Image Understanding (Vision) ─────────────────────────────────
router.post("/image", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: imageBase64
        }
      },
      {
        text: "You are Nexora AI, a study assistant for Indian college students. Analyze this image which contains a question or problem. Solve it step by step. Explain clearly and simply."
      }
    ]);

    const response = await result.response;
    res.json({ result: response.text() });
  } catch (err) {
    res.status(500).json({ message: "Image AI error", error: err.message });
  }
});

// ─── GEMINI: Image Generation ─────────────────────────────────────────────
router.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "Prompt is required" });

    const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-002" });

    const result = await model.generateImages({
      prompt: `${prompt}, high quality, detailed`,
      number_of_images: 1,
      safety_filter_level: "block_some",
      person_generation: "allow_adult",
      aspect_ratio: "16:9"
    });

    if (!result.images || result.images.length === 0) {
      return res.status(500).json({ message: "No image generated" });
    }

    const imageData = result.images[0].imageBytes;
    res.json({
      result: `data:image/png;base64,${imageData}`,
      type: "base64"
    });
  } catch (err) {
    console.error("Gemini image gen error:", err.message);
    res.status(500).json({
      message: "Image generation error",
      error: err.message,
      fallback: true
    });
  }
});

// ─── DEEPSEEK: Resume Builder ──────────────────────────────────────────────
router.post("/resume", async (req, res) => {
  try {
    const { userData } = req.body;
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
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

// ─── DEEPSEEK: PDF Analyzer ────────────────────────────────────────────────
router.post("/pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No PDF uploaded" });
    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text.slice(0, 4000);

    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
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