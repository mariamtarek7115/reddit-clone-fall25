import React from "react";
import { useNavigate } from "react-router-dom";
import Vote from "./Vote";
import "./PostCard.css";

const API_BASE = "http://localhost:5000";

export default function PostCard({
  post,
  onVote,
  showCommunity = true,
  showFullContent = false,
}) {
  const navigate = useNavigate();

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
  } = post;

  const postId = _id;
  const authorName = author?.username || "unknown";
  const communityName = community?.name || "general";

  const imageSrc =
    mediaUrl && mediaUrl.startsWith("/uploads")
      ? `${API_BASE}${mediaUrl}`
      : mediaUrl;

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
          <img src={imageSrc} alt={title} />
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