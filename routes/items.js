

import express from "express";
import multer from "multer";
import Item from "../models/Item.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ Create new item (Lost or Found)
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { name, location, description, type, date, phone } = req.body;

    // Validate required fields
    if (!name || !location || !type) {
      return res.status(400).json({ message: "Name, location, and type are required." });
    }

    const newItem = new Item({
      name,
      location,
      description,
      type,
      date: date || new Date().toISOString(),
      user: req.user.id,
      phone: phone || null, // <-- added phone number
      image: req.file ? req.file.filename : null,
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get logged-in user's items
router.get("/", verifyToken, async (req, res) => {
  try {
    const items = await Item.find({ user: req.user.id });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//open to all

router.get("/all", async (req, res) => {
  try {
    const items = await Item.find().populate("user", "name"); // include user name
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get a single item by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Delete an item
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await item.deleteOne();
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Contact Owner route
router.get("/contact/:id", verifyToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("user", "name email phone");
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Use phone from post first, fallback to user profile
    const phone = item.phone || item.user.phone;

    res.json({
      ownerName: item.user.name,
      phone,
      email: item.user.email,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch contact info" });
  }
});

export default router;
