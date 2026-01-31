
document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate-btn');
    const promptInput = document.getElementById('phrase-prompt');
    const resultDiv = document.getElementById('phrase-result');

    // The full, absolute URL of the deployed Cloud Function.
    // This is the proxy that will safely call the Gemini API.
    const CLOUD_FUNCTION_URL = "https://us-central1-project-1004-34292892-da8ed.cloudfunctions.net/geminiProxy";

    generateButton.addEventListener('click', async () => {
        const userPrompt = promptInput.value;
        if (!userPrompt) {
            resultDiv.textContent = "Please enter a prompt.";
            return;
        }

        resultDiv.textContent = "Generating...";
        resultDiv.classList.remove('error');

        try {
            // Construct the request body in the exact format the Gemini API requires.
            const requestBody = {
                contents: [{
                    parts: [{
                        text: userPrompt
                    }]
                }]
            };

            const response = await fetch(CLOUD_FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (!response.ok) {
                // Display error message from the proxy function or Gemini API.
                const errorMsg = data.error || 'An unknown API error occurred.';
                const errorDetails = data.details ? JSON.stringify(data.details, null, 2) : '';
                throw new Error(`${errorMsg}\n${errorDetails}`);
            }
            
            // Extract the generated text from the successful Gemini API response.
            const generatedText = data.candidates[0].content.parts[0].text;
            resultDiv.textContent = generatedText.replace(/\n/g, '<br>');

        } catch (error) {
            console.error("Fetch failed:", error);
            resultDiv.textContent = `Error: ${error.message}`;
            resultDiv.classList.add('error');
        }
    });
});
