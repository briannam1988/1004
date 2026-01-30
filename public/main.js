document.addEventListener('DOMContentLoaded', () => {

    // Initialize Firebase
    const functions = firebase.functions();

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

    // --- Helper Function for Firebase Cloud Function Calls ---
    async function callFunction(functionName, prompt, resultBox) {
        if (!prompt) {
            resultBox.innerHTML = '<p class="error">Please enter a prompt first.</p>';
            return;
        }

        resultBox.innerHTML = '<p>Thinking...</p>';
        resultBox.classList.add('loading');
        resultBox.classList.remove('error');

        try {
            const callable = functions.httpsCallable(functionName);
            const response = await callable({ prompt: prompt });
            
            const resultText = response.data || 'No response text received.';
            resultBox.innerHTML = `<p>${resultText}</p>`;

        } catch (error) {
            console.error(`Error calling function ${functionName}:`, error);
            resultBox.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        } finally {
            resultBox.classList.remove('loading');
        }
    }

    // --- Event Listeners ---
    generateBtn.addEventListener('click', () => {
        callFunction('generate', phrasePrompt.value, phraseResult);
    });

    calculateBtn.addEventListener('click', () => {
        callFunction('calculate', calcPrompt.value, calcResult);
    });

    analyzeBtn.addEventListener('click', () => {
        callFunction('analyzeDecision', decisionPrompt.value, decisionResult);
    });

});
