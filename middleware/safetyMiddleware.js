import { Filter } from "bad-words"; // Note the curly braces { }
import fs from "fs";

const filter = new Filter();

export const validateContent = (req, res, next) => {
  const { name, location, description } = req.body;
  const fields = [name, location, description];

  // 1. Check for Profanity (e.g., "fuck")
  const hasProfane = fields.some(field => field && filter.isProfane(field));

  // 2. Check for AI Refusal Strings (Llama refusals)
  const isAiRefusal = description && (
    description.includes("I can't write") || 
    description.includes("explicit content") ||
    description.includes("Inappropriate language")
  );

  if (hasProfane || isAiRefusal) {
    console.log("🚫 Security Block Triggered: Filtering offensive content.");
    
    // Clean up the uploaded file from the server immediately
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(400).json({ 
      message: "Security Block", 
      reason: "Inappropriate language or AI refusal detected." 
    });
  }

  next(); // If clean, move to the next logic (Gemini Verification)
};