const fetch = require("node-fetch");
const API_KEY = "da137f2b-3029-4bee-9978-9108a07e5cfc";

/**
 * Get routes between source and destination using GraphHopper API
 * @param {Object} source - { lat, lng }
 * @param {Object} destination - { lat, lng }
 * @returns {Promise<Array>} Array of route objects
 */
async function getRoutes(source, destination) {
  const url = `https://graphhopper.com/api/1/route?point=${source.lat},${source.lng}&point=${destination.lat},${destination.lng}&vehicle=car&key=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorData.message}`);
    }
    const data = await response.json();
    if (data.paths && data.paths.length > 0) {
      // Return array of route summaries
      return data.paths.map(routeInfo => ({
        distance: routeInfo.distance / 1000, // km
        time: (routeInfo.time / 1000) / 60, // minutes
        points: routeInfo.points
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("❌ A request error occurred:", error.message);
    return [];
  }
}

module.exports = { getRoutes };