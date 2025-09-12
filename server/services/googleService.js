const fetch = require("node-fetch");
const API_KEY = "da137f2b-3029-4bee-9978-9108a07e5cfc";

/**
 * Get routes between source and destination using GraphHopper API
 * @param {Object} source - { lat, lng }
 * @param {Object} destination - { lat, lng }
 * @returns {Promise<Array>} Array of route objects
 */
async function getRoutes(source, destination) {
  const url = `https://graphhopper.com/api/1/route?point=${source.lat},${source.lng}&point=${destination.lat},${destination.lng}&vehicle=car&key=${API_KEY}&points_encoded=true`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorData.message}`);
    }
    const data = await response.json();
    if (data.paths && data.paths.length > 0) {
      // Return array of route objects matching Google Directions API format
      return data.paths.map(routeInfo => {
        // GraphHopper sometimes returns points as an object {encoded: "..."}
        let encodedPolyline = routeInfo.points;
        if (encodedPolyline && typeof encodedPolyline === 'object' && encodedPolyline.encoded) {
          encodedPolyline = encodedPolyline.encoded;
        }
        return {
          legs: [{
            duration: { value: Math.round(routeInfo.time / 1000) }, // seconds
            distance: { value: Math.round(routeInfo.distance) }, // meters
          }],
          overview_polyline: encodedPolyline,
          summary: routeInfo.description || "Route",
          points: encodedPolyline, // for compatibility with frontend
        };
      });
    } else {
      return [];
    }
  } catch (error) {
    console.error("❌ A request error occurred:", error.message);
    return [];
  }
}

module.exports = { getRoutes };