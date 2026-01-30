const functions = require("firebase-functions");
const { VertexAI } = require("@google-cloud/vertexai");

// Initialize the Vertex AI client
const vertex_ai = new VertexAI({ project: process.env.GCLOUD_PROJECT, location: 'us-central1' });

// Instantiate the Gemini Pro model
const model = vertex_ai.preview.getGenerativeModel({
    model: 'gemini-pro',
});

exports.generate = functions.https.onCall(async (data, context) => {
    // Extract parameters from the data object
    const { situation, target, length, tone, detail, lang } = data;

    // Construct the dynamic prompt for the AI
    const prompt = `
        You are a professional copywriter. Generate 3 distinct versions of a message based on the following criteria. Each version should be in a separate JSON object with a 'title' and 'content' field. Return a single JSON array containing these three objects.

        **Language:** ${lang}
        **Situation:** ${situation}
        **Target Audience:** ${target}
        **Desired Length:** ${length}
        **Tone of Voice:** ${tone}
        **Additional Details:** ${detail}

        Analyze the user's request and generate three compelling and relevant message options. Ensure the output is a valid JSON array.
    `;

    try {
        // Send the prompt to the model
        const resp = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
        
        // Extract the raw text from the response
        const rawText = resp.response.candidates[0].content.parts[0].text;

        // The model sometimes wraps the JSON in markdown, so we need to clean it.
        const cleanedText = rawText.replace(/\`\`\`json|\`\`\`/g, '').trim();
        
        // Return the cleaned, stringified JSON to the frontend
        return { text: cleanedText };

    } catch (error) {
        // Log the full error for debugging
        console.error("Error generating content:", error);
        // Throw a structured error to the client
        throw new functions.https.HttpsError('internal', 'Failed to generate content.', error);
    }
});
