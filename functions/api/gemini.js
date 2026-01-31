
import { GoogleGenerativeAI } from "@google/generative-ai";

// [DIAGNOSTIC MODE]
// This function is temporarily modified to bypass all AI logic and return a simple, fixed JSON response.
// This is to test if the serverless function is deploying and responding to requests at all.
export async function onRequestPost({ request, env }) {
  try {
    // Bypassing all logic to send a test response.
    const testResponse = {
      result: "This is a diagnostic test response. If you see this, the server connection is working."
    };

    return new Response(JSON.stringify(testResponse), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    // Even in diagnostic mode, we'll log potential errors.
    console.error("Error in diagnostic mode:", error);
    return new Response(JSON.stringify({ error: "An error occurred even in diagnostic mode: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
