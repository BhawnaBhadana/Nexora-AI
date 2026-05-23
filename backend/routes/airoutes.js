const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
    console.error("Ask AI error:", err.message);
    res.status(500).json({ message: "AI error", error: err.message });
  }
});

router.post("/image", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
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
    console.error("Image AI error:", err.message);
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
        {
          role: "user",
          content: `Generate a professional resume: ${JSON.stringify(userData)}`
        }
      ]
    });
    res.json({ result: response.choices[0].message.content });
  } catch (err) {
    console.error("Resume error:", err.message);
    res.status(500).json({ message: "Resume error", error: err.message });
  }
});

module.exports = router;