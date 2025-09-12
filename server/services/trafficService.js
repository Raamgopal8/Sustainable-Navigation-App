// services/trafficService.js
// In our implementation the route duration is already fetched from Google
// This module is kept for future extension (live traffic tiles / traffic models)

const getTraffic = async (route) => {
  try {
    return route.legs && route.legs[0] && route.legs[0].duration && route.legs[0].duration.value ? route.legs[0].duration.value : 9999;
  } catch (err) {
    console.error("Traffic service error:", err.message);
    return 9999;
  }
};

module.exports = { getTraffic };
