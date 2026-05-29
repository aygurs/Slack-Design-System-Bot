import fs from 'node:fs';
import path from 'node:path';

// Get the path for the components.json file
const componentJsonFilePath = path.join(process.cwd(), 'data', 'components.json');

// Turn JSON data into JS objects we can work with
export function readComponentJson() {
    const file = fs.readFileSync(componentJsonFilePath, 'utf-8');
    return JSON.parse(file);
}

// Turn user questions and component info into lowercase text
function makeTextLowerCase(text) {
    return text.toLowerCase();
}

// Converts the component object into a string we can search for matches against the user's question
function componentObjectToString(component) {
    const componentDetails = [
    component.id,
    component.name,
    component.category,
    component.description,
    ...(component.useCases || []),
    ...(component.notRecommendedFor || []),
    ...(component.recommendationNotes || []),
    ...(component.keywords || [])
    ];

    return makeTextLowerCase(componentDetails.join(' '));
}

// Calculates a match score for how well the component matches the user's question
function calculateComponentMatchScore(component, userQuestion) {
    const userQuestionLower = makeTextLowerCase(userQuestion);
    const componentDetailsString = componentObjectToString(component);

    let score = 0;

    // Split the user's question into words
    const userQuestionWords = userQuestionLower.split(/\s+/);

    for (const word of userQuestionWords) {
        if (componentDetailsString.includes(word)) {
            score += 1;
        }
    }

    // Give extra points for direct matches
    if (userQuestionLower.includes(component.id.toLowerCase())) {
        score += 5;
    }

    if (userQuestionLower.includes(component.name.toLowerCase())) {
        score += 5;
    }

    return score;
}

// Returns a list of components that match the user's question, sorted by best match first
export function componentsWithScores(userQuestion) {
    const components = readComponentJson();

    const componentsWithScores = components.map((component) => {
        return {
            ...component,
            score: calculateComponentMatchScore(component, userQuestion)
        };
    });

    const matchingComponents = componentsWithScores
        // Remove components that have a score of 0 (no match at all)
        .filter((component) => component.score > 0)
        // Sort components by score, highest first
        .sort((a, b) => b.score - a.score);

    return matchingComponents;
}

// Returns the single best matching component for the user's question, or null if no good match is found
export function recommendComponent(userQuestion) {
    const results = componentsWithScores(userQuestion);

    if (results.length === 0 || results[0].score < 2) {
        return null;
    }

    return results[0];
}

// Generates a response message based on the recommended component and the user's original question
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
        .slice(0, 3)
        .map((useCase) => `• ${useCase}`)
        .join('\n');

    const topNotRecommendedFor = (component.notRecommendedFor || [])
        .slice(0, 3)
        .map((item) => `• ${item}`)
        .join('\n');

    return [
        `*Recommended component:* ${component.name}`,
        '',
        component.description,
        '',
        '*Good for:*',
        topUseCases || 'No use cases listed.',
        '',
        '*Not recommended for:*',
        topNotRecommendedFor || 'No guidance listed.',
        '',
        '*Example:*',
        '```',
        component.example,
        '```',
        component.docsUrl ? `*Docs:* ${component.docsUrl}` : ''
    ].join('\n');
}