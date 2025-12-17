import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar/Sidebar.jsx";
import Header from "../components/Header.jsx";
import PostCard from "../components/PostCard.jsx";

import CommentForm from "../components/Comment/CommentForm.jsx";
import CommentList from "../components/Comment/CommentList.jsx";

import { AuthContext } from "../context/AuthContext";
import "./PostDetail.css";

const API_BASE = "http://localhost:5000";

export default function PostDetail() {
  const { postId } = useParams();
  const { user } = useContext(AuthContext);

  const currentUserId = user?._id || null;
  const currentUsername = user?.username || null;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarActive, setSidebarActive] = useState("Home");

  const [communities] = useState([
    { id: 1, name: "r/JavaScript" },
    { id: 2, name: "r/ReactJS" },
  ]);

  const toggleJoinCommunity = (id) => console.log("Join/Leave community:", id);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  const [loadingPost, setLoadingPost] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // -------- Fetch Post --------
  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      setLoadingPost(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE}/posts/${postId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load post");

        setPost(data.post || data);
      } catch (e) {
        setError(e.message || "Failed to load post");
        setPost(null);
      } finally {
        setLoadingPost(false);
      }
    };

    fetchPost();
  }, [postId]);

  // -------- Fetch Comments --------
  const fetchComments = async () => {
    if (!postId) return;

    setLoadingComments(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/comments/post/${postId}?parent=null`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load comments");

      setComments(data.comments || []);
    } catch (e) {
      setError(e.message || "Failed to load comments");
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // -------- Create Comment (use userId!) --------
  const createComment = async (text) => {
    if (!currentUserId) {
      setError("You must be logged in to comment.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          userId: currentUserId,     // ✅ use ID
          body: text,
          parentComment: null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to post comment");

      setComments((prev) => [data.comment, ...prev]);

      setPost((prev) =>
        prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : prev
      );
    } catch (e) {
      setError(e.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  // -------- Delete Comment (author-only via userId) --------
  const deleteComment = async (commentId) => {
    if (!currentUserId) return;

    const ok = window.confirm("Delete this comment?");
    if (!ok) return;

    setError("");

    try {
      const res = await fetch(
        `${API_BASE}/comments/${commentId}?userId=${encodeURIComponent(currentUserId)}`,
        { method: "DELETE" }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete comment");

      // soft-delete in UI
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, isDeleted: true, body: "[deleted]" } : c
        )
      );

      setPost((prev) =>
        prev
          ? { ...prev, commentsCount: Math.max(0, (prev.commentsCount || 0) - 1) }
          : prev
      );
    } catch (e) {
      setError(e.message || "Failed to delete comment");
    }
  };

  // Normalize post for PostCard
  const postForCard = useMemo(() => {
    if (!post) return null;

    return {
      ...post,
      id: post._id,
      subreddit: post.community?.name ? `r/${post.community.name}` : "r/general",
      body: post.body || post.content || post.text || "",
      mediaUrl: post.mediaUrl,
      image: post.mediaUrl,
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
        <Header currentUser={{ username: currentUsername || "guest" }} />

        <div className="postdetail-content">
          {error && <div className="postdetail-error">⚠️ {error}</div>}

          {loadingPost ? (
            <div className="postdetail-loading">Loading post...</div>
          ) : postForCard ? (
            <PostCard post={postForCard} showCommunity={true} showFullContent={true} />
          ) : (
            <div className="postdetail-empty">Post not found.</div>
          )}

          <CommentForm disabled={!currentUserId || submitting} onSubmit={createComment} />

          <div className="comments-header">
            <h3>Comments</h3>
            <button onClick={fetchComments} disabled={loadingComments}>
              {loadingComments ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loadingComments ? (
            <div className="postdetail-loading">Loading comments...</div>
          ) : (
            <CommentList
              comments={comments}
              currentUsername={currentUsername}
              onDelete={deleteComment}
            />
          )}
        </div>
      </main>
    </div>
  );
}
