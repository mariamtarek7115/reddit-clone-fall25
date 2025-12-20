import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import CommunityPage from "./pages/CommunityPage";
import CreateCommunityPage from "./pages/CreateCommunityPage";
import Profile from "./pages/Profile";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
import MessageMods from "./pages/MessageMods";
import ModsAndMembers from "./pages/ModsAndMembers";

import { AuthContext } from "./context/AuthContext";

// ✅ if logged in, block /login and /signup
function PublicOnly({ children }) {
  const { user } = useContext(AuthContext);
  return user ? <Navigate to="/feed" replace /> : children;
}

// ✅ if not logged in, block everything else
function Protected({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/signup" replace />;
}

function App() {
  return (
    <div className="App">
      <Routes>
        {/* ✅ First page is Signup */}
        <Route
          path="/"
          element={
            <PublicOnly>
              <Signup />
            </PublicOnly>
          }
        />

        {/* ✅ Public only */}
        <Route
          path="/signup"
          element={
            <PublicOnly>
              <Signup />
            </PublicOnly>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnly>
              <Login />
            </PublicOnly>
          }
        />

        {/* ✅ Protected */}
        <Route
          path="/feed"
          element={
            <Protected>
              <Feed />
            </Protected>
          }
        />

        <Route
          path="/r/:communityName"
          element={
            <Protected>
              <CommunityPage />
            </Protected>
          }
        />
        <Route
          path="/r/:communityName/message-mods"
          element={
            <Protected>
              <MessageMods />
            </Protected>
          }
        />
        <Route
          path="/r/:communityName/mods"
          element={
            <Protected>
              <ModsAndMembers />
            </Protected>
          }
        />
        <Route
          path="/createcommunity"
          element={
            <Protected>
              <CreateCommunityPage />
            </Protected>
          }
        />
        <Route
          path="/u/:username"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />
        <Route
          path="/profile"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />
        <Route
          path="/post/:postId"
          element={
            <Protected>
              <PostDetail />
            </Protected>
          }
        />
        <Route
          path="/createpost"
          element={
            <Protected>
              <CreatePost />
            </Protected>
          }
        />

        {/* ✅ fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
