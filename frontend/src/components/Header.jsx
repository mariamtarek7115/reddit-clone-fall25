import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "./ProfileMenu.jsx";
import avatarImg from "../images/avatar.jpg";
import "./Header.css";

import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState(""); // ✅ search state

  const { user } = useContext(AuthContext);
  const username = user?.username || "guest";

  const navigate = useNavigate();

  const handleIconClick = (type) => {
    if (type === "create") {
      navigate("/createpost");
      return;
    }
  };

  // ✅ SEARCH HANDLER (USER + COMMUNITY)
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    // 🔹 USER SEARCH: u/username
    if (query.startsWith("u/")) {
      const userName = query.slice(2);
      navigate(`/u/${userName}`);
      return;
    }

    // 🔹 COMMUNITY SEARCH: r/community
    if (query.startsWith("r/")) {
      const communityName = query.slice(2);
      navigate(`/r/${communityName}`);
      return;
    }

    // 🔹 FALLBACK: global backend search
    try {
      const res = await fetch(
        `http://localhost:5000/search?q=${query}`
      );
      const data = await res.json();

      if (data.communities && data.communities.length > 0) {
        navigate(`/r/${data.communities[0].name}`);
      } else if (data.users && data.users.length > 0) {
        navigate(`/u/${data.users[0].username}`);
      } else {
        alert("No results found");
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  return (
    <header className="app-header">
      <div className="header-center">
        {/* 🔍 SEARCH BAR */}
        <form className="search-container" onSubmit={handleSearch}>
          <span className="search-icon">🔍</span>
          <input
            className="search-bar"
            placeholder={`Search in u/${username}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
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
