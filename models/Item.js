/*
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    type: { type: String, required: true }, 
    name: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String },
    phone: { type: String }, 
    image: { type: String }, 
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Item", itemSchema);
*/


import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    type: { type: String, required: true }, // 'lost' or 'found'
    name: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String },
    phone: { type: String }, 
    image: { type: String }, 
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    // --- NEW AI FIELDS ---
    isAiVerified: { 
        type: Boolean, 
        default: false 
    },
    aiReason: { 
        type: String, 
        default: "" 
    }
}, { timestamps: true });

export default mongoose.model("Item", itemSchema);