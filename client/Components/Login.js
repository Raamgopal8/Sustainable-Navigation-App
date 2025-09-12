import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Auth = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleLogin = () => {
    let formErrors = {};

    if (!username.trim()) {
      formErrors.username = "Username is required";
    }
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
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={{ color: "#66bb6a", marginBottom: "15px" }}>Login</h2>

        
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        {errors.username && <p style={styles.error}>{errors.username}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        {errors.email && <p style={styles.error}>{errors.email}</p>}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        {errors.password && <p style={styles.error}>{errors.password}</p>}

        <button onClick={handleLogin} style={styles.button}>
          Login
        </button>
          <p style={{ marginTop: "15px", color: "#555", fontSize: "14px" }}>
          Don't have an account?{" "}
          <Link to="/SignUp" style={{ color: "#2e7d32", fontWeight: "bold" }}>
            Sign Up
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
    width: "100%",
  },
  container: {
    padding: "30px",
    width: "320px",
    margin: "15% auto",
    borderRadius: "15px",
    background: "rgba(255, 255, 255, 0.1)", // transparent blur
    backdropFilter: "blur(10px)", // glass effect
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    color: "#fff",
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
  },
  error: {
    color: "red",
    fontSize: "12px",
    margin: "0 0 8px 5px",
    textAlign: "left",
  },
};

export default Auth;
