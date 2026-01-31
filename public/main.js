const form = document.getElementById('text-generation-form');
const promptInput = document.getElementById('prompt');
const resultDiv = document.getElementById('result');

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const prompt = promptInput.value;
    resultDiv.innerHTML = 'Generating...';

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'HTTP error! status: ' + response.status }));
            throw new Error(errorData.error || 'Something went wrong. Please try again.');
        }

        const data = await response.json();
        resultDiv.innerHTML = `<p>${data.generatedText.replace(/\n/g, '<br>')}</p>`;

    } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        console.error('Fetch error:', error);
    }
});
// Trigger new deployment to apply environment variables