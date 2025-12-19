const express = require("express");
const router = express.Router();
const communityController = require("../controllers/communityController");

// ORDER MATTERS
router.get("/", communityController.searchCommunities);
// User-specific communities
router.get("/user/:userId", communityController.getCommunitiesForUser);
// Join / Leave
router.post("/:communityId/join", communityController.joinCommunity);
router.delete("/:communityId/leave", communityController.leaveCommunity);
router.post("/", communityController.createCommunity);
router.get("/:name", communityController.getCommunity);

module.exports = router;
