const mongoose = require("mongoose");

const studyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  topics: [{
    title: String,
    completed: { type: Boolean, default: false },
    completedAt: String
  }],
  examDate: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("StudyPlan", studyPlanSchema);