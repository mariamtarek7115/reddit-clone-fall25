import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Sidebar.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const Sidebar = ({
  sidebarActive = "Home",
  setSidebarActive = () => {},
  sidebarOpen = true,
  setSidebarOpen = () => {},
  toggleJoinCommunity = () => {},
  communities = [],
}) => {
  const navigate = useNavigate();

  // Auth / joined communities
  const { user } = useContext(AuthContext);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [joinedLoading, setJoinedLoading] = useState(false);

  const displayCommunities = (joinedCommunities && joinedCommunities.length > 0)
    ? joinedCommunities
    : communities;

  useEffect(() => {
    if (!user?._id) {
      setJoinedCommunities([]);
      return;
    }

    const controller = new AbortController();
    const fetchJoined = async () => {
      setJoinedLoading(true);
      try {
        const res = await fetch(`${API_BASE}/community/user/${user._id}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch communities");

        let arr = [];
        if (Array.isArray(data)) arr = data;
        else if (Array.isArray(data.communities)) arr = data.communities;
        else {
          const key = Object.keys(data).find((k) => Array.isArray(data[k]));
          if (key) arr = data[key];
        }

        const formatted = arr.map((c) => ({
          id: c._id || c.id,
          name: c.name ? (c.name.startsWith("r/") ? c.name : `r/${c.name}`) : c.name,
          _id: c._id,
        }));

        setJoinedCommunities(formatted);
      } catch (e) {
        if (e.name !== "AbortError") console.error("Failed to fetch joined communities:", e);
        setJoinedCommunities([]);
      } finally {
        setJoinedLoading(false);
      }
    };

    fetchJoined();
    return () => controller.abort();
  }, [user?._id]);

  return (
    <aside
      className={
        sidebarOpen ? "feed-sidebar" : "feed-sidebar feed-sidebar--collapsed"
      }
    >
      <div className="sidebar-header">
        <div className="sidebar-logo">r</div>
        {sidebarOpen && <span className="sidebar-title">reddit</span>}
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-nav-item ${sidebarActive === "Home" ? "active" : ""}`}
          onClick={() => {
            setSidebarActive("Home");
            navigate("/feed");
          }}
        >
          <span>🏠</span>
          {sidebarOpen && <span>Home</span>}
        </button>

        <button
          className={`sidebar-nav-item ${sidebarActive === "Popular" ? "active" : ""}`}
          onClick={() => setSidebarActive("Popular")}
        >
          <span>📈</span>
          {sidebarOpen && <span>Popular</span>}
        </button>

        <button
          className={`sidebar-nav-item ${sidebarActive === "Answers" ? "active" : ""}`}
          onClick={() => setSidebarActive("Answers")}
        >
          <span>💬</span>
          {sidebarOpen && (
            <>
              <span>Answers</span>
              <span className="sidebar-badge">BETA</span>
            </>
          )}
        </button>

        <button
          className={`sidebar-nav-item ${sidebarActive === "Explore" ? "active" : ""}`}
          onClick={() => setSidebarActive("Explore")}
        >
          <span>🧭</span>
          {sidebarOpen && <span>Explore</span>}
        </button>

        {sidebarOpen && (
          <>
            <div className="sidebar-section-title">RESOURCES</div>

            <button
              className="sidebar-nav-item"
              onClick={() => setSidebarActive("About")}
            >
              About Reddit
            </button>
            <button
              className="sidebar-nav-item"
              onClick={() => setSidebarActive("Advertise")}
            >
              Advertise
            </button>
            <button
              className="sidebar-nav-item"
              onClick={() => setSidebarActive("Developers")}
            >
              Developer Platform
            </button>
            <button className="sidebar-nav-item">
              <span>Reddit Pro</span>
              <span className="sidebar-badge">BETA</span>
            </button>
            <button className="sidebar-nav-item">Help</button>
            <button className="sidebar-nav-item">Blog</button>
            <button className="sidebar-nav-item">Careers</button>
            <button className="sidebar-nav-item">Press</button>

            <button
              className="sidebar-start-community"
              onClick={() => navigate("/createcommunity")}
            >
              <span className="start-icon">+</span>
              {sidebarOpen && <span className="start-text"> Start a community</span>}
            </button>

            <button
              className="sidebar-section-title"
              onClick={() => navigate("/communities")}
            >
              COMMUNITIES
            </button>

            {displayCommunities.map((community) => {
              const raw = community.name || "";
              const communitySlug = raw.replace(/^r\//, "");
              const label = raw.startsWith("r/") ? raw : `r/${raw}`;

              return (
                <button
                  className="sidebar-nav-item"
                  key={community.id || communitySlug}
                  onClick={() => navigate("/r/" + communitySlug)}
                >
                  {label}
                </button>
              );
            })}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          ☰
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
