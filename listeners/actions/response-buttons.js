import {
    getComponentById,
    generateComponentExampleResponse,
    generateComponentAttributesResponse,
    generateAlternativeComponentsResponse
} from '../../services/componentResponseService.js';
import { getAlternativeComponents } from '../../services/componentService.js';

/** Handles the "Show example" button action */
export async function handleShowComponentExample({ ack, body, client, logger }) {
    await ack();

    try {
        const componentId = body.actions[0].value;
        const component = getComponentById(componentId);
        const response = generateComponentExampleResponse(component);

        const channelId = body.channel.id;
        const threadTs = body.message.thread_ts || body.message.ts;

        await client.chat.postMessage({
            channel: channelId,
            thread_ts: threadTs,
            text: response
        });
    } catch (error) {
        logger.error(`Failed to show component example: ${error}`);
    }
}

/** Handles the "Show attributes" button action */
export async function handleShowComponentAttributes({ ack, body, client, logger }) {
    await ack();

    try {
        const componentId = body.actions[0].value;
        const component = getComponentById(componentId);
        const response = generateComponentAttributesResponse(component);

        const channelId = body.channel.id;
        const threadTs = body.message.thread_ts || body.message.ts;

        await client.chat.postMessage({
            channel: channelId,
            thread_ts: threadTs,
            text: response
        });
    } catch (error) {
        logger.error(`Failed to show component attributes: ${error}`);
    }
}

/** Handles the "Show alternatives" button action */
export async function handleShowComponentAlternatives({ ack, body, client, logger }) {
    await ack();

    try {
        const buttonValue = JSON.parse(body.actions[0].value);
        const alternatives = getAlternativeComponents(buttonValue.userText, buttonValue.componentId);
        const response = generateAlternativeComponentsResponse(alternatives);

        const channelId = body.channel.id;
        const threadTs = body.message.thread_ts || body.message.ts;

        await client.chat.postMessage({
            channel: channelId,
            thread_ts: threadTs,
            text: response
        });
    } catch (error) {
        logger.error(`Failed to show component alternatives: ${error}`);
    }
}