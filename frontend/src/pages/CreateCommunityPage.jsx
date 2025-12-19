import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateCommunityPage.css';
import { AuthContext } from '../context/AuthContext';

const CreateCommunityPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'public',
    topics: [],
    mature: false
  });

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTopicToggle = (topic) => {
    setFormData(prev => {
      const topics = prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic].slice(0, 3); // Max 3 topics
      return { ...prev, topics };
    });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation
    if (!formData.name || !formData.description) {
      setError('Name and description are required');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        mature: !!formData.mature,
      };
      if (user && user._id) payload.creator = user._id;

      const res = await fetch('http://localhost:5000/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) setError(data.message || 'Community name already exists');
        else setError(data.message || 'Failed to create community');
        return;
      }

      setSuccess(`Community "r/${data.name}" created successfully!`);

      // Navigate to community page
      navigate(`/r/${data.name}`);
    } catch (err) {
      console.error('Create community error:', err);
      setError('Server error creating community');
    } finally {
      setSubmitting(false);
    }
  };

  // Sample topics like Reddit
  const topicCategories = [
    {
      title: "Anime & Cosplay",
      topics: ["Anime & Manga", "Cosplay"]
    },
    {
      title: "Art",
      topics: ["Performing Arts", "Architecture", "Design", "Art", "Filmmaking", "Digital Art", "Photography"]
    },
    {
      title: "Business & Finance", 
      topics: ["Personal Finance", "Crypto", "Economics", "Business News & Discussion", "Deals & Marketplace"]
    },
    {
      title: "Collectibles & Other Hobbies",
      topics: ["Model Building", "Collectibles", "Other Hobbies", "Toys"]
    }
  ];

  return (
    <div className="reddit-create-community">
      {/* Header */}
      <div className="cc-header">
        <div className="cc-header-content">
          <h1>
            {step === 1 && "Tell us about your community"}
            {step === 2 && "Add topics"} 
            {step === 3 && "What kind of community is this?"}
          </h1>
          <p className="cc-subtitle">
            {step === 1 && "A name and description help people understand what your community is all about."}
            {step === 2 && "Add up to 3 topics to help interested redditors find your community."}
            {step === 3 && "Decide who can view and contribute in your community."}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="cc-progress">
        <div className={`cc-progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
        <div className="cc-progress-line"></div>
        <div className={`cc-progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
        <div className="cc-progress-line"></div>
        <div className={`cc-progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
      </div>

      <div className="cc-content">
        {/* Step 1: Name & Description */}
        {step === 1 && (
          <div className="cc-step">
            <div className="cc-form-group">
              <label className="cc-label">
                Community name *
                <span className="cc-char-count">{21 - formData.name.length}/21</span>
              </label>
              <div className="cc-name-input-wrapper">
                <span className="cc-prefix">r/</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="CommunityName"
                  maxLength="21"
                  className="cc-name-input"
                />
              </div>
            </div>

            <div className="cc-form-group">
              <label className="cc-label">
                Description *
                <span className="cc-char-count">{500 - formData.description.length}/500</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Your community description"
                rows="4"
                maxLength="500"
                className="cc-description-input"
              />
            </div>

            <div className="cc-actions">
              <button type="button" className="cc-next-btn" onClick={nextStep} disabled={!formData.name || !formData.description}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Topics */}
        {step === 2 && (
          <div className="cc-step">
            <div className="cc-topics-header">
              <span className="cc-topics-count">Topics {formData.topics.length}/3</span>
              <input 
                type="text" 
                placeholder="Filter topics" 
                className="cc-topics-filter"
              />
            </div>

            <div className="cc-topics-grid">
              {topicCategories.map(category => (
                <div key={category.title} className="cc-topic-category">
                  <h3 className="cc-category-title">{category.title}</h3>
                  <div className="cc-topics-list">
                    {category.topics.map(topic => (
                      <button
                        key={topic}
                        type="button"
                        className={`cc-topic-btn ${formData.topics.includes(topic) ? 'selected' : ''}`}
                        onClick={() => handleTopicToggle(topic)}
                        disabled={formData.topics.length >= 3 && !formData.topics.includes(topic)}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="cc-actions">
              <button type="button" className="cc-back-btn" onClick={prevStep}>
                Back
              </button>
              <button type="button" className="cc-next-btn" onClick={nextStep}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Community Type */}
        {step === 3 && (
          <div className="cc-step">
            <div className="cc-type-options">
              <label className="cc-type-option">
                <input
                  type="radio"
                  name="type"
                  value="public"
                  checked={formData.type === 'public'}
                  onChange={handleChange}
                />
                <div className="cc-type-content">
                  <strong>Public</strong>
                  <span>Anyone can view, post, and comment to this community</span>
                </div>
              </label>

              <label className="cc-type-option">
                <input
                  type="radio"
                  name="type"
                  value="restricted"
                  checked={formData.type === 'restricted'}
                  onChange={handleChange}
                />
                <div className="cc-type-content">
                  <strong>Restricted</strong>
                  <span>Anyone can view, but only approved users can contribute</span>
                </div>
              </label>

              <label className="cc-type-option">
                <input
                  type="radio"
                  name="type"
                  value="private"
                  checked={formData.type === 'private'}
                  onChange={handleChange}
                />
                <div className="cc-type-content">
                  <strong>Private</strong>
                  <span>Only approved users can view and contribute</span>
                </div>
              </label>

              <label className="cc-type-option">
                <input
                  type="checkbox"
                  name="mature"
                  checked={formData.mature}
                  onChange={handleChange}
                />
                <div className="cc-type-content">
                  <strong>Mature (18+)</strong>
                  <span>Users must be over 18 to view and contribute</span>
                </div>
              </label>
            </div>

            <div className="cc-terms">
              <p>By continuing, you agree to our <strong>Mod Code of Conduct</strong> and acknowledge that you understand the <strong>Reddit Rules.</strong></p>
            </div>

            <div className="cc-actions">
              <button type="button" className="cc-back-btn" onClick={prevStep}>
                Back
              </button>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {error && <div style={{ color: 'red' }}>{error}</div>}
                {success && <div style={{ color: 'green' }}>{success}</div>}
                <button type="button" className="cc-create-final-btn" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Community'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCommunityPage;