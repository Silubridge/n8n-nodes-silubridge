import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class SilubridgeApi implements ICredentialType {
	name = 'silubridgeApi';

	displayName = 'Silubridge API';

	documentationUrl = 'https://api.silubridge.com';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.silubridge.com/v1',
			placeholder: 'https://api.silubridge.com/v1',
			required: true,
		},
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Create this token in Silubridge token management. Do not use a Stripe key here.',
		},
	];
}
