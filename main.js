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
            localStorage.setItem('preferredLanguage', lang);
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

    const langKoBtn = document.getElementById('lang-ko');
    const langEnBtn = document.getElementById('lang-en');
    if (langKoBtn && langEnBtn) {
        langKoBtn.addEventListener('click', () => loadTranslations('ko'));
        langEnBtn.addEventListener('click', () => loadTranslations('en'));
    }

    const savedLang = localStorage.getItem('preferredLanguage');
    const browserLang = navigator.language.startsWith('ko') ? 'ko' : 'en';
    const initialLang = savedLang || browserLang;
    loadTranslations(initialLang);
    // --- 다국어 지원 기능 끝 ---

    // --- AI 문구 생성기 로직 ---
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
                    // 수정된 파싱 로직: "Version X:"를 기준으로 나누고, 첫 번째 빈 요소를 제거
                    const versions = data.generatedText.split(/Version [0-9]+:/).slice(1).map(v => v.trim());

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
    } 

    // --- 비교판단 판독기 로직 ---
    const analyzeBtn = document.getElementById('analyzeBtn');
    const analysisResult = document.getElementById('analysis-result');
    const analysisLoader = document.getElementById('analysis-loader');

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', async () => {
            const pros = Array.from(document.querySelectorAll('#pro-list li')).map(li => li.textContent);
            const cons = Array.from(document.querySelectorAll('#con-list li')).map(li => li.textContent);

            if (pros.length === 0 && cons.length === 0) {
                analysisResult.innerHTML = '<p class="error">Please enter at least one pro or con.</p>';
                return;
            }

            analysisLoader.style.display = 'block';
            analysisResult.innerHTML = '';

            try {
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ pros, cons })
                });

                const data = await response.json();
                 analysisLoader.style.display = 'none';

                if (!response.ok) {
                    throw new Error(data.error || 'Analysis failed');
                }

                analysisResult.innerHTML = `<p>${data.analysis.replace(/\n/g, '<br>')}</p>`;

            } catch (error) {
                analysisLoader.style.display = 'none';
                analysisResult.innerHTML = `<p class="error">Analysis failed: ${error.message}</p>`;
            }
        });

        // 장점/단점 추가 로직
        const proInput = document.getElementById('pro-input');
        const conInput = document.getElementById('con-input');
        const addProBtn = document.getElementById('add-pro-btn');
        const addConBtn = document.getElementById('add-con-btn');
        const proList = document.getElementById('pro-list');
        const conList = document.getElementById('con-list');

        const addItem = (list, input) => {
            const text = input.value.trim();
            if (text) {
                const li = document.createElement('li');
                li.textContent = text;
                list.appendChild(li);
                input.value = '';
            }
        };

        addProBtn.addEventListener('click', () => addItem(proList, proInput));
        addConBtn.addEventListener('click', () => addItem(conList, conInput));
        proInput.addEventListener('keypress', (e) => e.key === 'Enter' && addItem(proList, proInput));
        conInput.addEventListener('keypress', (e) => e.key === 'Enter' && addItem(conList, conInput));
    }
});
