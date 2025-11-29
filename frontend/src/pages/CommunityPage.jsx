import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './CommunityPage.css';

const CommunityPage = () => {
  const { communityName } = useParams();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isMember, setIsMember] = useState(true); // Creator is automatically a member
  const [sortBy, setSortBy] = useState('hot');

  // Mock data - replace with actual API calls later
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const currentDate = new Date();
      const createdDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      setCommunity({
        name: communityName,
        displayName: communityName.charAt(0).toUpperCase() + communityName.slice(1),
        description: `Welcome to r/${communityName}! This is a community about ${communityName}.`,
        membersCount: 1, // Starts with just the creator
        createdAt: createdDate,
        type: 'public',
        isAdult: false,
        isModerator: true, // Creator is moderator
        insights: {
          visitors: 0,
          contributions: 0
        }
      });
      
      setPosts([]); // Empty posts for new community
      setIsMember(true); // Creator is automatically joined
    }, 500);
  }, [communityName]);

  const handleJoinLeave = () => {
    setIsMember(!isMember);
    // TODO: API call to join/leave community
  };

  const createPost = () => {
    // TODO: Redirect to create post page
    alert('Redirect to create post page');
  };

  if (!community) {
    return (
      <div className="community-page">
        <div className="loading">Loading community...</div>
      </div>
    );
  }

  return (
    <div className="community-page">
      {/* Community Banner */}
      <div className="community-banner">
        <div className="banner-content">
          <div className="community-icon">r/</div>
          <div className="community-titles">
            <h1>r/{community.name}</h1>
            <span className="community-display-name">{community.displayName}</span>
          </div>
        </div>
      </div>

      <div className="community-layout">
        {/* Main Content */}
        <div className="community-main">
          {/* Create Post Card */}
          <div className="create-post-card">
            <div className="user-avatar-small"></div>
            <input 
              type="text" 
              placeholder="Create Post" 
              className="create-post-input"
              onClick={createPost}
              readOnly
            />
            <div className="post-options">
              <button className="media-btn" title="Media">📷</button>
              <button className="link-btn" title="Link">🔗</button>
            </div>
          </div>

          {/* Posts Sorting */}
          <div className="posts-sorting">
            <button 
              className={`sort-btn ${sortBy === 'hot' ? 'active' : ''}`}
              onClick={() => setSortBy('hot')}
            >
              Hot
            </button>
            <button 
              className={`sort-btn ${sortBy === 'new' ? 'active' : ''}`}
              onClick={() => setSortBy('new')}
            >
              New
            </button>
            <button 
              className={`sort-btn ${sortBy === 'top' ? 'active' : ''}`}
              onClick={() => setSortBy('top')}
            >
              Top
            </button>
          </div>

          {/* Posts Area */}
          <div className="posts-area">
            {posts.length === 0 ? (
              <div className="no-posts">
                <div className="no-posts-icon">📝</div>
                <h3>This community doesn't have any posts yet</h3>
                <p>Make one and get this feed started.</p>
                <button className="create-first-post-btn" onClick={createPost}>
                  Create Post
                </button>
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="post-card">
                  {/* Post content will go here */}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar - Creator/MOD View */}
        <div className="community-sidebar">
          {/* About Community Card */}
          <div className="about-community-card">
            <div className="about-header">
              <h3>About Community</h3>
            </div>
            
            <div className="community-description">
              {community.description}
            </div>

            <div className="community-stats">
              <div className="stat">
                <strong>{community.membersCount.toLocaleString()}</strong>
                <span>Members</span>
              </div>
              <div className="stat">
                <strong>1</strong>
                <span>Online</span>
              </div>
            </div>

            <div className="community-info">
              <div className="info-item">
                <span className="info-icon">📅</span>
                <span>Created {community.createdAt}</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🌐</span>
                <span>{community.type.charAt(0).toUpperCase() + community.type.slice(1)}</span>
              </div>
              {community.isAdult && (
                <div className="info-item">
                  <span className="info-icon">🔞</span>
                  <span>Adult content</span>
                </div>
              )}
            </div>

            <div className="community-actions">
              <button className="create-post-sidebar-btn" onClick={createPost}>
                Create Post
              </button>
            </div>

            {/* Insights Section */}
            <div className="insights-section">
              <div className="insights-header">
                <h4>Insights</h4>
                <span className="insights-period">Past week ›</span>
              </div>
              <div className="insights-stats">
                <div className="insight-stat">
                  <strong>{community.insights.visitors}</strong>
                  <span>Visitors</span>
                </div>
                <div className="insight-stat">
                  <strong>{community.insights.contributions}</strong>
                  <span>Contributions</span>
                </div>
              </div>
            </div>

            {/* Moderator Section - Only show for creator */}
            {community.isModerator && (
              <div className="moderator-section">
                <div className="moderator-header">
                  <h4>MODERATORS</h4>
                </div>
                <div className="moderator-actions">
                  <button className="mod-action-btn">
                    <span className="mod-action-icon">✉️</span>
                    Message Mods
                  </button>
                  <button className="mod-action-btn">
                    <span className="mod-action-icon">👥</span>
                    Invite Mod
                  </button>
                </div>
                <div className="moderator-list">
                  <div className="moderator">
                    <span className="mod-avatar"></span>
                    <span>u/YourUsername</span>
                    <span className="mod-badge">MOD</span>
                  </div>
                </div>
                <button className="view-moderators-btn">View all moderators</button>
              </div>
            )}

            {/* Community Settings - Only for creator/mods */}
            {community.isModerator && (
              <div className="community-settings-card">
                <h4>COMMUNITY SETTINGS</h4>
                <div className="settings-options">
                  <button className="settings-btn">Community Appearance</button>
                  <button className="settings-btn">Edit Widgets</button>
                  <button className="settings-btn">Moderation Tools</button>
                  <button className="settings-btn">Community Guidelines</button>
                </div>
              </div>
            )}
          </div>

          {/* Resources Card */}
          <div className="resources-card">
            <h4>RESOURCES</h4>
            <div className="resources-list">
              <button className="resource-btn">Create Post</button>
              <button className="resource-btn">Community Guidelines</button>
              <button className="resource-btn">Moderation Tools</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;