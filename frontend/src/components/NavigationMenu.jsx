import React, { useState } from "react";
import "./NavigationMenu.css";

const NavigationMenu = ({ tabs = ["Overview", "Posts", "Comments", "Upvoted", "Downvoted"], onTabChange }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab); // Callback to parent if needed
  };

  return (
    <div className="navigation-menu">
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`nav-item ${activeTab === tab ? "active" : ""}`}
          onClick={() => handleTabClick(tab)}
        >
          {tab}
        </div>
      ))}
    </div>
  );
};

export default NavigationMenu;
