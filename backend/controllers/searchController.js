const Community = require("../models/Community");
const User = require("../models/User");

exports.globalSearch = async (req, res) => {
  try {
    const q = req.query.q || "";

    if (!q.trim()) {
      return res.json({ communities: [], users: [] });
    }

    // Search communities
    const communities = await Community.find({
      isDeleted: false,
      name: { $regex: q, $options: "i" },
    }).select("name description membersCount");

    // Search users
    const users = await User.find({
      username: { $regex: q, $options: "i" },
    }).select("username avatar");

    res.json({
      communities,
      users,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
