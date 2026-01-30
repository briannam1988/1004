require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

const app = express();
const port = 3000;

// --- Middlewares ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// --- Gemini AI Initialization ---
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// --- API Routes ---
app.post('/generate', async (req, res) => {
    try {
        const { situation, tone, detail } = req.body;

        // 1. Validate input
        if (!situation || !tone) {
            return res.status(400).json({ error: 'Situation and tone are required.' });
        }

        // 2. Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-pro"});

        // 3. Create the prompt
        const prompt = `
            당신은 한국어 메시지 작성 전문가입니다.
            다음 정보를 바탕으로, 주어진 상황과 톤에 완벽하게 맞는 자연스러운 문장을 생성해주세요.
            
            **상황:** ${situation}
            **어조:** ${tone}
            **추가 정보:** ${detail || '특이사항 없음'}

            **규칙:**
            - 답은 반드시 최종 문장만 보내주세요. 설명이나 부연 없이, 실제 사용자가 복사해서 바로 쓸 수 있는 텍스트만 생성해야 합니다.
            - 추가 정보가 있으면 그 내용을 반드시 반영하여 개인화된 메시지를 만드세요.
            - 전체 길이는 너무 길지 않게, 모바일 화면에서 보기 좋게 조절해주세요.
        `;

        // 4. Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 5. Send the response
        res.json({ generatedText: text });

    } catch (error) {
        console.error("Error during AI generation:", error);
        res.status(500).json({ error: 'Failed to generate text. Please check the server logs.' });
    }
});

// --- Server Start ---
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
