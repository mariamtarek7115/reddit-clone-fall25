
const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    // e.g. "memes" -> "r/memes"
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 21,
    },
    
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },

    type: {
      type: String,
      enum: ["public", "restricted", "private"],
      default: "public",
    },

    mature: {
      type: Boolean,
      default: false, // 18+
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    moderators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    membersCount: {
      type: Number,
      default: 1,
    },

    iconUrl: String,
   
  },
  { timestamps: true }
);

module.exports = mongoose.model("Community", communitySchema);
