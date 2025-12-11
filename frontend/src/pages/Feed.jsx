// src/pages/Feed.jsx
import React, { useState, useEffect } from "react";
import "./Feed.css";

export default function Feed() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // POSTS data
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Indigenous star held by ICE",
      subtitle: "Lest we Forget: How Indigenous Amer...",
      author: "u/thatsnotha",
      subreddit: "r/news",
      upvotes: 26000,
      comments: 420,
      voteState: null,
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=250&fit=crop",
    },
    {
      id: 2,
      title: "Tim Walz responds to Trump",
      subtitle: "Tim Walz responds to Donald Trump cal...",
      author: "u/politics",
      subreddit: "r/politics",
      upvotes: 45000,
      comments: 1203,
      voteState: null,
      image:
        "https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?w=400&h=250&fit=crop",
    },
    {
      id: 3,
      title: "Kim Kardashian's brain scan",
      subtitle: "Kim Kardashian Learns She Has 'GAD, Br...",
      author: "u/entertainment",
      subreddit: "r/entertainment",
      upvotes: 12000,
      comments: 856,
      voteState: null,
      image:
        "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&h=250&fit=crop",
    },
    {
      id: 4,
      title: "Trump's Ukraine pos",
      subtitle: "Biograph/Trump proposes t",
      author: "u/worldnews",
      subreddit: "r/worldnews",
      upvotes: 89000,
      comments: 2341,
      voteState: null,
      image:
        "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=400&h=250&fit=crop",
    },
  ]);

  // COMMUNITIES
  const [communities, setCommunities] = useState([
    { id: 1, name: "r/AskReddit", members: "45.2M", isJoined: false },
    { id: 2, name: "r/leagueoflegends", members: "6.8M", isJoined: false },
    { id: 3, name: "r/OutOfTheLoop", members: "3.4M", isJoined: false },
    { id: 4, name: "r/discordapp", members: "1.2M", isJoined: false },
    { id: 5, name: "r/Twitch", members: "2.9M", isJoined: false },
  ]);

  const [joinedFeatured, setJoinedFeatured] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState(posts);
  const [activeSort, setActiveSort] = useState("Best");
  const [activeLocation, setActiveLocation] = useState("Everywhere");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [locDropdownOpen, setLocDropdownOpen] = useState(false);
  const [sidebarActive, setSidebarActive] = useState("Home");
  const [seeMoreCommunities, setSeeMoreCommunities] = useState(false);

  // suggestions for search bar
  const [searchSuggestionsOpen, setSearchSuggestionsOpen] = useState(false);

  useEffect(() => {
    let list = [...posts];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.subtitle || "").toLowerCase().includes(q) ||
          p.subreddit.toLowerCase().includes(q)
      );
    }

    if (activeSort === "Hot") {
      list.sort((a, b) => b.comments - a.comments);
    } else if (activeSort === "Top") {
      list.sort((a, b) => b.upvotes - a.upvotes);
    } else if (activeSort === "Rising") {
      list.sort((a, b) => a.upvotes - b.upvotes);
    } else {
      // Best (default)
      list.sort(
        (a, b) => b.upvotes + b.comments - (a.upvotes + a.comments)
      );
    }

    setFilteredPosts(list);
  }, [posts, searchQuery, activeSort, activeLocation]);

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num;
  };

  const handlePostVote = (postId, voteType) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        let newUpvotes = post.upvotes;
        let newState = voteType;

        if (post.voteState === voteType) {
          // remove vote
          newUpvotes =
            voteType === "up" ? post.upvotes - 1 : post.upvotes + 1;
          newState = null;
        } else if (post.voteState === null) {
          // add vote
          newUpvotes =
            voteType === "up" ? post.upvotes + 1 : post.upvotes - 1;
        } else {
          // switch vote
          newUpvotes =
            voteType === "up" ? post.upvotes + 2 : post.upvotes - 2;
        }

        return { ...post, upvotes: newUpvotes, voteState: newState };
      })
    );
  };

  const toggleJoinCommunity = (id) => {
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isJoined: !c.isJoined } : c
      )
    );
  };

  const toggleJoinFeatured = () => {
    setJoinedFeatured((prev) => !prev);
  };

  const handleSearchChange = (e) => {
    const v = e.target.value;
    setSearchQuery(v);
    setSearchSuggestionsOpen(Boolean(v.trim()));
  };

  const sortOptions = ["Best", "Hot", "New", "Top", "Rising"];
  const locationOptions = ["Everywhere", "Nearby", "Custom"];

  const suggestions = [
    ...posts.map((p) => p.title),
    ...communities.map((c) => c.name),
  ]
    .filter(Boolean)
    .slice(0, 8)
    .filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="feed">
      {/* Sidebar */}
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
            className={`sidebar-nav-item ${
              sidebarActive === "Home" ? "active" : ""
            }`}
            onClick={() => setSidebarActive("Home")}
          >
            <span>🏠</span>
            {sidebarOpen && <span>Home</span>}
          </button>

          <button
            className={`sidebar-nav-item ${
              sidebarActive === "Popular" ? "active" : ""
            }`}
            onClick={() => setSidebarActive("Popular")}
          >
            <span>📈</span>
            {sidebarOpen && <span>Popular</span>}
          </button>

          <button
            className={`sidebar-nav-item ${
              sidebarActive === "Answers" ? "active" : ""
            }`}
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
            className={`sidebar-nav-item ${
              sidebarActive === "Explore" ? "active" : ""
            }`}
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

              <div className="sidebar-section-title">COMMUNITIES</div>
              <button className="sidebar-nav-item">Best of Reddit</button>
              <button className="sidebar-nav-item">
                Best of Reddit in P...
              </button>
              <button className="sidebar-nav-item">
                Best of Reddit in G...
              </button>
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

      {/* Main content */}
      <main className="feed-main">
        {/* Header search */}
        <header className="feed-header">
          <div className="feed-search-wrapper">
            <input
              type="text"
              className="feed-search-input"
              placeholder="Search Reddit"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSearchSuggestionsOpen(false);
                if (e.key === "Escape") setSearchSuggestionsOpen(false);
              }}
              onFocus={() =>
                setSearchSuggestionsOpen(Boolean(searchQuery.trim()))
              }
              onBlur={() =>
                setTimeout(() => setSearchSuggestionsOpen(false), 120)
              }
            />
            {searchSuggestionsOpen && suggestions.length > 0 && (
              <div className="feed-search-suggestions">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="feed-search-suggestion-item"
                    onMouseDown={() => {
                      setSearchQuery(s);
                      setSearchSuggestionsOpen(false);
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="feed-content">
          <div className="feed-grid">
            {/* Posts Column */}
            <section className="feed-posts-column">
              {/* Filters */}
              <div className="feed-filter-bar">
                <div className="feed-filter-wrapper">
                  <button
                    className="feed-filter-btn"
                    onClick={() =>
                      setSortDropdownOpen((prev) => !prev)
                    }
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
                    onClick={() =>
                      setLocDropdownOpen((prev) => !prev)
                    }
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

              {/* Featured community card */}
              <article className="feed-featured-card">
                <div className="feed-featured-header">
                  <div className="feed-featured-avatar"></div>
                  <div className="feed-featured-meta">
                    <div className="feed-featured-line">
                      <span className="feed-featured-subreddit">
                        r/funny
                      </span>
                      <span className="feed-featured-author">
                        {" "}
                        • Posted by u/SomeUserGM • 3 hours ago
                      </span>
                    </div>
                  </div>
                  <button
                    className={
                      joinedFeatured
                        ? "btn-join btn-join--joined"
                        : "btn-join"
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
                      When you realize this is the lady your Mom chose
                      to name you after 💀💀
                    </div>
                  </div>
                </div>
              </article>

              {/* Posts */}
              {filteredPosts.map((post) => (
                <article key={post.id} className="feed-post-card">
                  <div className="feed-post-layout">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="feed-post-thumbnail"
                    />
                    <div className="feed-post-details">
                      <h3 className="feed-post-title">
                        {post.title}
                      </h3>
                      <p className="feed-post-subtitle">
                        {post.subtitle}
                      </p>
                      <div className="feed-post-meta">
                        <span className="feed-post-subreddit">
                          {post.subreddit}
                        </span>
                        <span>•</span>
                        <span className="feed-post-author">
                          {post.author}
                        </span>
                      </div>
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
                              post.voteState === "up"
                                ? "vote-btn--active"
                                : ""
                            }`}
                            onClick={() =>
                              handlePostVote(post.id, "up")
                            }
                          >
                            ▲
                          </button>
                          <span className="vote-count">
                            {formatNumber(post.upvotes)}
                          </span>
                          <button
                            className={`vote-btn ${
                              post.voteState === "down"
                                ? "vote-btn--active"
                                : ""
                            }`}
                            onClick={() =>
                              handlePostVote(post.id, "down")
                            }
                          >
                            ▼
                          </button>
                        </div>

                        <button className="feed-action-btn">
                          💬 {post.comments}
                        </button>
                        <button className="feed-action-btn">
                          ↗ Share
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            {/* Communities sidebar */}
            <aside className="feed-communities">
              <div className="feed-communities-card">
                <h3 className="feed-communities-title">
                  POPULAR COMMUNITIES
                </h3>
                <div className="feed-communities-list">
                  {(seeMoreCommunities
                    ? communities
                    : communities.slice(0, 3)
                  ).map((community) => (
                    <div
                      key={community.id}
                      className="feed-community-item"
                    >
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
                        onClick={() =>
                          toggleJoinCommunity(community.id)
                        }
                      >
                        {community.isJoined ? "Joined" : "Join"}
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="feed-see-more-btn"
                  onClick={() =>
                    setSeeMoreCommunities((prev) => !prev)
                  }
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
