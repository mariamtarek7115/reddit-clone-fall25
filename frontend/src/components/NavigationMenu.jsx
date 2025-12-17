import React from "react";
import "./NavigationMenu.css";

const NavigationMenu = ({ 
  tabs = ["Overview", "Posts", "Comments", "Upvoted", "Downvoted"], 
  activeTab,
  onTabChange 
}) => {
  return (
    <div className="navigation-menu">
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`nav-item ${activeTab === tab ? "active" : ""}`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </div>
      ))}
    </div>
  );
};

export default NavigationMenu;