import { conversationStore } from '../thread-context/index.js';
import { recommendComponent, generateComponentResponse } from './componentService.js';

function isOnlyGreeting(userText) {
    const cleanedText = userText
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .trim();

    // Simple regex patterns to match common greetings
    const greetings = [
        /^hi+$/,
        /^hey+$/,
        /^hello+$/,
        /^yo+$/,
        /^hiya+$/
    ];

    // Return boolean indicating if the cleaned text matches any of the greeting patterns
    return greetings.some((greeting) => greeting.test(cleanedText));
}

// Sends a component recommendation response to the user based on their input text, and updates the conversation history in the store
export async function replyWithComponentRecommendation({ say, channelId, threadTs, userText }) {

    let response;

    if (isOnlyGreeting(userText)) {
        response = [
            "Hey! I'm Compy 👋",
            '',
            'Ask me about Zeta components and I can recommend one.',
            '',
            'Try asking:',
            '• "I need users to confirm deleting something"',
            '• "I need a save button"',
            '• "I need users to choose from a list"'
        ].join('\n');
    } else {
        const component = recommendComponent(userText);
        response = generateComponentResponse(component, userText);
    }

    await say({
        text: response,
        thread_ts: threadTs,
    });

    conversationStore.setHistory(channelId, threadTs, [
        { role: 'user', content: userText },
        { role: 'assistant', content: response },
    ]);
}