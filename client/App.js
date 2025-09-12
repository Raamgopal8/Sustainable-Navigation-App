import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import axios from "axios";

export default function HomeScreen() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [mapCenter, setMapCenter] = useState(null); // no default SF
  const [loading, setLoading] = useState(false);

  const fetchRoute = async () => {
    try {
      setLoading(true);

      // Parse input coordinates
      const [srcLat, srcLng] = source.split(",").map(Number);
      const [destLat, destLng] = destination.split(",").map(Number);

      if (!srcLat || !srcLng || !destLat || !destLng) {
        alert("Enter coordinates as: lat,lng");
        setLoading(false);
        return;
      }

      // Immediately center map on source input
      setMapCenter({ latitude: srcLat, longitude: srcLng });

      // Call your backend API for ORS route
      const res = await axios.post("http://localhost:5000/route", {
        source: [srcLng, srcLat], // ORS expects [lng,lat]
        destination: [destLng, destLat],
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
      alert("Error fetching route");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Source (lat,lng):</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 13.0827,80.2707"
        value={source}
        onChangeText={setSource}
      />

      <Text style={styles.label}>Destination (lat,lng):</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 12.9716,77.5946"
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
