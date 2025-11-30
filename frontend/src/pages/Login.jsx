
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
   const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
   const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }
     // TODO: replace with real API call later
     console.log("Logging in with:", { username, password });
     // For now just simulate success:
    // navigate("/");
  };
    const isValid = username.trim() && password;
    return (
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
  );
}


export default Login;
