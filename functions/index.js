
const functions = require("firebase-functions");
const { defineString } = require("firebase-functions/params");
const fetch = require("node-fetch"); 
const cors = require("cors")({ origin: true });

// Define the GEMINI_API_KEY as a parameter. 
// The value will be provided during deployment or via environment variables.
const geminiApiKey = defineString("GEMINI_API_KEY");

exports.geminiProxy = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed. Please use POST." });
    }

    // Access the value of the defined parameter.
    const apiKey = geminiApiKey.value();

    if (!apiKey) {
        console.error("Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.");
        return res.status(500).json({ error: "Server configuration error: API key is missing." });
    }

    try {
      const model = "gemini-1.5-flash";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const requestBody = req.body;

      if (!requestBody || !requestBody.contents) {
        return res.status(400).json({ error: "Invalid request body. 'contents' field is required." });
      }

      const geminiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await geminiResponse.json();
      
      if (!geminiResponse.ok) {
        console.error("Gemini API Error:", responseData);
        return res.status(geminiResponse.status).json({ error: "Gemini API failed.", details: responseData });
      }

      return res.status(200).json(responseData);

    } catch (error) {
      console.error("Internal Server Error:", error);
      return res.status(500).json({ error: "An internal server error occurred." });
    }
  });
});
