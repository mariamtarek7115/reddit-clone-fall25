import React, { useState } from "react";
import "./Comment.css";

export default function CommentForm({ disabled, onSubmit }) {
  const [text, setText] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <form className="comment-form" onSubmit={submit}>
      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={disabled ? "Log in to comment" : "Write a comment..."}
        disabled={disabled}
      />
      <div className="comment-form-actions">
        <button type="submit" disabled={disabled || !text.trim()}>
          Post
        </button>
        <button type="button" className="secondary" onClick={() => setText("")} disabled={disabled}>
          Clear
        </button>
      </div>
    </form>
  );
}
