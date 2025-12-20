import React, { useContext, useEffect, useMemo, useState, useRef } from "react";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import Header from "../components/Header.jsx";
import PostCard from "../components/PostCard.jsx";
import { AuthContext } from "../context/AuthContext";
import "./Feed.css";

const API_BASE = "http://localhost:5000";

export default function Feed() {
  const { user } = useContext(AuthContext);
  const userId = user?._id;

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

  // display order preserved across small local updates (like voting)
  const [displayOrder, setDisplayOrder] = useState([]);
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

  // ✅ Fetch posts from backend (CUSTOM FEED)
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setErr("");

      try {
        if (!userId) {
          setPosts([]);
          setDisplayOrder([]);
          setErr("You must be logged in to view your feed.");
          return;
        }

        const url = `${API_BASE}/posts/myfeed?userId=${userId}&sort=${backendSort}&page=1&limit=50`;
        console.log("🔍 Fetching from:", url);

        const res = await fetch(url);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log("📬 Feed data:", data);
        let rawPosts = [];
        if (Array.isArray(data)) rawPosts = data;
        else if (Array.isArray(data.posts)) rawPosts = data.posts;
        else if (Array.isArray(data.data)) rawPosts = data.data;
        else {
          const arrayKeys = Object.keys(data).filter((key) => Array.isArray(data[key]));
          if (arrayKeys.length > 0) rawPosts = data[arrayKeys[0]];
        }

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
          voteState: p.voteState ?? null,
          mediaUrl: p.mediaUrl || null,
          image: p.mediaUrl || null,
          type: p.type || "text",
          createdAt: p.createdAt,
        }));

        setPosts(uiPosts);
        setDisplayOrder(uiPosts.map((p) => p._id || p.id));
      } catch (e) {
        console.error("🔥 Feed fetch error:", e);
        setErr(e.message || "Something went wrong");
        setPosts([]);
        setDisplayOrder([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [backendSort, userId]);

  // NOTE: preserve the exact order returned from the backend.
  // The server controls ordering (including joined-community prioritization),
  // so we should not re-sort posts client-side here. Display order is set
  // when posts are fetched.

  const filteredPosts = useMemo(() => {
    if (!displayOrder || displayOrder.length === 0) return posts;
    return displayOrder.map((id) => postsById[id]).filter(Boolean);
  }, [displayOrder, postsById, posts]);

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

  // Post voting handler
  const handlePostVote = async (postId, voteType) => {
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

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId || p.id === postId
            ? { ...p, upvotes: data.upvotes, voteState: data.voteState }
            : p
        )
      );

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

  const toggleJoinFeatured = () => setJoinedFeatured((prev) => !prev);

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
            <section className="feed-posts-column">
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
                            className={`feed-dropdown-item ${opt === activeSort ? "active" : ""}`}
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
                            className={`feed-dropdown-item ${opt === activeLocation ? "active" : ""}`}
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

              {err && (
                <div className="feed-status feed-status--error">
                  <span>⚠️ {err}</span>
                  <button className="retry-btn" onClick={() => window.location.reload()}>
                    Retry
                  </button>
                </div>
              )}

              {loading && (
                <div className="feed-status">
                  <span>Loading...</span>
                </div>
              )}

              {!loading && !err && filteredPosts.length > 0 && (
                <div className="posts-container">
                  {filteredPosts.map((post) => (
                    <PostCard key={post._id} post={post} onVote={handlePostVote} showCommunity />
                  ))}
                </div>
              )}

              {!loading && !err && filteredPosts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No posts found</h3>
                  <p>Be the first to create a post!</p>
                </div>
              )}
            </section>

            <aside className="feed-communities">
              <div className="feed-communities-card">
                <div className="card-header">
                  <h3 className="feed-communities-title">POPULAR COMMUNITIES</h3>
                  <button className="create-community-btn" onClick={() => console.log("Create")}>
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
                      {(seeMoreCommunities ? communities : communities.slice(0, 5)).map((community) => (
                        <div key={community.id} className="feed-community-item">
                          <div className="feed-community-avatar">{community.name.charAt(2) || "R"}</div>
                          <div className="feed-community-info">
                            <div className="feed-community-name">{community.name}</div>
                            <div className="feed-community-members">{community.members}</div>
                          </div>

                          <button
                            className={community.isJoined ? "btn-join btn-join--joined" : "btn-join"}
                            onClick={() => toggleJoinCommunity(community.id)}
                          >
                            {community.isJoined ? "Joined" : "Join"}
                          </button>
                        </div>
                      ))}
                    </div>

                    <button className="feed-see-more-btn" onClick={() => setSeeMoreCommunities((p) => !p)}>
                      {seeMoreCommunities ? "Show less" : "See more"}
                    </button>
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}