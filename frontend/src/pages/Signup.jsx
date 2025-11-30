// src/pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");

  const [dialogMessage, setDialogMessage] = useState(""); // message for dialog
  const [showDialog, setShowDialog] = useState(false);    // toggle dialog

  const navigate = useNavigate();

  const openDialog = (msg) => {
    setDialogMessage(msg);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setDialogMessage("");
  };

  const handleSignup = async () => {
  if (!username) {
    openDialog("Username is required");
    return;
  }
  if (!password) {
    openDialog("Password is required");
    return;
  }

  // Fixed regex
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  if (!passwordRegex.test(password)) {
    openDialog(
      "Password must be at least 8 characters and include:\n• lowercase\n• uppercase\n• number\n• special character"
    );
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      // ✅ Show success message and auto-close
      setDialogMessage("Account created successfully! Redirecting...");
      setShowDialog(true);
      
      // Auto-close and navigate after 1.5 seconds
      setTimeout(() => {
        setShowDialog(false);
        navigate("/feed");
      }, 1500);
    } else if (data.message?.includes("E11000") || data.message === "Username already exists") {
      openDialog("Username already exists. Please choose another username.");
    } else {
      openDialog(data.message || "Signup failed");
    }
  } catch (error) {
    console.error("Error:", error);
    openDialog("Something went wrong. Please try again.");
  }
};

  const isValid = username.trim() && password;

  return (
    <div className="signup_main">
      <h1>Sign Up</h1>
      <h2>Create your username and password</h2>

      <p className="intro">
        Reddit is anonymous, so your username is what you’ll go by here.
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
        <span className="login_link" onClick={() => navigate("/login")}>
          Log in
        </span>
      </p>

      {/* 🔥 CUSTOM MODAL DIALOG */}
      {showDialog && (
        <div className="dialog_overlay">
          <div className="dialog_box">
            <p>{dialogMessage}</p>
            <button className="dialog_close" onClick={closeDialog}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;


