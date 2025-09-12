// routes/routes.js
const express = require("express");
const router = express.Router();
const googleService = require("../services/googleService");
const airQualityService = require("../services/airQualityService");
const trafficService = require("../services/trafficService");
const auth = require("../middleware/auth");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// health sensitivity mapping (weights per pollutant)
const defaultSensitivity = {
  asthma: { pm2_5: 1.5, o3: 1.2, pm10: 0.5, no2: 0.8, co: 0.4 },
  heart: { pm2_5: 1.4, co: 1.3, pm10: 0.6, no2: 0.7 },
  general: {}
};

// Helper: compute score
function computeScore({ trafficMinutes, aqi, pollutants, sensitivityMap }) {
  const TRAFFIC_WEIGHT = 1.0;
  const AQI_WEIGHT = 50.0;
  const POLLUTANT_WEIGHT = 0.08;

  let healthPenalty = 0;
  for (const [poll, w] of Object.entries(sensitivityMap || {})) {
    const val = pollutants[poll] || 0;
    healthPenalty += val * w;
  }

  const score =
    TRAFFIC_WEIGHT * trafficMinutes +
    AQI_WEIGHT * aqi +
    POLLUTANT_WEIGHT * healthPenalty;

  return { score, components: { trafficMinutes, aqi, healthPenalty } };
}

// Optimize endpoint
router.post("/optimize", async (req, res) => {
  try {
    const token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : null;
    let user = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id);
      } catch (e) {
        /* ignore invalid token */
      }
    }

    let { source, destination, healthCondition, preferQuick } = req.body;
    console.log('Received source:', source, 'destination:', destination);
    // Accept arrays or objects for source/destination
    if (Array.isArray(source)) {
      source = { lng: source[0], lat: source[1] };
    }
    if (Array.isArray(destination)) {
      destination = { lng: destination[0], lat: destination[1] };
    }
    if (!source || !destination || !source.lat || !source.lng || !destination.lat || !destination.lng) {
      return res.status(400).json({ error: "source and destination required and must have lat/lng" });
    }

    // Step 1: get routes
    const routes = await googleService.getRoutes(source, destination);
    if (!routes || routes.length === 0) {
      return res.status(500).json({ error: "No routes from Google" });
    }

    // Prepare sensitivity map
    const condition =
      healthCondition || (user && user.healthCondition) || "general";
    const sensitivityMap = { ...defaultSensitivity[condition] };

    if (user && user.pollutantPreferences) {
      for (const [k, v] of user.pollutantPreferences.entries()) {
        sensitivityMap[k] = v;
      }
    }

    // Step 2: evaluate each route
    const enriched = await Promise.all(
      routes.map(async (route) => {
        const durationSec =
          route.legs &&
          route.legs[0] &&
          route.legs[0].duration &&
          route.legs[0].duration.value
            ? route.legs[0].duration.value
            : 9999;

        const trafficMinutes = Math.round(durationSec / 60);

        const pollutants = await airQualityService.getPollutantsFromPolyline(
          route.overview_polyline
        );

        const { score, components } = computeScore({
          trafficMinutes,
          aqi: pollutants.aqi || 5,
          pollutants,
          sensitivityMap
        });

        return {
          ...route,
          pollutants,
          trafficMinutes,
          score,
          scoreComponents: components,
          distance: route.legs && route.legs[0] && route.legs[0].distance && route.legs[0].distance.value ? route.legs[0].distance.value : null,
          duration: route.legs && route.legs[0] && route.legs[0].duration && route.legs[0].duration.value ? route.legs[0].duration.value : null
        };
      })
    );

    // Step 3: bias for preferQuick
    if (preferQuick) {
      enriched.forEach((r) => (r.score *= 0.98));
    }

    enriched.sort((a, b) => a.score - b.score);

    const best = enriched[0];
    const alternatives = enriched;

    // Step 4: award Green Points
    let awarded = 0;
    if (user) {
      const worstScore = Math.max(...enriched.map((r) => r.score));
      const diff = Math.max(0, worstScore - best.score);
      awarded = Math.max(1, Math.round(diff / 10));
      user.greenPoints = (user.greenPoints || 0) + awarded;

      user.routeHistory.push({
        source,
        destination,
        summary: best.summary || "Best",
        score: best.score,
        awardedPoints: awarded
      });

      await user.save();
    }

    res.json({
      bestRoute: best,
      alternatives,
      awardedPoints: awarded
    });
  } catch (err) {
    console.error("Optimize error:", err.message, err.stack);
    res.status(500).json({ error: "Optimization failed", detail: err.message });
  }
});

// Mark route as completed and increase green points
router.post("/complete", auth, async (req, res) => {
  try {
    const { routeSummary } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.greenPoints = (user.greenPoints || 0) + 10;
    user.routeHistory.push({
      summary: routeSummary,
      completed: true,
      date: new Date()
    });

    await user.save();
    res.json({ greenPoints: user.greenPoints });
  } catch (err) {
    res.status(500).json({ error: "Failed to update green points" });
  }
});

module.exports = router;
