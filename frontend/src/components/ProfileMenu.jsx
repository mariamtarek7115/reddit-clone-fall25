import React, { useContext } from "react";
import "./ProfileMenu.css";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import avatarImg from "../images/avatar.jpg";
import { useNavigate } from "react-router-dom";

const ProfileMenu = ({ onClose }) => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const username = user?.username || "guest";

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate("/login");
  };

  return (
    <div className="profile-menu">
      <div className="profile-menu-header">
        <img className="profile-menu-avatar" src={avatarImg} alt="avatar" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }} />
        <div>
          <div className="profile-menu-username">{username}</div>
          <div className="profile-menu-handle">u/{username}</div>
        </div>
      </div>

      <div className="profile-menu-divider" />

      <button className="profile-menu-item" onClick={() => { navigate('/profile', { state: { tab: 'Drafts' } }); onClose?.(); }}>
        📝 Drafts
      </button>

      <div className="profile-menu-item profile-menu-toggle">
        🌙 Dark Mode
        <label className="switch" htmlFor="dark-mode-toggle">
          <input id="dark-mode-toggle" type="checkbox" checked={isDark} onChange={toggleTheme} />
          <span className="slider" />
        </label>
      </div>

      <button className="profile-menu-item logout" onClick={handleLogout}>
        🚪 Log Out
      </button>

      <div className="profile-menu-divider" />

      <button className="profile-menu-item">⚙ Settings</button>
    </div>
  );
};

export default ProfileMenu;
