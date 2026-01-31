
const functions = require("firebase-functions");
const express = require("express");
const { generateText } = require("./generate");

const app = express();
app.use(express.json());

// FIX: The path should match the full path from the rewrite rule.
// The client requests /api/generate, so the server should listen for that full path.
app.post("/api/generate", async (req, res) => {
  try {
    // The prompt is now sent in the body directly
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Missing required field: prompt"
      });
    }

    // Call the actual text generation logic
    const text = await generateText(prompt);
    
    // The client expects an object with a 'text' property which is an array.
    // We'll mock this by splitting the generated text into 3 parts.
    // In a real scenario, you'd modify generateText to return 3 versions.
    const versions = text.split('\n\n').slice(0, 3);
    while (versions.length < 3) {
        versions.push("Could not generate an alternative version.");
    }

    res.json({
      text: versions
    });

  } catch (error) {
    console.error("Error in /api/generate endpoint:", error);
    res.status(500).json({
      error: "An unexpected error occurred while generating text."
    });
  }
});

// Expose Express API as a single Cloud Function.
exports.api = functions.https.onRequest(app);
