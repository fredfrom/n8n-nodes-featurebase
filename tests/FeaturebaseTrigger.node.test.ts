import { FeaturebaseTrigger } from '../nodes/Featurebase/FeaturebaseTrigger.node';
import { createHmac } from 'node:crypto';
import type { INodePropertyOptions } from 'n8n-workflow';

// ─── Mock factories ─────────────────────────────────────────────────────

function createMockHookFunctions(overrides: Record<string, any> = {}) {
	const staticData: Record<string, any> = {};
	return {
		getWorkflowStaticData: jest.fn().mockReturnValue(staticData),
		getNodeWebhookUrl: jest.fn().mockReturnValue('https://n8n.example.com/webhook/abc'),
		getNodeParameter: jest.fn().mockReturnValue('post.created'),
		getCredentials: jest.fn().mockResolvedValue({ apiKey: 'test-key-placeholder' }),
		getNode: jest.fn().mockReturnValue({ name: 'Featurebase Trigger' }),
		helpers: {
			httpRequest: jest.fn().mockResolvedValue([]),
			httpRequestWithAuthentication: jest.fn().mockResolvedValue([]),
		},
		...overrides,
	};
}

function createMockWebhookFunctions(
	body: Record<string, any>,
	headers: Record<string, string> = {},
	rawBody?: Buffer,
	webhookSecret = '',
) {
	return {
		getRequestObject: jest.fn().mockReturnValue({
			headers,
			...(rawBody !== undefined ? { rawBody } : {}),
		}),
		getCredentials: jest.fn().mockResolvedValue({ apiKey: 'test-key', webhookSecret }),
		getBodyData: jest.fn().mockReturnValue(body),
		helpers: {
			returnJsonArray: jest.fn().mockImplementation((data: any) => [data]),
		},
	};
}

// ─── Tests ──────────────────────────────────────────────────────────────

describe('FeaturebaseTrigger Node', () => {
	let trigger: FeaturebaseTrigger;

	beforeAll(() => {
		trigger = new FeaturebaseTrigger();
	});

	// ─── Node metadata ──────────────────────────────────────────────

	describe('node metadata', () => {
		it('should have the correct internal name', () => {
			expect(trigger.description.name).toBe('featurebaseTrigger');
		});

		it('should have display name "Featurebase Trigger"', () => {
			expect(trigger.description.displayName).toBe('Featurebase Trigger');
		});

		it('should be in the trigger group', () => {
			expect(trigger.description.group).toContain('trigger');
		});

		it('should have no inputs and one main output', () => {
			expect(trigger.description.inputs).toEqual([]);
			expect(trigger.description.outputs).toEqual(['main']);
		});

		it('should require featurebaseApi credentials', () => {
			expect(trigger.description.credentials).toEqual([
				{ name: 'featurebaseApi', required: true },
			]);
		});

		it('should reference the SVG icon', () => {
			expect(trigger.description.icon).toBe('file:featurebase.svg');
		});
	});

	// ─── Webhook configuration ──────────────────────────────────────

	describe('webhook configuration', () => {
		it('should define a default webhook', () => {
			const webhooks = trigger.description.webhooks!;
			expect(webhooks).toHaveLength(1);
			expect(webhooks[0].name).toBe('default');
		});

		it('should listen on POST', () => {
			expect(trigger.description.webhooks![0].httpMethod).toBe('POST');
		});

		it('should respond immediately (onReceived)', () => {
			expect(trigger.description.webhooks![0].responseMode).toBe('onReceived');
		});

		it('should use "webhook" as the path', () => {
			expect(trigger.description.webhooks![0].path).toBe('webhook');
		});
	});

	// ─── Event selection ────────────────────────────────────────────

	describe('event property', () => {
		const eventProp = new FeaturebaseTrigger().description.properties.find(
			(p) => p.name === 'event',
		)!;

		it('should be required', () => {
			expect(eventProp.required).toBe(true);
		});

		it('should default to post.created', () => {
			expect(eventProp.default).toBe('post.created');
		});

		it('should offer all five event types', () => {
			const values = (eventProp.options as INodePropertyOptions[]).map(
				(o) => o.value,
			);
			expect(values).toEqual(
				expect.arrayContaining([
					'post.created',
					'post.updated',
					'post.status_changed',
					'comment.created',
					'changelog.published',
				]),
			);
			expect(values).toHaveLength(5);
		});
	});

	// ─── webhookSecret is now in credentials, not node properties ───

	describe('webhookSecret', () => {
		it('should not exist as a node property (moved to credentials)', () => {
			const secretProp = new FeaturebaseTrigger().description.properties.find(
				(p) => p.name === 'webhookSecret',
			);
			expect(secretProp).toBeUndefined();
		});
	});

	// ─── webhookMethods.default.checkExists ─────────────────────────

	describe('checkExists', () => {
		it('should return true and store webhookId when matching webhook found', async () => {
			const staticData: Record<string, any> = {};
			const mock = createMockHookFunctions({
				getWorkflowStaticData: jest.fn().mockReturnValue(staticData),
				helpers: {
					httpRequestWithAuthentication: jest.fn().mockResolvedValue([
						{
							id: 'wh_existing',
							url: 'https://n8n.example.com/webhook/abc',
							topics: ['post.created'],
						},
					]),
				},
			});

			const fn = trigger.webhookMethods.default.checkExists;
			const result = await fn.call(mock as any);

			expect(result).toBe(true);
			expect(staticData.webhookId).toBe('wh_existing');
		});

		it('should return false when no matching webhook exists', async () => {
			const mock = createMockHookFunctions({
				helpers: {
					httpRequestWithAuthentication: jest.fn().mockResolvedValue([
						{ id: 'wh_other', url: 'https://other.com/hook', topics: ['post.created'] },
					]),
				},
			});

			const fn = trigger.webhookMethods.default.checkExists;
			const result = await fn.call(mock as any);

			expect(result).toBe(false);
		});

		it('should return false when event does not match', async () => {
			const mock = createMockHookFunctions({
				helpers: {
					httpRequestWithAuthentication: jest.fn().mockResolvedValue([
						{
							id: 'wh_wrong_event',
							url: 'https://n8n.example.com/webhook/abc',
							topics: ['comment.created'],
						},
					]),
				},
			});

			const fn = trigger.webhookMethods.default.checkExists;
			const result = await fn.call(mock as any);

			expect(result).toBe(false);
		});

		it('should return false when the API call fails', async () => {
			const mock = createMockHookFunctions({
				helpers: {
					httpRequestWithAuthentication: jest.fn().mockRejectedValue(new Error('Network error')),
				},
			});

			const fn = trigger.webhookMethods.default.checkExists;
			const result = await fn.call(mock as any);

			expect(result).toBe(false);
		});

		it('should call GET /v2/webhooks using httpRequestWithAuthentication', async () => {
			const httpRequestWithAuth = jest.fn().mockResolvedValue([]);
			const mock = createMockHookFunctions({
				helpers: { httpRequestWithAuthentication: httpRequestWithAuth },
			});

			const fn = trigger.webhookMethods.default.checkExists;
			await fn.call(mock as any);

			expect(httpRequestWithAuth).toHaveBeenCalledWith(
				'featurebaseApi',
				expect.objectContaining({
					method: 'GET',
					url: 'https://do.featurebase.app/v2/webhooks',
				}),
			);
		});

		it('should return false for non-HTTPS URLs without calling API', async () => {
			const httpRequestWithAuth = jest.fn().mockResolvedValue([]);
			const mock = createMockHookFunctions({
				getNodeWebhookUrl: jest.fn().mockReturnValue('http://localhost:5678/webhook/abc'),
				helpers: { httpRequestWithAuthentication: httpRequestWithAuth },
			});

			const fn = trigger.webhookMethods.default.checkExists;
			const result = await fn.call(mock as any);

			expect(result).toBe(false);
			expect(httpRequestWithAuth).not.toHaveBeenCalled();
		});
	});

	// ─── webhookMethods.default.create ──────────────────────────────

	describe('create webhook', () => {
		it('should POST to /v2/webhooks with url and topics', async () => {
			const httpRequestWithAuth = jest.fn().mockResolvedValue({ id: 'wh_new123' });
			const staticData: Record<string, any> = {};
			const mock = createMockHookFunctions({
				getWorkflowStaticData: jest.fn().mockReturnValue(staticData),
				helpers: { httpRequestWithAuthentication: httpRequestWithAuth },
			});

			const fn = trigger.webhookMethods.default.create;
			const result = await fn.call(mock as any);

			expect(result).toBe(true);
			expect(staticData.webhookId).toBe('wh_new123');
			expect(httpRequestWithAuth).toHaveBeenCalledWith(
				'featurebaseApi',
				expect.objectContaining({
					method: 'POST',
					url: 'https://do.featurebase.app/v2/webhooks',
					body: {
						name: 'n8n-post.created',
						url: 'https://n8n.example.com/webhook/abc',
						topics: ['post.created'],
					},
				}),
			);
		});

		it('should throw NodeApiError when response has no id', async () => {
			const mock = createMockHookFunctions({
				helpers: {
					httpRequestWithAuthentication: jest.fn().mockResolvedValue({}),
				},
			});

			const fn = trigger.webhookMethods.default.create;
			await expect(fn.call(mock as any)).rejects.toThrow();
		});

		it('should throw NodeApiError when the API call fails', async () => {
			const mock = createMockHookFunctions({
				helpers: {
					httpRequestWithAuthentication: jest.fn().mockRejectedValue(new Error('403 Forbidden')),
				},
			});

			const fn = trigger.webhookMethods.default.create;
			await expect(fn.call(mock as any)).rejects.toThrow();
		});

		it('should return true without calling API for non-HTTPS URLs', async () => {
			const httpRequestWithAuth = jest.fn();
			const mock = createMockHookFunctions({
				getNodeWebhookUrl: jest.fn().mockReturnValue('http://localhost:5678/webhook/abc'),
				helpers: { httpRequestWithAuthentication: httpRequestWithAuth },
			});

			const fn = trigger.webhookMethods.default.create;
			const result = await fn.call(mock as any);

			expect(result).toBe(true);
			expect(httpRequestWithAuth).not.toHaveBeenCalled();
		});
	});

	// ─── webhookMethods.default.delete ──────────────────────────────

	describe('delete webhook', () => {
		it('should DELETE /v2/webhooks/{id} and clean up static data', async () => {
			const httpRequestWithAuth = jest.fn().mockResolvedValue({});
			const staticData: Record<string, any> = { webhookId: 'wh_todelete' };
			const mock = createMockHookFunctions({
				getWorkflowStaticData: jest.fn().mockReturnValue(staticData),
				helpers: { httpRequestWithAuthentication: httpRequestWithAuth },
			});

			const fn = trigger.webhookMethods.default.delete;
			const result = await fn.call(mock as any);

			expect(result).toBe(true);
			expect(staticData.webhookId).toBeUndefined();
			expect(httpRequestWithAuth).toHaveBeenCalledWith(
				'featurebaseApi',
				expect.objectContaining({
					method: 'DELETE',
					url: 'https://do.featurebase.app/v2/webhooks/wh_todelete',
				}),
			);
		});

		it('should return true immediately when no webhookId in static data', async () => {
			const httpRequestWithAuth = jest.fn();
			const mock = createMockHookFunctions({
				getWorkflowStaticData: jest.fn().mockReturnValue({}),
				helpers: { httpRequestWithAuthentication: httpRequestWithAuth },
			});

			const fn = trigger.webhookMethods.default.delete;
			const result = await fn.call(mock as any);

			expect(result).toBe(true);
			expect(httpRequestWithAuth).not.toHaveBeenCalled();
		});

		it('should return false when the API call fails', async () => {
			const staticData: Record<string, any> = { webhookId: 'wh_fail' };
			const mock = createMockHookFunctions({
				getWorkflowStaticData: jest.fn().mockReturnValue(staticData),
				helpers: {
					httpRequestWithAuthentication: jest.fn().mockRejectedValue(new Error('500')),
				},
			});

			const fn = trigger.webhookMethods.default.delete;
			const result = await fn.call(mock as any);

			expect(result).toBe(false);
		});
	});

	// ─── webhook() handler ──────────────────────────────────────────

	describe('webhook handler', () => {
		it('should return the body as workflow data when no secret is set', async () => {
			const body = { event: 'post.created', data: { id: 'p1', title: 'Test' } };
			const mock = createMockWebhookFunctions(body);

			const result = await trigger.webhook.call(mock as any);

			expect(result.workflowData).toBeDefined();
			expect(result.workflowData).toHaveLength(1);
			expect(mock.helpers.returnJsonArray).toHaveBeenCalledWith(body);
		});

		it('should accept a valid HMAC-SHA256 signature', async () => {
			const secret = 'my-webhook-secret';
			const body = { event: 'post.created', data: { id: 'p1' } };
			const rawBody = Buffer.from(JSON.stringify(body));
			const signature = createHmac('sha256', secret)
				.update(rawBody)
				.digest('hex');

			const mock = createMockWebhookFunctions(
				body,
				{ 'x-featurebase-signature': signature },
				rawBody,
				secret,
			);

			const result = await trigger.webhook.call(mock as any);

			expect(result.workflowData).toHaveLength(1);
			expect(mock.helpers.returnJsonArray).toHaveBeenCalledWith(body);
		});

		it('should reject when signature header is missing but secret is set', async () => {
			const body = { event: 'post.created' };
			const rawBody = Buffer.from(JSON.stringify(body));
			const mock = createMockWebhookFunctions(
				body,
				{},
				rawBody,
				'my-secret',
			);

			const result = await trigger.webhook.call(mock as any);

			expect(result.workflowData).toEqual([]);
		});

		it('should reject when signature does not match', async () => {
			const secret = 'my-secret';
			const body = { event: 'post.created' };
			const rawBody = Buffer.from(JSON.stringify(body));

			const mock = createMockWebhookFunctions(
				body,
				{ 'x-featurebase-signature': 'invalid-signature-value' },
				rawBody,
				secret,
			);

			const result = await trigger.webhook.call(mock as any);

			expect(result.workflowData).toEqual([]);
		});

		it('should reject when rawBody is missing but secret is set', async () => {
			const body = { event: 'post.created' };
			const mock = createMockWebhookFunctions(
				body,
				{ 'x-featurebase-signature': 'some-sig' },
				undefined,
				'my-secret',
			);

			const result = await trigger.webhook.call(mock as any);

			expect(result.workflowData).toEqual([]);
		});

		it('should handle a post.status_changed payload', async () => {
			const body = {
				event: 'post.status_changed',
				data: {
					id: 'p42',
					title: 'Dark mode support',
					status: 'in_progress',
					previousStatus: 'planned',
				},
			};
			const mock = createMockWebhookFunctions(body);

			const result = await trigger.webhook.call(mock as any);

			expect(result.workflowData).toHaveLength(1);
			expect(mock.helpers.returnJsonArray).toHaveBeenCalledWith(body);
		});

		it('should handle a comment.created payload', async () => {
			const body = {
				event: 'comment.created',
				data: {
					id: 'c99',
					postId: 'p42',
					content: 'Great idea!',
				},
			};
			const mock = createMockWebhookFunctions(body);

			const result = await trigger.webhook.call(mock as any);

			expect(result.workflowData).toHaveLength(1);
		});

		it('should handle a changelog.published payload', async () => {
			const body = {
				event: 'changelog.published',
				data: {
					id: 'cl5',
					title: 'March Release',
					content: '<p>New features</p>',
				},
			};
			const mock = createMockWebhookFunctions(body);

			const result = await trigger.webhook.call(mock as any);

			expect(result.workflowData).toHaveLength(1);
		});
	});
});
