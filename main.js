document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const loader = document.getElementById('loader');
    const resultWrapper = document.getElementById('result-wrapper');
    const resultContainer = document.getElementById('result-cards-container');
    const historyList = document.getElementById('history-list');

    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const situation = document.getElementById('situation').value;
            const target = document.getElementById('target').value;
            const length = document.getElementById('length').value;
            const tone = document.getElementById('tone').value;
            const detail = document.getElementById('detail').value;

            const prompt = `Create 3 distinct versions of a text for the following situation, clearly labeled as "Version 1:", "Version 2:", and "Version 3:".\n- Situation: ${situation}\n- Target Audience: ${target}\n- Desired Length: ${length}\n- Tone: ${tone}\n- Additional Details: ${detail}`;

            loader.style.display = 'block';
            resultWrapper.style.display = 'block';
            resultContainer.innerHTML = '';

            try {
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prompt: prompt }),
                });

                const data = await response.json();
                loader.style.display = 'none';

                if (!response.ok) {
                    throw new Error(data.error || `HTTP error! status: ${response.status}`);
                }

                if (data.generatedText && typeof data.generatedText === 'string') {
                    // Split the text by "Version X:" to create cards
                    const versions = data.generatedText.split(/Version [0-9]+:/).map(v => v.trim()).filter(v => v);

                    if (versions.length > 0) {
                        versions.forEach((version, index) => {
                            const card = document.createElement('div');
                            card.className = 'result-card';
                            card.innerHTML = `
                                <h3>Version ${index + 1}</h3>
                                <p>${version.replace(/\n/g, '<br>')}</p>
                            `;
                            resultContainer.appendChild(card);
                        });
                    } else {
                        // If splitting fails, show the whole text in one card
                        const card = document.createElement('div');
                        card.className = 'result-card';
                        card.innerHTML = `<h3>Generated Text</h3><p>${data.generatedText.replace(/\n/g, '<br>')}</p>`;
                        resultContainer.appendChild(card);
                    }

                    const historyItem = document.createElement('li');
                    historyItem.textContent = `"${situation}: ${detail.substring(0, 40)}..."`;
                    historyList.prepend(historyItem);

                } else {
                    throw new Error("Invalid or empty response format from API.");
                }

            } catch (error) {
                loader.style.display = 'none';
                resultContainer.innerHTML = `<p class="error">Something went wrong. Please try again. Details: ${error.message}</p>`;
                console.error('Error:', error);
            }
        });
    } else {
        console.error('Error: Could not find the generate button (generateBtn).');
    }
});
