
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function onRequestPost({ request, env }) {
  try {
    // Initialize the Generative AI model with the API key
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const reqBody = await request.json();
    const { pros, cons } = reqBody;

    // Validate the input
    if (!Array.isArray(pros) || !Array.isArray(cons)) {
      return new Response(JSON.stringify({ error: "Pros and cons are required and must be arrays." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Construct a clear prompt for the AI by correctly joining the arrays
    const prompt = `Based on the following pros and cons, provide a balanced analysis and recommendation. 

Pros:
- ${pros.join('\n- ')}

Cons:
- ${cons.join('\n- ')}

Provide a thoughtful analysis considering both sides and conclude with a clear recommendation.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = await response.text();

    // Return the analysis
    return new Response(JSON.stringify({ analysis: analysisText }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze function:", error);
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred during analysis." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
