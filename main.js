document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const loader = document.getElementById('loader');
    const resultWrapper = document.getElementById('result-wrapper');
    const resultContainer = document.getElementById('result-cards-container');
    const historyList = document.getElementById('history-list');

    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            // Get form values
            const situation = document.getElementById('situation').value;
            const target = document.getElementById('target').value;
            const length = document.getElementById('length').value;
            const tone = document.getElementById('tone').value;
            const detail = document.getElementById('detail').value;

            // Construct the prompt
            const prompt = `Create 3 distinct versions of a text for the following situation.
- Situation: ${situation}
- Target Audience: ${target}
- Desired Length: ${length}
- Tone: ${tone}
- Additional Details: ${detail}`;

            // Show loader and hide previous results
            loader.style.display = 'block';
            resultWrapper.style.display = 'block';
            resultContainer.innerHTML = '';

            try {
                // Fetch from the API
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prompt: prompt }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                // Hide loader
                loader.style.display = 'none';

                // Display results
                if (data.text && Array.isArray(data.text)) {
                    data.text.forEach((version, index) => {
                        const card = document.createElement('div');
                        card.className = 'result-card';
                        card.innerHTML = `
                            <h3>Version ${index + 1}</h3>
                            <p>${version.replace(/\n/g, '<br>')}</p>
                        `;
                        resultContainer.appendChild(card);
                    });
                    
                    // Add to history
                    const historyItem = document.createElement('li');
                    historyItem.textContent = `"${prompt.substring(0, 50)}..."`;
                    historyItem.addEventListener('click', () => {
                        // On click, maybe show the full prompt and result again
                        alert(`Prompt: ${prompt}\n\nResult: ${data.text.join('\n\n')}`);
                    });
                    historyList.prepend(historyItem);

                } else {
                     throw new Error("Invalid response format from API.");
                }

            } catch (error) {
                // Hide loader and show error
                loader.style.display = 'none';
                resultContainer.innerHTML = `<p class="error">Something went wrong. Please try again. Details: ${error.message}</p>`;
                console.error('Error:', error);
            }
        });
    } else {
        console.error('Error: Could not find the generate button (generateBtn).');
    }
});
