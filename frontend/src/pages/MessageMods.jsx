import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./MessageMods.css";

const MessageMods = () => {
  const { communityName } = useParams();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const canSend = title.trim() && message.trim();

  return (
    <div className="message-mods-page">
      <div className="message-mods-card">
        <h1>Send a message</h1>

        {/* Sender */}
        <div className="form-group">
          <label>Sender</label>
          <div className="sender-pill">
            <img
              src="https://www.redditstatic.com/avatars/avatar_default_02_545452.png"
              alt="avatar"
            />
            <span>u/Former_Pack5559</span>
          </div>
        </div>

        {/* Send to */}
        <div className="form-group">
          <label>
            Send to<span>*</span>
          </label>
          <input
            type="text"
            value={`r/${communityName}`}
            disabled
            className="input-pill"
          />
        </div>

        {/* Title */}
        <div className="form-group">
          <label>
            Title<span>*</span>
          </label>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="input-pill"
          />
          <div className="char-count">{title.length}/100</div>
        </div>

        {/* Message */}
        <div className="form-group">
          <label>
            Message<span>*</span>
          </label>
          <textarea
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={10000}
            className="textarea-pill"
          />
          <div className="char-count">{message.length}/10000</div>
        </div>

        {/* Send Button */}
        <div className="form-actions">
          <button
            className={`send-btn ${canSend ? "active" : ""}`}
            disabled={!canSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageMods;
