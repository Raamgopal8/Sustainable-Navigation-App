import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import { Image } from "react-native";
import axios from "axios";

// Decode polyline (Google-style encoded polyline)
function decodePolyline(encoded) {
  let points = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }
  return points;
}

export default function HomeScreen({ navigation }) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [mapCenter, setMapCenter] = useState(null);
  const [loading, setLoading] = useState(false);

  const LOCATIONIQ_API_KEY = "pk.aa5bbd56aa898cd16d711a045d52a2c9";

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
    setLoading(true);
    try {
      let srcLoc = await geocodePlace(source);
      let destLoc = await geocodePlace(destination);

      setMapCenter({ latitude: srcLoc.lat, longitude: srcLoc.lng });

      const res = await axios.post("http://192.168.201.163:5000/api/routes/optimize", {
        source: { lat: srcLoc.lat, lng: srcLoc.lng },
        destination: { lat: destLoc.lat, lng: destLoc.lng },
      });

      const bestRoute = res.data.bestRoute;
      let coords = [];

      if (bestRoute && bestRoute.overview_polyline) {
        if (typeof bestRoute.overview_polyline === "string") {
          coords = decodePolyline(bestRoute.overview_polyline);
        } else if (bestRoute.overview_polyline.points) {
          coords = decodePolyline(bestRoute.overview_polyline.points);
        }
      }

      setRouteCoords(coords);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not fetch route");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="green" />

      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.navTitle}>GreenPath</Text>
        <TouchableOpacity onPress={() => Alert.alert("Menu", "Drawer will open here")}>
              <Image source={require("./assets/menu.png")} style={{ width: 28, height: 28, marginTop: 10, top: 10, tintColor: "#f1e8e8ff" }} />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapBox}>
        {mapCenter ? (
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
                <Marker coordinate={routeCoords[routeCoords.length - 1]} title="End" />
              </>
            )}
          </MapView>
        ) : (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 20.5937, // India default
              longitude: 78.9629,
              latitudeDelta: 10,
              longitudeDelta: 10,
            }}
          />
        )}
      </View>

      {/* Inputs */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Source (e.g. Chennai)"
          placeholderTextColor="#555"
          value={source}
          onChangeText={setSource}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Destination (e.g. Erode)"
          placeholderTextColor="#555"
          value={destination}
          onChangeText={setDestination}
        />

        <TouchableOpacity style={styles.button} onPress={fetchRoute}>
          <Text style={styles.buttonText}>{loading ? "Loading..." : "Submit"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  navbar: {
    top:10,
    height: 90,
    backgroundColor: "green",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  navTitle: { top:15, fontSize: 20, fontWeight: "bold", color: "#fff" },
  mapBox: {
    height: "40%",
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 10,
  },
  map: { flex: 1 },
  inputContainer: { flex: 1, padding: 20 },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 30,
    marginBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "green",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
