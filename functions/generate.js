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

  const { situation, tone, detail } = requestBody;
  if (!situation || !tone) {
    return new Response('필수 입력 항목(상황, 톤)이 누락되었습니다.', { status: 400 });
  }

  // 2. AI 모델 호출
  try {
    const ai = new Ai(context.env.AI);
    
    // 2-1. 사용자 입력을 바탕으로 AI에게 전달할 프롬프트(명령어) 생성
    const prompt = `
      **당신은 한국어로 다양한 상황에 맞는 글을 작성해주는 최고의 문구 생성 전문가입니다.**

      **[상황]**
      ${situation}

      **[어조]**
      ${tone}

      **[추가 정보]**
      ${detail || '없음'}

      **[지시]**
      위 정보를 바탕으로, 다음 규칙을 반드시 준수하여 문구를 생성해주세요.
      - 50자 이상 150자 이하의 완벽한 한국어 문장으로 만드세요.
      - 창의적이고, 상황에 가장 적절하며, 자연스러운 표현을 사용하세요.
      - 어조를 정확하게 반영하세요.
      - 추가 정보가 있다면, 그 내용을 자연스럽게 문장에 포함시키세요.
      - 결과물은 오직 생성된 문구만 포함해야 하며, 다른 설명이나 제목은 절대 추가하지 마세요.
    `;

    // 2-2. AI 모델 실행
    const response = await ai.run('@cf/meta/llama-2-7b-chat-int8', { prompt });

    // 3. 결과 반환
    return new Response(JSON.stringify({ generatedText: response.response }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("AI 모델 호출 오류:", error);
    return new Response('AI 모델을 호출하는 중 오류가 발생했습니다.', { status: 500 });
  }
}
