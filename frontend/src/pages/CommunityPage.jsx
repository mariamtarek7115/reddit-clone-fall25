import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import PostCard from "../components/PostCard.jsx";
import { AuthContext } from "../context/AuthContext";
import "./CommunityPage.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const CommunityPage = () => {
  const { communityName: rawCommunityName } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // current user (may be undefined)


  // Normalize community name (strip leading :, r/ or slashes) to avoid malformed params
  const communityName = rawCommunityName
    ? String(rawCommunityName).replace(/^[:\/]+|^r\//i, "").trim()
    : rawCommunityName;

  // Sidebar state (REQUIRED for your Sidebar component)
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarActive, setSidebarActive] = useState("Home");

  // Communities list (dummy for now; hook backend later)
  const [communities, setCommunities] = useState([
    { id: 1, name: "JavaScript" },
    { id: 2, name: "ReactJS" },
  ]);

  const toggleJoinCommunity = (id) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isJoined: !c.isJoined } : c))
    );
  };

  const [community, setCommunity] = useState(null);
  const [sortBy, setSortBy] = useState("all");
  const [showMenu, setShowMenu] = useState(false);

  // Posts for this community
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [notFound, setNotFound] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    if (!communityName) return;

    const controller = new AbortController();
    const fetchCommunity = async () => {
      try {
        setNotFound(false);
        const res = await fetch(`${API_BASE}/community/${encodeURIComponent(communityName)}`, { signal: controller.signal });
        if (res.status === 404) {
          setNotFound(true);
          setCommunity(null);
          return;
        }
        const data = await res.json();
        setCommunity(data.community || data);
      } catch (e) {
        if (e.name !== 'AbortError') console.error('Error fetching community:', e);
        setCommunity(null);
      }
    };

    fetchCommunity();
    return () => controller.abort();
  }, [communityName]);

  // Fetch posts for the current community
  useEffect(() => {
    if (!community || !community.name) return;

    const fetchPosts = async () => {
      setLoading(true);
      setErr("");

      try {
        let url = `${API_BASE}/posts?communityName=${encodeURIComponent(
          community.name
        )}`;

        // When "All" is selected, we omit the sort param so backend returns community posts in default order
        if (sortBy && sortBy !== "all") {
          url += `&sort=${encodeURIComponent(sortBy)}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `HTTP ${res.status}`);
        }

        const data = await res.json();

        // Normalize response to an array of posts
        let rawPosts = [];
        if (Array.isArray(data)) rawPosts = data;
        else if (data.posts && Array.isArray(data.posts)) rawPosts = data.posts;
        else if (data.data && Array.isArray(data.data)) rawPosts = data.data;
        else {
          const arrKey = Object.keys(data).find((k) => Array.isArray(data[k]));
          if (arrKey) rawPosts = data[arrKey];
        }

        // Map to UI shape expected by PostCard
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
      } catch (e) {
        console.error("Error fetching community posts:", e);
        setErr(e.message || "Failed to fetch posts");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [community, sortBy]);

  // When community and user are present, check membership
  useEffect(() => {
    if (!community || !community._id || !user?._id) {
      setIsMember(false);
      return;
    }

    const controller = new AbortController();
    const checkMembership = async () => {
      try {
        const res = await fetch(`${API_BASE}/community/user/${user._id}`, { signal: controller.signal });
        if (!res.ok) {
          setIsMember(false);
          return;
        }
        const data = await res.json();
        const arr = data.communities || data || [];
        const found = arr.find((c) => c._id === community._id || c.name === community.name || (`r/${c.name}` === community.name));
        setIsMember(!!found);
      } catch (e) {
        if (e.name !== 'AbortError') console.error('Error checking membership:', e);
        setIsMember(false);
      }
    };

    checkMembership();
    return () => controller.abort();
  }, [community, user]);

  if (!community) return <div className="loading">Loading…</div>;

  return (
    <>
      <Header />

      <div className="reddit-shell">
        {/* LEFT GLOBAL NAV */}
        <Sidebar
          sidebarActive={sidebarActive}
          setSidebarActive={setSidebarActive}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          toggleJoinCommunity={toggleJoinCommunity}
          communities={communities.map((c) => ({
            ...c,
            // Sidebar expects strings like "r/JavaScript" in UI,
            // but it also uses navigate("/community/" + community.name)
            // so we should keep just the name here.
            name: c.name,
          }))}
        />

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
                  className={`join-btn ${isMember ? 'joined' : ''}`}
                  onClick={async () => {
                    if (!user?._id) {
                      navigate('/login');
                      return;
                    }

                    if (joinLoading) return;
                    setJoinLoading(true);

                    try {
                      if (!isMember) {
                        const res = await fetch(`${API_BASE}/community/${community._id}/join`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ userId: user._id }),
                        });

                        if (!res.ok) {
                          const txt = await res.text();
                          throw new Error(txt || `HTTP ${res.status}`);
                        }

                        setIsMember(true);
                        setCommunity((prev) => ({ ...prev, membersCount: (prev.membersCount || 0) + 1 }));
                      } else {
                        const res = await fetch(`${API_BASE}/community/${community._id}/leave`, {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ userId: user._id }),
                        });

                        if (!res.ok) {
                          const txt = await res.text();
                          throw new Error(txt || `HTTP ${res.status}`);
                        }

                        setIsMember(false);
                        setCommunity((prev) => ({ ...prev, membersCount: Math.max(0, (prev.membersCount || 1) - 1) }));
                      }
                    } catch (e) {
                      console.error('Join/Leave error:', e);
                      alert('Failed to update membership');
                    } finally {
                      setJoinLoading(false);
                    }
                  }}
                >
                  {isMember ? (joinLoading ? '...' : 'Joined') : (joinLoading ? '...' : 'Join')}
                </button>

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
                    onClick={() => setShowMenu((prev) => !prev)}
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
                <button
                  className={sortBy === 'all' ? 'active' : ''}
                  onClick={() => setSortBy('all')}
                >
                  All
                </button>
              </div>

              {/* Posts (fetch on mount and when sortBy changes). "All" omits sort param so backend returns community posts without additional sorting. */}
              {loading && <div className="loading">Loading posts…</div>}

              {err && <div className="error">⚠️ {err}</div>}

              {!loading && !err && posts.length > 0 && (
                <div className="posts-container">
                  {posts.map((p, idx) => (
                    <PostCard
                      key={p._id || p.id || idx}
                      post={{
                        ...p,
                        image: p.mediaUrl || null,
                        mediaUrl: p.mediaUrl || null,
                      }}
                      showCommunity={false}
                      showFullContent={false}
                    />
                  ))}
                </div>
              )}

              {!loading && !err && posts.length === 0 && (
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
              )}
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
                  onClick={() => navigate(`/community/${community.name}/message-mods`)}
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
                    onClick={() => navigate(`/community/${community.name}/mods`)}
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
