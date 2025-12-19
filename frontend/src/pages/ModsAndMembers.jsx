import React, { useState } from "react";
import "./ModsAndMembers.css";

const ModsAndMembers = () => {
  const [activeTab, setActiveTab] = useState("mods");

  return (
    <div className="mods-page">
      <div className="mods-container">
        <h1 className="mods-title">Mods & Members</h1>

        {/* Tabs */}
        <div className="mods-tabs">
          <button
            className={`mods-tab ${activeTab === "mods" ? "active" : ""}`}
            onClick={() => setActiveTab("mods")}
          >
            Moderators
          </button>
          <button
            className={`mods-tab ${activeTab === "approved" ? "active" : ""}`}
            onClick={() => setActiveTab("approved")}
          >
            Approved Users
          </button>
        </div>

        {/* Actions */}
        <div className="mods-actions">
          <button className="primary-btn">+ Invite Mod</button>
        </div>

        {/* Card */}
        <div className="mods-card">
          {activeTab === "mods" ? (
            <div className="mods-row">
              <span className="mods-user">u/Former_Pack5559</span>
              <span className="mods-role">Everything</span>
            </div>
          ) : (
            <div className="mods-empty">
              No approved users yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModsAndMembers;
