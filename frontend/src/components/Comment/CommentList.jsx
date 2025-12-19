import React from "react";
import Comment from "./Comment";

export default function CommentList({ comments, currentUsername, onDelete, onReply, onVote }) {
  if (!comments || comments.length === 0) {
    return <div className="empty-state">No comments yet.</div>;
  }

  // Build a parent -> children map so replies render under their parent comment
  const childrenByParentId = comments.reduce((acc, c) => {
    const parentId = c.parentComment ? String(c.parentComment) : "__root__";
    if (!acc[parentId]) acc[parentId] = [];
    acc[parentId].push(c);
    return acc;
  }, {});

  const topLevel = childrenByParentId["__root__"] || [];

  return (
    <div className="comments-list">
      {topLevel.map((c) => (
        <Comment
          key={c._id}
          comment={c}
          currentUsername={currentUsername}
          onDelete={onDelete}
          onReply={onReply}
          onVote={onVote}
          childrenByParentId={childrenByParentId}
        />
      ))}
    </div>
  );
}
