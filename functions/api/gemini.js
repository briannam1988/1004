
import { GoogleGenerativeAI } from "@google/generative-ai";

// This single endpoint will handle all AI-powered features.
export async function onRequestPost({ request, env }) {
  try {
    // IMPORTANT: The GEMINI_API_KEY must be set in the Cloudflare environment secrets.
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const reqBody = await request.json();
    const { type, prompt, pros, cons } = reqBody;

    let finalPrompt;

    // Determine the final prompt based on the request type
    switch (type) {
      case 'generate':
        if (!prompt) {
          return new Response(JSON.stringify({ error: "Prompt is required for generation." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        finalPrompt = `Generate exactly 3 creative and distinct versions of the following phrase, ensuring they are suitable for a professional website. Do not add any extra formatting, titles, or numbers. Just return the three phrases separated by a newline character (\n). Phrase: "${prompt}"`;
        break;

      case 'analyze':
        if (!Array.isArray(pros) || !Array.isArray(cons)) {
          return new Response(JSON.stringify({ error: "Pros and cons are required for analysis." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        finalPrompt = `Based on the following pros and cons, provide a balanced analysis and a clear recommendation. 

Pros:
- ${pros.join('\n- ')}

Cons:
- ${cons.join('\n- ')}

Provide a thoughtful analysis and conclude with a direct recommendation.`;
        break;

      default:
        return new Response(JSON.stringify({ error: "Invalid request type specified." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Generate content from the model
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = await response.text();

    // Return the response, using a generic key
    return new Response(JSON.stringify({ result: text }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in Gemini API endpoint:", error);
    // Provide a more specific error message if the API key is missing.
    if (error.message.includes('API key')) {
         return new Response(JSON.stringify({ error: "The GEMINI_API_KEY is not configured on the server. Please contact the administrator." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
