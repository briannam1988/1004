const supportedLangs = ['en', 'ko', 'ja', 'zh', 'es', 'fr', 'de', 'ru', 'pt', 'ar'];
let currentLang = 'en';
let translations = {};

// Function to fetch translation files
async function fetchTranslations(lang) {
  try {
    const response = await fetch(`locales/${lang}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${lang}.json`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    // Fallback to English if the selected language fails
    if (lang !== 'en') {
      return await fetchTranslations('en');
    }
  }
}

// Function to apply translations to the page
function applyTranslations(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-translate-key]').forEach(element => {
    const key = element.getAttribute('data-translate-key');
    if (translations[key]) {
      // Use textContent for most elements, but value for input placeholders
      if (element.tagName === 'INPUT' && element.placeholder) {
        element.placeholder = translations[key];
      } else {
        element.textContent = translations[key];
      }
    }
  });
  // Special handling for the main title's emoji
  const mainTitle = document.querySelector('[data-translate-key="writer_title"], [data-translate-key="decision_title"], [data-translate-key="calculator_title"]');
  if (mainTitle) {
      const key = mainTitle.getAttribute('data-translate-key');
      if(translations[key]){
          mainTitle.innerHTML = translations[key];
      }
  }
}

// Function to switch language
async function switchLanguage(lang) {
  if (!supportedLangs.includes(lang)) {
    console.warn(`Language ${lang} is not supported. Falling back to English.`);
    lang = 'en';
  }
  currentLang = lang;
  localStorage.setItem('preferredLang', lang);
  translations = await fetchTranslations(lang);
  applyTranslations(lang);
}

// Function to create language switcher UI
function createLanguageSwitcher() {
  const switcherContainer = document.createElement('div');
  switcherContainer.className = 'language-switcher';

  const selectedLang = document.createElement('div');
  selectedLang.className = 'selected-lang';
  selectedLang.textContent = currentLang.toUpperCase();

  const langDropdown = document.createElement('ul');
  langDropdown.className = 'lang-dropdown';

  supportedLangs.forEach(lang => {
    const langItem = document.createElement('li');
    const langLink = document.createElement('a');
    langLink.href = '#';
    langLink.textContent = lang.toUpperCase();
    langLink.onclick = (e) => {
      e.preventDefault();
      switchLanguage(lang);
      selectedLang.textContent = lang.toUpperCase();
      langDropdown.style.display = 'none';
    };
    langItem.appendChild(langLink);
    langDropdown.appendChild(langItem);
  });

  switcherContainer.appendChild(selectedLang);
  switcherContainer.appendChild(langDropdown);

  selectedLang.onclick = () => {
    langDropdown.style.display = langDropdown.style.display === 'block' ? 'none' : 'block';
  };
  
  // Add to nav
  document.querySelector('nav .menu').appendChild(switcherContainer);
}


// Initialize the internationalization
document.addEventListener('DOMContentLoaded', async () => {
  const preferredLang = localStorage.getItem('preferredLang');
  const browserLang = navigator.language.split('-')[0];
  let initialLang = 'en';

  if (preferredLang && supportedLangs.includes(preferredLang)) {
    initialLang = preferredLang;
  } else if (supportedLangs.includes(browserLang)) {
    initialLang = browserLang;
  }

  await switchLanguage(initialLang);
  createLanguageSwitcher();
});
