// src/pages/Home.jsx
import React from "react";

export default function Home() {
  return (
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "Arial" }}>
      <h1>Welcome to your Reddit Clone!</h1>
      <p>You've successfully signed up and are now logged in</p>
      <button onClick={() => window.location.reload()}>
        Refresh to test again
      </button>
    </div>
  );
}