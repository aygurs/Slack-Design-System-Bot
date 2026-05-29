import { handleFeedbackButton } from './feedback-buttons.js';
import {
    handleShowComponentExample,
    handleShowComponentAttributes,
    handleShowComponentAlternatives
} from './response-buttons.js';

/**
 * Register action listeners with the Bolt app.
 * @param {import('@slack/bolt').App} app
 * @returns {void}
 */
export function register(app) {
  app.action('show_component_example', handleShowComponentExample);
  app.action('show_component_attributes', handleShowComponentAttributes);
  app.action('show_component_alternatives', handleShowComponentAlternatives);
}
