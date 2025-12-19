// src/components/Sidebar.jsx
import React from 'react';
import './Sidebar.css'; // Ensure to create and link this CSS file for styling

const Sidebar = ({
  sidebarActive,
  setSidebarActive,
  sidebarOpen,
  setSidebarOpen,
  toggleJoinCommunity,
  communities,
}) => {
  return (
    <aside className={sidebarOpen ? 'feed-sidebar' : 'feed-sidebar feed-sidebar--collapsed'}>
      <div className="sidebar-header">
        <div className="sidebar-logo">r</div>
        {sidebarOpen && <span className="sidebar-title">reddit</span>}
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-nav-item ${sidebarActive === 'Home' ? 'active' : ''}`}
          onClick={() => setSidebarActive('Home')}
        >
          <span>🏠</span>
          {sidebarOpen && <span>Home</span>}
        </button>

        <button
          className={`sidebar-nav-item ${sidebarActive === 'Popular' ? 'active' : ''}`}
          onClick={() => setSidebarActive('Popular')}
        >
          <span>📈</span>
          {sidebarOpen && <span>Popular</span>}
        </button>

        <button
          className={`sidebar-nav-item ${sidebarActive === 'Answers' ? 'active' : ''}`}
          onClick={() => setSidebarActive('Answers')}
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
          className={`sidebar-nav-item ${sidebarActive === 'Explore' ? 'active' : ''}`}
          onClick={() => setSidebarActive('Explore')}
        >
          <span>🧭</span>
          {sidebarOpen && <span>Explore</span>}
        </button>

        {sidebarOpen && (
          <>
            <div className="sidebar-section-title">RESOURCES</div>
            <button className="sidebar-nav-item" onClick={() => setSidebarActive('About')}>
              About Reddit
            </button>
            <button className="sidebar-nav-item" onClick={() => setSidebarActive('Advertise')}>
              Advertise
            </button>
            <button className="sidebar-nav-item" onClick={() => setSidebarActive('Developers')}>
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

            <div className="sidebar-section-title">COMMUNITIES</div>
            {communities.map((community) => (
              <button
                className="sidebar-nav-item"
                key={community.id}
                onClick={() => toggleJoinCommunity(community.id)}
              >
                {community.name}
              </button>
            ))}
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