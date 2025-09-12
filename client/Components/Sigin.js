import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
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
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={{ color: "#66bb6a", marginBottom: "15px" }}>Sign Up</h2>

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setErrors((prev) => ({ ...prev, username: "" }));
          }}
          style={styles.input}
        />
        {errors.username && <p style={styles.error}>{errors.username}</p>}

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((prev) => ({ ...prev, email: "" }));
          }}
          style={styles.input}
        />
        {errors.email && <p style={styles.error}>{errors.email}</p>}

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((prev) => ({ ...prev, password: "" }));
          }}
          style={styles.input}
        />
        {errors.password && <p style={styles.error}>{errors.password}</p>}

        {/* Confirm Password */}
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setErrors((prev) => ({ ...prev, confirmPassword: "" }));
          }}
          style={styles.input}
        />
        {errors.confirmPassword && (
          <p style={styles.error}>{errors.confirmPassword}</p>
        )}

        {/* Sign-Up Button */}
        <button onClick={handleSignUp} style={styles.button}>
          Sign Up
          <span style={styles.shine}></span>
        </button>

        {/* Login Link */}
        <p style={{ marginTop: "15px", color: "#555", fontSize: "14px" }}>
          Already have an account?{" "}
          <Link to="/" style={{ color: "#2e7d32", fontWeight: "bold" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    padding: "20px",
    boxSizing: "border-box",
  },
  container: {
    padding: "30px",
    width: "320px",
    borderRadius: "15px",
    background: "rgba(255, 255, 255, 0.1)", // glass effect
    backdropFilter: "blur(10px)",
    boxShadow:
      "0 0 25px rgba(0, 0, 0, 0.4), inset 0 0 10px rgba(255,255,255,0.2)",
    color: "#fff",
    textAlign: "center",
    position: "relative",
  },
  input: {
    display: "block",
    width: "95%",
    margin: "10px 0",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
  },
  button: {
    width: "101%",
    padding: "12px",
    background: "linear-gradient(90deg, #66bb6a, #43a047)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
    position: "relative",
    overflow: "hidden",
  },
  error: {
    color: "red",
    fontSize: "12px",
    margin: "0 0 8px 5px",
    textAlign: "left",
  },
};

// Shine animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(
  `
@keyframes shine {
  0% { left: -75%; }
  50% { left: 100%; }
  100% { left: 100%; }
}
`,
  styleSheet.cssRules.length
);

export default SignUp;
