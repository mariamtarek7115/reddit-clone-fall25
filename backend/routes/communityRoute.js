const express = require("express");
const router = express.Router();
const communityController = require("../controllers/communityController");

// ORDER MATTERS
router.get("/", communityController.searchCommunities);
router.post("/", communityController.createCommunity);
router.get("/:name", communityController.getCommunity);

module.exports = router;
