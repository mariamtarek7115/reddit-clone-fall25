const router = require("express").Router();
const commentController = require("../controllers/commentController");

router.get("/post/:postId", commentController.getCommentsByPost);
router.post("/", commentController.createComment);
router.patch("/:commentId", commentController.updateComment);
router.delete("/:commentId", commentController.deleteComment);

module.exports = router;
