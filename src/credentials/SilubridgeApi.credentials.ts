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
			description: '在 Silubridge 令牌管理里生成的令牌，不是 Stripe 密钥',
		},
	];
}
