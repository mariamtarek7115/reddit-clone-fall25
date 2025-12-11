
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    password: {
      type: String, // hashed with bcrypt
      required: true,
    },
    
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    
    bio: {
      type: String,
      maxlength: 300,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
