
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function onRequestPost({ request, env }) {
  try {
    // Initialize the Generative AI model based on the working generate.js
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Parse request body for pros and cons
    const reqBody = await request.json();
    const { pros, cons } = reqBody;

    // Validate input
    if (!Array.isArray(pros) || !Array.isArray(cons)) {
      return new Response(JSON.stringify({ error: "Pros and cons are required and must be arrays." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Construct the prompt for analysis
    const prompt = `Based on the following pros and cons, provide a balanced analysis and recommendation. 

Pros:
- ${pros.join('\n- ')}

Cons:
- ${cons.join('\n- ')}

Provide a thoughtful analysis considering both sides and conclude with a clear recommendation.`;

    // Generate content from the model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = await response.text();

    // Return the analysis, ensuring the key matches the frontend expectation
    return new Response(JSON.stringify({ analysis: analysisText }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    // Log the detailed error and return a structured JSON error to the client
    console.error("Error in analyze function:", error);
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred during analysis." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
