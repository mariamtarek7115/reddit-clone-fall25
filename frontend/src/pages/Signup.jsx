import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import { AuthContext } from "../context/AuthContext";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const { login } = useContext(AuthContext);
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

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    if (!passwordRegex.test(password)) {
      openDialog(
        "Password must be at least 8 characters and include:\n• lowercase\n• uppercase\n• number\n• special character"
      );
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log("Signup response:", data);

      if (!response.ok) {
        openDialog(data.message || "Signup failed");
        return;
      }

      // ✅ store user globally (backend returns { message, user: { _id, username } })
      login(data.user);

      // ✅ success dialog then redirect
      setDialogMessage("Account created successfully! Redirecting...");
      setShowDialog(true);

      setTimeout(() => {
        setShowDialog(false);
        navigate("/feed");
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      openDialog("Something went wrong. Please try again.");
    }
  };

  const isValid = username.trim() && password;

  return (
    <div className="auth-page">
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

        {showDialog && (
          <div className="dialog_overlay">
            <div className="dialog_box">
              <p>{dialogMessage}</p>
              <button className="dialog_close" onClick={closeDialog}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Signup;
