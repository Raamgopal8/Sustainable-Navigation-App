// routes/leaderboard.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// top users by Green Points
router.get("/", async (req, res) => {
  try {
    const top = await User.find({}).sort({ greenPoints: -1 }).limit(20).select("name greenPoints");
    res.json({ leaderboard: top });
  } catch (err) {
    console.error("Leaderboard error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

