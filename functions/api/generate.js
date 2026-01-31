
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function onRequestPost({ request, env }) {
  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const reqBody = await request.json();
    const prompt = reqBody.prompt;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    return new Response(JSON.stringify({ generatedText: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    // Return the actual error message for debugging
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
