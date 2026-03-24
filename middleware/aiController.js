import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const verifyImageAndCaption = async (filePath, mimeType, name, description) => {
  try {
    // 1. Set strict safety thresholds to catch profanity immediately
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
      ]
    });

    const imageData = {
      inlineData: {
        data: fs.readFileSync(filePath).toString("base64"),
        mimeType: mimeType,
      },
    };

    const prompt = `
      You are a STRICT Security Guard for a Lost & Found app. 
      Analyze if this image matches: Name: "${name}", Description: "${description}".

      REJECTION RULES (isVerified = false):
      - PROFANITY: If the text contains slurs or swear words (like "fuck").
      - MISMATCH: If the image is a person/selfie but the name is an object (like "Wallet").
      - FAKE: If the image is a meme, icon, or unrelated to the item name.
      
      Return ONLY JSON: {"isVerified": boolean, "reason": "string"}
    `;

    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const text = response.text();
    
    const cleanedJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedJson);

  } catch (error) {
    console.error("AI Blocked Post or System Error:", error.message);
    // ❌ BLOCK BY DEFAULT: If Gemini refuses to talk (due to "fuck") or crashes, return false.
    return { 
      isVerified: false, 
      reason: "Inappropriate content or verification failure." 
    };
  }
};