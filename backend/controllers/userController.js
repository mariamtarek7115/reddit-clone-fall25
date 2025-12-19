// backend/controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// POST /user/login
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid username or password" });
    }

    const correct = await bcrypt.compare(password, user.password);
    if (!correct) {
      return res
        .status(401)
        .json({ message: "Invalid username or password" });
    }

    return res.status(200).json({
      message: "Login successful",
      user: { _id: user._id, username: user.username },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /user/signup
exports.createUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Password rules: >=8 chars, lowercase, uppercase, number, special char
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include lowercase, uppercase, number, and special character",
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, password: hashedPassword });
    const savedUser = await user.save();

    return res.status(201).json({
      message: "Account created successfully",
      user: { _id: savedUser._id, username: savedUser.username },
    });
  } catch (e) {
    console.error("Database error:", e);

    // Mongo duplicate key
    if (e.code === 11000) {
      return res.status(400).json({ message: "Username already exists" });
    }

    return res.status(500).json({ message: "Server error creating user" });
  }
};

// GET /user
exports.getUsers = async (req, res) => {
  try {
    // never return password hashes
    const users = await User.find({}, { password: 0 });
    return res.status(200).json(users);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// DELETE /user/:username
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({
      username: req.params.username,
    });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
