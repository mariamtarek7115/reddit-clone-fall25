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
      const res = await fetch(`${API_BASE}/comments/post/${postId}`);
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
  }, [postId]);

  // -------- Create Comment (supports replies via parentComment) --------
  const createComment = async (text, parentComment = null) => {
    if (!currentUserId) {
      setError("You must be logged in to comment.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const bodyPayload = { postId, userId: currentUserId, body: text };
      if (parentComment) bodyPayload.parentComment = parentComment;

      const res = await fetch(`${API_BASE}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to post comment");

      // Refresh comments to include the new reply in the right place
      await fetchComments();

      // Update post comment count only for top-level comments
      if (!parentComment) {
        setPost((prev) =>
          prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : prev
        );
      }
    } catch (e) {
      setError(e.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  // -------- Delete Comment --------
  const deleteComment = async (commentId) => {
    if (!currentUserId) return;

    const ok = window.confirm("Delete this comment?");
    if (!ok) return;

    setError("");

    try {
      const res = await fetch(`${API_BASE}/comments/${commentId}?userId=${encodeURIComponent(currentUserId)}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete comment");

      // Update UI
      setComments((prev) =>
        prev.filter((c) => c._id !== commentId)
      );

      // Update post comment count
      setPost((prev) =>
        prev
          ? { ...prev, commentsCount: Math.max(0, (prev.commentsCount || 0) - 1) }
          : prev
      );
    } catch (e) {
      setError(e.message || "Failed to delete comment");
    }
  };

  // -------- Post Voting --------
  const handlePostVote = async (postId, voteType) => {
    if (!currentUserId) {
      alert("You must be logged in to vote.");
      return;
    }

    const value = voteType === "up" ? 1 : -1;

    try {
      const res = await fetch(`${API_BASE}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
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

      // Update the post in state
      setPost((prev) => (prev ? { ...prev, upvotes: data.upvotes, voteState: data.voteState } : prev));
    } catch (error) {
      console.error("Vote error:", error);
      alert("Failed to vote");
    }
  };

  // -------- Comment Voting --------
  const handleCommentVote = async (commentId, voteType) => {
    if (!currentUserId) {
      alert("You must be logged in to vote.");
      return;
    }

    const value = voteType === "up" ? 1 : -1;

    try {
      const res = await fetch(`${API_BASE}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, targetType: "Comment", targetId: commentId, value }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Vote failed");
        return;
      }

      // Update the comment in state
      setComments((prev) => prev.map((c) => (c._id === commentId ? { ...c, upvotes: data.upvotes, voteState: data.voteState } : c)));
    } catch (err) {
      console.error("Comment vote error:", err);
      alert("Failed to vote on comment");
    }
  };

  // Normalize post for PostCard
  const postForCard = useMemo(() => {
    if (!post) return null;

    return {
      ...post,
      id: post._id,
      subreddit: post.community?.name ? `r/${post.community.name}` : "r/general",
      body: post.body || "",
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
            <PostCard 
              post={postForCard} 
              showCommunity={true} 
              showFullContent={true}
              onVote={handlePostVote}
            />
          ) : (
            <div className="postdetail-empty">Post not found.</div>
          )}

          <CommentForm 
            disabled={!currentUserId || submitting} 
            onSubmit={createComment} 
          />

          <div className="comments-header">
            <h3>Comments ({post?.commentsCount || 0})</h3>
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
                onReply={createComment}
                onVote={handleCommentVote}
              />
          )}
        </div>
      </main>
    </div>
  );
}