const User = require("../models/User");
const bcrypt = require("bcryptjs");
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Username and password are required" });

    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ message: "Invalid username or password" });

    const correct = await bcrypt.compare(password, user.password);
    if (!correct)
      return res.status(401).json({ message: "Invalid username or password" });

    res.json({
      message: "Login successful",
      user: { id: user._id, username: user.username }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { loginUser };