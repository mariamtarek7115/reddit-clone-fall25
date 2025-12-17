import React from "react";
import "./Comment.css";

export default function Comment({ comment, currentUsername, onDelete }) {
  const authorName = comment.author?.username || "unknown";
  const canDelete = currentUsername && authorName === currentUsername;

  return (
    <div className={`comment ${comment.isDeleted ? "deleted" : ""}`}>
      <div className="comment-meta">
        <span className="comment-author">u/{authorName}</span>
        <span className="dot">•</span>
        <span className="comment-time">
          {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}
        </span>

        {canDelete && !comment.isDeleted && (
          <button className="comment-delete" onClick={() => onDelete(comment._id)}>
            Delete
          </button>
        )}
      </div>

      <div className="comment-body">
        {comment.isDeleted ? "[deleted]" : comment.body}
      </div>
    </div>
  );
}
