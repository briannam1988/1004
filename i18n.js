const supportedLangs = ['en', 'ko', 'ja', 'zh', 'es', 'fr', 'de', 'ru', 'pt', 'ar'];
// Mapping from country code to language
const countryToLang = {
    'KR': 'ko',
    'JP': 'ja',
    'CN': 'zh',
    'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'VE': 'es', 'CL': 'es', // Spanish speaking
    'FR': 'fr', // French
    'DE': 'de', 'AT': 'de', 'CH': 'de', // German speaking
    'RU': 'ru', // Russian
    'PT': 'pt', 'BR': 'pt', // Portuguese
    'SA': 'ar', 'AE': 'ar', 'EG': 'ar', // Arabic speaking
};

let translations = {};
window.currentLanguage = 'en'; // Set a global default

/**
 * Fetches the translation file for the given language.
 * Falls back to English if the requested language is not found.
 */
async function fetchTranslations(lang) {
    try {
        const response = await fetch(`/locales/${lang}.json`);
        if (!response.ok) throw new Error(`Could not load ${lang}.json`);
        return await response.json();
    } catch (error) {
        console.error(error);
        if (lang !== 'en') return await fetchTranslations('en');
        return {};
    }
}

/**
 * Dynamically updates the page's meta title and description for SEO.
 */
function updateMetaTags() {
    const path = window.location.pathname;
    let titleKey = 'writer_title'; // Default
    let descriptionKey = 'meta_description_writer';

    if (path.includes('decision-helper.html')) {
        titleKey = 'decision_title';
        descriptionKey = 'meta_description_decision';
    } else if (path.includes('calculator.html')) {
        titleKey = 'calculator_title';
        descriptionKey = 'meta_description_calculator';
    }

    if (translations[titleKey]) {
        document.title = translations[titleKey];
    }
    const descriptionTag = document.getElementById('meta-description');
    if (descriptionTag && translations[descriptionKey]) {
        descriptionTag.setAttribute('content', translations[descriptionKey]);
    }
}

/**
 * Dynamically adds hreflang tags for SEO to tell Google about localized versions.
 */
function updateHreflangTags() {
    // Clear existing hreflang tags
    document.querySelectorAll('link[rel="alternate"]').forEach(el => el.remove());

    const { origin, pathname } = window.location;

    supportedLangs.forEach(lang => {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = lang;
        link.href = `${origin}${pathname}`;
        document.head.appendChild(link);
    });

    // Add a default for non-specified languages
    const defaultLink = document.createElement('link');
    defaultLink.rel = 'alternate';
    defaultLink.hreflang = 'x-default';
    defaultLink.href = `${origin}${pathname}`.replace(`/${window.currentLanguage}/`, '/en/');
    document.head.appendChild(defaultLink);
}

/**
 * Applies translations to all elements with a data-translate-key attribute.
 */
function applyTranslations() {
    document.documentElement.lang = window.currentLanguage;
    document.querySelectorAll('[data-translate-key]').forEach(el => {
        const key = el.getAttribute('data-translate-key');
        if (translations[key]) {
            const translation = translations[key];
            // For INPUT and TEXTAREA, only set the placeholder.
            // This script should not be responsible for setting the actual input value.
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if(el.placeholder !== undefined) {
                    el.placeholder = translation;
                }
            } else {
                el.innerHTML = translation; // Use innerHTML to support simple tags in translations
            }
        }
    });
}

/**
 * Main function to switch the language of the application.
 */
async function switchLanguage(lang) {
    if (!supportedLangs.includes(lang)) {
        console.warn(`Unsupported language: ${lang}. Falling back to English.`);
        lang = 'en';
    }
    
    window.currentLanguage = lang;
    localStorage.setItem('preferredLang', lang);
    translations = await fetchTranslations(lang);
    
    applyTranslations();
    updateMetaTags();
    updateHreflangTags();

    // Update the language switcher UI if it exists
    const selectedLangUI = document.querySelector('.selected-lang');
    if (selectedLangUI) {
        selectedLangUI.textContent = lang.toUpperCase();
    }
}

/**
 * Creates and injects the language switcher UI into the nav bar.
 */
function createLanguageSwitcher() {
    const switcherContainer = document.createElement('div');
    switcherContainer.className = 'language-switcher';

    const selectedLang = document.createElement('div');
    selectedLang.className = 'selected-lang';
    selectedLang.textContent = window.currentLanguage.toUpperCase();

    const langDropdown = document.createElement('ul');
    langDropdown.className = 'lang-dropdown';

    supportedLangs.forEach(lang => {
        const langItem = document.createElement('li');
        const langLink = document.createElement('a');
        langLink.href = '#';
        langLink.textContent = lang.toUpperCase();
        langLink.onclick = (e) => {
            e.preventDefault();
            langDropdown.style.display = 'none';
            switchLanguage(lang);
        };
        langItem.appendChild(langLink);
        langDropdown.appendChild(langItem);
    });

    switcherContainer.appendChild(selectedLang);
    switcherContainer.appendChild(langDropdown);

    selectedLang.onclick = () => {
        langDropdown.style.display = langDropdown.style.display === 'block' ? 'none' : 'block';
    };
    document.querySelector('nav .menu').appendChild(switcherContainer);
}

/**
 * Determines the initial language based on user preference, IP, or browser settings.
 */
async function initializeI18n() {
    const preferredLang = localStorage.getItem('preferredLang');
    if (preferredLang && supportedLangs.includes(preferredLang)) {
        await switchLanguage(preferredLang);
        return;
    }

    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code;
        const langFromIP = countryToLang[countryCode];
        if (langFromIP && supportedLangs.includes(langFromIP)) {
            await switchLanguage(langFromIP);
            return;
        }
    } catch (error) {
        console.log('IP-based language detection failed. Falling back to browser language.');
    }

    const browserLang = navigator.language.split('-')[0];
    if (supportedLangs.includes(browserLang)) {
        await switchLanguage(browserLang);
        return;
    }

    await switchLanguage('en'); // Final fallback to English
}

// --- Main Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    await initializeI18n();
    createLanguageSwitcher();
});
