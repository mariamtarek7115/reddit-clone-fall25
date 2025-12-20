const express = require("express");
const router = express.Router();
const { updateMyProfile } = require("../controllers/profileController");
const {
  getProfileOverview,
  getUserPosts,
  getUserComments,
  getUserVotes,
} = require("../controllers/profileController");

// username-based profile
router.get("/:username/overview", getProfileOverview);
router.get("/:username/posts", getUserPosts);
router.get("/:username/comments", getUserComments);

// ?value=1 (upvoted) or ?value=-1 (downvoted)
router.get("/:username/votes", getUserVotes);
router.patch("/me", updateMyProfile);

module.exports = router;
