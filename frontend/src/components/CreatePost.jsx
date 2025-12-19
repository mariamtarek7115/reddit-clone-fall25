import React, { useState, useEffect, useRef } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./CreatePost.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function CreatePost() {
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  const [tab, setTab] = useState("Text");

  // Community selection
  const [communities, setCommunities] = useState([]);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [communityError, setCommunityError] = useState("");
  const dropdownRef = useRef(null);

  // Search & join
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [joiningId, setJoiningId] = useState(null);

  const navigate = useNavigate();

  // Fetch user's communities
  const fetchUserCommunities = async () => {
    if (!user) return;
    try {
      setLoadingCommunities(true);
      setCommunityError("");
      const res = await fetch(`${API_BASE}/community/user/${user._id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch communities");
      setCommunities(data.communities || []);
    } catch (e) {
      console.error("Fetch communities error:", e);
      setCommunityError(e.message || "Failed to load communities");
      setCommunities([]);
    } finally {
      setLoadingCommunities(false);
    }
  };

  useEffect(() => {
    // close dropdown on outside click
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCommunityDropdown(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

  //haga zay di mafrood hatetshal lama n3mel el protected routes
  if (!user) {
    alert("You must be logged in to create a post");
    return;
  }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("authorId", user._id);

    const hasBody = body && body.trim().length > 0;
    const hasImage = Boolean(image);
    const hasUrl = url && url.trim().length > 0;

    // Determine type
    let computedType = "text";
    const filledCount = [hasBody, hasImage, hasUrl].filter(Boolean).length;
    if (filledCount > 1) computedType = "mixed";
    else if (hasImage) computedType = "image";
    else if (hasUrl) computedType = "link";

    formData.append("type", computedType);

    if (hasBody) formData.append("body", body);
    if (hasImage) formData.append("image", image);
    if (hasUrl) formData.append("url", url);
    if (selectedCommunity) formData.append("communityId", selectedCommunity._id);

    try {
      const res = await fetch("http://localhost:5000/posts", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create post");
        return;
      }

      console.log("Post created:", data);

      // Reset form
      setTitle("");
      setBody("");
      setImage(null);
      setUrl("");

      // If the post has an associated community, go to that community page
      if (data.community && data.community.name) {
        navigate(`/r/${data.community.name}`);
        return;
      }

      // Otherwise navigate to profile and open Posts tab
      navigate("/profile", { state: { tab: "Posts" } });
    } catch (err) {
      console.error("Create post error:", err);
      alert("Server error");
    }
  };



  return (
  <div className="create-post-wrapper">
      <h2>Create post</h2>
      <div className="create-post-header" ref={dropdownRef}>
        <button
          className="community-selector"
          onClick={async (e) => {
            e.preventDefault();
            if (!user) {
              alert("You must be logged in to select a community");
              return;
            }
            if (!showCommunityDropdown && communities.length === 0) {
              await fetchUserCommunities();
            }
            setShowCommunityDropdown((s) => !s);
          }}
        >
          <span>r/</span>{" "}
          {selectedCommunity ? selectedCommunity.name : "Select a community"} ▼
        </button>

        {showCommunityDropdown && (
          <div className="community-dropdown">
            {/* Search area */}
            <div style={{ padding: '6px 8px' }}>
              <input
                type="text"
                placeholder="Search communities to join"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!searchQuery) return;
                    setLoadingSearch(true);
                    try {
                      const res = await fetch(`${API_BASE}/community?q=${encodeURIComponent(searchQuery)}`);
                      const data = await res.json();
                      setSearchResults(data || []);
                    } catch (err) {
                      console.error('Search error', err);
                      setSearchResults([]);
                    } finally {
                      setLoadingSearch(false);
                    }
                  }
                }}
                style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #ddd' }}
              />
            </div>

            {loadingCommunities ? (
              <div className="community-loading">Loading...</div>
            ) : communityError ? (
              <div className="community-error">{communityError}</div>
            ) : communities.length === 0 ? (
              <div style={{ padding: 8 }}>
                <div className="community-empty">You haven't joined any communities yet</div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
                  Search and join from below.
                </div>
              </div>
            ) : (
              communities.map((c) => (
                <button
                  key={c._id}
                  className={`community-item ${selectedCommunity && selectedCommunity._id === c._id ? 'selected' : ''}`}
                  onClick={(ev) => {
                    ev.preventDefault();
                    setSelectedCommunity(c);
                    setShowCommunityDropdown(false);
                  }}
                >
                  r/{c.name}
                </button>
              ))
            )}

            {/* Search results */}
            {loadingSearch ? (
              <div className="community-loading">Searching...</div>
            ) : searchResults.length > 0 ? (
              <div style={{ borderTop: '1px solid #eee', marginTop: 8 }}>
                {searchResults.map((c) => (
                  <div key={c._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px' }}>
                    <div style={{ fontWeight: 600 }}>r/{c.name}</div>
                    <div>
                      <button
                        className="community-item"
                        style={{ padding: '6px 10px' }}
                        disabled={joiningId === c._id}
                        onClick={async (ev) => {
                          ev.preventDefault();
                          if (!user) { alert('You must be logged in to join'); return; }
                          setJoiningId(c._id);
                          try {
                            const res = await fetch(`${API_BASE}/community/${c._id}/join`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ userId: user._id }),
                            });
                            if (!res.ok) {
                              const err = await res.json();
                              alert(err.message || 'Failed to join');
                              return;
                            }
                            const data = await res.json();
                            // Add to joined communities and select it
                            setCommunities((prev) => [data.membership.community ? data.membership.community : c, ...prev]);
                            setSelectedCommunity(data.membership.community ? data.membership.community : c);
                            setShowCommunityDropdown(false);
                          } catch (err) {
                            console.error('Join error', err);
                            alert('Server error joining');
                          } finally {
                            setJoiningId(null);
                          }
                        }}
                      >
                        {joiningId === c._id ? 'Joining...' : 'Join'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <div style={{ padding: 8, color: '#666' }}>No results</div>
            ) : null}
          </div>
        )}

        <span className="drafts">Drafts</span>
      </div>

      <div className="create-post-tabs">
        {["Text", "Images", "Link"].map((t) => (
          <button
            key={t}
            className={`tab-button ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <form className="create-post-form" onSubmit={handleSubmit}>
        {/* Title is always visible */}
        <input
          type="text"
          placeholder="Title*"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="create-post-title"
          maxLength={300}
          required
        />

        {/* Conditional rendering based on tab */}
        {tab === "Text" && (
          <>
            <textarea
              placeholder="Body text (optional)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="create-post-body"
              maxLength={300}
            />
            <span className="char-count">{body.length}/300</span>
          </>
        )}

        {tab === "Images" && (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="create-post-image"
          />
        )}

        {tab === "Link" && (
          <input
            type="url"
            placeholder="Paste a URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="create-post-url"
          />
        )}

        <div className="create-post-actions">
          <div className="form-buttons">
            <button type="submit" className="save-draft">
              Save Draft
            </button>
            <button type="submit" className="post-button">
              Post
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}