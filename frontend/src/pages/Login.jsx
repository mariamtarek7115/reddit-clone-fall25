import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // ✅ store logged in user globally
      // backend returns: { message, user: { _id, username } }
      login(data.user);

      // ✅ go to feed
      navigate("/feed");
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const isValid = username.trim() && password;

  return (
    <div className="auth-page">
      <div className="login_main">
        <h1>Log In</h1>
        <h2>Welcome back</h2>

        <p className="intro">
          Enter your username and password to continue to Reddit Clone.
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="error_text">{error}</p>}

          <button type="submit" disabled={!isValid}>
            Log In
          </button>
        </form>

        <p className="ending">
          New to Reddit Clone?{" "}
          <span className="signup_link" onClick={() => navigate("/signup")}>
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
