// src/App.js
import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import CreateCommunityPage from './pages/CreateCommunityPage';
import CommunityPage from './pages/CommunityPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} /> 
        <Route path="/create-community" element={<CreateCommunityPage />} />
        <Route path="/r/:communityName" element={<CommunityPage />} />
      </Routes>
    </div>
  );
}

export default App;