// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  healthCondition: { type: String, enum: ["asthma", "heart", "general"], default: "general" },
  pollutantPreferences: { type: Map, of: Number }, // optional weights per pollutant
  greenPoints: { type: Number, default: 0 },
  routeHistory: [
    {
      source: String,
      destination: String,
      chosenRouteSummary: String,
      score: Number,
      awardedPoints: Number,
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);

