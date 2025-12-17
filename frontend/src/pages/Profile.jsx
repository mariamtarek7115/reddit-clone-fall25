import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header";
import NavigationMenu from "../components/NavigationMenu";
import { AuthContext } from "../context/AuthContext";

const API_BASE = "http://localhost:5000";

const Profile = () => {
  const { user } = useContext(AuthContext); // ✅ logged-in user from login/signup
  const username = user?.username; // e.g. mariam_Ibrahim200

  const [sidebarActive, setSidebarActive] = useState("Home");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState("Overview");

  // Sidebar dummy communities (keep for now)
  const [communities, setCommunities] = useState([
    { id: 1, name: "r/JavaScript" },
    { id: 2, name: "r/ReactJS" },
  ]);

  // Profile data states
  const [overview, setOverview] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [upvoted, setUpvoted] = useState({ posts: [], comments: [] });
  const [downvoted, setDownvoted] = useState({ posts: [], comments: [] });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleJoinCommunity = (id) => {
    console.log("Join/Leave community:", id);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Fetch based on tab
  useEffect(() => {
    if (!username) return; // protected routes should prevent this, but safe guard

    const fetchTabData = async () => {
      setLoading(true);
      setError("");

      try {
        if (activeTab === "Overview") {
          const res = await fetch(`${API_BASE}/profile/${username}/overview`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to load overview");
          setOverview(data);
        }

        if (activeTab === "Posts") {
          const res = await fetch(`${API_BASE}/profile/${username}/posts`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to load posts");
          setPosts(data.posts || []);
        }

        if (activeTab === "Comments") {
          const res = await fetch(`${API_BASE}/profile/${username}/comments`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to load comments");
          setComments(data.comments || []);
        }

        if (activeTab === "Upvoted") {
          const res = await fetch(`${API_BASE}/profile/${username}/votes?value=1`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to load upvoted");
          setUpvoted({ posts: data.posts || [], comments: data.comments || [] });
        }

        if (activeTab === "Downvoted") {
          const res = await fetch(`${API_BASE}/profile/${username}/votes?value=-1`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to load downvoted");
          setDownvoted({ posts: data.posts || [], comments: data.comments || [] });
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTabData();
  }, [activeTab, username]);

  return (
    <div className="profile-page" style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
      {/* Sidebar */}
      <Sidebar
        sidebarActive={sidebarActive}
        setSidebarActive={setSidebarActive}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        toggleJoinCommunity={toggleJoinCommunity}
        communities={communities}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header (your Header now reads AuthContext itself, so no need to pass currentUser) */}
        <Header />

        {/* Navigation Menu */}
        <NavigationMenu onTabChange={handleTabChange} />

        {/* Tab Content */}
        <div className="tab-content" style={{ padding: "20px" }}>
          {loading && <div>Loading...</div>}
          {error && <div style={{ color: "red" }}>{error}</div>}

          {!loading && !error && (
            <>
              {activeTab === "Overview" && (
                <div>
                  <h3>u/{overview?.user?.username}</h3>
                  <p>Bio: {overview?.user?.bio || "No bio yet"}</p>
                  <p>Posts: {overview?.stats?.postsCount ?? 0}</p>
                  <p>Comments: {overview?.stats?.commentsCount ?? 0}</p>
                </div>
              )}

              {activeTab === "Posts" && (
                <div>
                  {posts.length === 0 ? (
                    <div>No posts yet.</div>
                  ) : (
                    posts.map((p) => (
                      <div key={p._id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                        <div style={{ fontWeight: 700 }}>{p.title}</div>
                        <div style={{ color: "#777", fontSize: 13 }}>
                          r/{p.community?.name || "unknown"} • {new Date(p.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "Comments" && (
                <div>
                  {comments.length === 0 ? (
                    <div>No comments yet.</div>
                  ) : (
                    comments.map((c) => (
                      <div key={c._id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                        <div style={{ fontWeight: 600 }}>{c.content}</div>
                        <div style={{ color: "#777", fontSize: 13 }}>
                          on: {c.post?.title || "Unknown post"} • {new Date(c.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "Upvoted" && (
                <div>
                  <h4>Upvoted Posts</h4>
                  {upvoted.posts.length === 0 ? (
                    <div>No upvoted posts.</div>
                  ) : (
                    upvoted.posts.map((p) => (
                      <div key={p._id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                        <div style={{ fontWeight: 700 }}>{p.title}</div>
                        <div style={{ color: "#777", fontSize: 13 }}>
                          r/{p.community?.name || "unknown"}
                        </div>
                      </div>
                    ))
                  )}

                  <h4 style={{ marginTop: 20 }}>Upvoted Comments</h4>
                  {upvoted.comments.length === 0 ? (
                    <div>No upvoted comments.</div>
                  ) : (
                    upvoted.comments.map((c) => (
                      <div key={c._id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                        <div style={{ fontWeight: 600 }}>{c.content}</div>
                        <div style={{ color: "#777", fontSize: 13 }}>
                          on: {c.post?.title || "Unknown post"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "Downvoted" && (
                <div>
                  <h4>Downvoted Posts</h4>
                  {downvoted.posts.length === 0 ? (
                    <div>No downvoted posts.</div>
                  ) : (
                    downvoted.posts.map((p) => (
                      <div key={p._id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                        <div style={{ fontWeight: 700 }}>{p.title}</div>
                        <div style={{ color: "#777", fontSize: 13 }}>
                          r/{p.community?.name || "unknown"}
                        </div>
                      </div>
                    ))
                  )}

                  <h4 style={{ marginTop: 20 }}>Downvoted Comments</h4>
                  {downvoted.comments.length === 0 ? (
                    <div>No downvoted comments.</div>
                  ) : (
                    downvoted.comments.map((c) => (
                      <div key={c._id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                        <div style={{ fontWeight: 600 }}>{c.content}</div>
                        <div style={{ color: "#777", fontSize: 13 }}>
                          on: {c.post?.title || "Unknown post"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
