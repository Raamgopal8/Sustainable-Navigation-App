// models/Report.js
const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  lat: Number,
  lon: Number,
  type: { type: String }, // e.g., "smoke", "dust", "construction", "traffic"
  description: String,
  votes: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Report", ReportSchema);

