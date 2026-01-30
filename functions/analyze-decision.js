const functions = require("firebase-functions");
const { VertexAI } = require("@google-cloud/vertexai");

// Initialize the Vertex AI client
const vertex_ai = new VertexAI({ project: process.env.GCLOUD_PROJECT, location: 'us-central1' });

// Instantiate the Gemini Pro model
const model = vertex_ai.preview.getGenerativeModel({
    model: 'gemini-pro',
});

exports.analyzeDecision = functions.https.onCall(async (data, context) => {
    // Extract parameters from the data object
    const { option_a, option_b, decision_context, lang } = data;

    // Construct the dynamic prompt for the AI
    const prompt = `
        You are a rational and insightful decision-making assistant. Your task is to analyze two options and provide a clear, objective recommendation. 
        Return a single JSON object with the following structure: { "option_a_score": number, "option_a_pros": string[], "option_a_cons": string[], "option_b_score": number, "option_b_pros": string[], "option_b_cons": string[], "recommendation_reason": string, "final_recommendation": "A" | "B" }.

        **Analysis Criteria:**
        - **Language:** ${lang}
        - **Option A:** ${option_a}
        - **Option B:** ${option_b}
        - **Additional Context:** ${decision_context}

        Evaluate each option on a scale of 1 to 10. List the key pros and cons for each. Based on your analysis, provide a compelling reason for your final recommendation. Ensure the entire output is a single, valid JSON object.
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
        console.error("Error analyzing decision:", error);
        throw new functions.https.HttpsError('internal', 'Failed to analyze decision.', error);
    }
});
