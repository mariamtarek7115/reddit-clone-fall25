const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Vote = require("../models/Vote");

// GET /profile/:username/overview
exports.getProfileOverview = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }, { password: 0 });
    if (!user) return res.status(404).json({ message: "User not found" });

    const [postsCount, commentsCount] = await Promise.all([
      Post.countDocuments({ author: user._id, isDeleted: false }),
      Comment.countDocuments({ author: user._id, isDeleted: false }),
    ]);

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        bio: user.bio || "",
        createdAt: user.createdAt,
      },
      stats: { postsCount, commentsCount },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /profile/:username/posts
exports.getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ author: user._id, isDeleted: false })
      .populate("community", "name")
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /profile/:username/comments
exports.getUserComments = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const comments = await Comment.find({ author: user._id, isDeleted: false })
      .populate("post", "title")
      .sort({ createdAt: -1 });

    res.json({ comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /profile/:username/votes?value=1 or -1
exports.getUserVotes = async (req, res) => {
  try {
    const { username } = req.params;
    const value = Number(req.query.value); // 1 or -1

    if (![1, -1].includes(value)) {
      return res.status(400).json({ message: "value must be 1 or -1" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    // votes made by this user
    const votes = await Vote.find({ user: user._id, value }).sort({ createdAt: -1 });

    // split post/comment votes
    const postIds = votes.filter(v => v.targetType === "Post").map(v => v.targetId);
    const commentIds = votes.filter(v => v.targetType === "Comment").map(v => v.targetId);

    const [posts, comments] = await Promise.all([
      Post.find({ _id: { $in: postIds }, isDeleted: false }).populate("community", "name"),
      Comment.find({ _id: { $in: commentIds }, isDeleted: false }).populate("post", "title"),
    ]);

    res.json({ posts, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
