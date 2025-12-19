const express = require("express");
const { summarizePost } = require("../controllers/ai");

const router = express.Router();

router.post("/summarize", summarizePost);

module.exports = router;