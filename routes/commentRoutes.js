/*
import express from "express";
import Comment from "../models/Comment.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add a comment to an item
router.post("/item/:itemId", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text.trim()) return res.status(400).json({ message: "Comment cannot be empty" });

    const newComment = new Comment({
      itemId: req.params.itemId,
      userId: req.user.id,
      text
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to post comment" });
  }
});

// Get all comments for an item
router.get("/item/:itemId", async (req, res) => {
  try {
    const comments = await Comment.find({ itemId: req.params.itemId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

// Delete a comment by ID
router.delete("/:commentId", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete comment" });
  }
});

export default router;
*/

import express from "express";
import Comment from "../models/Comment.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { io } from "../index.js"; // import your io instance

const router = express.Router();

// Add a comment to an item
router.post("/item/:itemId", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text.trim()) return res.status(400).json({ message: "Comment cannot be empty" });

    const newComment = new Comment({
      itemId: req.params.itemId,
      userId: req.user.id,
      text
    });

    await newComment.save();

    // Emit event to all connected clients
    io.emit("newComment", {
      itemId: req.params.itemId,
      text,
      userId: req.user.id
    });

    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to post comment" });
  }
});

// Get all comments for an item
router.get("/item/:itemId", async (req, res) => {
  try {
    const comments = await Comment.find({ itemId: req.params.itemId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

// Delete a comment by ID
router.delete("/:commentId", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete comment" });
  }
});

export default router;
