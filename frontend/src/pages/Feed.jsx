import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import Header from "../components/Header.jsx";
import "./Feed.css";

const API_BASE = "http://localhost:5000";
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&h=520&fit=crop";

export default function Feed() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // REAL POSTS (from backend)
  const [posts, setPosts] = useState([]); // UI-ready posts
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // COMMUNITIES (still dummy for now)
  const [communities, setCommunities] = useState([
    { id: 1, name: "r/AskReddit", members: "45.2M", isJoined: false },
    { id: 2, name: "r/leagueoflegends", members: "6.8M", isJoined: false },
    { id: 3, name: "r/OutOfTheLoop", members: "3.4M", isJoined: false },
    { id: 4, name: "r/discordapp", members: "1.2M", isJoined: false },
    { id: 5, name: "r/Twitch", members: "2.9M", isJoined: false },
  ]);

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

  // Read logged-in user from localStorage (works even without AuthContext)
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const currentUser = { username: storedUser?.username || "guest" };

  const formatNumber = (num) => {
    const n = Number(num) || 0;
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n;
  };

  // map sort -> backend sort (if your backend ignores query, it's ok)
  const backendSort = useMemo(() => {
    if (activeSort === "New") return "new";
    if (activeSort === "Top") return "top";
    if (activeSort === "Hot") return "hot";
    // Best/Rising: we’ll sort locally
    return "new";
  }, [activeSort]);

  // ✅ Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setErr("");

      try {
        const res = await fetch(
          `${API_BASE}/posts?sort=${backendSort}&page=1&limit=50`
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load posts");

        // Support different response shapes:
        const rawPosts = Array.isArray(data)
          ? data
          : data.posts || data.data || [];

        // Convert backend -> UI shape
        const uiPosts = rawPosts.map((p) => ({
          id: p._id, // IMPORTANT for unique keys
          title: p.title || "(No title)",
          body: p.body || "",
          subtitle: p.body
            ? p.body.length > 70
              ? p.body.slice(0, 70) + "..."
              : p.body
            : "",
          author: `u/${p.author?.username || "unknown"}`, // if you don’t populate, it may show unknown
          subreddit: p.community?.name ? `r/${p.community.name}` : "r/general",
          upvotes: p.upvotes ?? 0,
          comments: p.commentsCount ?? 0,
          voteState: null,
          image: p.mediaUrl || FALLBACK_IMG,
          createdAt: p.createdAt,
        }));

        setPosts(uiPosts);
      } catch (e) {
        console.error("Feed fetch error:", e);
        setErr(e.message || "Something went wrong");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [backendSort]);

  // local sorting (keeps your old behavior)
  const filteredPosts = useMemo(() => {
    let list = [...posts];

    if (activeSort === "Hot") {
      list.sort((a, b) => b.comments - a.comments);
    } else if (activeSort === "Top") {
      list.sort((a, b) => b.upvotes - a.upvotes);
    } else if (activeSort === "Rising") {
      list.sort((a, b) => a.upvotes - b.upvotes);
    } else {
      // Best
      list.sort((a, b) => b.upvotes + b.comments - (a.upvotes + a.comments));
    }

    return list;
  }, [posts, activeSort, activeLocation]);

  // Voting pill (frontend-only for now)
  const handlePostVote = (postId, voteType) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

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
                <div className="feed-filter-wrapper">
                  <button
                    className="feed-filter-btn"
                    onClick={() => setSortDropdownOpen((prev) => !prev)}
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

              {/* Featured card */}
              <article className="feed-featured-card">
                <div className="feed-featured-header">
                  <div className="feed-featured-avatar"></div>
                  <div className="feed-featured-meta">
                    <div className="feed-featured-line">
                      <span className="feed-featured-subreddit">r/funny</span>
                      <span className="feed-featured-author">
                        {" "}
                        • Posted by u/SomeUserGM • 3 hours ago
                      </span>
                    </div>
                  </div>

                  <button
                    className={
                      joinedFeatured ? "btn-join btn-join--joined" : "btn-join"
                    }
                    onClick={toggleJoinFeatured}
                  >
                    {joinedFeatured ? "Joined" : "Join"}
                  </button>
                </div>

                <div className="feed-featured-body">
                  <h2 className="feed-featured-title">
                    Mom, I want to change my name
                  </h2>
                  <div className="feed-featured-thumbnail">
                    <div className="feed-featured-overlay">
                      When you realize this is the lady your Mom chose to name
                      you after 💀💀
                    </div>
                  </div>
                </div>
              </article>

              {/* Loading / Error */}
              {loading && <div className="feed-status">Loading posts…</div>}
              {err && <div className="feed-status feed-status--error">{err}</div>}

              {/* Posts (Reddit-like layout) */}
              {!loading &&
                !err &&
                filteredPosts.map((post, idx) => (
                  <article
                    key={post.id ?? `post-${idx}`} // ✅ prevents “only 1 shows” bug
                    className="feed-post-card feed-post-card--large"
                  >
                    {/* header row */}
                    <div className="feed-post-header">
                      <div className="feed-post-header-left">
                        <span className="feed-post-subreddit">{post.subreddit}</span>
                        <span className="feed-post-dot">•</span>
                        <span className="feed-post-author">{post.author}</span>
                      </div>
                      <button className="feed-post-more" title="More">
                        •••
                      </button>
                    </div>

                    {/* title */}
                    <h3 className="feed-post-title">{post.title}</h3>

                    {/* body preview */}
                    {post.subtitle && (
                      <p className="feed-post-subtitle">{post.subtitle}</p>
                    )}

                    {/* big media */}
                    <div className="feed-post-media">
                      <img src={post.image} alt={post.title} />
                    </div>

                    {/* actions */}
                    <div className="feed-post-actions">
                      <div
                        className={`vote-pill ${
                          post.voteState === "up"
                            ? "vote-pill--up"
                            : post.voteState === "down"
                            ? "vote-pill--down"
                            : ""
                        }`}
                      >
                        <button
                          className={`vote-btn ${
                            post.voteState === "up" ? "vote-btn--active" : ""
                          }`}
                          onClick={() => handlePostVote(post.id, "up")}
                        >
                          ▲
                        </button>
                        <span className="vote-count">
                          {formatNumber(post.upvotes)}
                        </span>
                        <button
                          className={`vote-btn ${
                            post.voteState === "down" ? "vote-btn--active" : ""
                          }`}
                          onClick={() => handlePostVote(post.id, "down")}
                        >
                          ▼
                        </button>
                      </div>

                      <button className="feed-action-btn">
                        💬 {post.comments}
                      </button>
                      <button className="feed-action-btn">↗ Share</button>
                    </div>
                  </article>
                ))}

              {!loading && !err && filteredPosts.length === 0 && (
                <div className="feed-status">No posts yet.</div>
              )}
            </section>

            {/* Communities sidebar */}
            <aside className="feed-communities">
              <div className="feed-communities-card">
                <h3 className="feed-communities-title">POPULAR COMMUNITIES</h3>

                <div className="feed-communities-list">
                  {(seeMoreCommunities ? communities : communities.slice(0, 3)).map(
                    (community) => (
                      <div key={community.id} className="feed-community-item">
                        <div className="feed-community-avatar"></div>
                        <div className="feed-community-info">
                          <div className="feed-community-name">
                            {community.name}
                          </div>
                          <div className="feed-community-members">
                            {community.members} members
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
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
