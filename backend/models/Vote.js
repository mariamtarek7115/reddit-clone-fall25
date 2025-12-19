
const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["Post", "Comment"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    value: {
      type: Number,
      enum: [1, -1], // 1 = upvote, -1 = downvote
      required: true,
    },
  },
  { timestamps: true }
);

// one vote per user per target
voteSchema.index(
  { user: 1, targetType: 1, targetId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Vote", voteSchema);
