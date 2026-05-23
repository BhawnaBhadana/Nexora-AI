const StudyPlan = require("../models/studyplan");
exports.createPlan = async (req, res) => {
  try {
    const { subject, topics, examDate } = req.body;
    const topicList = topics.map(t => ({ title: t, completed: false }));
    const plan = await StudyPlan.create({ userId: req.user.id, subject, topics: topicList, examDate });
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleTopic = async (req, res) => {
  try {
    const { planId, topicIndex } = req.body;
    const plan = await StudyPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    plan.topics[topicIndex].completed = !plan.topics[topicIndex].completed;
    plan.topics[topicIndex].completedAt = plan.topics[topicIndex].completed ? new Date().toISOString() : "";
    await plan.save();
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    await StudyPlan.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};