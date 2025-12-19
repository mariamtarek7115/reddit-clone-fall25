// backend/routes/postRoute.js
const express = require("express");
const router = express.Router();

const {
  createPost,
  getFeedPosts,
  getPostById,
  getPostsByCommunity,
  getPostsByUser,
  updatePost,
  deletePost,
} = require("../controllers/postController");

// Feed
router.get("/", getFeedPosts);

// Filters
router.get("/community/:communityName", getPostsByCommunity);
router.get("/user/:username", getPostsByUser);

// Single post
router.get("/:postId", getPostById);

// Create / edit / delete
router.post("/", createPost);
router.patch("/:postId", updatePost);
router.delete("/:postId", deletePost);

module.exports = router;
