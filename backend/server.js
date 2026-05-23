require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/ai", require("./routes/airoutes"));
app.use("/api/analytics", require("./routes/analyticroutes"));
app.use("/api/plan", require("./routes/studyplanroutes"));

app.get("/", (req, res) => res.send("Nexora AI backend running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));