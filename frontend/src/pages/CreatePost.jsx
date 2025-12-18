import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import CreatePost from "../components/CreatePost";

export default function CreatePostPage() {
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarActive, setSidebarActive] = useState("Home");

  // Example communities
  //fix later with backend
  const [communities, setCommunities] = useState([
    { id: 1, name: "r/javascript" },
    { id: 2, name: "r/reactjs" },
  ]);

  const toggleJoinCommunity = (id) => {
    console.log("Toggle community with id:", id);
    // Implement join/leave logic here
  };


  return (
    <div className="page-wrapper">
      <Header setSidebarOpen={setSidebarOpen} />
      <div className="page-content" style={{ display: "flex" }}>
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarActive={sidebarActive}
          setSidebarActive={setSidebarActive}
          communities={communities}
          toggleJoinCommunity={toggleJoinCommunity}
        />
        <main className="main-content" style={{ flex: 1, padding: "20px" }}>
          <CreatePost />
        </main>
      </div>
    </div>
  );
}