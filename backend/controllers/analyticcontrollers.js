const User = require("../models/user");

exports.updateAnalytics = async (req, res) => {
  try {
    const { type, correct, total, topic } = req.body;
    const user = await User.findById(req.user.id);
    const a = user.analytics;
    const today = new Date().toISOString().split("T")[0];
    const dayIndex = new Date().getDay();

    if (type === "doubt") a.doubtsAsked += 1;
    if (type === "notes") {
      a.notesGenerated += 1;
      if (topic && !a.topicsCompleted.includes(topic)) a.topicsCompleted.push(topic);
    }
    if (type === "test") {
      a.testsAttempted += 1;
      a.correctAnswers += correct || 0;
      a.totalAnswers += total || 0;
    }

    a.weeklyActivity[dayIndex] = (a.weeklyActivity[dayIndex] || 0) + 1;
    a.dailyHeatmap.set(today, (a.dailyHeatmap.get(today) || 0) + 1);

    if (a.lastStudyDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split("T")[0];
      a.studyStreak = a.lastStudyDate === yStr ? a.studyStreak + 1 : 1;
      a.lastStudyDate = today;
    }

    await user.save();
    res.json({ analytics: user.analytics });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("analytics name");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};