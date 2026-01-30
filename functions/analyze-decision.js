import { Ai } from '@cloudflare/ai';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (url.pathname === '/analyze-decision' && request.method === 'POST') {
            return handleAnalyzeDecision(request, env);
        }
        // This worker is for the API endpoint only. Frontend assets are handled by Pages.
        return new Response('Not found', { status: 404 });
    }
};

async function handleAnalyzeDecision(request, env) {
    try {
        const { optionA, optionB, context } = await request.json();

        if (!optionA || !optionB) {
            return new Response(JSON.stringify({ error: '두 가지 선택지를 모두 입력해주세요.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const ai = new Ai(env.AI);

        const prompt = `당신은 사용자의 복잡한 의사결정을 돕는 전문 컨설턴트입니다. 두 가지 선택지(A와 B)와 사용자의 추가 고려사항을 바탕으로, 다음 JSON 형식에 맞춰 객관적이고 논리적인 분석을 제공해주세요.\n\n### 분석 요청\n- **선택 A:** ${optionA}\n- **선택 B:** ${optionB}\n- **추가 고려사항:** ${context || '없음'}\n\n### 출력 형식 (반드시 이 JSON 구조를 따르세요):\n\`\`\`json\n{\n  \"scores\": {\n    \"optionA\": { \"name\": \"${optionA}\", \"score\": <0에서 100 사이의 정수 점수> },\n    \"optionB\": { \"name\": \"${optionB}\", \"score\": <0에서 100 사이의 정수 점수> }\n  },\n  \"recommendation\": \"<AI의 최종 추천 선택지 이름>\",\n  \"summary\": \"<AI가 해당 선택지를 추천하는 핵심 이유를 1~2문장으로 요약>\",\n  \"comparison\": [\n    {\n      \"criteria\": \"<비교 기준 1 (예: 가격)>\",\n      \"optionA\": \"<선택 A에 대한 설명>\",\n      \"optionB\": \"<선택 B에 대한 설명>\"\n    },\n    {\n      \"criteria\": \"<비교 기준 2 (예: 성능)>\",\n      \"optionA\": \"<선택 A에 대한 설명>\",\n      \"optionB\": \"<선택 B에 대한 설명>\"\n    },\n    {\n      \"criteria\": \"<비교 기준 3 (예: 디자인)>\",\n      \"optionA\": \"<선택 A에 대한 설명>\",\n      \"optionB\": \"<선택 B에 대한 설명>\"\n    }\n  ],\n  \"reasoning\": \"<AI의 종합적인 분석 의견 및 최종 결론>\"\n}\n\`\`\`\n`;

        const stream = await ai.run('@cf/meta/llama-3-8b-instruct', {
            prompt,
            stream: true
        });

        let fullResponse = '';
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonStr = line.substring(6);
                    if (jsonStr.trim() === '[DONE]') continue;
                    try {
                        const jsonObj = JSON.parse(jsonStr);
                        fullResponse += jsonObj.response;
                    } catch (e) { /* Incomplete JSON, ignore */ }
                }
            }
        }

        const jsonMatch = fullResponse.match(/```json\n([\s\S]*?)\n```/);
        if (!jsonMatch || !jsonMatch[1]) {
             throw new Error("AI로부터 유효한 JSON 형식의 응답을 추출하지 못했습니다.");
        }

        const analysisResult = JSON.parse(jsonMatch[1]);

        return new Response(JSON.stringify(analysisResult), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error in handleAnalyzeDecision:", error);
        return new Response(JSON.stringify({ error: error.message || 'AI 분석 중 서버에서 오류가 발생했습니다.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
