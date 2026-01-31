
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Get your API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateText(situation, target, length, tone, detail) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        Generate 3 distinct versions of a message for the following scenario:

        **Situation:** ${situation}
        **Target Audience:** ${target}
        **Length:** ${length}
        **Tone:** ${tone}
        **Additional Details:** ${detail}

        Present the results as three distinct options, clearly labeled (e.g., "Option 1", "Option 2", "Option 3").
        For each option, provide a title and the generated text.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();

        // Basic parsing to format the output as HTML cards
        return formatAsHtmlCards(text);

    } catch (error) {
        console.error("Error generating text:", error);
        // Consider how to handle this in the response
        return `<p class="error">Error generating text. Please check the console for details.</p>`;
    }
}

function formatAsHtmlCards(text) {
    const options = text.split(/\n\n(?=Option \d+:)/).map(s => s.trim());
    let html = '';

    options.forEach(option => {
        const lines = option.split('\n');
        const title = lines.shift().replace('**', '').replace('**', ''); // Simple bold removal
        const content = lines.join('\n').trim();

        html += `
            <div class="result-card">
                <h3>${title}</h3>
                <p>${content.replace(/\n/g, '<br>')}</p>
                <div class="card-actions">
                    <button class="copy-btn">Copy</button>
                    <button class="share-btn">Share</button>
                </div>
            </div>
        `;
    });

    return html;
}

module.exports = { generateText };
