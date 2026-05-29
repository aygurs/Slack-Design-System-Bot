# Compy — Zeta Design System Slack Bot

Compy is a Slack bot that helps teams choose the right component from the Zeta Design System.

Instead of searching through docs manually, users can ask Compy natural questions like:

```text
I need users to confirm deleting something
I need a component for choosing from a list
What should I use when there are no search results?
```

Compy then recommends a suitable component, explains why it fits, and provides quick actions for examples, attributes, docs, and alternatives.

---

## What Compy Does

Compy helps users:

- Find the best Zeta component for a UI use case
- Understand why that component is suitable
- View example code directly in Slack
- View component attributes directly in Slack
- Open the relevant Zeta docs
- See possible alternative components

The goal is to make design-system usage faster, easier, and more consistent across teams.

---

## Example Interaction

```text
User:
I need users to confirm deleting something

Compy:
Recommended component: Dialog

A dialog is a good fit because the user needs to pause and confirm an important or destructive action before continuing.

Good for:
• confirming a destructive action
• asking the user to make an important decision
• showing a blocking warning

[Show example] [Show attributes] [Open docs] [Show potential alternatives]
```

---

## Current Features

### Component Recommendations

Compy reads structured component data from:

```text
data/components.json
```

Each component can include:

- `id`
- `name`
- `description`
- `useCases`
- `example`
- `attributes`
- `slots`
- `keywords`
- `docsUrl`

This allows the bot to recommend real components from the design system instead of inventing answers.

---

### AI Recommendation Layer

Compy includes an optional AI recommendation layer.

When enabled, the AI receives a simplified version of the component JSON and chooses the most suitable component ID for the user's request.

The AI must return structured JSON:

```json
{
  "componentId": "dialog",
  "reason": "A dialog is suitable because the user needs to confirm a potentially destructive action before continuing."
}
```

The app then validates that the returned `componentId` actually exists in `components.json`.

If the AI is unavailable, disabled, or returns an invalid component ID, Compy falls back to the local matching system.

This keeps the bot reliable while still allowing more natural AI-powered reasoning.

---

### Local Fallback Matching

Compy also has a deterministic fallback matcher.

This matcher scores components based on:

- component ID
- component name
- description
- use cases
- keywords

It also filters out common filler words using:

```text
data/stopWords.json
```

This helps avoid weak matches from phrases like:

```text
I need a component which lets users...
```

---

### Slack Buttons

When Compy recommends a component, it displays interactive buttons:

| Button | Purpose |
|---|---|
| Show example | Posts example component code in the thread |
| Show attributes | Posts the component's available attributes |
| Open docs | Opens the component documentation |
| Show potential alternatives | Posts other possible matching components |

---

## Key Files

### `data/components.json`

Stores the component knowledge base used by both the AI layer and the fallback matcher.

This is the main source of truth for Compy.

---

### `data/stopWords.json`

Stores common words that should be ignored during local matching.

Example words:

```json
[
  "i",
  "need",
  "component",
  "which",
  "user",
  "users"
]
```

---

### `services/componentService.js`

Handles local component matching.

Responsibilities:

- Read `components.json`
- Convert component data into searchable text
- Filter user questions into important words
- Score components
- Return the best matching component
- Return alternative components

---

### `services/aiComponentService.js`

Handles optional AI-based component selection.

Responsibilities:

- Check whether AI recommendations are enabled
- Send component data and the user request to OpenAI
- Ask for a valid JSON response
- Return the selected component ID and reason
- Return `null` if AI is unavailable or fails

---

### `services/componentResponseService.js`

Builds the final Slack response.

Responsibilities:

- Handle greetings and thanks
- Try the AI recommendation layer
- Fall back to local matching
- Generate the recommendation message
- Add Slack buttons
- Store conversation history

---

### `listeners/actions/response-buttons.js`

Handles Slack button clicks.

Responsibilities:

- Show example code
- Show component attributes
- Show alternative components

---

### `listeners/events/app-mentioned.js`

Handles direct `@Compy` mentions in channels.

Example:

```text
@Compy I need a save button
```

---

### `listeners/events/message.js`

Handles:

- Direct messages
- Replies in threads where Compy is already involved

---

## Environment Variables

Create a `.env` file in the project root.

```env
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_APP_TOKEN=xapp-your-token
OPENAI_API_KEY=your-openai-key
USE_AI_RECOMMENDATIONS=false
```

### `USE_AI_RECOMMENDATIONS`

Controls whether Compy should try to use the AI layer.

```env
USE_AI_RECOMMENDATIONS=false
```

Uses the local fallback matcher only.

```env
USE_AI_RECOMMENDATIONS=true
```

Tries the AI layer first, then falls back to local matching if AI fails.

---

## Installation

Install dependencies:

```bash
npm install
```

If using the OpenAI AI layer, make sure the OpenAI package is installed:

```bash
npm install openai
```

---

## Running the Bot

Start the local development server:

```bash
npm start
```

Or use the Slack CLI command provided by your Slack app setup.

---

## Example Demo Questions

Use these to test the bot:

```text
I need a save button
I need users to confirm deleting something
I need users to choose from a list
What should I use for no search results?
I need to show a profile image
I need to show upload progress
I need a top navigation bar
I need users to accept terms and conditions
I need a small clickable chip
I need to show that there is no data yet
I need a component for global search
I need something for choosing multiple options
I need a blocking warning
I need to show user initials
I need something for task completion percentage
```

---

## Reliability Approach

Compy is designed to avoid common AI reliability issues.

The AI layer does not directly control the final response. Instead:

1. The AI chooses a `componentId`
2. The app checks that the ID exists in `components.json`
3. The app uses the real component data to build the Slack response
4. If anything fails, the local matcher is used instead

This prevents hallucinated components and keeps the bot useful even when AI is disabled or unavailable.

---

## Future Improvements

Possible next steps:

- Add more Zeta components to `components.json`
- Add support for MCP so external tools can query the design-system data
- Add feedback buttons to improve recommendations over time
- Add support for other design systems

---

## Built With

- Slack Bolt for JavaScript
- Slack Block Kit
- Node.js
- OpenAI API
- Zeta Design System component data