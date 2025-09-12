import React, { useState } from "react";
import decodePolyline from "./utils/decodePolyline";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import axios from "axios";

export default function HomeScreen() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [mapCenter, setMapCenter] = useState(null);
  const [loading, setLoading] = useState(false);

  // TODO: Replace with your actual LocationIQ API key
  const LOCATIONIQ_API_KEY = "pk.aa5bbd56aa898cd16d711a045d52a2c9";

  // Geocode a place name to lat/lng
  const geocodePlace = async (place) => {
    const url = `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(
      place
    )}&format=json`;
    const res = await axios.get(url);

    if (Array.isArray(res.data) && res.data.length > 0) {
      const loc = res.data[0];
      return { lat: parseFloat(loc.lat), lng: parseFloat(loc.lon) };
    } else {
      throw new Error(`Could not geocode: ${place}`);
    }
  };

  const fetchRoute = async () => {
    console.log("fetchRoute called");
    setLoading(true);
    try {
      let srcLoc, destLoc;

      try {
        srcLoc = await geocodePlace(source);
        console.log("Geocoded source:", srcLoc);
      } catch (e) {
        alert("Could not geocode source: " + source);
        return;
      }

      try {
        destLoc = await geocodePlace(destination);
        console.log("Geocoded destination:", destLoc);
      } catch (e) {
        alert("Could not geocode destination: " + destination);
        return;
      }

      setMapCenter({ latitude: srcLoc.lat, longitude: srcLoc.lng });
      console.log("Calling backend...");

      const res = await axios.post(
        "http://192.168.201.163:5000/api/routes/optimize",
        {
          source: { lat: srcLoc.lat, lng: srcLoc.lng },
          destination: { lat: destLoc.lat, lng: destLoc.lng },
        }
      );

      console.log("Backend response:", res.data);
      const bestRoute = res.data.bestRoute;
      let coords = [];

      if (bestRoute && bestRoute.overview_polyline) {
        if (typeof bestRoute.overview_polyline === "string") {
          coords = decodePolyline(bestRoute.overview_polyline);
        } else if (bestRoute.overview_polyline.points) {
          coords = decodePolyline(bestRoute.overview_polyline.points);
        }
      }

      console.log("Decoded coords:", coords);
      setRouteCoords(coords);
    } catch (err) {
      console.error(err);
      alert("Error fetching route or geocoding place name");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Source (place name):</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Chennai"
        value={source}
        onChangeText={setSource}
      />

      <Text style={styles.label}>Destination (place name):</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Erode"
        value={destination}
        onChangeText={setDestination}
      />

      <Button title={loading ? "Loading..." : "Get Route"} onPress={fetchRoute} />

      {mapCenter && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: mapCenter.latitude,
            longitude: mapCenter.longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}
        >
          {routeCoords.length > 0 && (
            <>
              <Polyline coordinates={routeCoords} strokeColor="blue" strokeWidth={4} />
              <Marker coordinate={routeCoords[0]} title="Start" />
              <Marker
                coordinate={routeCoords[routeCoords.length - 1]}
                title="End"
              />
            </>
          )}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  map: {
    flex: 1,
    marginTop: 10,
  },
});
