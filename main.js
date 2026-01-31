document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const loader = document.getElementById('loader');
    const resultWrapper = document.getElementById('result-wrapper');
    const resultContainer = document.getElementById('result-cards-container');
    const historyList = document.getElementById('history-list');

    // --- 다국어 지원 기능 시작 ---
    const translations = {};

    async function loadTranslations(lang) {
        try {
            const response = await fetch(`${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${lang}.json`);
            }
            translations[lang] = await response.json();
            updateUI(lang);
            localStorage.setItem('preferredLanguage', lang); // 사용자가 선택한 언어 저장
        } catch (error) {
            console.error(error);
        }
    }

    function updateUI(lang) {
        const langData = translations[lang];
        if (!langData) return;

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (langData[key]) {
                element.textContent = langData[key];
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (langData[key]) {
                element.placeholder = langData[key];
            }
        });
    }

    document.getElementById('lang-ko').addEventListener('click', () => loadTranslations('ko'));
    document.getElementById('lang-en').addEventListener('click', () => loadTranslations('en'));

    // 페이지 로드 시 기본 언어 설정
    const savedLang = localStorage.getItem('preferredLanguage');
    const browserLang = navigator.language.startsWith('ko') ? 'ko' : 'en';
    const initialLang = savedLang || browserLang;
    loadTranslations(initialLang);
    // --- 다국어 지원 기능 끝 ---


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
