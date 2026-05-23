const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  plan: { type: String, default: "free" },
  analytics: {
    doubtsAsked: { type: Number, default: 0 },
    notesGenerated: { type: Number, default: 0 },
    testsAttempted: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    totalAnswers: { type: Number, default: 0 },
    studyStreak: { type: Number, default: 0 },
    lastStudyDate: { type: String, default: "" },
    weeklyActivity: { type: [Number], default: [0,0,0,0,0,0,0] },
    topicsCompleted: { type: [String], default: [] },
    dailyHeatmap: { type: Map, of: Number, default: {} }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);