/*
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
*/


import express from "express";
import multer from "multer";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import Item from "../models/Item.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Cloudinary config (use env vars for deployment)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dvcl4us6x",
  api_key: process.env.CLOUDINARY_API_KEY || "982818485858234",
  api_secret: process.env.CLOUDINARY_API_SECRET || "UrngGc6173QPRn_NDg4O1elpXpY",
});

// ✅ Setup multer for temporary file upload
const upload = multer({ dest: "uploads/" });

// ✅ Create new item (Lost or Found)
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { name, location, description, type, date, phone } = req.body;

    if (!name || !location || !type) {
      return res.status(400).json({ message: "Name, location, and type are required." });
    }

    let imageUrl = null;

    // ✅ Upload image to Cloudinary if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "lost_found_items",
        resource_type: "auto", // ✅ ensures mobile uploads (jpg, heic, etc.) work fine
      });
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path); // delete temp file
    }

    const newItem = new Item({
      name,
      location,
      description,
      type,
      date: date || new Date().toISOString(),
      user: req.user.id,
      phone: phone || null,
      image: imageUrl,
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

// ✅ Get all items (public)
router.get("/all", async (req, res) => {
  try {
    const items = await Item.find().populate("user", "name");
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get a single item (public)
router.get("/:id", async (req, res) => {
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

// ✅ Contact Owner
router.get("/contact/:id", verifyToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("user", "name email phone");
    if (!item) return res.status(404).json({ message: "Item not found" });

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
