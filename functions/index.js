
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// Gemini API endpoint
app.post("/api/gemini", async (req, res) => {
  try {
    // IMPORTANT: The GEMINI_API_KEY must be set in the Firebase environment.
    // Use the command: firebase functions:config:set gemini.key="YOUR_API_KEY"
    const genAI = new GoogleGenerativeAI(functions.config().gemini.key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { type, prompt, pros, cons } = req.body;
    let finalPrompt;

    switch (type) {
      case 'generate':
        if (!prompt) {
          return res.status(400).json({ error: "Prompt is required for generation." });
        }
        finalPrompt = `Generate exactly 3 creative and distinct versions of the following phrase, ensuring they are suitable for a professional website. Do not add any extra formatting, titles, or numbers. Just return the three phrases separated by a newline character (\n). Phrase: "${prompt}"`;
        break;

      case 'analyze':
        if (!Array.isArray(pros) || !Array.isArray(cons)) {
          return res.status(400).json({ error: "Pros and cons are required for analysis." });
        }
        finalPrompt = `Based on the following pros and cons, provide a balanced analysis and a clear recommendation. \n\nPros:\n- ${pros.join('\n- ')}\n\nCons:\n- ${cons.join('\n- ')}\n\nProvide a thoughtful analysis and conclude with a direct recommendation.`;
        break;

      default:
        return res.status(400).json({ error: "Invalid request type specified." });
    }

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = await response.text();

    res.json({ result: text });

  } catch (error) {
    console.error("Error in Gemini API endpoint:", error);
    if (error.message.includes('API key')) {
      return res.status(500).json({ error: "The GEMINI_API_KEY is not configured on the server. Please contact the administrator." });
    }
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});

// Expose Express API as a single Cloud Function.
exports.api = functions.https.onRequest(app);
