import { FeaturebaseApi } from '../credentials/FeaturebaseApi.credentials';

describe('FeaturebaseApi Credentials', () => {
	let credentials: FeaturebaseApi;

	beforeEach(() => {
		credentials = new FeaturebaseApi();
	});

	describe('class metadata', () => {
		it('should have the correct internal name', () => {
			expect(credentials.name).toBe('featurebaseApi');
		});

		it('should have a user-facing display name', () => {
			expect(credentials.displayName).toBe('Featurebase API');
		});

		it('should link to the Featurebase API docs', () => {
			expect(credentials.documentationUrl).toBe(
				'https://docs.featurebase.app/rest-api',
			);
		});
	});

	describe('properties', () => {
		it('should define exactly two properties (API Key + Webhook Secret)', () => {
			expect(credentials.properties).toHaveLength(2);
		});

		it('should require the API key', () => {
			const apiKeyProp = credentials.properties[0];
			expect(apiKeyProp.name).toBe('apiKey');
			expect(apiKeyProp.required).toBe(true);
		});

		it('should mask the API key as a password field', () => {
			const apiKeyProp = credentials.properties[0];
			expect(apiKeyProp.type).toBe('string');
			expect(apiKeyProp.typeOptions).toEqual({ password: true });
		});

		it('should default API key to an empty string', () => {
			const apiKeyProp = credentials.properties[0];
			expect(apiKeyProp.default).toBe('');
		});

		it('should have a webhookSecret property', () => {
			const secretProp = credentials.properties[1];
			expect(secretProp.name).toBe('webhookSecret');
			expect(secretProp.type).toBe('string');
			expect(secretProp.typeOptions).toEqual({ password: true });
			expect(secretProp.default).toBe('');
		});
	});

	describe('authenticate', () => {
		it('should use generic header-based authentication', () => {
			expect(credentials.authenticate.type).toBe('generic');
		});

		it('should inject Bearer token in Authorization header', () => {
			const headers = credentials.authenticate.properties.headers!;
			expect(headers.Authorization).toBe(
				'=Bearer {{$credentials.apiKey}}',
			);
		});

		it('should inject the fixed Featurebase-Version header', () => {
			const headers = credentials.authenticate.properties.headers!;
			expect(headers['Featurebase-Version']).toBe('2026-01-01.nova');
		});

		it('should not set body or query string parameters', () => {
			expect(credentials.authenticate.properties.body).toBeUndefined();
			expect(credentials.authenticate.properties.qs).toBeUndefined();
		});
	});

	describe('test (credential verification)', () => {
		it('should hit the correct base URL', () => {
			expect(credentials.test.request.baseURL).toBe(
				'https://do.featurebase.app',
			);
		});

		it('should GET /v2/boards to verify the key', () => {
			expect(credentials.test.request.method).toBe('GET');
			expect(credentials.test.request.url).toBe('/v2/boards');
		});
	});
});
