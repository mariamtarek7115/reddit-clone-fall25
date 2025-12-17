import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header";
import PostCard from "../components/PostCard";
import { AuthContext } from "../context/AuthContext";
import "./PostDetail.css";

const API_BASE = "http://localhost:5000";

export default function PostDetail() {
  const { postId } = useParams();
  const { user } = useContext(AuthContext);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarActive, setSidebarActive] = useState("Home");
  const [communities] = useState([
    { id: 1, name: "r/JavaScript" },
    { id: 2, name: "r/ReactJS" },
  ]);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [err, setErr] = useState("");

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const username = user?.username;

  // Fetch post
  useEffect(() => {
    const fetchPost = async () => {
      setLoadingPost(true);
      setErr("");
      try {
        const res = await fetch(`${API_BASE}/posts/${postId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load post");

        // your backend may return {post} or the post directly
        setPost(data.post || data);
      } catch (e) {
        setErr(e.message || "Failed to load post");
      } finally {
        setLoadingPost(false);
      }
    };

    fetchPost();
  }, [postId]);

  // Fetch top-level comments
  const fetchComments = async () => {
    setLoadingComments(true);
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/comments/post/${postId}?parent=null`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load comments");
      setComments(data.comments || []);
    } catch (e) {
      setErr(e.message || "Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const toggleJoinCommunity = (id) => console.log("Join/Leave community:", id);

  // Submit comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!username) {
      setErr("You must be logged in to comment.");
      return;
    }

    setSubmitting(true);
    setErr("");

    try {
      const res = await fetch(`${API_BASE}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          username,
          body: newComment.trim(),
          parentComment: null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create comment");

      // Prepend new comment
      setComments((prev) => [data.comment, ...prev]);
      setNewComment("");

      // Optional: update post comment count locally
      setPost((prev) =>
        prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : prev
      );
    } catch (e) {
      setErr(e.message || "Failed to create comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Your PostCard expects some fields sometimes; we can pass through safely.
  const postForCard = useMemo(() => {
    if (!post) return null;
    return {
      ...post,
      id: post._id,
      subreddit: post.community?.name ? `r/${post.community.name}` : "r/general",
      mediaUrl: post.mediaUrl,
      image: post.mediaUrl,
      body: post.body || post.content || post.text || "",
    };
  }, [post]);

  return (
    <div className="postdetail">
      <Sidebar
        sidebarActive={sidebarActive}
        setSidebarActive={setSidebarActive}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        toggleJoinCommunity={toggleJoinCommunity}
        communities={communities}
      />

      <main className="postdetail-main">
        <Header />

        <div className="postdetail-content">
          {err && <div className="postdetail-error">⚠️ {err}</div>}

          {loadingPost ? (
            <div className="postdetail-loading">Loading post...</div>
          ) : postForCard ? (
            <PostCard post={postForCard} showCommunity={true} showFullContent={true} />
          ) : (
            <div className="postdetail-empty">Post not found.</div>
          )}

          {/* Comment form */}
          <section className="comment-box">
            <h3>Comment</h3>
            <form onSubmit={handleSubmit}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={username ? "Write a comment..." : "Log in to comment"}
                disabled={!username || submitting}
                rows={4}
              />
              <div className="comment-actions">
                <button type="submit" disabled={!username || submitting || !newComment.trim()}>
                  {submitting ? "Posting..." : "Post Comment"}
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setNewComment("")}
                  disabled={submitting}
                >
                  Clear
                </button>
              </div>
            </form>
          </section>

          {/* Comments list */}
          <section className="comments-section">
            <div className="comments-header">
              <h3>Comments</h3>
              <button onClick={fetchComments} disabled={loadingComments}>
                {loadingComments ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {loadingComments ? (
              <div className="postdetail-loading">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="postdetail-empty">No comments yet.</div>
            ) : (
              <div className="comments-list">
                {comments.map((c) => (
                  <div key={c._id} className="comment-card">
                    <div className="comment-meta">
                      <span className="comment-author">u/{c.author?.username || "unknown"}</span>
                      <span className="dot">•</span>
                      <span className="comment-time">
                        {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                      </span>
                    </div>
                    <div className="comment-body">{c.body}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
