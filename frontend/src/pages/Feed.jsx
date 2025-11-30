import React, { useState, useRef, useEffect } from 'react';

export default function RedditClone() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // FEATURED votes state
  const [postVotes, setPostVotes] = useState({
    featured: { count: 20000, state: null } // null, 'up', or 'down'
  });

  // POSTS data
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Indigenous star held by ICE",
      subtitle: "Lest we Forget: How Indigenous Amer...",
      author: "u/thatsnotha",
      subreddit: "r/news",
      upvotes: 26000,
      comments: 420,
      voteState: null,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=250&fit=crop"
    },
    {
      id: 2,
      title: "Tim Walz responds to Trump",
      subtitle: "Tim Walz responds to Donald Trump cal...",
      author: "u/politics",
      subreddit: "r/politics",
      upvotes: 45000,
      comments: 1203,
      voteState: null,
      image: "https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?w=400&h=250&fit=crop"
    },
    {
      id: 3,
      title: "Kim Kardashian's brain scan",
      subtitle: "Kim Kardashian Learns She Has 'GAD, Br...",
      author: "u/entertainment",
      subreddit: "r/entertainment",
      upvotes: 12000,
      comments: 856,
      voteState: null,
      image: "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&h=250&fit=crop"
    },
    {
      id: 4,
      title: "Trump's Ukraine pos",
      subtitle: "Biograph/Trump proposes t",
      author: "u/worldnews",
      subreddit: "r/worldnews",
      upvotes: 89000,
      comments: 2341,
      voteState: null,
      image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=400&h=250&fit=crop"
    }
  ]);

  // COMMUNITIES
  const [communities, setCommunities] = useState([
    { id: 1, name: "r/AskReddit", members: "45.2M", isJoined: false },
    { id: 2, name: "r/leagueoflegends", members: "6.8M", isJoined: false },
    { id: 3, name: "r/OutOfTheLoop", members: "3.4M", isJoined: false },
    { id: 4, name: "r/discordapp", members: "1.2M", isJoined: false },
    { id: 5, name: "r/Twitch", members: "2.9M", isJoined: false }
  ]);

  // UI & interaction states
  const [joinedFeatured, setJoinedFeatured] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestionsOpen, setSearchSuggestionsOpen] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState(posts);
  const [activeSort, setActiveSort] = useState('Best');
  const [activeLocation, setActiveLocation] = useState('Everywhere');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [locDropdownOpen, setLocDropdownOpen] = useState(false);
  const [sidebarActive, setSidebarActive] = useState('Home');
  const [showCommentsFor, setShowCommentsFor] = useState(null);
  const [showShareFor, setShowShareFor] = useState(null);
  const [showMoreFor, setShowMoreFor] = useState(null);
  const [seeMoreCommunities, setSeeMoreCommunities] = useState(false);
  const [currentPostView, setCurrentPostView] = useState(null); // for full post view

  // Featured video refs and state
  const videoRef = useRef(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoVolume, setVideoVolume] = useState(1);

  // Update filtered posts when posts, searchQuery, sort, or location change
  useEffect(() => {
    let list = [...posts];

    // simple search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.subtitle || '').toLowerCase().includes(q) ||
        p.subreddit.toLowerCase().includes(q)
      );
    }

    // sort logic (mock)
    if (activeSort === 'Hot') {
      list.sort((a, b) => b.comments - a.comments);
    } else if (activeSort === 'New') {
      list = list; // no real timestamp so skip
    } else if (activeSort === 'Top') {
      list.sort((a, b) => b.upvotes - a.upvotes);
    } else if (activeSort === 'Rising') {
      list.sort((a, b) => a.upvotes - b.upvotes);
    } else {
      // Best (default) - mix
      list.sort((a, b) => (b.upvotes + b.comments) - (a.upvotes + a.comments));
    }

    // location filter (mock) - no real location data, so we don't change list except Nearby/custom messaging
    setFilteredPosts(list);
  }, [posts, searchQuery, activeSort, activeLocation]);

  // Video progress updater
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const handleTimeUpdate = () => {
      if (v.duration) {
        setVideoProgress((v.currentTime / v.duration) * 100);
      }
    };
    v.addEventListener('timeupdate', handleTimeUpdate);
    return () => v.removeEventListener('timeupdate', handleTimeUpdate);
  }, [videoRef]);

  // Format numbers (K)
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  // ---------- Voting handlers ----------
  const handleFeaturedVote = (voteType) => {
    setPostVotes(prev => {
      const current = prev.featured;
      let newCount = current.count;
      let newState = voteType;

      if (current.state === voteType) {
        // Remove vote
        newCount = voteType === 'up' ? current.count - 1 : current.count + 1;
        newState = null;
      } else if (current.state === null) {
        // Add vote
        newCount = voteType === 'up' ? current.count + 1 : current.count - 1;
      } else {
        // Switch vote
        newCount = voteType === 'up' ? current.count + 2 : current.count - 2;
      }

      return {
        ...prev,
        featured: { count: newCount, state: newState }
      };
    });
  };

  const handlePostVote = (postId, voteType) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id !== postId) return post;

        let newUpvotes = post.upvotes;
        let newState = voteType;

        if (post.voteState === voteType) {
          // Remove vote
          newUpvotes = voteType === 'up' ? post.upvotes - 1 : post.upvotes + 1;
          newState = null;
        } else if (post.voteState === null) {
          // Add vote
          newUpvotes = voteType === 'up' ? post.upvotes + 1 : post.upvotes - 1;
        } else {
          // Switch vote
          newUpvotes = voteType === 'up' ? post.upvotes + 2 : post.upvotes - 2;
        }

        return { ...post, upvotes: newUpvotes, voteState: newState };
      })
    );
  };

  // ---------- Join / Leave ----------
  const toggleJoinFeatured = () => {
    setJoinedFeatured(prev => !prev);
  };

  const toggleJoinCommunity = (id) => {
    setCommunities(prev => prev.map(c => c.id === id ? { ...c, isJoined: !c.isJoined } : c));
  };

  // ---------- Search ----------
  const handleSearchChange = (e) => {
    const v = e.target.value;
    setSearchQuery(v);
    setSearchSuggestionsOpen(Boolean(v.trim()));
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      // submit search: suggestions close and filteredPosts already updates via effect
      setSearchSuggestionsOpen(false);
    } else if (e.key === 'Escape') {
      setSearchSuggestionsOpen(false);
    }
  };

  const pickSuggestion = (value) => {
    setSearchQuery(value);
    setSearchSuggestionsOpen(false);
  };

  // ---------- Filters ----------
  const sortOptions = ['Best', 'Hot', 'New', 'Top', 'Rising'];
  const locationOptions = ['Everywhere', 'Nearby', 'Custom'];

  // ---------- Post interactions ----------
  const openComments = (postId) => {
    setShowCommentsFor(postId);
  };
  const closeComments = () => setShowCommentsFor(null);

  const openShare = (postId) => {
    setShowShareFor(postId === showShareFor ? null : postId);
  };

  const openMore = (postId) => {
    setShowMoreFor(postId === showMoreFor ? null : postId);
  };

  const handleHidePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setShowMoreFor(null);
  };

  const handleSavePost = (postId) => {
    // simple toggle saved via adding property
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, saved: !p.saved } : p));
    setShowMoreFor(null);
  };

  // clickable title/image -> open full post view
  const openFullPost = (post) => {
    setCurrentPostView(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const closeFullPost = () => setCurrentPostView(null);

  // Sidebar nav click
  const handleSidebarNav = (name) => {
    setSidebarActive(name);
  };

  // Communities see more
  const toggleSeeMore = () => setSeeMoreCommunities(prev => !prev);

  // Video controls
  const featuredVideoSrc = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"; // stable sample
  const togglePlayPause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setVideoPlaying(true);
    } else {
      v.pause();
      setVideoPlaying(false);
    }
  };
  const handleVolumeChange = (e) => {
    const vol = Number(e.target.value);
    setVideoVolume(vol);
    if (videoRef.current) videoRef.current.volume = vol;
  };

  // Search suggestions derived from posts & communities
  const suggestions = [
    ...posts.map(p => p.title),
    ...communities.map(c => c.name)
  ].filter(Boolean).slice(0, 8).filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

  // Styles (kept from your original design - minor additions)
  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      margin: 0,
      padding: 0
    },
    sidebar: {
      backgroundColor: '#000',
      borderRight: '1px solid #2d2d2d',
      transition: 'width 0.3s',
      display: 'flex',
      flexDirection: 'column',
      width: sidebarOpen ? '256px' : '64px'
    },
    sidebarHeader: {
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    redditLogo: {
      width: '32px',
      height: '32px',
      backgroundColor: '#ff4500',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '18px'
    },
    redditTitle: {
      fontSize: '20px',
      fontWeight: 600
    },
    sidebarNav: {
      flex: 1,
      padding: '0 8px',
      overflowY: 'auto'
    },
    navItem: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 12px',
      borderRadius: '8px',
      background: 'none',
      border: 'none',
      color: '#999',
      cursor: 'pointer',
      fontSize: '14px',
      marginBottom: '4px',
      transition: 'all 0.2s'
    },
    navItemActive: {
      backgroundColor: '#1a1a1a',
      color: '#fff'
    },
    navBadge: {
      padding: '2px 6px',
      backgroundColor: '#ff4500',
      fontSize: '10px',
      fontWeight: 600,
      borderRadius: '4px',
      marginLeft: 'auto'
    },
    sectionTitle: {
      marginTop: '24px',
      marginBottom: '8px',
      padding: '0 12px',
      fontSize: '11px',
      color: '#666',
      fontWeight: 600
    },
    sidebarFooter: {
      padding: '16px',
      borderTop: '1px solid #2d2d2d'
    },
    toggleBtn: {
      background: 'none',
      border: 'none',
      color: '#999',
      cursor: 'pointer',
      fontSize: '20px',
      padding: '4px'
    },
    mainContent: {
      flex: 1,
      overflowY: 'auto'
    },
    header: {
      position: 'sticky',
      top: 0,
      backgroundColor: '#000',
      borderBottom: '1px solid #2d2d2d',
      padding: '8px 16px',
      zIndex: 10
    },
    searchInput: {
      width: '100%',
      maxWidth: '768px',
      backgroundColor: '#1a1a1a',
      color: '#fff',
      padding: '8px 16px',
      borderRadius: '24px',
      border: '1px solid #2d2d2d',
      outline: 'none',
      fontSize: '14px'
    },
    feedContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '16px'
    },
    feedGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 350px',
      gap: '16px'
    },
    postsColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    filterBar: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px'
    },
    filterBtn: {
      padding: '6px 16px',
      backgroundColor: '#1a1a1a',
      borderRadius: '24px',
      border: 'none',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '14px',
      position: 'relative'
    },
    dropdown: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: 0,
      background: '#0f0f0f',
      border: '1px solid #2d2d2d',
      borderRadius: '8px',
      padding: '8px',
      zIndex: 50,
      minWidth: 140
    },
    postCard: {
      backgroundColor: '#1a1a1a',
      borderRadius: '12px',
      overflow: 'hidden'
    },
    postHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px',
      borderBottom: '1px solid #2d2d2d'
    },
    subredditAvatar: {
      width: '32px',
      height: '32px',
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      borderRadius: '50%'
    },
    postMeta: {
      flex: 1,
      fontSize: '13px'
    },
    joinBtn: {
      padding: '4px 16px',
      backgroundColor: '#3b82f6',
      borderRadius: '24px',
      border: 'none',
      color: '#fff',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer'
    },
    joinBtnJoined: {
      padding: '4px 16px',
      backgroundColor: '#16a34a',
      borderRadius: '24px',
      border: 'none',
      color: '#fff',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer'
    },
    moreBtn: {
      background: 'none',
      border: 'none',
      color: '#999',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '4px 8px'
    },
    postContent: {
      padding: '16px'
    },
    postTitle: {
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '12px'
    },
    videoContainer: {
      position: 'relative',
      paddingBottom: '56.25%',
      backgroundColor: '#000',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    videoThumbnail: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    videoOverlay: {
      position: 'absolute',
      bottom: '16px',
      left: '16px',
      color: '#fff',
      fontSize: '14px',
      textShadow: '0 2px 4px rgba(0,0,0,0.8)'
    },
    videoTime: {
      position: 'absolute',
      bottom: '16px',
      right: '16px',
      color: '#fff',
      fontSize: '12px',
      backgroundColor: 'rgba(0,0,0,0.75)',
      padding: '4px 8px',
      borderRadius: '4px'
    },
    postActions: {
      padding: '0 16px 16px',
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    },
    actionBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'none',
      border: 'none',
      color: '#999',
      cursor: 'pointer',
      fontSize: '14px',
      padding: '4px 8px',
      transition: 'color 0.2s'
    },
    actionBtnActive: {
      fontWeight: '600'
    },
    postLayout: {
      display: 'flex',
      gap: '16px',
      padding: '16px'
    },
    postThumbnail: {
      width: '128px',
      height: '96px',
      objectFit: 'cover',
      borderRadius: '8px',
      flexShrink: 0,
      cursor: 'pointer'
    },
    postDetails: {
      flex: 1
    },
    postTitleSmall: {
      fontSize: '16px',
      fontWeight: 600,
      marginBottom: '4px',
      cursor: 'pointer'
    },
    postSubtitle: {
      fontSize: '14px',
      color: '#999',
      marginBottom: '8px'
    },
    postMetaInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '12px',
      color: '#666'
    },
    communitiesSidebar: {
      position: 'sticky',
      top: '80px',
      height: 'fit-content'
    },
    communitiesCard: {
      backgroundColor: '#1a1a1a',
      borderRadius: '12px',
      padding: '16px'
    },
    communitiesTitle: {
      fontSize: '12px',
      fontWeight: 600,
      color: '#999',
      marginBottom: '12px'
    },
    communitiesList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    communityItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    communityAvatar: {
      width: '32px',
      height: '32px',
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      borderRadius: '50%'
    },
    communityName: {
      fontSize: '14px',
      fontWeight: 600
    },
    communityMembers: {
      fontSize: '12px',
      color: '#666'
    },
    seeMoreBtn: {
      width: '100%',
      marginTop: '16px',
      padding: '8px',
      background: 'none',
      border: 'none',
      color: '#3b82f6',
      fontSize: '14px',
      cursor: 'pointer'
    },
    suggestionBox: {
      position: 'absolute',
      top: '44px',
      left: 0,
      right: 0,
      background: '#0f0f0f',
      border: '1px solid #2d2d2d',
      borderRadius: 8,
      zIndex: 40,
      maxHeight: 220,
      overflowY: 'auto',
      padding: 8
    },
    suggestionItem: {
      padding: '6px 8px',
      cursor: 'pointer',
      borderRadius: 6,
      color: '#ddd'
    },
    progressBarOuter: {
      width: 'calc(100% - 32px)',
      height: 8,
      background: '#2d2d2d',
      borderRadius: 8,
      overflow: 'hidden',
      position: 'relative',
      marginTop: 12
    },
    progressBarInner: {
      height: '100%',
      background: '#ff4500'
    },
    fullPostView: {
      position: 'fixed',
      inset: '8% 10%',
      zIndex: 120,
      background: '#0b0b0b',
      border: '1px solid #222',
      borderRadius: 12,
      padding: 20,
      overflowY: 'auto',
      maxHeight: '80%'
    },
    closeFullPostBtn: {
      position: 'absolute',
      top: 12,
      right: 12,
      background: 'none',
      border: '1px solid #333',
      color: '#fff',
      padding: '6px 10px',
      borderRadius: 8,
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.redditLogo}>r</div>
          {sidebarOpen && <span style={styles.redditTitle}>reddit</span>}
        </div>

        <nav style={styles.sidebarNav}>
          <button
            style={{ ...styles.navItem, ...(sidebarActive === 'Home' ? styles.navItemActive : {}) }}
            onClick={() => handleSidebarNav('Home')}
          >
            <span>🏠</span>
            {sidebarOpen && <span>Home</span>}
          </button>
          <button
            style={{ ...styles.navItem, ...(sidebarActive === 'Popular' ? styles.navItemActive : {}) }}
            onClick={() => handleSidebarNav('Popular')}
          >
            <span>📈</span>
            {sidebarOpen && <span>Popular</span>}
          </button>
          <button
            style={{ ...styles.navItem, ...(sidebarActive === 'Answers' ? styles.navItemActive : {}) }}
            onClick={() => handleSidebarNav('Answers')}
          >
            <span>💬</span>
            {sidebarOpen && (
              <>
                <span>Answers</span>
                <span style={styles.navBadge}>BETA</span>
              </>
            )}
          </button>
          <button
            style={{ ...styles.navItem, ...(sidebarActive === 'Explore' ? styles.navItemActive : {}) }}
            onClick={() => handleSidebarNav('Explore')}
          >
            <span>🧭</span>
            {sidebarOpen && <span>Explore</span>}
          </button>

          {sidebarOpen && (
            <>
              <div style={styles.sectionTitle}>RESOURCES</div>
              <button style={styles.navItem} onClick={() => handleSidebarNav('About')}>About Reddit</button>
              <button style={styles.navItem} onClick={() => handleSidebarNav('Advertise')}>Advertise</button>
              <button style={styles.navItem} onClick={() => handleSidebarNav('Developers')}>Developer Platform</button>
              <button style={styles.navItem}>
                <span>Reddit Pro</span>
                <span style={styles.navBadge}>BETA</span>
              </button>
              <button style={styles.navItem}>Help</button>
              <button style={styles.navItem}>Blog</button>
              <button style={styles.navItem}>Careers</button>
              <button style={styles.navItem}>Press</button>

              <div style={styles.sectionTitle}>COMMUNITIES</div>
              <button style={styles.navItem}>Best of Reddit</button>
              <button style={styles.navItem}>Best of Reddit in P...</button>
              <button style={styles.navItem}>Best of Reddit in G...</button>
            </>
          )}
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.toggleBtn}>
            ☰
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header (Search) */}
        <div style={styles.header}>
          <div style={{ position: 'relative', maxWidth: 768 }}>
            <input
              type="text"
              placeholder="Search Reddit"
              style={styles.searchInput}
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => setSearchSuggestionsOpen(Boolean(searchQuery.trim()))}
              onBlur={() => setTimeout(() => setSearchSuggestionsOpen(false), 120)}
            />
            {searchSuggestionsOpen && suggestions.length > 0 && (
              <div style={styles.suggestionBox}>
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    style={styles.suggestionItem}
                    onMouseDown={() => pickSuggestion(s)}
                  >
                    {s}
                  </div>
                ))}
                {suggestions.length === 0 && (
                  <div style={styles.suggestionItem}>No suggestions</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Feed */}
        <div style={styles.feedContainer}>
          <div style={styles.feedGrid}>
            {/* Posts Column */}
            <div style={styles.postsColumn}>
              {/* Filter Bar */}
              <div style={styles.filterBar}>
                <div style={{ position: 'relative' }}>
                  <button
                    style={{
                      ...styles.filterBtn,
                      ...(activeSort ? { boxShadow: '0 0 0 2px rgba(255,69,0,0.06)' } : {})
                    }}
                    onClick={() => setSortDropdownOpen(prev => !prev)}
                  >
                    {activeSort} ▼
                  </button>
                  {sortDropdownOpen && (
                    <div style={styles.dropdown}>
                      {sortOptions.map(opt => (
                        <div key={opt}>
                          <button
                            style={{ ...styles.actionBtn, width: '100%', justifyContent: 'flex-start', padding: '6px 8px', color: opt === activeSort ? '#fff' : '#ccc' }}
                            onClick={() => { setActiveSort(opt); setSortDropdownOpen(false); }}
                          >
                            {opt}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <button
                    style={styles.filterBtn}
                    onClick={() => setLocDropdownOpen(prev => !prev)}
                  >
                    {activeLocation}
                  </button>
                  {locDropdownOpen && (
                    <div style={styles.dropdown}>
                      {locationOptions.map(opt => (
                        <div key={opt}>
                          <button
                            style={{ ...styles.actionBtn, width: '100%', justifyContent: 'flex-start', padding: '6px 8px', color: opt === activeLocation ? '#fff' : '#ccc' }}
                            onClick={() => { setActiveLocation(opt); setLocDropdownOpen(false); }}
                          >
                            {opt}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Featured Video Post */}
              <div style={styles.postCard}>
                <div style={styles.postHeader}>
                  <div style={styles.subredditAvatar}></div>
                  <div style={styles.postMeta}>
                    <div>
                      <span style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => alert('Open subreddit r/funny preview')}>r/funny</span>
                      <span style={{ color: '#999', fontSize: '12px' }}> • Posted by <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => alert('Open user u/SomeUserGM')}>u/SomeUserGM</span> • 3 hours ago</span>
                    </div>
                  </div>
                  <button style={joinedFeatured ? styles.joinBtnJoined : styles.joinBtn} onClick={toggleJoinFeatured}>
                    {joinedFeatured ? 'Joined' : 'Join'}
                  </button>
                  <div style={{ position: 'relative' }}>
                    <button className="more" style={styles.moreBtn} onClick={() => openMore('featured')}>⋯</button>
                    {showMoreFor === 'featured' && (
                      <div style={{ ...styles.dropdown, right: 8, left: 'auto' }}>
                        <button style={{ ...styles.actionBtn }} onClick={() => { alert('Reported (mock)'); setShowMoreFor(null); }}>Report</button>
                        <button style={{ ...styles.actionBtn }} onClick={() => { alert('Saved (mock)'); setShowMoreFor(null); }}>Save</button>
                        <button style={{ ...styles.actionBtn }} onClick={() => { alert('Hidden (mock)'); setShowMoreFor(null); }}>Hide</button>
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.postContent}>
                  <h2 style={styles.postTitle}>Mom, I want to change my name</h2>

                  <div style={styles.videoContainer}>
                    {/* actual video element */}
                    <video
                      ref={videoRef}
                      src={featuredVideoSrc}
                      poster="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=450&fit=crop"
                      style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
                      onClick={togglePlayPause}
                      muted={videoVolume === 0}
                      controls={false}
                    />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                      {!videoPlaying && <div style={{ background: 'rgba(0,0,0,0.45)', padding: 12, borderRadius: 8, pointerEvents: 'auto', cursor: 'pointer' }} onClick={togglePlayPause}>▶ Play</div>}
                    </div>

                    <div style={styles.videoOverlay}>
                      When you realize this is the<br />
                      lady your Mom chose to name<br />
                      you after 💀💀
                    </div>
                    <div style={styles.videoTime}>0:26 / 3:26</div>
                  </div>

                  <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      Volume
                      <input type="range" min={0} max={1} step={0.01} value={videoVolume} onChange={handleVolumeChange} />
                    </label>
                  </div>

                  <div style={styles.progressBarOuter}>
                    <div style={{ ...styles.progressBarInner, width: `${videoProgress}%` }} />
                  </div>
                </div>

                <div style={styles.postActions}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: postVotes.featured.state === 'up' ? '#ff4500' :
                      postVotes.featured.state === 'down' ? '#3b82f6' : '#f1f1f1',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    gap: '8px'
                  }}>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                        color: postVotes.featured.state === 'up' ? '#fff' : '#000'
                      }}
                      onClick={() => handleFeaturedVote('up')}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                    </button>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: postVotes.featured.state ? '#fff' : '#000'
                    }}>
                      {formatNumber(postVotes.featured.count)}
                    </span>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                        color: postVotes.featured.state === 'down' ? '#fff' : '#000'
                      }}
                      onClick={() => handleFeaturedVote('down')}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12l7 7 7-7" />
                      </svg>
                    </button>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <button style={styles.actionBtn} onClick={() => openComments('featured')}>💬 420</button>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <button style={styles.actionBtn} onClick={() => openShare('featured')}>↗ Share</button>
                    {showShareFor === 'featured' && (
                      <div style={{ ...styles.dropdown, right: 8, left: 'auto' }}>
                        <button style={styles.actionBtn} onClick={() => { navigator.clipboard?.writeText(window.location.href); alert('Link copied (mock)'); setShowShareFor(null); }}>Copy link</button>
                        <button style={styles.actionBtn} onClick={() => { alert('Share to X (mock)'); setShowShareFor(null); }}>Share to X</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Other Posts */}
              {filteredPosts.map(post => (
                <div key={post.id} style={styles.postCard}>
                  <div style={styles.postLayout}>
                    <img src={post.image} alt={post.title} style={styles.postThumbnail} onClick={() => openFullPost(post)} />
                    <div style={styles.postDetails}>
                      <h3 style={styles.postTitleSmall} onClick={() => openFullPost(post)}>{post.title}</h3>
                      <p style={styles.postSubtitle}>{post.subtitle}</p>
                      <div style={styles.postMetaInfo}>
                        <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => alert(`Open ${post.subreddit}`)}>{post.subreddit}</span>
                        <span>•</span>
                        <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => alert(`Open ${post.author}`)}>{post.author}</span>
                      </div>
                      <div style={{ ...styles.postActions, padding: '8px 0 0 0' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: post.voteState === 'up' ? '#ff4500' :
                            post.voteState === 'down' ? '#3b82f6' : '#f1f1f1',
                          borderRadius: '20px',
                          padding: '6px 12px',
                          gap: '8px'
                        }}>
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0',
                              display: 'flex',
                              alignItems: 'center',
                              color: post.voteState === 'up' ? '#fff' : '#000'
                            }}
                            onClick={() => handlePostVote(post.id, 'up')}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 19V5M5 12l7-7 7 7" />
                            </svg>
                          </button>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: post.voteState ? '#fff' : '#000'
                          }}>
                            {formatNumber(post.upvotes)}
                          </span>
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0',
                              display: 'flex',
                              alignItems: 'center',
                              color: post.voteState === 'down' ? '#fff' : '#000'
                            }}
                            onClick={() => handlePostVote(post.id, 'down')}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v14M5 12l7 7 7-7" />
                            </svg>
                          </button>
                        </div>

                        <button style={{ ...styles.actionBtn, padding: '4px 8px' }} onClick={() => openComments(post.id)}>💬 {post.comments}</button>

                        <div style={{ position: 'relative' }}>
                          <button style={styles.actionBtn} onClick={() => openShare(post.id)}>↗ Share</button>
                          {showShareFor === post.id && (
                            <div style={{ ...styles.dropdown, right: 8, left: 'auto' }}>
                              <button style={styles.actionBtn} onClick={() => { navigator.clipboard?.writeText(window.location.href); alert('Link copied (mock)'); setShowShareFor(null); }}>Copy link</button>
                              <button style={styles.actionBtn} onClick={() => { alert('Share to X (mock)'); setShowShareFor(null); }}>Share to X</button>
                            </div>
                          )}
                        </div>

                        <div style={{ position: 'relative' }}>
                          <button style={styles.actionBtn} onClick={() => openMore(post.id)}>⋯</button>
                          {showMoreFor === post.id && (
                            <div style={{ ...styles.dropdown, right: 8, left: 'auto' }}>
                              <button style={styles.actionBtn} onClick={() => { alert('Reported (mock)'); setShowMoreFor(null); }}>Report</button>
                              <button style={styles.actionBtn} onClick={() => handleSavePost(post.id)}>Save</button>
                              <button style={styles.actionBtn} onClick={() => handleHidePost(post.id)}>Hide</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            </div>

            {/* Communities Sidebar */}
            <div style={styles.communitiesSidebar}>
              <div style={styles.communitiesCard}>
                <h3 style={styles.communitiesTitle}>POPULAR COMMUNITIES</h3>
                <div style={styles.communitiesList}>
                  {(seeMoreCommunities ? communities : communities.slice(0, 3)).map((community) => (
                    <div key={community.id} style={styles.communityItem}>
                      <div style={styles.communityAvatar}></div>
                      <div style={{ flex: 1 }}>
                        <div style={styles.communityName}>{community.name}</div>
                        <div style={styles.communityMembers}>{community.members} members</div>
                      </div>
                      <div>
                        <button
                          style={community.isJoined ? styles.joinBtnJoined : styles.joinBtn}
                          onClick={() => toggleJoinCommunity(community.id)}
                        >
                          {community.isJoined ? 'Joined' : 'Join'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button style={styles.seeMoreBtn} onClick={toggleSeeMore}>
                  {seeMoreCommunities ? 'Show less' : 'See more'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments modal (simple) */}
      {showCommentsFor && (
        <div style={{
          position: 'fixed',
          inset: '15% 15%',
          zIndex: 130,
          background: '#0b0b0b',
          border: '1px solid #222',
          borderRadius: 8,
          padding: 16
        }}>
          <button onClick={closeComments} style={{ marginBottom: 8 }}>Close</button>
          <div>Comments for post id: {String(showCommentsFor)}</div>
          <div style={{ marginTop: 12, color: '#aaa' }}>[Comments would be loaded from backend]</div>
        </div>
      )}

      {/* Full post view */}
      {currentPostView && (
        <div style={styles.fullPostView}>
          <button style={styles.closeFullPostBtn} onClick={closeFullPost}>Close</button>
          <h2>{currentPostView.title}</h2>
          <div style={{ color: '#999' }}>{currentPostView.subreddit} • {currentPostView.author}</div>
          <img src={currentPostView.image} alt="" style={{ width: '100%', marginTop: 12, borderRadius: 8 }} />
          <p style={{ marginTop: 12, color: '#ddd' }}>{currentPostView.subtitle}</p>
          <div style={{ marginTop: 12 }}>
            <button style={styles.actionBtn} onClick={() => handlePostVote(currentPostView.id, 'up')}>▲ Upvote</button>
            <button style={styles.actionBtn} onClick={() => handlePostVote(currentPostView.id, 'down')}>▼ Downvote</button>
            <button style={styles.actionBtn} onClick={() => openComments(currentPostView.id)}>Comments</button>
          </div>
        </div>
      )}
    </div>
  );
}
