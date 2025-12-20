import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Vote from "./Vote";
import "./PostCard.css";
import { AuthContext } from "../context/AuthContext";

const API_BASE = "http://localhost:5000";

export default function PostCard({
  post,
  onVote,
  onPostDeleted,
  showCommunity = true,
  showFullContent = false,
}) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuOpen]);

  if (!post) return null;

  const {
    _id,
    title,
    body,
    author,
    community,
    upvotes = 0,
    commentsCount = 0,
    voteState = null,
    mediaUrl,
    createdAt,
    url,
  } = post;

  const postId = _id;
  const authorName = author?.username || "unknown";
  const communityName = community?.name || "general";

  const isMine = Boolean(
    user &&
      (String(author?._id || "") === String(user?._id || "") ||
        String(authorName || "").toLowerCase() === String(user?.username || "").toLowerCase())
  );

  const imageSrc =
    mediaUrl && mediaUrl.startsWith("/uploads")
      ? `${API_BASE}${mediaUrl}`
      : mediaUrl;

  const handleSave = () => {
    const key = `saved_${user ? user._id : "guest"}`;
    try {
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      const exists = Array.isArray(arr) && arr.some((p) => (p._id || p.id) === postId);
      if (!exists) {
        const toStore = {
          ...post,
          id: postId,
        };
        const next = Array.isArray(arr) ? [toStore, ...arr] : [toStore];
        localStorage.setItem(key, JSON.stringify(next));
      }
    } catch (err) {
      console.error("Failed to save post", err);
    } finally {
      setMenuOpen(false);
    }
  };

  const handleEdit = () => {
    // Reuse CreatePost's draft editing flow (it PATCHes when postId exists)
    setMenuOpen(false);
    navigate("/createpost", {
      state: {
        draftToEdit: {
          id: `edit_${postId}`,
          postId,
          title: title || "",
          body: body || "",
          url: url || "",
          community: community ? { _id: community._id, name: community.name } : null,
          imageData: null,
          createdAt: new Date().toISOString(),
        },
      },
    });
  };

  const handleDelete = async () => {
    if (!user?._id) return;
    const ok = window.confirm("Delete this post?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: user._id }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete post");

      setMenuOpen(false);
      if (onPostDeleted) onPostDeleted(postId);
      else navigate(0);
    } catch (err) {
      console.error("Delete post error", err);
      // no alert popups
    }
  };

  return (
    <article className="post-card">
      {/* Header */}
      <div className="post-card-header">
        <div className="post-card-header-left">
          {showCommunity && <span>r/{communityName}</span>}
          <span>u/{authorName}</span>
          {createdAt && (
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          )}
        </div>

        <div className="post-card-header-right" ref={menuRef}>
          <button
            className="post-card-more"
            type="button"
            aria-label="Post menu"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
          >
            ⋯
          </button>

          {menuOpen && (
            <div className="post-card-menu">
              <button type="button" onClick={handleSave}>
                Save
              </button>
              {isMine && (
                <>
                  <button type="button" onClick={handleEdit}>
                    Edit
                  </button>
                  <button type="button" className="danger" onClick={handleDelete}>
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="post-card-title">{title}</h3>

      {/* Body */}
      {body && (
        <p className="post-card-content">
          {showFullContent ? body : body.slice(0, 200)}
          {!showFullContent && body.length > 200 && "..."}
        </p>
      )}

      {/* Image */}
      {imageSrc && (
        <div className="post-card-media">
          <img className="post-card-image" src={imageSrc} alt={title} />
        </div>
      )}

      {/* Actions */}
      <div className="post-card-actions">
        <Vote
          score={upvotes}
          voteState={voteState}
          onVote={(type) => onVote(postId, type)}
        />

        <button 
          className="comments-btn"
          onClick={() => navigate(`/post/${postId}`)}
        >
          💬 {commentsCount} Comments
        </button>
      </div>
    </article>
  );
}