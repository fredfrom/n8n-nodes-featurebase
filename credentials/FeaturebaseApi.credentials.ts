import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FeaturebaseApi implements ICredentialType {
	name = 'featurebaseApi';
	displayName = 'Featurebase API';
	// eslint-disable-next-line n8n-nodes-base/cred-class-field-documentation-url-miscased
	documentationUrl = 'https://docs.featurebase.app/rest-api';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
		{
			displayName: 'Webhook Signing Secret',
			name: 'webhookSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'The signing secret for verifying incoming webhooks (found in Featurebase webhook settings). Leave empty to skip signature verification.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				'Featurebase-Version': '2026-01-01.nova',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://do.featurebase.app',
			url: '/v2/boards',
			method: 'GET',
		},
	};
}
