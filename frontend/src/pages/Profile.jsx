import React, { useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header";
import NavigationMenu from "../components/NavigationMenu";

const Profile = () => {
  const [sidebarActive, setSidebarActive] = useState("Home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const currentUser = { avatar: "/path/to/avatar.jpg", username: "Mariam" }; // mafrood nghayar nkhaleeh ygeeb esm el user nafso ml database

  // State for active tab
  const [activeTab, setActiveTab] = useState("Overview");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Temporary dummy data for the Sidebar
  const [communities, setCommunities] = useState([
    { id: 1, name: "r/JavaScript" },
    { id: 2, name: "r/ReactJS" },
  ]);

  const toggleJoinCommunity = (id) => {
    console.log("Join/Leave community:", id);
  };

  return (
    <div
      className="profile-page"
      style={{ display: "flex", flexDirection: "row", height: "100vh" }}
    >
      {/* Sidebar */}
      <Sidebar
        sidebarActive={sidebarActive}
        setSidebarActive={setSidebarActive}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        toggleJoinCommunity={toggleJoinCommunity}
        communities={communities}
      />

    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px" }}>
        {/* Header */}
        <Header currentUser={currentUser} />

        {/* Navigation Menu */}
        <NavigationMenu onTabChange={handleTabChange} />

        {/* Tab Content */}
        <div className="tab-content" style={{ padding: "20px" }}>
          {activeTab === "Overview" && <div>All posts and comments here</div>}
          {activeTab === "Posts" && <div>User posts here</div>}
          {activeTab === "Comments" && <div>User comments here</div>}
          {activeTab === "Upvoted" && <div>Upvoted content</div>}
          {activeTab === "Downvoted" && <div>Downvoted content</div>}
        </div>
      </div>
    </div>
  );
};

export default Profile;
