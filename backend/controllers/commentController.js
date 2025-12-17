const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");

/**
 * GET /comments/post/:postId
 * Optional query: ?parent=null (top-level) OR ?parent=<commentId>
 */
exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { parent } = req.query;

    const filter = { post: postId, isDeleted: false };

    if (parent === "null") filter.parentComment = null;
    else if (parent) filter.parentComment = parent;

    const comments = await Comment.find(filter)
      .populate("author", "username")
      .sort({ createdAt: -1 });

    res.json({ comments });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load comments" });
  }
};

/**
 * POST /comments
 * body: { postId, body, parentComment=null, userId OR username }
 */
exports.createComment = async (req, res) => {
  try {
    const { postId, body, parentComment = null, userId, username } = req.body;

    if (!postId || !body?.trim()) {
      return res.status(400).json({ message: "postId and body are required" });
    }

    let authorId = userId;

    if (!authorId && username) {
      const u = await User.findOne({ username });
      if (!u) return res.status(404).json({ message: "User not found" });
      authorId = u._id;
    }

    if (!authorId) {
      return res.status(400).json({ message: "userId or username is required" });
    }

    // Ensure post exists
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // If it's a reply, ensure parent exists and belongs to same post
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) return res.status(404).json({ message: "Parent comment not found" });
      if (String(parent.post) !== String(postId)) {
        return res.status(400).json({ message: "Parent comment does not belong to this post" });
      }
    }

    const comment = await Comment.create({
      post: postId,
      author: authorId,
      parentComment: parentComment || null,
      body: body.trim(),
    });

    // Increment post comment count ONLY for top-level? (Usually count all comments)
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    const populated = await Comment.findById(comment._id).populate("author", "username");

    res.status(201).json({ comment: populated });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create comment" });
  }
};

/**
 * PATCH /comments/:commentId
 * body: { body }
 */
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { body } = req.body;

    if (!body?.trim()) return res.status(400).json({ message: "body is required" });

    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { body: body.trim() },
      { new: true }
    ).populate("author", "username");

    if (!updated) return res.status(404).json({ message: "Comment not found" });

    res.json({ comment: updated });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update comment" });
  }
};

/**
 * DELETE /comments/:commentId
 * Soft delete: mark isDeleted=true, wipe body
 */
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.isDeleted) return res.json({ message: "Already deleted" });

    comment.isDeleted = true;
    comment.body = "[deleted]";
    await comment.save();

    // Decrement post count
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete comment" });
  }
};
