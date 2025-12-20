import React, { useContext, useEffect, useMemo, useState, useRef } from "react";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import Header from "../components/Header.jsx";
import PostCard from "../components/PostCard.jsx";
import { AuthContext } from "../context/AuthContext";
import "./Feed.css";

const API_BASE = "http://localhost:5000";

export default function Feed() {
  const { user } = useContext(AuthContext);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // REAL POSTS (from backend)
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // COMMUNITIES (fetch from backend)
  const [communities, setCommunities] = useState([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(false);

  const [joinedFeatured, setJoinedFeatured] = useState(false);

  // UI state
  const [activeSort, setActiveSort] = useState("Best");
  const [activeLocation, setActiveLocation] = useState("Everywhere");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [locDropdownOpen, setLocDropdownOpen] = useState(false);
  const [sidebarActive, setSidebarActive] = useState("Home");
  const [seeMoreCommunities, setSeeMoreCommunities] = useState(false);

  const sortOptions = ["Best", "Hot", "New", "Top", "Rising"];
  const locationOptions = ["Everywhere", "Nearby", "Custom"];

  // Current user from AuthContext
  const currentUser = useMemo(() => {
    return { username: user?.username || "guest" };
  }, [user]);

  // map sort -> backend sort
  const backendSort = useMemo(() => {
    if (activeSort === "New") return "new";
    if (activeSort === "Top") return "top";
    if (activeSort === "Hot") return "hot";
    return "new";
  }, [activeSort]);

  // ✅ Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setErr("");

      try {
        const url = `${API_BASE}/posts?sort=${backendSort}&page=1&limit=50`;
        console.log("🔍 Fetching from:", url);

        const res = await fetch(url);

        console.log("📡 Response status:", res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ API Error response:", errorText);
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log("📊 Full API Response:", data);

        // Extract posts
        let rawPosts = [];

        if (Array.isArray(data)) {
          rawPosts = data;
        } else if (data.posts && Array.isArray(data.posts)) {
          rawPosts = data.posts;
        } else if (data.data && Array.isArray(data.data)) {
          rawPosts = data.data;
        } else {
          const arrayKeys = Object.keys(data).filter((key) => Array.isArray(data[key]));
          if (arrayKeys.length > 0) rawPosts = data[arrayKeys[0]];
        }

        // Convert backend -> UI shape for PostCard component
        const uiPosts = rawPosts.map((p) => ({
          _id: p._id,
          id: p._id,
          title: p.title || "(No title)",
          body: p.body || "",
          author: p.author || { username: "unknown" },
          community: p.community,
          subreddit: p.community?.name ? `r/${p.community.name}` : "r/general",
          upvotes: p.upvotes ?? 0,
          commentsCount: p.commentsCount ?? 0,
          voteState: null,
          mediaUrl: p.mediaUrl || null,
          image: p.mediaUrl || null,
          type: p.type || "text",
          createdAt: p.createdAt,
        }));

        setPosts(uiPosts);
        // initialize display order to the fetched order
        setDisplayOrder(uiPosts.map((p) => p._id || p.id));
      } catch (e) {
        console.error("🔥 Feed fetch error:", e);
        setErr(e.message || "Something went wrong");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [backendSort]);

  // ✅ Fetch communities from backend
  useEffect(() => {
    const fetchCommunities = async () => {
      setCommunitiesLoading(true);
      try {
        const res = await fetch(`${API_BASE}/community`);
        if (res.ok) {
          const data = await res.json();
          const formattedCommunities =
            data.communities?.map((community, index) => ({
              id: community._id || index + 1,
              name: `r/${community.name}`,
              members: formatNumber(community.members || 0) + " members",
              isJoined: false,
              _id: community._id,
            })) || [];
          setCommunities(formattedCommunities);
        }
      } catch (error) {
        console.error("Error fetching communities:", error);
      } finally {
        setCommunitiesLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const formatNumber = (num) => {
    const n = Number(num) || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  // display order preserved across small local updates (like voting)
  const [displayOrder, setDisplayOrder] = useState([]);
  // skip updating displayOrder when we intentionally change posts locally (e.g. after a vote)
  const skipDisplayOrderUpdateRef = useRef(false);

  // helper: build id -> post map
  const postsById = useMemo(() => {
    const m = {};
    posts.forEach((p) => {
      const id = p._id || p.id;
      if (id) m[id] = p;
    });
    return m;
  }, [posts]);

  // When posts or activeSort change (normally due to fetch or user changing sort),
  // compute a new display order unless we've flagged to skip (local vote update).
  useEffect(() => {
    if (skipDisplayOrderUpdateRef.current) {
      // consume the skip and do not update displayOrder
      skipDisplayOrderUpdateRef.current = false;
      return;
    }

    const list = [...posts];

    if (activeSort === "Hot") {
      list.sort((a, b) => b.commentsCount - a.commentsCount);
    } else if (activeSort === "Top") {
      list.sort((a, b) => b.upvotes - a.upvotes);
    } else if (activeSort === "Rising") {
      list.sort((a, b) => b.upvotes - a.upvotes);
    } else if (activeSort === "Best") {
      list.sort(
        (a, b) =>
          b.upvotes * 0.7 +
          b.commentsCount * 0.3 -
          (a.upvotes * 0.7 + a.commentsCount * 0.3)
      );
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setDisplayOrder(list.map((p) => p._id || p.id));
  }, [posts, activeSort]);

  // filteredPosts respects displayOrder and avoids re-sorting on vote actions
  const filteredPosts = useMemo(() => {
    if (!displayOrder || displayOrder.length === 0) return posts;
    return displayOrder.map((id) => postsById[id]).filter(Boolean);
  }, [displayOrder, postsById, posts]);

  // Post voting handler
  const handlePostVote = async (postId, voteType) => {
    const userId = user?._id;

    if (!userId) {
      alert("You must be logged in to vote.");
      return;
    }

    const value = voteType === "up" ? 1 : -1;

    try {
      const res = await fetch(`${API_BASE}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          targetType: "Post",
          targetId: postId,
          value,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Vote failed");
        return;
      }

      // Update UI post from server response (preserve display order)
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId || p.id === postId
            ? { ...p, upvotes: data.upvotes, voteState: data.voteState }
            : p
        )
      );
      // prevent re-computing display order for this local update
      skipDisplayOrderUpdateRef.current = true;
    } catch (error) {
      console.error("Vote error:", error);
      alert("Failed to vote");
    }
  };

  const toggleJoinCommunity = (id) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isJoined: !c.isJoined } : c))
    );
  };

  const toggleJoinFeatured = () => {
    setJoinedFeatured((prev) => !prev);
  };

  

  return (
    <div className="feed">
      <Sidebar
        sidebarActive={sidebarActive}
        setSidebarActive={setSidebarActive}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        toggleJoinCommunity={toggleJoinCommunity}
        communities={communities}
      />

      <main className="feed-main">
        <Header currentUser={currentUser} />

        <div className="feed-content">
         

          <div className="feed-grid">
            {/* Posts Column */}
            <section className="feed-posts-column">
              {/* Filters */}
              <div className="feed-filter-bar">
                <div className="filter-controls">
                  <div className="feed-filter-wrapper">
                    <button
                      className="feed-filter-btn"
                      onClick={() => setSortDropdownOpen((prev) => !prev)}
                      onBlur={() => setTimeout(() => setSortDropdownOpen(false), 200)}
                    >
                      {activeSort} ▼
                    </button>

                    {sortDropdownOpen && (
                      <div className="feed-dropdown">
                        {sortOptions.map((opt) => (
                          <button
                            key={opt}
                            className={`feed-dropdown-item ${
                              opt === activeSort ? "active" : ""
                            }`}
                            onClick={() => {
                              setActiveSort(opt);
                              setSortDropdownOpen(false);
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="feed-filter-wrapper">
                    <button
                      className="feed-filter-btn"
                      onClick={() => setLocDropdownOpen((prev) => !prev)}
                      onBlur={() => setTimeout(() => setLocDropdownOpen(false), 200)}
                    >
                      {activeLocation}
                    </button>

                    {locDropdownOpen && (
                      <div className="feed-dropdown">
                        {locationOptions.map((opt) => (
                          <button
                            key={opt}
                            className={`feed-dropdown-item ${
                              opt === activeLocation ? "active" : ""
                            }`}
                            onClick={() => {
                              setActiveLocation(opt);
                              setLocDropdownOpen(false);
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Featured Community Card (Optional) */}
              {communities.length > 0 && (
                <article className="feed-featured-card">
                  <div className="feed-featured-header">
                    <div className="feed-featured-avatar"></div>
                    <div className="feed-featured-meta">
                      <div className="feed-featured-line">
                        <span className="feed-featured-subreddit">{communities[0]?.name}</span>
                        <span className="feed-featured-author">
                          {" "}
                          • Featured Community • {communities[0]?.members}
                        </span>
                      </div>
                    </div>

                    <button
                      className={joinedFeatured ? "btn-join btn-join--joined" : "btn-join"}
                      onClick={toggleJoinFeatured}
                    >
                      {joinedFeatured ? "Joined" : "Join"}
                    </button>
                  </div>

                  <div className="feed-featured-body">
                    <h2 className="feed-featured-title">
                      Welcome to {communities[0]?.name?.replace("r/", "")}
                    </h2>
                    <div className="feed-featured-thumbnail">
                      <div className="feed-featured-overlay">
                        Join our growing community of enthusiasts and share your thoughts!
                      </div>
                    </div>
                  </div>
                </article>
              )}

             

              {err && (
                <div className="feed-status feed-status--error">
                  <span>⚠️ {err}</span>
                  <button className="retry-btn" onClick={() => window.location.reload()}>
                    Retry
                  </button>
                </div>
              )}

              {/* Posts using PostCard Component */}
              {!loading && !err && filteredPosts.length > 0 && (
                <div className="posts-container">
                  {filteredPosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onVote={handlePostVote}
                      showCommunity={true}
                    />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && !err && filteredPosts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No posts found</h3>
                  <p>Be the first to create a post!</p>
                  
                </div>
              )}

              
            </section>

            {/* Communities sidebar */}
            <aside className="feed-communities">
              <div className="feed-communities-card">
                <div className="card-header">
                  <h3 className="feed-communities-title">POPULAR COMMUNITIES</h3>
                  <button
                    className="create-community-btn"
                    onClick={() => console.log("Create community clicked")}
                  >
                    Create
                  </button>
                </div>

                {communitiesLoading ? (
                  <div className="communities-loading">
                    <div className="loading-spinner small"></div>
                    <span>Loading communities...</span>
                  </div>
                ) : (
                  <>
                    <div className="feed-communities-list">
                      {(seeMoreCommunities ? communities : communities.slice(0, 5)).map(
                        (community) => (
                          <div key={community.id} className="feed-community-item">
                            <div className="feed-community-avatar">
                              {community.name.charAt(2) || "R"}
                            </div>
                            <div className="feed-community-info">
                              <div className="feed-community-name">{community.name}</div>
                              <div className="feed-community-members">{community.members}</div>
                            </div>

                            <button
                              className={
                                community.isJoined ? "btn-join btn-join--joined" : "btn-join"
                              }
                              onClick={() => toggleJoinCommunity(community.id)}
                            >
                              {community.isJoined ? "Joined" : "Join"}
                            </button>
                          </div>
                        )
                      )}
                    </div>

                    <button
                      className="feed-see-more-btn"
                      onClick={() => setSeeMoreCommunities((prev) => !prev)}
                    >
                      {seeMoreCommunities ? "Show less" : "See more"}
                    </button>
                  </>
                )}
              </div>

              {/* Reddit Premium Ad */}
              <div className="premium-card">
                <div className="premium-header">
                  <h4>Reddit Premium</h4>
                  <span className="premium-badge">PREMIUM</span>
                </div>
                <p className="premium-desc">
                  The best Reddit experience, with monthly Coins
                </p>
                <button className="premium-btn">Try Now</button>
              </div>

              {/* Footer Links */}
              <div className="footer-links">
                <a href="/content-policy">Content Policy</a>
                <a href="/privacy-policy">Privacy Policy</a>
                <a href="/user-agreement">User Agreement</a>
                <div className="copyright">© 2024 Reddit Clone. All rights reserved.</div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}