import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import "./CommunityPage.css";

const CommunityPage = () => {
  const { communityName } = useParams();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [sortBy, setSortBy] = useState("hot");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!communityName) return;

    setCommunity({
      name: communityName,
      description: `Welcome to r/${communityName}!`,
      membersCount: 1,
      createdAt: "Dec 19, 2025",
      type: "Public",
      isAdult: true,
      isModerator: true,
      insights: {
        visitors: 0,
        contributions: 0,
      },
    });
  }, [communityName]);

  if (!community) return <div className="loading">Loading…</div>;

  return (
    <>
      <Header />

      <div className="reddit-shell">
        {/* LEFT GLOBAL NAV */}
        <Sidebar />

        {/* COMMUNITY PAGE */}
        <div className="community-page">
          {/* BANNER */}
          <div className="community-banner" />

          {/* HEADER */}
          <div className="community-header">
            <div className="community-header-inner">
              <div className="community-icon">r/</div>

              <div className="community-header-text">
                <h1>r/{community.name}</h1>
                <span>Created {community.createdAt}</span>
              </div>

              <div className="community-header-actions">
                <button
                  className="create-post-btn"
                  onClick={() => navigate("/createpost")}
                >
                  + Create Post
                </button>

                {community.isModerator && (
                  <button className="mod-tools-btn">Mod Tools</button>
                )}

                <div className="menu-wrapper">
                  <button
                    className="more-btn"
                    onClick={() => setShowMenu(prev => !prev)}
                  >
                    ⋯
                  </button>

                  {showMenu && (
                    <div className="community-menu">
                      <button>Add to custom feed</button>
                      <button>Add to favorites</button>
                      <button>Mute r/{community.name}</button>
                      <button className="danger">Leave</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="community-content">
            {/* FEED */}
            <main className="community-feed">
              <div className="sort-bar">
                {["hot", "new", "top"].map(type => (
                  <button
                    key={type}
                    className={sortBy === type ? "active" : ""}
                    onClick={() => setSortBy(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              <div className="empty-feed">
                <h2>This community doesn’t have any posts yet</h2>
                <p>Make one and get this feed started.</p>
                <button
                  className="primary-cta"
                  onClick={() => navigate("/createpost")}
                >
                  Create Post
                </button>
              </div>
            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="community-right">
              <div className="about-card">
                <h3>About Community</h3>
                <p>{community.description}</p>

                <div className="stats">
                  <div>
                    <strong>{community.membersCount}</strong>
                    <span>Members</span>
                  </div>
                  <div>
                    <strong>1</strong>
                    <span>Online</span>
                  </div>
                </div>

                <div className="info">
                  <span>🌐 {community.type}</span>
                  {community.isAdult && <span>🔞 Adult content</span>}
                </div>

                <button
                  className="primary-cta full"
                  onClick={() =>
                    navigate(`/r/${community.name}/message-mods`)
                  }
                >
                  Message Mods
                </button>
              </div>

              {community.isModerator && (
                <div className="mod-card">
                  <h4>MODERATORS</h4>
                  <div className="mod-row">u/Former_Pack5559</div>
                  <button
                    className="link-btn"
                    onClick={() => navigate(`/r/${community.name}/mods`)}
                  >
                    View all moderators
                  </button>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommunityPage;
