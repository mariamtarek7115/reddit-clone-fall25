import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "./ProfileMenu.jsx";
import avatarImg from "../images/avatar.jpg";
import "./Header.css";

import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useContext(AuthContext);

  const username = user?.username || "guest";

  const navigate = useNavigate();

  const handleIconClick = (type) => {
    if (type === "create") {
      navigate("/createpost");
      return;
    }

    console.log(`${type} clicked`);
    // TODO: implement icon-specific actions (open messages, show notifications)
  };

  return (
    <header className="app-header">
      <div className="header-center">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input className="search-bar" placeholder={`Search in u/${username}`} />
        </div>
      </div>

      <div className="header-right">
        <button
          className="icon icon-button"
          aria-label="messages"
          onClick={() => handleIconClick("messages")}
        >
          💬
        </button>
        <button
          className="icon icon-button"
          aria-label="create"
          onClick={() => handleIconClick("create")}
        >
          ➕
        </button>
        <button
          className="icon icon-button"
          aria-label="notifications"
          onClick={() => handleIconClick("notifications")}
        >
          🔔
        </button>

        <img
          className="user-avatar"
          src={avatarImg}
          alt="avatar"
          onClick={() => setMenuOpen((p) => !p)}
        />

        {menuOpen && <ProfileMenu onClose={() => setMenuOpen(false)} />}
      </div>
    </header>
  );
};

export default Header;
