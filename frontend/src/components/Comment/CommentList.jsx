import React from "react";
import Comment from "./Comment";

export default function CommentList({ comments, currentUsername, onDelete, onReply, onVote }) {
  if (!comments || comments.length === 0) {
    return <div className="empty-state">No comments yet.</div>;
  }

  return (
    <div className="comments-list">
      {comments.map((c) => (
        <Comment
          key={c._id}
          comment={c}
          currentUsername={currentUsername}
          onDelete={onDelete}
          onReply={onReply}
          onVote={onVote}
        />
      ))}
    </div>
  );
}
