const express = require("express");
const router = express.Router();
const { updateAnalytics, getAnalytics } = require("../controllers/analyticcontrollers");
const { protect } = require("../middleware/authmiddleware");

router.post("/update", protect, updateAnalytics);
router.get("/get", protect, getAnalytics);

module.exports = router;