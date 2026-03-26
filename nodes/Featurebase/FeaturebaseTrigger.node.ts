import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import { createHmac } from 'node:crypto';

export class FeaturebaseTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Featurebase Trigger',
		name: 'featurebaseTrigger',
		icon: 'file:featurebase.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when Featurebase events occur',
		defaults: {
			name: 'Featurebase Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'featurebaseApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				default: 'post.created',
				options: [
					{
						name: 'Changelog Published',
						value: 'changelog.published',
					},
					{
						name: 'Comment Created',
						value: 'comment.created',
					},
					{
						name: 'Post Created',
						value: 'post.created',
					},
					{
						name: 'Post Status Changed',
						value: 'post.status_changed',
					},
					{
						name: 'Post Updated',
						value: 'post.updated',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const event = this.getNodeParameter('event') as string;

				// Skip check for non-HTTPS URLs (local development)
				if (!webhookUrl.startsWith('https://')) {
					return false;
				}

				const credentials = await this.getCredentials('featurebaseApi');

				try {
					const response = (await this.helpers.httpRequest({
						method: 'GET',
						url: 'https://do.featurebase.app/v2/webhooks',
						headers: {
							Authorization: `Bearer ${credentials.apiKey as string}`,
							'Featurebase-Version': '2026-01-01.nova',
						},
					})) as IDataObject[];

					for (const webhook of response) {
						const topics = webhook.topics as string[] | undefined;
						if (webhook.url === webhookUrl && topics && topics.includes(event)) {
							webhookData.webhookId = webhook.id as string;
							return true;
						}
					}
				} catch (error) {
					return false;
				}
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const event = this.getNodeParameter('event') as string;

				// Skip Featurebase registration for non-HTTPS URLs (local development)
				if (!webhookUrl.startsWith('https://')) {
					return true;
				}

				const credentials = await this.getCredentials('featurebaseApi');

				const body: IDataObject = {
					name: `n8n-${event}`,
					url: webhookUrl,
					topics: [event],
				};

				try {
					const response = (await this.helpers.httpRequest({
						method: 'POST',
						url: 'https://do.featurebase.app/v2/webhooks',
						headers: {
							Authorization: `Bearer ${credentials.apiKey as string}`,
							'Featurebase-Version': '2026-01-01.nova',
							'Content-Type': 'application/json',
						},
						body,
					})) as IDataObject;

					if (!response.id) {
						throw new NodeApiError(this.getNode(), response as unknown as JsonObject, {
							message: 'Featurebase did not return a webhook ID',
						});
					}

					webhookData.webhookId = response.id as string;
					return true;
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as JsonObject, {
						message: 'Failed to create Featurebase webhook',
					});
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookId = webhookData.webhookId as string;

				if (!webhookId) {
					return true;
				}

				const credentials = await this.getCredentials('featurebaseApi');

				try {
					await this.helpers.httpRequest({
						method: 'DELETE',
						url: `https://do.featurebase.app/v2/webhooks/${webhookId}`,
						headers: {
							Authorization: `Bearer ${credentials.apiKey as string}`,
							'Featurebase-Version': '2026-01-01.nova',
						},
					});
				} catch (error) {
					return false;
				}

				delete webhookData.webhookId;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const credentials = await this.getCredentials('featurebaseApi');
		const webhookSecret = credentials.webhookSecret as string | undefined;

		if (webhookSecret) {
			const signature = req.headers['x-featurebase-signature'] as string | undefined;

			if (!signature) {
				return { workflowData: [] };
			}

			const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;

			if (!rawBody) {
				return { workflowData: [] };
			}

			const expectedSignature = createHmac('sha256', webhookSecret)
				.update(rawBody)
				.digest('hex');

			if (signature !== expectedSignature) {
				return { workflowData: [] };
			}
		}

		const body = this.getBodyData();
		return {
			workflowData: [this.helpers.returnJsonArray(body)],
		};
	}
}
