
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function onRequest(context) {
  // context contains request, env, etc.
  const { request, env } = context;

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response('Invalid request method. Please use POST.', { status: 405 });
  }

  try {
    const { situation, tone, detail } = await request.json();

    // Access the API Key from Cloudflare's environment variables
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Return the generated text as a JSON response
    const jsonResponse = JSON.stringify({ generatedText: text });
    return new Response(jsonResponse, {
        headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error during AI generation:", error);
    const errorResponse = JSON.stringify({ error: 'Failed to generate text.' });
    return new Response(errorResponse, { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
