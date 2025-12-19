// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import CommunityPage from "./pages/CommunityPage";
import CreateCommunityPage from "./pages/CreateCommunityPage";
import Profile from "./pages/Profile";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
import MessageMods from "./pages/MessageMods";
import ModsAndMembers from "./pages/ModsAndMembers";


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/feed" element={<Feed />} />
       <Route path="/r/:communityName" element={<CommunityPage />} />
<Route path="/r/:communityName/message-mods" element={<MessageMods />} />
<Route path="/r/:communityName/mods" element={<ModsAndMembers />} />


        <Route path="/createcommunity" element={<CreateCommunityPage />} />
        <Route path="/profile" element={<Profile />} />
      <Route path="/post/:postId" element={<PostDetail />} />
      <Route path="/createpost" element={<CreatePost />} />

      </Routes>
    </div>
  );
}

export default App;