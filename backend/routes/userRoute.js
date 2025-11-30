// backend/routes/userRoute.js
const express = require("express");
const router = express.Router();

const {
  loginUser,
  createUser,
  getUsers,
  deleteUser,
} = require("../controllers/userController");

// Signup
router.post("/signup", createUser);

// Login
router.post("/login", loginUser);

// Get all users (optional)
router.get("/", getUsers);

// Delete by username (optional)
router.delete("/:username", deleteUser);

module.exports = router;
