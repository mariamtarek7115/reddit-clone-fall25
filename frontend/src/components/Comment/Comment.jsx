import React, { useState } from "react";
import "./Comment.css";
import CommentForm from "./CommentForm";

export default function Comment({ comment, currentUsername, onDelete, onReply, onVote, childrenByParentId }) {
  const authorName = comment.author?.username || "unknown";
  const canDelete = currentUsername && authorName === currentUsername;
  const [showReply, setShowReply] = useState(false);

  const replies = (childrenByParentId && childrenByParentId[String(comment._id)]) || [];

  const handleReplySubmit = async (text) => {
    if (onReply) {
      // createComment expects (text, parentComment)
      await onReply(text, comment._id);
      setShowReply(false);
    }
  };

  const handleVote = (type) => {
    if (onVote) onVote(comment._id, type);
  };

  return (
    <div className={`comment ${comment.isDeleted ? "deleted" : ""}`}>
      <div className="comment-meta">
        <span className="comment-author">u/{authorName}</span>
        <span className="dot">•</span>
        <span className="comment-time">
          {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}
        </span>

        {canDelete && !comment.isDeleted && (
          <button 
            className="comment-delete" 
            onClick={() => onDelete(comment._id)}
          >
            Delete
          </button>
        )}
      </div>

      <div className="comment-body">
        {comment.isDeleted ? "[deleted]" : comment.body}
      </div>

      <div className="comment-actions">
        <button className="comment-action-btn" onClick={() => handleVote("up")}>
          <span>▲</span>
          <span>{comment.upvotes || 0}</span>
        </button>
        <button className="comment-action-btn" onClick={() => handleVote("down")}>
          <span>▼</span>
        </button>
        <button className="comment-action-btn" onClick={() => setShowReply((s) => !s)}>Reply</button>
      </div>

      {showReply && (
        <div className="comment-reply-form">
          <CommentForm onSubmit={handleReplySubmit} />
        </div>
      )}

      {replies.length > 0 && (
        <div className="comment-children">
          {replies.map((child) => (
            <Comment
              key={child._id}
              comment={child}
              currentUsername={currentUsername}
              onDelete={onDelete}
              onReply={onReply}
              onVote={onVote}
              childrenByParentId={childrenByParentId}
            />
          ))}
        </div>
      )}
    </div>
  );
}