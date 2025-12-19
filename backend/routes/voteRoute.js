const router = require("express").Router();
const { voteOnTarget } = require("../controllers/voteController");

router.post("/", voteOnTarget);

module.exports = router;
