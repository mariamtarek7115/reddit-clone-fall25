import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({
  sidebarActive = "Home",
  setSidebarActive = () => {},
  sidebarOpen = true,
  setSidebarOpen = () => {},
  toggleJoinCommunity = () => {},
  communities = [],
}) => {
  const navigate = useNavigate();

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
              className="sidebar-section-title"
              onClick={() => navigate("/communities")}
            >
              COMMUNITIES
            </button>

            {communities.map((community) => {
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
