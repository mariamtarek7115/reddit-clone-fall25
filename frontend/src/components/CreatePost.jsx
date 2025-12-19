import React, { useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./CreatePost.css";

export default function CreatePost() {
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  const [tab, setTab] = useState("Text");

  const navigate = useNavigate();

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

      // Navigate to profile and open Posts tab
      navigate("/profile", { state: { tab: "Posts" } });
    } catch (err) {
      console.error("Create post error:", err);
      alert("Server error");
    }
  };



  return (
  <div className="create-post-wrapper">
      <h2>Create post</h2>
      <div className="create-post-header">
        <button className="community-selector">
          <span>r/</span> Select a community ▼
        </button>
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