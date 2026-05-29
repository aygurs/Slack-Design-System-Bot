import {
    getComponentById,
    generateComponentExampleResponse,
    generateComponentAttributesResponse
} from '../../services/componentResponseService.js';

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