# Blueprint: AI Utility Platform

## 1. Project Overview

**Purpose:** A web-based platform providing a suite of AI-powered tools to assist users with various daily and professional tasks. The platform is designed to be intuitive, responsive, and globally accessible through multi-language support.

**Core Features:**
*   **AI Text Generator:** Generates three contextualized text suggestions for various situations (e.g., reports, emails, apologies).
*   **AI Decision Helper:** Analyzes two options provided by the user, offering a detailed comparison, pros and cons, and a final recommendation.
*   **AI Specialty Calculator:** (Under Development) A tool designed to handle complex calculations like taxes and salaries, providing detailed AI-powered explanations.
*   **Multi-Language Support:** The entire platform is available in 10 languages with dynamic language switching.

## 2. Implemented Architecture & Design

### 2.1. Frontend Structure

*   **HTML:** Three main pages (`index.html`, `decision-helper.html`, `calculator.html`), one for each core tool. The structure is clean, semantic, and utilizes `data-translate-key` attributes for internationalization.
*   **CSS (`style.css`):** A single stylesheet defines the visual identity of the platform. It uses a modern, clean aesthetic with a responsive design that adapts to various screen sizes. Key features include a flexible grid layout, custom-styled form elements, and a newly added, user-friendly language switcher.
*   **JavaScript (`i18n.js`):** This file contains the entire logic for the multi-language functionality.
    *   **Language Detection:** Checks `localStorage` for a user's previous preference, then falls back to the browser's `navigator.language`.
    *   **Dynamic Loading:** Asynchronously fetches the appropriate language JSON file from the `/locales/` directory.
    *   **DOM Manipulation:** Traverses the DOM to find all elements with `data-translate-key` and replaces their content with the loaded translations.
    *   **UI Injection:** Dynamically creates and injects a language switcher dropdown into the navigation bar of every page.

### 2.2. Internationalization (i18n)

*   **Translation Files:** All user-facing strings are stored in JSON files within the `locales/` directory (e.g., `en.json`, `ko.json`). This separation of content from code makes it easy to add or edit languages.
*   **Supported Languages (10):** English (en), Korean (ko), Japanese (ja), Chinese (zh), Spanish (es), French (fr), German (de), Russian (ru), Portuguese (pt), Arabic (ar).

### 2.3. Design & UI/UX

*   **Layout:** A container-based, centered layout for a focused user experience.
*   **Navigation:** A clear, consistent top navigation bar allows easy switching between the different AI tools. On mobile devices, the navigation adapts to a vertical layout.
*   **Visual Identity:** The color scheme is based on a professional and trustworthy palette of blues and greens (`#2c3e50`, `#42b983`). Interactive elements have clear hover and disabled states.
*   **Language Switcher:** A dropdown menu is placed on the right side of the navigation bar, displaying the current language and allowing users to easily switch to another.

## 3. Plan & Steps for the Current Request (Multi-Language Support)

**Objective:** Refactor the existing Korean-only web application to support multiple languages, making it accessible to a global audience.

**Execution Steps:**

1.  **[Completed]** **File Structure Setup:** Created a `locales` directory to store all language-specific JSON files.

2.  **[Completed]** **Create Translation Files:**
    *   Created `en.json` as the default/base language file.
    *   Translated the content into 9 additional languages: `ko.json`, `ja.json`, `zh.json`, `es.json`, `fr.json`, `de.json`, `ru.json`, `pt.json`, and `ar.json`.

3.  **[Completed]** **Develop Translation Logic (`i18n.js`):**
    *   Implemented functions to detect the user's preferred language.
    *   Wrote an asynchronous function to fetch and parse the relevant `.json` translation file.
    *   Created the core `applyTranslations()` function to scan the DOM and replace text content based on `data-translate-key` attributes.
    *   Developed the `createLanguageSwitcher()` function to dynamically build and inject the UI component into the navigation bar.

4.  **[Completed]** **Refactor HTML Files:**
    *   Modified `index.html`, `decision-helper.html`, and `calculator.html`.
    *   Changed the primary language attribute to `<html lang="en">`.
    *   Replaced all hardcoded text elements (headings, labels, buttons, placeholders) with `data-translate-key` attributes.
    *   Included the `<script src="i18n.js"></script>` at the end of the `<body>`.
    *   Updated the navigation bar structure to support the injected language switcher.

5.  **[Completed]** **Update Stylesheet (`style.css`):**
    *   Added CSS rules to style the `.language-switcher`, `.selected-lang`, and `.lang-dropdown` classes for a polished and functional dropdown menu.
    *   Modified the `.nav-bar .menu` styles to use Flexbox `space-between`, ensuring the main navigation links and the language switcher are aligned to opposite ends.
    *   Added responsive styles to ensure the language switcher and navigation bar look good on mobile devices.

6.  **[Completed]** **Final Review and Documentation:**
    *   Verified that all pages and languages work as expected.
    *   Created this `blueprint.md` file to document the new architecture and the steps taken.
