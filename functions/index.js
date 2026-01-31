
const functions = require("firebase-functions");
const express = require("express");
const { generateText } = require("./generate"); // Ensure this path is correct

const app = express();
app.use(express.json());

app.post("/generate", async (req, res) => {
  try {
    const {
      situation,
      target,
      length,
      tone,
      detail
    } = req.body;

    // Validate input
    if (!situation || !target || !length || !tone || !detail) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    const html = await generateText(situation, target, length, tone, detail);
    res.json({
      html
    });

  } catch (error) {
    console.error("Error in /generate endpoint:", error);
    res.status(500).json({
      error: "An unexpected error occurred."
    });
  }
});

// Expose Express API as a single Cloud Function.
exports.api = functions.https.onRequest(app);
