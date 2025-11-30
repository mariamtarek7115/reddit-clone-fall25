const User = require("../models/User");

exports.createUser = async (req, res) => {
    console.log("Received:", req.body);

    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Backend password validation - FIXED REGEX
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            message: "Password must be at least 8 characters and include lowercase, uppercase, number, and special character" 
        });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const user = new User({ username, password });
        const savedUser = await user.save();
        
        // Don't send password back
        const userResponse = {
            username: savedUser.username,
            _id: savedUser._id
        };
        
        res.status(201).json(userResponse);
    } catch (e) {
        console.error("Database error:", e);
        if (e.code === 11000) {
            res.status(400).json({ message: "Username already exists" });
        } else {
            res.status(500).json({ message: "Server error creating user" });
        }
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ username: req.params.username });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
