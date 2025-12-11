// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import CommunityPage from "./pages/CommunityPage";
import CreateCommunityPage from "./pages/CreateCommunityPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/community/:communityName" element={<CommunityPage />} />
        <Route path="/createcommunity" element={<CreateCommunityPage />} />
      </Routes>
    </div>
  );
}

export default App;