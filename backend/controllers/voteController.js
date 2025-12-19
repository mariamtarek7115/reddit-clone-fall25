const mongoose = require("mongoose");
const Vote = require("../models/Vote");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

exports.voteOnTarget = async (req, res) => {
  try {
    const { userId, targetType, targetId, value } = req.body;

    if (!userId || !targetType || !targetId || ![1, -1].includes(value)) {
      return res.status(400).json({ message: "Missing/invalid fields" });
    }
    if (!["Post", "Comment"].includes(targetType)) {
      return res.status(400).json({ message: "targetType must be Post or Comment" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: "Invalid userId/targetId" });
    }

    const Model = targetType === "Post" ? Post : Comment;

    const target = await Model.findById(targetId);
    if (!target || target.isDeleted) {
      return res.status(404).json({ message: `${targetType} not found` });
    }

    const existing = await Vote.findOne({ user: userId, targetType, targetId });

    let newVoteState = null; // "up" | "down" | null

    if (!existing) {
      // create new vote
      await Vote.create({ user: userId, targetType, targetId, value });
      newVoteState = value === 1 ? "up" : "down";
    } else if (existing.value === value) {
      // undo vote
      await Vote.deleteOne({ _id: existing._id });
      newVoteState = null;
    } else {
      // switch vote
      existing.value = value;
      await existing.save();
      newVoteState = value === 1 ? "up" : "down";
    }

    // Recalculate net score: upvotes (1) minus downvotes (-1)
    const upvoteCount = await Vote.countDocuments({ targetType, targetId, value: 1 });
    const downvoteCount = await Vote.countDocuments({ targetType, targetId, value: -1 });
    const net = (upvoteCount || 0) - (downvoteCount || 0);
    target.upvotes = net;
    await target.save();

    return res.json({
      targetType,
      targetId,
      upvotes: target.upvotes,
      voteState: newVoteState,
    });
  } catch (err) {
    console.error("voteOnTarget error:", err);
    return res.status(500).json({ message: "Server error voting" });
  }
};
