import { Ai } from '@cloudflare/ai';

export async function onRequest(context) {
    // 1. 요청 유효성 검사
    if (context.request.method !== 'POST') {
        return new Response('잘못된 요청입니다. POST 메서드를 사용해주세요.', { status: 405 });
    }

    let requestBody;
    try {
        requestBody = await context.request.json();
    } catch (e) {
        return new Response('잘못된 JSON 형식입니다.', { status: 400 });
    }

    const { situation, target, length, tone, detail } = requestBody;

    if (!situation || !target || !length || !tone) {
        return new Response('필수 입력 항목이 누락되었습니다.', { status: 400 });
    }

    // 2. AI 모델 호출
    try {
        const ai = new Ai(context.env.AI);
        
        // 2-1. 사용자 입력을 바탕으로 AI에게 전달할 프롬프트(명령어) 고도화
        const prompt = `
            **역할:** 당신은 세계 최고의 카피라이터이자, 한국어 커뮤니케이션 전문가입니다.
            
            **[목표]**
            아래에 주어진 [상황], [대상], [글의 길이], [어조], [추가 정보]를 모두 종합적으로 고려하여,
            사용자가 즉시 사용할 수 있는 완벽한 한국어 문구 **3가지**를 생성해야 합니다.

            **[입력 정보]**
            - **상황:** ${situation}
            - **대상:** ${target}
            - **글의 길이:** ${length}
            - **어조:** ${tone}
            - **추가 정보:** ${detail || '없음'}

            **[결과물 생성 규칙] - 이 규칙을 반드시, 무조건, 예외 없이 준수해야 합니다.**
            1.  **3가지 버전 생성:** 위 입력 정보를 바탕으로, 서로 다른 뉘앙스나 표현을 가진 3가지 버전의 문구를 생성하세요.
            2.  **JSON 형식 출력:** 결과물은 반드시 아래와 같은 JSON 형식이어야 합니다. 다른 어떤 텍스트나 설명도 추가해서는 안 됩니다.
                \`\`\`json
                {
                  "generatedTexts": [
                    "첫 번째 제안 문구입니다.",
                    "두 번째 제안 문구입니다.",
                    "세 번째 제안 문구입니다."
                  ]
                }
                \`\`\`
            3.  **글의 길이 준수:**
                - '짧게': 1-2개의 문장 (총 100자 내외)
                - '중간': 3-5개의 문장 (총 300자 내외)
                - '길게': 여러 문단으로 구성된 완전한 글 (이메일 형식 등)
            4.  **한국어:** 모든 결과물은 완벽하고 자연스러운 한국어여야 합니다.
            5.  **내용 반영:** [상황], [대상], [어조], [추가 정보]를 모두 충실하게 반영하세요.

            **[실행]**
            지금 바로 위의 규칙에 따라 결과물을 생성하세요.
        `;

        // 2-2. AI 모델 실행
        const aiResponse = await ai.run('@cf/meta/llama-2-7b-chat-int8', { prompt });

        // 3. AI 응답 파싱 및 반환
        // AI가 반환한 텍스트에서 JSON 부분만 정확히 추출
        const responseText = aiResponse.response;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("AI가 유효한 JSON 형식의 응답을 생성하지 못했습니다.");
        }
        
        const parsedJson = JSON.parse(jsonMatch[0]);

        return new Response(JSON.stringify(parsedJson), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("AI 모델 호출 또는 파싱 오류:", error);
        return new Response(JSON.stringify({ error: `AI 모델 처리 중 오류가 발생했습니다: ${error.message}` }), { status: 500 });
    }
}
