
document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const loader = document.getElementById('loader');
    const resultWrapper = document.getElementById('result-wrapper');
    const resultCardsContainer = document.getElementById('result-cards-container');
    const detailTextarea = document.getElementById('detail');

    const CLOUD_FUNCTION_URL = "https://us-central1-project-1004-34292892-da8ed.cloudfunctions.net/geminiProxy";

    // Load history if the function exists
    if (typeof loadHistory === 'function') {
        loadHistory();
    }

    async function generateText() {
        const situation = document.getElementById('situation').value;
        const target = document.getElementById('target').value;
        const length = document.getElementById('length').value;
        const tone = document.getElementById('tone').value;
        let detail = detailTextarea.value.trim();
        const originalButtonText = generateBtn.textContent;

        if (!detail) {
            detail = detailTextarea.placeholder;
        }

        const userPrompt = `Imagine you are writing for a '${target}' audience. The situation is a '${situation}'. Write a message that is '${length}' in length and has a '${tone}' tone. Here is the core message to include: "${detail}". Based on these requirements, please generate 3 distinct versions of the text, each starting with a number (e.g., 1. , 2. , 3. ).`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: userPrompt
                }]
            }]
        };

        resultWrapper.style.display = 'block';
        loader.style.display = 'block';
        resultCardsContainer.innerHTML = '';
        generateBtn.disabled = true;
        generateBtn.textContent = "AI가 입력 내용을 기반으로 제안을 생성하고 있습니다...";

        try {
            const response = await fetch(CLOUD_FUNCTION_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const responseData = await response.json();

            if (!response.ok) {
                const errorMsg = responseData.error || 'An unknown API error occurred.';
                throw new Error(errorMsg);
            }
            
            const generatedText = responseData.candidates[0].content.parts[0].text;
            const generatedTexts = generatedText.split(/\n?\d\.\s/).filter(v => v.trim() !== '').map(t => t.trim());
            renderResultCards(generatedTexts);

            if (typeof saveToHistory === 'function') {
                saveToHistory({ situation, target, length, tone, detail, result: generatedTexts });
            }

        } catch (error) {
            console.error("API call error:", error);
            const errorElement = document.createElement('p');
            errorElement.className = 'error-message';
            errorElement.textContent = `Failed to generate text: ${error.message}`;
            resultCardsContainer.innerHTML = '';
            resultCardsContainer.appendChild(errorElement);
        } finally {
            loader.style.display = 'none';
            generateBtn.disabled = false;
            generateBtn.textContent = originalButtonText;
        }
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', generateText);
    }
});

function renderResultCards(texts) {
    const resultCardsContainer = document.getElementById('result-cards-container');
    resultCardsContainer.innerHTML = (texts || []).map((text, index) => {
        const encodedText = btoa(encodeURIComponent(text));
        return `
        <div class="result-card">
            <div class="card-header">
                <h3>Suggestion ${index + 1}</h3>
                <button class="copy-btn" onclick="copyToClipboard(this, '${encodedText}')">Copy</button>
            </div>
            <p class="card-text">${text.replace(/\n/g, '<br>')}</p>
        </div>
    `}).join('');
}

function copyToClipboard(button, encodedText) {
    try {
        const textToCopy = decodeURIComponent(atob(encodedText));
        navigator.clipboard.writeText(textToCopy).then(() => {
            button.textContent = 'Copied!';
            setTimeout(() => { button.textContent = 'Copy'; }, 2000);
        }, (err) => {
            console.error('Copy failed', err);
            alert('Failed to copy text.');
        });
    } catch (e) {
        console.error("Decoding error:", e);
        alert("Could not copy text due to a decoding error.");
    }
}

function saveToHistory(entry) {
    try {
        let history = JSON.parse(localStorage.getItem('generationHistory')) || [];
        history.unshift(entry);
        if (history.length > 5) history = history.slice(0, 5);
        localStorage.setItem('generationHistory', JSON.stringify(history));
        loadHistory();
    } catch(e) {
        console.error("Could not save to history:", e);
    }
}

function loadHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    try {
        const history = JSON.parse(localStorage.getItem('generationHistory')) || [];
        historyList.innerHTML = history.map(item => {
            const resultSummary = item && item.result && item.result[0] ? item.result[0].substring(0, 30) : '...';
            const itemString = JSON.stringify(item).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
            return `
                <li class="history-item" onclick="loadFromHistory(${itemString})" tabindex="0">
                    <strong>[${item.situation || 'N/A'}]</strong> to ${item.target || 'N/A'} - \"${resultSummary}...\"
                </li>
            `;
        }).join('');
    } catch (e) {
        console.error("Could not load history:", e);
        historyList.innerHTML = "<li class='error-message'>Could not load history.</li>";
    }
}

function loadFromHistory(item) {
    try {
        document.getElementById('situation').value = item.situation;
        document.getElementById('target').value = item.target;
        document.getElementById('length').value = item.length;
        document.getElementById('tone').value = item.tone;
        document.getElementById('detail').value = item.detail;
        renderResultCards(item.result);
        document.getElementById('result-wrapper').style.display = 'block';
        window.scrollTo(0, 0);
    } catch (e) {
        console.error("Could not load from history item:", e);
        alert("Error loading this history item.");
    }
}
