import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import axios from "axios";


export default function HomeScreen() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [mapCenter, setMapCenter] = useState(null);
  const [loading, setLoading] = useState(false);

  // TODO: Replace with your actual Google Maps Geocoding API key
  const GEOTAG_API_KEY = "pk.aa5bbd56aa898cd16d711a045d52a2c9";

  // Geocode a place name to lat/lng using Google Maps Geocoding API
  const geocodePlace = async (place) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=${GEOTAG_API_KEY}`;
    const res = await axios.get(url);
    if (
      res.data.status === "OK" &&
      res.data.results &&
      res.data.results.length > 0
    ) {
      const loc = res.data.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng };
    } else {
      throw new Error(`Could not geocode: ${place}`);
    }
  };

  const fetchRoute = async () => {
    try {
      setLoading(true);

      // Geocode source and destination
      const srcLoc = await geocodePlace(source);
      const destLoc = await geocodePlace(destination);

      // Center map on source
      setMapCenter({ latitude: srcLoc.lat, longitude: srcLoc.lng });

      // Call your backend API for best route
      const res = await axios.post("http://localhost:5000/route", {
        source: [srcLoc.lng, srcLoc.lat], // ORS expects [lng,lat]
        destination: [destLoc.lng, destLoc.lat],
      });

      const geometry = res.data.geometry.coordinates;
      const coords = geometry.map(([lng, lat]) => ({
        latitude: lat,
        longitude: lng,
      }));

      setRouteCoords(coords);

      // Recenter map on first route point
      if (coords.length > 0) {
        setMapCenter(coords[0]);
      }
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
          region={{
            latitude: mapCenter.latitude,
            longitude: mapCenter.longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}
        >
          {routeCoords.length > 0 && (
            <>
              <Polyline
                coordinates={routeCoords}
                strokeColor="blue"
                strokeWidth={4}
              />
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
