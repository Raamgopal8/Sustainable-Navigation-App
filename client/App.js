
import React, { useState } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import {Signup} from './Signup';
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
const Auth = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigation = useNavigation();

  const handleLogin = () => {
    let formErrors = {};

    if (!username.trim()) formErrors.username = "Username is required";
    if (!email.trim()) {
      formErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = "Enter a valid email";
    }
    if (!password.trim()) {
      formErrors.password = "Password is required";
    } else if (password.length < 6) {
      formErrors.password = "Password must be at least 6 characters";
    }

    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      alert(`✅ Logged in as: ${username} (${email})`);
      // navigation.navigate("Home"); // example
    }
  };
}

function HomeScreen({ navigation }) {
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
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Image source={require("./assets/menu.png")} style={{ width: 28, height: 28, marginTop: 10, top: 10, tintColor: "#fff" }} />
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



function SignUp() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>SignUp</Text>
    </View>
  );
}


function ProfileScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Profile</Text>
    </View>
  );
}

function HealthPersonalizationScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Health Personalization</Text>
    </View>
  );
}

function GreenPointsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Green Points</Text>
    </View>
  );
}

function LoginScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigation = null; // If you want navigation, pass it as a prop

  /**
   * Handles the login form submission by validating user input fields.
   * Checks for required username, valid email format, and password length.
   * Sets error messages for invalid fields and proceeds with login if all validations pass.
   *
   * @function
   * @returns {void}
   */
  const handleLogin = () => {
    let formErrors = {};

    if (!username.trim()) formErrors.username = "Username is required";
    if (!email.trim()) {
      formErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = "Enter a valid email";
    }
    if (!password.trim()) {
      formErrors.password = "Password is required";
    } else if (password.length < 6) {
      formErrors.password = "Password must be at least 6 characters";
    }

    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      alert(`✅ Logged in as: ${username} (${email})`);
      // navigation.navigate("Home"); // example
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.container1}>
        <Text style={styles.title1}>Login</Text>

        <TextInput
          placeholder="Username"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
          style={styles.input1}
        />
        {errors.username && <Text style={styles.error}>{errors.username}</Text>}

        <TextInput
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input1}
        />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}

        <TextInput
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input1}
        />
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}

        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.signupText}>
          Don’t have an account?{" "}
          <Text
          
            style={styles.signupLink}
            onPress={() => navigation && navigation.navigate && navigation.navigate("SignUp")}
          >
            Sign Up
          </Text>
        </Text>
      </View>
    </View>
  );
}

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
        }}>
        <Drawer.Screen name="Home" component={HomeScreen} />
        {/* <Drawer.Screen name="Profile" component={ProfileScreen} /> */}
        <Drawer.Screen name="Health Personalization" component={HealthPersonalizationScreen} />
        <Drawer.Screen name="Green Points" component={GreenPointsScreen} />
        <Drawer.Screen name="Login" component={LoginScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
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
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  container1: {
    padding: 30,
    width: 320,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)", // works only on web, ignore on mobile
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title1: {
    color: "#66bb6a",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  input1: {
    width: "100%",
    marginVertical: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    color: "#fff",
  },
  button1: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#43a047",
  },
  buttonText1: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#fff",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginLeft: 5,
  },
  signupText: {
    marginTop: 15,
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
  },
  signupLink: {
    color: "#2e7d32",
    fontWeight: "bold",
  },
});
