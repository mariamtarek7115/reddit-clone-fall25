import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header";
import NavigationMenu from "../components/NavigationMenu";
import PostCard from "../components/PostCard";
import { AuthContext } from "../context/AuthContext";
import { useLocation, useParams } from "react-router-dom";
import "./Profile.css"; 

const API_BASE = "http://localhost:5000";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const { username: routeUsername } = useParams();

  // Use route param when viewing other users, otherwise fall back to signed-in user
  const username = routeUsername || user?.username;

  const [sidebarActive, setSidebarActive] = useState("Home");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState(location.state?.tab || "Overview");

  // Sidebar dummy communities
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

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  // Handle voting in profile: call backend and update local state arrays
  const handleVote = async (postId, voteType) => {
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
        body: JSON.stringify({ userId, targetType: "Post", targetId: postId, value }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Vote failed");
        return;
      }

      // Build an updated post object (try to reuse existing data when available)
      const findIn = (arr) => (Array.isArray(arr) ? arr.find((p) => p._id === postId || p.id === postId) : undefined);
      const existing = findIn(posts) || findIn(upvoted.posts) || findIn(downvoted.posts) || { _id: postId };
      const updatedPost = { ...existing, _id: postId, id: postId, upvotes: data.upvotes, voteState: data.voteState };

      // Update main posts list
      setPosts((prev) => prev.map((p) => (p._id === postId || p.id === postId ? updatedPost : p)));

      // Update Upvoted list: include post only when voteState === 'up'
      setUpvoted((prev) => {
        const exists = (prev.posts || []).some((p) => p._id === postId || p.id === postId);
        if (data.voteState === "up") {
          // add or update
          const newPosts = exists
            ? prev.posts.map((p) => (p._id === postId || p.id === postId ? updatedPost : p))
            : [updatedPost, ...(prev.posts || [])];
          return { ...prev, posts: newPosts };
        } else {
          // remove if present
          return { ...prev, posts: (prev.posts || []).filter((p) => p._id !== postId && p.id !== postId) };
        }
      });

      // Update Downvoted list: include post only when voteState === 'down'
      setDownvoted((prev) => {
        const exists = (prev.posts || []).some((p) => p._id === postId || p.id === postId);
        if (data.voteState === "down") {
          const newPosts = exists
            ? prev.posts.map((p) => (p._id === postId || p.id === postId ? updatedPost : p))
            : [updatedPost, ...(prev.posts || [])];
          return { ...prev, posts: newPosts };
        } else {
          return { ...prev, posts: (prev.posts || []).filter((p) => p._id !== postId && p.id !== postId) };
        }
      });

      // Also update posts shown in Overview (if those are loaded)
      setPosts((prev) => prev.map((p) => (p._id === postId || p.id === postId ? updatedPost : p)));
    } catch (err) {
      console.error("Profile vote error:", err);
      alert("Failed to vote");
    }
  };

  // Fetch based on tab
  useEffect(() => {
    if (!username) return;

    const fetchTabData = async () => {
      setLoading(true);
      setError("");

      try {
        if (activeTab === "Overview") {
          const [overviewRes, postsRes] = await Promise.all([
            fetch(`${API_BASE}/profile/${username}/overview`),
            fetch(`${API_BASE}/profile/${username}/posts`)
          ]);
          
          const overviewData = await overviewRes.json();
          const postsData = await postsRes.json();
          
          if (!overviewRes.ok) throw new Error(overviewData.message || "Failed to load overview");
          if (!postsRes.ok) throw new Error(postsData.message || "Failed to load posts");
          
          setOverview(overviewData);
          setPosts(postsData.posts?.slice(0, 3) || []);
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
    <div className="profile-page">
      {/* Sidebar */}
      <Sidebar
        sidebarActive={sidebarActive}
        setSidebarActive={setSidebarActive}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        toggleJoinCommunity={toggleJoinCommunity}
        communities={communities}
      />

      <div className="profile-main">
        {/* Header */}
        <Header />

        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-banner"></div>
          <div className="profile-info">
            <div className="profile-avatar"></div>
            <div className="profile-details">
              <h1 className="profile-username">u/{username}</h1>
              <div className="profile-stats">
                <span className="profile-stat">
                  <strong>{overview?.stats?.postsCount || 0}</strong> Posts
                </span>
                <span className="profile-stat">
                  <strong>{overview?.stats?.commentsCount || 0}</strong> Comments
                </span>
                <span className="profile-stat">
                  <strong>{overview?.stats?.karma || 0}</strong> Karma
                </span>
              </div>
              {overview?.user?.bio && (
                <p className="profile-bio">{overview.user.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <NavigationMenu onTabChange={handleTabChange} activeTab={activeTab} />

        {/* Tab Content */}
        <div className="profile-content">
          {loading && (
            <div className="profile-loading">
              <div className="loading-spinner"></div>
              <p>Loading...</p>
            </div>
          )}
          
          {error && (
            <div className="profile-error">
              <p>Error: {error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Overview Tab */}
              {activeTab === "Overview" && (
                <div className="tab-overview">
                  {/* Recent Posts Preview */}
                  <div className="overview-section">
                    <h2 className="section-title">Recent Posts</h2>
                    {posts.length === 0 ? (
                      <div className="empty-state">
                        <p>No posts yet.</p>
                      </div>
                    ) : (
                      <div className="posts-grid">
                        {posts.map((post) => (
                          <PostCard
                            key={post._id}
                            post={post}
                            onVote={handleVote}
                            showCommunity={true}
                            showFullContent={false}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="overview-section">
                    <h2 className="section-title">Profile Information</h2>
                    <div className="profile-info-card">
                      <div className="info-item">
                        <span className="info-label">Member since:</span>
                        <span className="info-value">
                          {overview?.user?.createdAt 
                            ? new Date(overview.user.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Karma:</span>
                        <span className="info-value">{overview?.stats?.karma || 0}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Post Karma:</span>
                        <span className="info-value">{overview?.stats?.postKarma || 0}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Comment Karma:</span>
                        <span className="info-value">{overview?.stats?.commentKarma || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Posts Tab */}
              {activeTab === "Posts" && (
                <div className="tab-posts">
                  {posts.length === 0 ? (
                    <div className="empty-state">
                      <p>No posts yet.</p>
                      <button className="create-post-btn">Create your first post</button>
                    </div>
                  ) : (
                    <div className="posts-list">
                      {posts.map((post) => (
                        <PostCard
                          key={post._id}
                          post={post}
                          onVote={handleVote}
                          showCommunity={true}
                          showFullContent={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === "Comments" && (
                <div className="tab-comments">
                  {comments.length === 0 ? (
                    <div className="empty-state">
                      <p>No comments yet.</p>
                    </div>
                  ) : (
                    <div className="comments-list">
                      {comments.map((comment) => (
                        <div key={comment._id} className="comment-card">
                          <div className="comment-header">
                            <span className="comment-author">u/{comment.author?.username}</span>
                            <span className="comment-time">
                              • {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                            <span className="comment-on">
                              • on <strong>{comment.post?.title || "Unknown post"}</strong>
                            </span>
                          </div>
                          <div className="comment-body">
                           <p>{comment.body}</p>
                          </div>
                          <div className="comment-actions">
                            <button className="comment-action-btn">
                              <span>▲</span>
                              <span>{comment.upvotes || 0}</span>
                            </button>
                            <button className="comment-action-btn">
                              <span>▼</span>
                            </button>
                            <button className="comment-action-btn">💬 Reply</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Upvoted Tab */}
              {activeTab === "Upvoted" && (
                <div className="tab-upvoted">
                  {upvoted.posts.length === 0 ? (
                    <div className="empty-state">
                      <p>No upvoted posts yet.</p>
                    </div>
                  ) : (
                    <div className="posts-list">
                      {upvoted.posts.map((post) => (
                        <PostCard
                          key={post._id}
                          post={post}
                          onVote={handleVote}
                          showCommunity={true}
                          showFullContent={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Downvoted Tab */}
              {activeTab === "Downvoted" && (
                <div className="tab-downvoted">
                  {downvoted.posts.length === 0 ? (
                    <div className="empty-state">
                      <p>No downvoted posts yet.</p>
                    </div>
                  ) : (
                    <div className="posts-list">
                      {downvoted.posts.map((post) => (
                        <PostCard
                          key={post._id}
                          post={post}
                          onVote={handleVote}
                          showCommunity={true}
                          showFullContent={false}
                        />
                      ))}
                    </div>
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