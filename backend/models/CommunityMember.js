
const mongoose = require("mongoose");

const communityMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    role: {
      type: String,
      enum: ["member", "moderator", "admin"],
      default: "member",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One user can be a member of a community only once
communityMemberSchema.index({ user: 1, community: 1 }, { unique: true });

module.exports = mongoose.model("CommunityMember", communityMemberSchema);