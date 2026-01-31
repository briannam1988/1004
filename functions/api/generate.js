
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function onRequestPost({ request, env }) {
  try {
    // Initialize the Generative AI model with the API key from environment variables
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const reqBody = await request.json();
    const prompt = reqBody.prompt;

    // Check if the prompt is provided
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate content with the model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    // Return the generated text in the expected format
    return new Response(JSON.stringify({ generatedText: text }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    // Log the detailed error on the server
    console.error("Error processing request:", error);

    // Return a structured error message to the client
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
