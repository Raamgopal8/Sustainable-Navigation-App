// routes/reports.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Report = require("../models/Report");

// Submit report (auth optional)
router.post("/", async (req, res) => {
  try {
    const { lat, lon, type, description } = req.body;
    if (!lat || !lon || !type) return res.status(400).json({ error: "Missing fields" });

    const report = new Report({ lat, lon, type, description });
    await report.save();
    res.json({ message: "Report saved", report });
  } catch (err) {
    console.error("Report error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Upvote a report
router.post("/:id/vote", async (req, res) => {
  try {
    const r = await Report.findById(req.params.id);
    if (!r) return res.status(404).json({ error: "Not found" });
    r.votes = (r.votes || 0) + 1;
    await r.save();
    res.json({ message: "Voted", votes: r.votes });
  } catch (err) {
    console.error("Vote error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get recent reports
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find({}).sort({ createdAt: -1 }).limit(100);
    res.json({ reports });
  } catch (err) {
    console.error("Get reports error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

