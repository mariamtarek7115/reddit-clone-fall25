import React, { useContext, useState } from "react";
import ProfileMenu from "./ProfileMenu.jsx";
import avatarImg from "../images/avatar.jpg";
import "./Header.css";

import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useContext(AuthContext);

  const username = user?.username || "guest";

  return (
    <header className="app-header">
      <div className="header-center">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input className="search-bar" placeholder={`Search in u/${username}`} />
        </div>
      </div>

      <div className="header-right">
        <span className="icon">💬</span>
        <span className="icon">➕</span>
        <span className="icon">🔔</span>

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
