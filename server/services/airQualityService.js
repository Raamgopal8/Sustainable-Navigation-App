// services/airQualityService.js
const axios = require("axios");
const decodePolyline = require("../utils/decodePolyline");

// OpenWeather Air Pollution API
// Expects polyline string -> decode -> take midpoint -> call API

async function getPollutantsFromPolyline(polyline) {
  try {
    if (!polyline) {
      return fallbackPollutants();
    }
    const points = decodePolyline(polyline);
    if (!points || points.length === 0) return fallbackPollutants();
    const mid = points[Math.floor(points.length / 2)];
    const lat = mid.lat;
    const lon = mid.lng;

    const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.AIR_QUALITY_API_KEY}`;
    const res = await axios.get(url, { timeout: 8000 });
    const data = res.data && res.data.list && res.data.list[0];
    if (!data) return fallbackPollutants();

    const components = data.components || {};
    return {
      aqi: data.main && data.main.aqi ? data.main.aqi : 5,
      pm2_5: round(components.pm2_5),
      pm10: round(components.pm10),
      o3: round(components.o3),
      co: round(components.co),
      no2: round(components.no2),
      so2: round(components.so2),
      nh3: round(components.nh3)
    };
  } catch (err) {
    console.error("AirQualityService error:", err.message);
    return fallbackPollutants();
  }
}

function fallbackPollutants() {
  // Conservative defaults (worst)
  return { aqi: 5, pm2_5: 150, pm10: 200, o3: 120, co: 10, no2: 100, so2: 50, nh3: 10 };
}
function round(v) { return v ? Math.round(v * 10) / 10 : 0; }

module.exports = { getPollutantsFromPolyline };

