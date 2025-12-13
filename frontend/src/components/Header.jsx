import React from "react";
import "./Header.css";
import avatarImg from "../images/avatar.jpg"; // Import the image

const Header = ({ currentUser }) => {
  return (
    <header className="app-header">
      {/* Search bar centered */}
      <div className="header-center">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            className="search-bar"
            placeholder={`Search in u/${currentUser?.username || "User"}`}
          />
        </div>
      </div>

      {/* Right side icons */}
      <div className="header-right">
        <button className="header-button">Create</button>
        <div className="icon">💬</div>
        <div className="icon">
          🔔
          <span className="notification-badge">3</span>
        </div>
        <img
            className="user-avatar"
            src={avatarImg} // just to test
            alt="avatar"
        />
      </div>
    </header>
  );
};

export default Header;
