// src/pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSignup = () => {
    if (!username) {
      alert("Username is required");
      return;
    }
    if (!password) {
      alert("Password is required");
      return;
    }

    // Fixed regex: Added .* to each lookahead
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(password)) {
      alert(
        "Password must be at least 8 characters and include:\n- lowercase\n- uppercase\n- number\n- special character"
      );
      return;
    }

    // SUCCESS! Simulate signup + auto login
    alert("Account created successfully!");
    navigate("/");  // This will now take you to the Home page you just created

    //HANDLE API
  };

  const isValid = username.trim() && password;

  return (
    <div className="signup_main">
        <h1>Sign Up</h1>
      <h2>Create your username and password</h2>

      <p className="intro">
        Reddit is anonymous, so your username is what you’ll go by here. Choose
        wisely—because once you get a name, you can’t change it.
      </p>

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

      <button onClick={handleSignup} disabled={!isValid}>
        Continue
      </button>

      <p className="ending">
        Already a Reddit user?{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => navigate("/login")}
        >
          Log in
        </span>
      </p>
    </div>
  );
}

export default Signup;