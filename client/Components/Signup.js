import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const SignUp = ({ navigation }) => {
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
      navigate("/"); // Redirect to login page
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>

        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setErrors((prev) => ({ ...prev, username: "" }));
          }}
          style={styles.input}
        />
        {errors.username ? <Text style={styles.error}>{errors.username}</Text> : null}

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors((prev) => ({ ...prev, email: "" }));
          }}
          style={styles.input}
          keyboardType="email-address"
        />
        {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({ ...prev, password: "" }));
          }}
          style={styles.input}
          secureTextEntry
        />
        {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}

        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setErrors((prev) => ({ ...prev, confirmPassword: "" }));
          }}
          style={styles.input}
          secureTextEntry
        />
        {errors.confirmPassword ? <Text style={styles.error}>{errors.confirmPassword}</Text> : null}

        <TouchableOpacity onPress={handleSignUp} style={styles.button}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.loginText}>
          Already have an account?{' '}
          <Text style={styles.loginLink} onPress={() => navigation && navigation.navigate && navigation.navigate('Login')}>
            Login
          </Text>
        </Text>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
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

export default SignUp;
