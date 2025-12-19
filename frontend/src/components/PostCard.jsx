import React from "react";
import "./PostCard.css"; 
import { useNavigate } from "react-router-dom";
   


const FALLBACK_IMG = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&h=520&fit=crop";

const PostCard = ({ 
  post, 
  onVote, 
  showCommunity = true,
  showFullContent = false 
}) => {
    const navigate = useNavigate();
  const {
    _id,
    id,
    title,
    body,
    author,
    community,
    subreddit,
    upvotes = 0,
    commentsCount = 0,
    voteState = null,
    image,
    mediaUrl,
    createdAt,
    type
  } = post;

  const postId = _id || id;
  const authorName = author?.username || author || "unknown";
  const communityName = community?.name || subreddit || "general";
  const postImage = mediaUrl || image || FALLBACK_IMG;
  const isImage = type === "image" || postImage;
  
  const formatNumber = (num) => {
    const n = Number(num) || 0;
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n;
  };

  const handleVote = (voteType) => {
    if (onVote && postId) {
      onVote(postId, voteType);
    }
  };

  return (
    <article className="post-card post-card--profile">
      {/* Header */}
      <div className="post-card-header">
        <div className="post-card-header-left">
          {showCommunity && (
            <>
              <span className="post-card-community">r/{communityName}</span>
              <span className="post-card-dot">•</span>
            </>
          )}
          <span className="post-card-author">u/{authorName}</span>
          {createdAt && (
            <>
              <span className="post-card-dot">•</span>
              <span className="post-card-time">
                {new Date(createdAt).toLocaleDateString()}
              </span>
            </>
          )}
        </div>
        <button className="post-card-more" title="More">
          •••
        </button>
      </div>

      {/* Title */}
      <h3 className="post-card-title">{title}</h3>

      {/* Body - Show full content if specified */}
      {body && (
        <div className="post-card-body">
          <p className={`post-card-content ${showFullContent ? "" : "post-card-content--preview"}`}>
            {showFullContent ? body : (body.length > 200 ? body.slice(0, 200) + "..." : body)}
          </p>
          {!showFullContent && body.length > 200 && (
            <button className="post-card-read-more">Read more</button>
          )}
        </div>
      )}

      {/* Media/Image */}
      {isImage && (
        <div className="post-card-media">
          <img 
            src={postImage} 
            alt={title}
            className="post-card-image"
            loading="lazy"
          />
        </div>
      )}

      {/* Actions */}
      <div className="post-card-actions">
        <div className={`vote-pill ${voteState === "up" ? "vote-pill--up" : voteState === "down" ? "vote-pill--down" : ""}`}>
          <button
            className={`vote-btn ${voteState === "up" ? "vote-btn--active" : ""}`}
            onClick={() => handleVote("up")}
            aria-label="Upvote"
          >
            ▲
          </button>
          <span className="vote-count">
            {formatNumber(upvotes)}
          </span>
          <button
            className={`vote-btn ${voteState === "down" ? "vote-btn--active" : ""}`}
            onClick={() => handleVote("down")}
            aria-label="Downvote"
          >
            ▼
          </button>
        </div>

        <button
  className="post-card-action-btn"
  onClick={() => navigate(`/post/${postId}`)}
>
  <span className="post-card-action-icon">💬</span>
  <span className="post-card-action-text">
    {formatNumber(commentsCount)} Comments
  </span>
</button>
        
        <button className="post-card-action-btn">
          <span className="post-card-action-icon">↗</span>
          <span className="post-card-action-text">Share</span>
        </button>
        
        <button className="post-card-action-btn">
          <span className="post-card-action-icon">🔖</span>
          <span className="post-card-action-text">Save</span>
        </button>
      </div>
    </article>
  );
};

export default PostCard;