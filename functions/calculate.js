const functions = require("firebase-functions");
const { VertexAI } = require("@google-cloud/vertexai");

// Initialize the Vertex AI client
const vertex_ai = new VertexAI({ project: process.env.GCLOUD_PROJECT, location: 'us-central1' });

// Instantiate the Gemini Pro model
const model = vertex_ai.preview.getGenerativeModel({
    model: 'gemini-pro',
});

exports.calculate = functions.https.onCall(async (data, context) => {
    // Extract parameters from the data object
    const { inquiry, lang } = data;

    // Construct the dynamic prompt for the AI
    const prompt = `
        You are an advanced calculation and reasoning engine. You can solve mathematical problems, answer complex questions, and provide quantitative analysis. 
        Return a single JSON object with the following structure: { "input_query": string, "result_type": "calculation" | "explanation" | "error", "answer": string | number, "explanation_details": string }.

        **User Inquiry:**
        - **Language:** ${lang}
        - **Question/Calculation:** ${inquiry}

        Analyze the user's inquiry. If it's a direct calculation, provide the answer and a brief explanation. If it's a question requiring a more complex, reasoned answer, provide a detailed explanation. If the request is unclear or cannot be processed, explain the issue. Ensure the output is a single, valid JSON object.
    `;

    try {
        // Send the prompt to the model
        const resp = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
        
        // Extract and clean the response text
        const rawText = resp.response.candidates[0].content.parts[0].text;
        const cleanedText = rawText.replace(/\`\`\`json|\`\`\`/g, '').trim();
        
        // Return the cleaned, stringified JSON to the frontend
        return { text: cleanedText };

    } catch (error) {
        console.error("Error during calculation:", error);
        throw new functions.https.HttpsError('internal', 'Failed during calculation.', error);
    }
});
