const Community = require("../models/Community");

/**
 * CREATE COMMUNITY
 */
exports.createCommunity = async (req, res) => {
  try {
    const { name, description, type, mature } = req.body;

    // Validation
    if (!name || !description) {
      return res.status(400).json({
        message: "Name and description are required",
      });
    }

    // Check if community already exists
    const exists = await Community.findOne({ name });
    if (exists) {
      return res.status(400).json({
        message: "Community already exists",
      });
    }

    // Create community (NO creator for now)
    const community = await Community.create({
      name,
      description,
      type: type || "public",
      mature: mature ?? false,
      membersCount: 1,
      creator: null,        // 🔥 IMPORTANT FIX
      moderators: []        // explicit to avoid hidden logic
    });

    return res.status(201).json(community);

  } catch (err) {
    console.error("Create community error FULL:", err);
    return res.status(500).json({
      message: "Failed to create community",
      error: err.message,
    });
  }
};

/**
 * GET COMMUNITY BY NAME
 */
exports.getCommunity = async (req, res) => {
  try {
    const community = await Community.findOne({ name: req.params.name });

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    return res.json(community);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * SEARCH COMMUNITIES
 */
exports.searchCommunities = async (req, res) => {
  try {
    const q = req.query.q || "";

    const communities = await Community.find({
      name: { $regex: q, $options: "i" },
    });

    return res.json(communities);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
