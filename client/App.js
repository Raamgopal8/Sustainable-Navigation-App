function SignupScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSignUp = () => {
    let formErrors = {};
    if (!username.trim()) formErrors.username = "Username is required";
    if (!email.trim()) formErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      formErrors.email = "Enter a valid email";
    if (!password.trim()) formErrors.password = "Password is required";
    else if (password.length < 6)
      formErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      formErrors.confirmPassword = "Passwords do not match";

    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      alert(`✅ Account created for: ${username} (${email})`);
      if (navigation && navigation.navigate) navigation.navigate('Login');
    }
  };

  return (
    <View style={signupStyles.page}>
      <View style={signupStyles.container}>
        <Text style={signupStyles.title}>Sign Up</Text>

        <TextInput
          placeholder="Username"
          placeholderTextColor="#fff"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setErrors((prev) => ({ ...prev, username: "" }));
          }}
          style={signupStyles.input}
        />
        {errors.username ? <Text style={signupStyles.error}>{errors.username}</Text> : null}

        <TextInput
          placeholder="Email"
          placeholderTextColor="#fff"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors((prev) => ({ ...prev, email: "" }));
          }}
          style={signupStyles.input}
          keyboardType="email-address"
        />
        {errors.email ? <Text style={signupStyles.error}>{errors.email}</Text> : null}

        <TextInput
          placeholder="Password"
          placeholderTextColor="#fff"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({ ...prev, password: "" }));
          }}
          style={signupStyles.input}
          secureTextEntry
        />
        {errors.password ? <Text style={signupStyles.error}>{errors.password}</Text> : null}

        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#fff"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setErrors((prev) => ({ ...prev, confirmPassword: "" }));
          }}
          style={signupStyles.input}
          secureTextEntry
        />
        {errors.confirmPassword ? <Text style={signupStyles.error}>{errors.confirmPassword}</Text> : null}

        <TouchableOpacity onPress={handleSignUp} style={signupStyles.button}>
          <Text style={signupStyles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={signupStyles.loginText}>
          Already have an account?{' '}
          <Text style={signupStyles.loginLink} onPress={() => navigation && navigation.navigate && navigation.navigate('Login')}>
            Login
          </Text>
        </Text>
      </View>
    </View>
  );
}
const signupStyles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
    padding: 20,
  },
  container: {
    padding: 30,
    width: 320,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    alignItems: "center",
  },
  title: {
    color: "#66bb6a",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    marginVertical: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    color: "#fff",
    backgroundColor: "#222",
  },
  button: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#43a047",
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#fff",
    fontSize: 16,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginLeft: 5,
    alignSelf: "flex-start",
  },
  loginText: {
    marginTop: 15,
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
  },
  loginLink: {
    color: "#2e7d32",
    fontWeight: "bold",
  },
});
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from "react";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
// import {Signup} from './Signup';
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

const GreenPoints = ({ points }) => {
 const [progress, setProgress] = useState(0);
  // Animate the progress value
  useEffect(() => {
    let start = 0;
    const interval = setInterval(() => {
      start += 2; // speed of increment
      if (start >= points) {
        start = points;
        clearInterval(interval);
      }
      setProgress(start);
    }, 20); // interval speed
    return () => clearInterval(interval);
  }, [points]); 
}

function HomeScreen({ navigation }) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [mapCenter, setMapCenter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [health,setHealth]=useState(""); // { distance, duration }

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
        healthCondition: health,
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
      setRouteInfo({
        distance: bestRoute.distance, // meters
        duration: bestRoute.duration, // seconds
      });
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
        <MapView
          style={styles.map}
         
  initialRegion={
  mapCenter
    ? {
        latitude: mapCenter.latitude,
        longitude: mapCenter.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }
    : {
        latitude: 22.5937,   // Center of India
        longitude: 78.9629,
        latitudeDelta: 25,
        longitudeDelta: 25,
      }
}

        >
          {routeCoords.length > 0 && (
            <>
              <Polyline coordinates={routeCoords} strokeColor="blue" strokeWidth={4} />
              <Marker coordinate={routeCoords[0]} title="Start" />
              <Marker coordinate={routeCoords[routeCoords.length - 1]} title="End" />
            </>
          )}
        </MapView>
      </View>
      {/* Inputs or Route Info */}
      <View style={styles.inputContainer}>
        {routeInfo ? (
        <View style={styles.routeInfoBox}>
  <View style={styles.routeInfoRow}>
    <Text style={styles.labelText}>Source:</Text>
    <Text style={styles.valueText}>{source}</Text>
  </View>
  <View style={styles.routeInfoRow}>
    <Text style={styles.labelText}>Destination:</Text>
    <Text style={styles.valueText}>{destination}</Text>
  </View>
  <View style={styles.routeInfoRow}>
    <Text style={styles.labelText}>Distance:</Text>
    <Text style={styles.valueText}>
      {routeInfo.distance ? (routeInfo.distance / 1000).toFixed(2) + ' km' : '-'}
    </Text>
  </View>
  <View style={styles.routeInfoRow}>
    <Text style={styles.labelText}>Time Taken:</Text>
    <Text style={styles.valueText}>
      {routeInfo.duration ? Math.ceil(routeInfo.duration / 60) + ' min' : '-'}
    </Text>
  </View>
</View>
        ) : (
          <>
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
            <TextInput
              style={styles.input}
              placeholder="Enter your health concern (e.g. asthma)"
              placeholderTextColor="#555"
              value={health}
              onChangeText={setHealth}
            />
            <TouchableOpacity style={styles.button} onPress={fetchRoute}>
              <Text style={styles.buttonText}>{loading ? "Loading..." : "Submit"}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}



// function SignUp() {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>SignUp</Text>
//     </View>
//   );
// }


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
  const [progress, setProgress] = useState(0);
  const points = 320; // Replace with actual points from backend/user data
  useEffect(() => {
    let start = 0;
    const interval = setInterval(() => {
      start += 2;
      if (start >= points) {
        start = points;
        clearInterval(interval);
      }
      setProgress(start);
    }, 20);
    return () => clearInterval(interval);
  }, [points]);
  return (
    <View style={styles.container2}>
      <Text style={styles.heading2}>🌱 Your Green Points</Text>
      <View style={styles.gauge}>
        <AnimatedCircularProgress
          size={200}
          width={15}
          fill={(progress / 500) * 100}
          tintColor="#66bb6a"
          backgroundColor="#e0e0e0"
          duration={500}
        >
          {() => <Text style={styles.progressText}>{progress}</Text>}
        </AnimatedCircularProgress>
      </View>
      <Text style={styles.label2}>Eco Score (out of 500)</Text>
    </View>
  );
}

function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
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
          Don’t have an account?{' '}
          <Text style={styles.signupLink} onPress={() => navigation && navigation.navigate && navigation.navigate('Sign Up')}>
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
      <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity
          style={{ backgroundColor: 'green', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24, alignItems: 'center', marginRight: 8, flex: 1 }}
          onPress={() => props.navigation.navigate('Login')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: 'green', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24, alignItems: 'center', marginLeft: 8, flex: 1 }}
          onPress={() => props.navigation.navigate('Sign Up')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Sign Up</Text>
        </TouchableOpacity>
      </View>
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
        <Drawer.Screen name="Sign Up" component={SignupScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  routeInfoBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  // New styles for better layout and appearance
routeInfoBox: {
  backgroundColor: '#f5f5f5',
  borderRadius: 10,
  padding: 15,
  marginHorizontal: 10,
  marginTop: -10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
routeInfoRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginVertical: 4,
},
labelText: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#333',
},
valueText: {
  fontSize: 16,
  color: '#2e7d32',
},
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
   container2: {
    top:60,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 30,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    alignItems: "center",
    width: 350,
    alignSelf: "center",
  },
  heading2: {
    marginBottom: 20,
    fontSize: 22,
    fontWeight: "bold",
    color: "#1b5e20",
  },
  gauge: {
    marginBottom: 15,
  },
  progressText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  label2: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
  },
});
