import fs from 'node:fs';
import path from 'node:path';

// Get the path for the components.json file
const componentJsonFilePath = path.join(process.cwd(), 'data', 'components.json');
const stopWordsJsonFilePath = path.join(process.cwd(), 'data', 'stopWords.json');

/** Reads the components.json file and returns the array of components */
export function readComponentJson() {
    const file = fs.readFileSync(componentJsonFilePath, 'utf-8');
    return JSON.parse(file);
}

// Obtain the list of stop words from the JSON file
function readStopWordsJson() {
    const file = fs.readFileSync(stopWordsJsonFilePath, 'utf-8');
    return JSON.parse(file);
}

// Obtain the most relevant words from the user's question by removing stop words and punctuation
function getRelevantWords(userQuestion) {
    const stopWords = readStopWordsJson();
    const userQuestionLower = makeTextLowerCase(userQuestion);

    return userQuestionLower
        .replace(/[^\w\s-]/g, '')
        .split(/\s+/)
        .filter((word) => word.length > 2)
        .filter((word) => !stopWords.includes(word));
}

// Turn user questions and component info into lowercase text
function makeTextLowerCase(text) {
    return text.toLowerCase();
}

// Converts the component object into a string we can search for matches against the user's question
// Only searches id, name, and keywords - not description or useCases to avoid noisy matches
function componentObjectToString(component) {
    const componentDetails = [
    component.id,
    component.name,
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
    const relevantUserQuestionWords = getRelevantWords(userQuestion);

    for (const word of relevantUserQuestionWords) {
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

/** Returns a list of components that match the user's question, sorted by best match first */
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

/** Returns a list of alternative components for the user's question, excluding the selected component */
export function getAlternativeComponents(userQuestion, selectedComponentId) {
    const results = componentsWithScores(userQuestion);

    return results
        .filter((component) => component.id !== selectedComponentId)
        .slice(0, 2);
}

/** Returns the single best matching component for the user's question, or null if no good match is found */
export function recommendComponent(userQuestion) {
    const results = componentsWithScores(userQuestion);

    if (results.length === 0) {
        return null;
    }

    return results[0];
}