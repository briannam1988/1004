document.addEventListener('DOMContentLoaded', () => {

    // --- Element References ---
    const generateBtn = document.getElementById('generate-btn');
    const phrasePrompt = document.getElementById('phrase-prompt');
    const phraseResult = document.getElementById('phrase-result');

    const calculateBtn = document.getElementById('calculate-btn');
    const calcPrompt = document.getElementById('calc-prompt');
    const calcResult = document.getElementById('calc-result');

    const analyzeBtn = document.getElementById('analyze-btn');
    const decisionPrompt = document.getElementById('decision-prompt');
    const decisionResult = document.getElementById('decision-result');

    // --- Helper Function for API Calls ---
    async function callApi(endpoint, prompt, resultBox) {
        if (!prompt) {
            resultBox.innerHTML = '<p class="error">Please enter a prompt first.</p>';
            return;
        }

        resultBox.innerHTML = '<p>Thinking...</p>';
        resultBox.classList.add('loading');
        resultBox.classList.remove('error');

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: { prompt: prompt } })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error.message || 'An unknown error occurred.');
            }

            const data = await response.json();
            
            // The actual response from the callable function is nested under 'result'
            const resultText = data.result || 'No response text received.';

            resultBox.innerHTML = `<p>${resultText}</p>`;

        } catch (error) {
            console.error(`Error calling ${endpoint}:`, error);
            resultBox.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        } finally {
            resultBox.classList.remove('loading');
        }
    }

    // --- Event Listeners ---
    generateBtn.addEventListener('click', () => {
        callApi('/generate', phrasePrompt.value, phraseResult);
    });

    calculateBtn.addEventListener('click', () => {
        callApi('/calculate', calcPrompt.value, calcResult);
    });

    analyzeBtn.addEventListener('click', () => {
        callApi('/analyzeDecision', decisionPrompt.value, decisionResult);
    });

});
