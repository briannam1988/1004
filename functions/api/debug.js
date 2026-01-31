export async function onRequestGet({ env }) {
  try {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not set in environment variables." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Directly call the REST API to list models, as suggested by the error message
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(`Failed to list models: ${JSON.stringify(data)}`);
    }

    // Return the list of models
    return new Response(JSON.stringify(data.models || data), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Debug Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
