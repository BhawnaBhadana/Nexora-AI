const express = require("express");
const router = express.Router();
const { createPlan, getPlans, toggleTopic, deletePlan } = require("../controllers/studyplancontrollers");
const { protect } = require("../middleware/authmiddleware");

router.post("/create", protect, createPlan);
router.get("/get", protect, getPlans);
router.post("/toggle", protect, toggleTopic);
router.delete("/:id", protect, deletePlan);

module.exports = router;