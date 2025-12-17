import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import Header from "../components/Header.jsx";
import PostCard from "../components/PostCard.jsx";
import "./Feed.css";

const API_BASE = "http://localhost:5000";
const FALLBACK_IMG = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&h=520&fit=crop";

export default function Feed() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // REAL POSTS (from backend)
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

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

  // Read logged-in user from localStorage
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const currentUser = { username: storedUser?.username || "guest" };

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
      setDebugInfo("Starting fetch...");

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

        // DEBUG: Check what structure we have
        console.log("🔍 Debugging response structure:");
        console.log("- Is array?", Array.isArray(data));
        console.log("- Has 'posts' property?", data.posts !== undefined);
        console.log("- Posts is array?", Array.isArray(data.posts));
        console.log("- Posts count:", data.posts ? data.posts.length : 0);

        // Extract posts
        let rawPosts = [];
        
        if (Array.isArray(data)) {
          rawPosts = data;
          console.log("✅ Response is direct array, count:", rawPosts.length);
        } else if (data.posts && Array.isArray(data.posts)) {
          rawPosts = data.posts;
          console.log("✅ Found posts array in data.posts, count:", rawPosts.length);
        } else if (data.data && Array.isArray(data.data)) {
          rawPosts = data.data;
          console.log("✅ Found posts array in data.data, count:", rawPosts.length);
        } else {
          const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]));
          if (arrayKeys.length > 0) {
            rawPosts = data[arrayKeys[0]];
            console.log(`✅ Found array in key '${arrayKeys[0]}', count:`, rawPosts.length);
          } else {
            console.warn("⚠️ No array found in response, using empty array");
            rawPosts = [];
          }
        }

        console.log(`📝 Final raw posts count: ${rawPosts.length}`);

        // Show first post for debugging
        if (rawPosts.length > 0) {
          console.log("📄 First post sample:", rawPosts[0]);
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
          mediaUrl: p.mediaUrl || FALLBACK_IMG,
          image: p.mediaUrl || FALLBACK_IMG,
          type: p.type || "text",
          createdAt: p.createdAt,
        }));

        console.log(`🎨 Converted to ${uiPosts.length} UI posts`);
        setPosts(uiPosts);

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
          const formattedCommunities = data.communities?.map((community, index) => ({
            id: community._id || index + 1,
            name: `r/${community.name}`,
            members: formatNumber(community.members || 0) + " members",
            isJoined: false,
            _id: community._id
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

  // local sorting
  const filteredPosts = useMemo(() => {
    let list = [...posts];

    if (activeSort === "Hot") {
      list.sort((a, b) => b.commentsCount - a.commentsCount);
    } else if (activeSort === "Top") {
      list.sort((a, b) => b.upvotes - a.upvotes);
    } else if (activeSort === "Rising") {
      list.sort((a, b) => b.upvotes - a.upvotes);
    } else if (activeSort === "Best") {
      list.sort((a, b) => (b.upvotes * 0.7 + b.commentsCount * 0.3) - (a.upvotes * 0.7 + a.commentsCount * 0.3));
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [posts, activeSort]);

  // Voting handler for PostCard
  const handlePostVote = async (postId, voteType) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId && post._id !== postId) return post;

        let newUpvotes = post.upvotes;
        let newState = voteType;

        if (post.voteState === voteType) {
          newUpvotes = voteType === "up" ? post.upvotes - 1 : post.upvotes + 1;
          newState = null;
        } else if (post.voteState === null) {
          newUpvotes = voteType === "up" ? post.upvotes + 1 : post.upvotes - 1;
        } else {
          newUpvotes = voteType === "up" ? post.upvotes + 2 : post.upvotes - 2;
        }

        return { ...post, upvotes: newUpvotes, voteState: newState };
      })
    );
  };

  const toggleJoinCommunity = (id) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isJoined: !c.isJoined } : c))
    );
  };

  const toggleJoinFeatured = () => {
    setJoinedFeatured((prev) => !prev);
  };

  // Test API directly
  const testApiDirectly = async () => {
    try {
      console.log("🧪 Testing API directly...");
      const res = await fetch(`${API_BASE}/posts`);
      const data = await res.json();
      console.log("🧪 Direct test result:", data);
      alert(`Direct test: ${data.posts ? data.posts.length : 0} posts found`);
    } catch (error) {
      console.error("🧪 Test failed:", error);
      alert(`Test failed: ${error.message}`);
    }
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
          {/* Test API Button */}
          <button 
            onClick={testApiDirectly}
            style={{
              position: 'fixed',
              top: '80px',
              right: '20px',
              zIndex: 1000,
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Test API
          </button>

          <div className="feed-grid">
            {/* Posts Column - REMOVED CREATE POST BAR */}
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
                      Welcome to {communities[0]?.name?.replace('r/', '')}
                    </h2>
                    <div className="feed-featured-thumbnail">
                      <div className="feed-featured-overlay">
                        Join our growing community of enthusiasts and share your thoughts!
                      </div>
                    </div>
                  </div>
                </article>
              )}

              {/* Loading / Error */}
              {loading && (
                <div className="feed-status loading">
                  <div className="loading-spinner"></div>
                  <span>Loading posts...</span>
                </div>
              )}
              
              {err && (
                <div className="feed-status feed-status--error">
                  <span>⚠️ {err}</span>
                  <button 
                    className="retry-btn" 
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Posts using PostCard Component */}
              {!loading && !err && filteredPosts.length > 0 && (
                <div className="posts-container">
                  {filteredPosts.map((post, index) => (
                    <PostCard
                      key={post.id || post._id || index}
                      post={post}
                      onVote={handlePostVote}
                      showCommunity={true}
                      showFullContent={false}
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
                  <button 
                    onClick={testApiDirectly}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--accent)',
                      color: 'var(--accent)',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      marginTop: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Test API Connection
                  </button>
                </div>
              )}

              {/* Load More */}
              {!loading && !err && filteredPosts.length > 0 && (
                <div className="load-more-container">
                  <button className="load-more-btn">
                    Load More Posts
                  </button>
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
                              {community.name.charAt(2) || 'R'}
                            </div>
                            <div className="feed-community-info">
                              <div className="feed-community-name">
                                {community.name}
                              </div>
                              <div className="feed-community-members">
                                {community.members}
                              </div>
                            </div>

                            <button
                              className={
                                community.isJoined
                                  ? "btn-join btn-join--joined"
                                  : "btn-join"
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
                <div className="copyright">
                  © 2024 Reddit Clone. All rights reserved.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}