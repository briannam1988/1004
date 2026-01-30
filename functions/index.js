const functions = require("firebase-functions");
const { VertexAI } = require('@google-cloud/vertexai');
const cors = require('cors');

// Initialize Vertex AI & Model
const vertex_ai = new VertexAI({ project: 'project-1004-34292892-da8ed', location: 'us-central1' });
const model = 'gemini-1.0-pro-001';

const generativeModel = vertex_ai.preview.getGenerativeModel({
    model: model,
    generation_config: {
        "max_output_tokens": 2048,
        "temperature": 0.5,
        "top_p": 1,
    },
});

// --- CORS Configuration for public access ---
const corsHandler = cors({
    origin: "https://2f8d8596.1004-3pn.pages.dev", 
    methods: "POST", 
    allowedHeaders: "Content-Type" 
});

// --- Reusable Function for AI Generation ---
async function performAITask(prompt, systemInstruction) {
    if (!prompt) {
        throw new Error('A prompt is required for this function.');
    }
    try {
        const req = {
            contents: [
                { role: 'user', parts: [{ text: prompt }] },
                { role: 'model', parts: [{ text: systemInstruction }] }
            ]
        };
        const result = await generativeModel.generateContent(req);
        if (!result.response.candidates || result.response.candidates.length === 0) {
            throw new Error('No content candidates returned from AI.');
        }
        const text = result.response.candidates[0].content.parts[0].text;
        return { result: text };
    } catch (error) {
        console.error("Error during AI content generation:", error);
        throw new Error(`Failed to perform AI task. Reason: ${error.message}`);
    }
}

// --- Main AI Generation Logic ---
const generateLogic = async (data) => {
    const { situation, target, length, tone, detail, lang } = data;

    if (!detail) {
        throw new functions.https.HttpsError('invalid-argument', 'The "detail" field is required.');
    }

    const langInstruction = lang === 'ko' ? 'Korean' : 'English';
    const prompt = `
        Please generate 3 distinct marketing phrases based on the following criteria.
        Each phrase must be on a new line.

        - **Situation**: ${situation}
        - **Target Audience**: ${target}
        - **Desired Length**: ${length}
        - **Tone of Voice**: ${tone}
        - **Language**: ${langInstruction}
        - **Additional Details**: ${detail}
    `;

    const systemInstruction = "You are an expert copywriter. Generate 3 distinct and compelling marketing phrases based on the user's detailed request. Each phrase must be on a new line, and only output the phrases.";
    
    return await performAITask(prompt, systemInstruction);
}


// --- Cloud Function Exports ---

// [Kept for Firebase SDK users] Generate Marketing Phrases via onCall
exports.generate = functions.https.onCall(generateLogic);

// [NEW Public Endpoint] Generate Marketing Phrases via onRequest for Cloudflare
exports.generatePublic = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }
        try {
            const result = await generateLogic(req.body);
            res.status(200).json(result);
        } catch (error) {
            console.error("Public generation error:", error);
            if (error instanceof functions.https.HttpsError) {
                res.status(error.httpErrorCode.status).send(error.message);
            } else {
                res.status(500).send('Internal Server Error');
            }
        }
    });
});


// --- Other Functions (Kept as onCall) ---
// Analyze a Decision
exports.analyzeDecision = functions.https.onCall((data, context) => {
    const systemInstruction = "You are a logical analyst. Provide a balanced analysis of the pros and cons.";
    return performAITask(data.prompt, systemInstruction);
});

// Perform a Calculation
exports.calculate = functions.https.onCall((data, context) => {
    const systemInstruction = "You are a powerful calculator. Solve the following problem, showing your steps if necessary.";
    return performAITask(data.prompt, systemInstruction);
});
