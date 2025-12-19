const express = require("express");
const router = express.Router();

// Example vote routes (you can adjust later)
router.post("/upvote", (req, res) => {
  res.json({ message: "Upvoted" });
});

router.post("/downvote", (req, res) => {
  res.json({ message: "Downvoted" });
});

module.exports = router;
