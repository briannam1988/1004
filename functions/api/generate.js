
// Test function to check if the Cloudflare environment is working correctly.

export async function onRequestPost({ request, env }) {
  try {
    // We are not using the AI SDK for this test.
    // Just get the prompt to simulate reading the request.
    const reqBody = await request.json();
    const prompt = reqBody.prompt;

    const testResponse = `This is a test response. The function is working. You sent: ${prompt}`;

    // Return a simple success JSON response.
    return new Response(JSON.stringify({ generatedText: testResponse }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    // If even this simple function fails, we return the error.
    console.error("Simple test function failed:", error);
    return new Response(JSON.stringify({ error: error.message || "Simple test function failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
