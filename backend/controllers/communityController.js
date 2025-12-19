const Community = require("../models/Community");
const CommunityMember = require("../models/CommunityMember");
const mongoose = require("mongoose");

/**
 * CREATE COMMUNITY
 */
exports.createCommunity = async (req, res) => {
  try {
    let { name, description, type, mature } = req.body;

    // Validation
    if (!name || !description) {
      return res.status(400).json({
        message: "Name and description are required",
      });
    }

    // Normalize name for consistent storage and uniqueness
    name = name.trim().toLowerCase();

    // Check if community already exists
    const exists = await Community.findOne({ name });
    if (exists) {
      return res.status(409).json({
        message: "Community already exists",
      });
    }

    // If creator provided and valid, set it and create membership
    let creatorId = null;
    if (req.body.creator && mongoose.Types.ObjectId.isValid(req.body.creator)) {
      creatorId = req.body.creator;
    }

    // Create community. If creator exists, set membersCount to 1 (creator will be a member); otherwise 0.
    const community = await Community.create({
      name,
      description,
      type: type || "public",
      mature: mature ?? false,
      membersCount: creatorId ? 1 : 0,
      creator: creatorId || undefined,
      moderators: creatorId ? [creatorId] : []
    });

    // If creator provided, create CommunityMember entry
    if (creatorId) {
      try {
        await CommunityMember.create({ user: creatorId, community: community._id, role: 'admin' });
      } catch (err) {
        // ignore duplicate membership errors if they occur unexpectedly
        if (err && err.code !== 11000) console.error('Error creating creator membership:', err);
      }
    }

    return res.status(201).json(community);

  } catch (err) {
    console.error("Create community error FULL:", err);
    // Handle duplicate key errors (race conditions)
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Community name already exists" });
    }

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
    const name = String(req.params.name || "").trim().toLowerCase();
    const community = await Community.findOne({ name });

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

/**
 * GET COMMUNITIES JOINED BY USER
 */
exports.getCommunitiesForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const memberships = await CommunityMember.find({ user: userId }).populate(
      "community",
      "name description iconUrl"
    );

    const communities = memberships.map((m) => m.community).filter(Boolean);

    return res.json({ communities });
  } catch (err) {
    console.error("getCommunitiesForUser error:", err);
    return res.status(500).json({ message: "Server error fetching user communities" });
  }
};

/**
 * JOIN COMMUNITY
 */
exports.joinCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res.status(400).json({ message: "Invalid communityId" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    try {
      const membership = await CommunityMember.create({ user: userId, community: communityId });

      // Increment membersCount
      await Community.findByIdAndUpdate(communityId, { $inc: { membersCount: 1 } });

      return res.status(201).json({ membership });
    } catch (err) {
      // Duplicate membership
      if (err && err.code === 11000) {
        return res.status(409).json({ message: "User already a member" });
      }
      throw err;
    }
  } catch (err) {
    console.error("joinCommunity error:", err);
    return res.status(500).json({ message: "Server error joining community" });
  }
};

/**
 * LEAVE COMMUNITY
 */
exports.leaveCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res.status(400).json({ message: "Invalid communityId" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const membership = await CommunityMember.findOneAndDelete({ user: userId, community: communityId });

    if (!membership) return res.status(404).json({ message: "Membership not found" });

    // Decrement membersCount but not below 0
    await Community.findByIdAndUpdate(communityId, { $inc: { membersCount: -1 } });

    return res.json({ message: "Left community" });
  } catch (err) {
    console.error("leaveCommunity error:", err);
    return res.status(500).json({ message: "Server error leaving community" });
  }
};
