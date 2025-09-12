import React from "react";
import {
  View,
  Text,
  navigate,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import MapView from "react-native-maps";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer, DrawerActions } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

const Drawer = createDrawerNavigator();

const HomeScreen = ({ navigation }) => {
  const handleSubmit = () => {
    alert("Submit button pressed 🚀");
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />

      
      <View style={styles.navbar}>
        <Text style={styles.navTitle}>GreenPath</Text>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Icon.Button
            name="menu"
            size={40}
            top={12}
            backgroundColor="transparent"
            underlayColor="transparent"
            color="#fff"
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          />

        </TouchableOpacity>
      </View>

      <View style={styles.mapBox}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Source"
          placeholderTextColor="#555"
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Destination"
          placeholderTextColor="#555"
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const ProfileScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.screenText}>👤 Profile</Text>
  </View>
);

const HealthScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.screenText}>❤️ Health Details</Text>
  </View>
);

const GreenPointsScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.screenText}>🌱 Green Points</Text>
  </View>
);

const Signup = () => {
  return (
    <View style={styles.screen}>
      <Text style={styles.screenText}>Login</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigate("/Login")}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        screenOptions={{
          headerShown: false,
          drawerActiveTintColor: "#2196F3",
          drawerLabelStyle: { fontSize: 16 },
        }}
      >
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Profile" component={ProfileScreen} />
        <Drawer.Screen name="Health Details" component={HealthScreen} />
        <Drawer.Screen name="Green Points" component={GreenPointsScreen} />
        <Drawer.Screen name="Login" component={Signup} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  navbar: {
    height: 100,
    backgroundColor:"rgba(144, 238, 144, 0.35)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    elevation: 5,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    margin: 30,
    top: 20,
    left: -10,
  },
  mapBox: {
    height: "40%",
    margin: 30,
    borderRadius: 22,
    overflow: "hidden",
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  map: {
    flex: 1,
  },
  inputContainer: {
    flex: 1,
    padding: 25,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 55,
    marginBottom: 8,
    paddingHorizontal: 40,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  screen: {
    flex: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  screenText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
});
