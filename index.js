/*
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./routes/auth.js";      // user auth
import itemRoutes from "./routes/items.js";     // items CRUD
import adminRoutes from "./routes/admin.js";    // admin auth & management
import commentRoutes from "./routes/commentRoutes.js";
dotenv.config();
const app = express();

// Setup path for static uploads folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());


//app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/comments", commentRoutes);

// Root route
app.get("/", (req, res) => res.send("Lost & Found Backend Running"));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
*/




import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

// Import routes
import authRoutes from "./routes/auth.js";
import itemRoutes from "./routes/items.js";
import adminRoutes from "./routes/admin.js";
import commentRoutes from "./routes/commentRoutes.js";

dotenv.config();
const app = express();

// Setup path for static uploads folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/comments", commentRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Root route
app.get("/", (req, res) => res.send("Lost & Found Backend Running"));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

// Create HTTP server and attach Socket.IO
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // allow all for testing
        methods: ["GET", "POST"]
    }
});

// Store connected clients
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Example: emit notifications from itemRoutes or commentRoutes
// You can export io to use in routes:
export { io };

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
