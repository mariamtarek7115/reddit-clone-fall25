import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "./ProfileMenu.jsx";
import avatarImg from "../images/avatar.jpg";
import "./Header.css";

import { AuthContext } from "../context/AuthContext";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
<<<<<<< HEAD
  const [query, setQuery] = useState(""); // ✅ search state
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({ users: [], communities: [] });
  const [searchLoading, setSearchLoading] = useState(false);
=======
  const [query, setQuery] = useState(""); 
>>>>>>> 064f56a7a8709fc6fe59f46b1f40643851f11e2a

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
  const performSearch = async (q) => {
    const qtrim = (q || "").trim();
    setShowResults(true);
    setSearchLoading(true);
    setResults({ users: [], communities: [] });

    if (!qtrim) {
      setSearchLoading(false);
      return;
    }

    try {
      // Explicit user search format: u/username — validate via global search
      if (qtrim.startsWith("u/")) {
        const uname = qtrim.slice(2);
        const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(uname)}`);
        const data = await res.json();
        const match = (data.users || []).find((u) => u.username?.toLowerCase() === uname.toLowerCase());
        if (match) {
          setResults({ users: [match], communities: [] });
        } else {
          setResults({ users: [], communities: [] });
        }
        return;
      }

      // Explicit community search format: r/community — validate by hitting community endpoint
      if (qtrim.startsWith("r/")) {
        const cname = qtrim.slice(2);
        const res = await fetch(`${API_BASE}/community/${encodeURIComponent(cname)}`);
        if (res.ok) {
          const data = await res.json();
          // server returns community object
          setResults({ users: [], communities: [data.community || data] });
        } else {
          setResults({ users: [], communities: [] });
        }
        return;
      }

      // General search: query backend /search endpoint
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(qtrim)}`);
      const data = await res.json();

      setResults({ users: data.users || [], communities: data.communities || [] });
    } catch (err) {
      console.error("Search error:", err);
      setResults({ users: [], communities: [] });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e && e.preventDefault && e.preventDefault();
    await performSearch(query);
  };

  // Click handlers for results
  const goToCommunity = (c) => {
    const name = c.name?.startsWith("r/") ? c.name.replace(/^r\//, "") : c.name;
    setShowResults(false);
    navigate(`/r/${name}`);
  };

  const goToUser = (u) => {
    setShowResults(false);
    navigate(`/u/${u.username}`);
  };


  return (
    <header className="app-header">
      <div className="header-center">
        {/* 🔍 SEARCH BAR */}
        <form className="search-container" onSubmit={handleSearch}>
          <span className="search-icon" onClick={() => performSearch(query)}>🔍</span>
          <input
            className="search-bar"
            placeholder={`Search users or communities`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (query.trim()) performSearch(query); setShowResults(true); }}
            onBlur={() => setTimeout(() => setShowResults(false), 150)}
          />

          {showResults && (
            <div className="search-dropdown" role="list">
              {searchLoading && <div className="search-loading">Searching…</div>}

              {!searchLoading && (results.communities.length > 0 || results.users.length > 0) && (
                <>
                  {results.communities.length > 0 && (
                    <div className="search-section">
                      <div className="search-section-title">Communities</div>
                      {results.communities.map((c) => (
                        <button key={c._id || c.name} className="search-item" onMouseDown={() => goToCommunity(c)}>
                          <div className="search-item-title">{c.name?.startsWith("r/") ? c.name : `r/${c.name}`}</div>
                          {c.description && <div className="search-item-sub">{c.description}</div>}
                        </button>
                      ))}
                    </div>
                  )}

                  {results.users.length > 0 && (
                    <div className="search-section">
                      <div className="search-section-title">Users</div>
                      {results.users.map((u) => (
                        <button key={u._id || u.username} className="search-item" onMouseDown={() => goToUser(u)}>
                          <div className="search-item-title">u/{u.username}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {!searchLoading && results.communities.length === 0 && results.users.length === 0 && (
                <div className="search-no-results">No results found</div>
              )}
            </div>
          )}
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
