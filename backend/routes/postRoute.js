// backend/routes/postRoute.js
const express = require("express");
const path = require("path");
const multer = require("multer");
const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// Only accept image files and limit size to 5MB
const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

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
router.post("/", upload.single('image'), createPost);
router.patch("/:postId", upload.single('image'), updatePost);
router.delete("/:postId", deletePost);

module.exports = router;
