import React, { useState } from "react";
import "./Vote.css";

export default function Vote({ score = 0, voteState = null, onVote }) {
  const [processing, setProcessing] = useState(false);

  const handleVote = async (type) => {
    if (processing) return; // prevent duplicate requests
    setProcessing(true);
    try {
      // onVote is expected to return a Promise
      await onVote(type);
    } catch (err) {
      console.error("Vote failed", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className={`vote-pill ${
        voteState === "up"
          ? "vote-pill--up"
          : voteState === "down"
          ? "vote-pill--down"
          : ""
      }`}
    >
      <button
        className={`vote-btn ${voteState === "up" ? "vote-btn--active" : ""}`}
        onClick={() => handleVote("up")}
        aria-label="Upvote"
        disabled={processing}
      >
        ▲
      </button>

      <span className="vote-count">{score}</span>

      <button
        className={`vote-btn ${voteState === "down" ? "vote-btn--active" : ""}`}
        onClick={() => handleVote("down")}
        aria-label="Downvote"
        disabled={processing}
      >
        ▼
      </button>
    </div>
  );
}