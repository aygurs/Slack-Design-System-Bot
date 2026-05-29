import { conversationStore } from '../thread-context/index.js';
import { recommendComponent, readComponentJson } from './componentService.js';

// Helper function to determine if the user's input is just a greeting
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

// Helper function to determine if the user's input is just a thanks expression
function isOnlyThanks(userText) {
    const cleanedText = userText
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .trim();

    // Simple regex patterns to match common thanks expressions
    const thanks = [
        /^thanks?$/,
        /^thank you$/,
        /^thx$/,
        /^ty$/
    ];

    // Return boolean indicating if the cleaned text matches any of the thanks patterns
    return thanks.some((thank) => thank.test(cleanedText));
}

/** Reads the components.json file and returns the object for the component with the matching ID, or null if not found */
export function getComponentById(componentId) {
    const components = readComponentJson();

    return components.find((component) => component.id === componentId) || null;
}

/** Generates a response message containing the example code for the specified component */
export function generateComponentExampleResponse(component) {
    if (!component) {
        return "Oh no! I couldn't find a good component match for your request.";
    }

    if (!component.example || component.example.length === 0) {
        return `I don't have an example for ${component.name} yet.`;
    }

    return [
        `*Example for ${component.name}:*`,
        '',
        '```',
        component.example,
        '```'
    ].join('\n');
}

/** Generates a response message containing the attributes for the specified component */
export function generateComponentAttributesResponse(component) {
    if (!component) {
        return "Oh no! I couldn't find a good component match for your request.";
    }

    if (!component.attributes || component.attributes.length === 0) {
        return `I don't have any attributes listed for ${component.name} yet.`;
    }

    const attributesText = component.attributes
        .map((attribute) => {
            return [
                `*${attribute.name}*`,
                `• Type: \`${attribute.type}\``,
                `• Default: \`${attribute.default}\``,
                `• ${attribute.description}`
            ].join('\n');
        })
        .join('\n\n');

    return [
        `*Attributes for ${component.name}:*`,
        '',
        attributesText
    ].join('\n');
}

/** Sends a component recommendation response to the user based on their input text, and updates the conversation history in the store */
export async function replyWithComponentRecommendation({ say, channelId, threadTs, userText }) {

    let response;
    let component = null;

    if (isOnlyGreeting(userText)) {
        response = [
            "Hey! I'm Compy 👋",
            '',
            'Ask me about Zeta components and I can recommend one.',
            '',
            'Try asking:',
            '• "I need to make a list of options for users to choose from"',
            '• "I need a save button"'
        ].join('\n');
    } else if(isOnlyThanks(userText)) {
        response = "You're welcome! I'm here to help whenever you need! 😊";
    } else {
        component = recommendComponent(userText);
        response = generateComponentResponse(component, userText);
    }

    const blocks = [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: response
            }
        }
    ];

    if (component) {
        blocks.push({
            type: 'actions',
            elements: [
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: 'Show example'
                    },
                    action_id: 'show_component_example',
                    value: component.id
                },
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: 'Show attributes'
                    },
                    action_id: 'show_component_attributes',
                    value: component.id
                },
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: 'Open docs'
                    },
                    url: component.docsUrl,
                    action_id: 'open_component_docs'
                }
            ]
        });
    }

    await say({
        text: response,
        blocks,
        thread_ts: threadTs,
    });

    conversationStore.setHistory(channelId, threadTs, [
        { role: 'user', content: userText },
        { role: 'assistant', content: response },
    ]);
}

/** Generates a response message based on the recommended component and the user's original question */
export function generateComponentResponse(component, userQuestion) {

    // If no good match is found, return a message saying so
    if (!component) {
        return [
            `I couldn't find a good component match for: "${userQuestion}"`,
            '',
            'Try asking something like:',
            '• "I need users to confirm deleting something"',
            '• "I need a save button"',
            '• "I need users to choose from a list"'
        ].join('\n');
    }

    const topUseCases = (component.useCases || [])
        .map((useCase) => `• ${useCase}`)
        .join('\n');

    return [
        `*Recommended component:* ${component.name}`,
        '',
        component.description,
        '',
        '*Good for:*',
        topUseCases || 'I don\'t have any use cases listed for this component yet.',
    ].join('\n');
}