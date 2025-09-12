import React, { useState } from "react";
import decodePolyline from "./utils/decodePolyline";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons"; // for hamburger icon

export default function HomeScreen() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [mapCenter, setMapCenter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

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
      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.logo}>GreenPath</Text>
        <TouchableOpacity style={styles.menuIcon} onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Map - now above inputs, medium box */}
      {mapCenter && (
        <View style={styles.mapBox}>
          <MapView
            style={styles.mapMedium}
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
        </View>
      )}

      {/* Inputs Section - now below map */}
      <View style={styles.inputsContainer}>
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

        <Button
          title={loading ? "Loading..." : "Get Route"}
          onPress={fetchRoute}
        />
      </View>

      {/* Slide-out Menu */}
      <Modal visible={menuVisible} animationType="slide" transparent={true}>
        <View style={styles.menuOverlay}>
          <View style={styles.menu}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Settings</Text>
              <TouchableOpacity style={styles.menuCloseIcon} onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={28} color="#388E3C" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.menuItem}><Text style={styles.menuItemText}>Home</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}><Text style={styles.menuItemText}>My Profile</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}><Text style={styles.menuItemText}>Health Details</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}><Text style={styles.menuItemText}>Green Points</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuButton}><Text style={styles.menuButtonText}>Login</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  menuCloseIcon: {
    padding: 4,
  },
  menuItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 16,
    color: '#388E3C',
    fontWeight: '500',
  },
  menuButton: {
    marginTop: 20,
    backgroundColor: '#388E3C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    marginBottom: 16,
  },
  mapMedium: {
    width: '95%',
    height: 400,
    borderRadius: 16,
    overflow: 'hidden',
  },
  container: { flex: 1, backgroundColor: "#fff" },
  navbar: {
    height: 80,
    top:25,
    backgroundColor: "#388E3C", // Green theme
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  logo: { fontSize: 22, fontWeight: "bold", color: "#fff", letterSpacing: 1 },
  menuIcon: { padding: 8 },
  map: { flex: 1 },
  inputsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom:160,
    width: '100%',
    padding: 10,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  label: { fontWeight: "bold", marginBottom: 4 },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
  },
  menu: {
    width: "70%",
    height: "100%",
    backgroundColor: "#fff",
    padding: 20,
  },
  menuTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
});
