import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';

type HttpMethod = 'GET' | 'POST';

async function request(
	baseUrl: string,
	apiToken: string,
	method: HttpMethod,
	path: string,
	body?: JsonObject,
): Promise<JsonObject> {
	const headers: Record<string, string> = {
		Authorization: `Bearer ${apiToken}`,
		'Content-Type': 'application/json',
	};

	const init: RequestInit = {
		method,
		headers,
	};

	if (body) {
		init.body = JSON.stringify(body);
	}

	const response = await fetch(`${baseUrl}${path}`, init);
	const text = await response.text();

	let parsed: JsonObject | string = text;
	try {
		parsed = JSON.parse(text) as JsonObject;
	} catch {
		parsed = text;
	}

	if (!response.ok) {
		throw new Error(typeof parsed === 'string' ? parsed : JSON.stringify(parsed));
	}

	if (typeof parsed === 'string') {
		return { raw: parsed };
	}

	return parsed;
}

export class Silubridge implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Silubridge',
		name: 'silubridge',
		icon: 'file:silubridge.svg',
		group: ['transform'],
		version: 1,
		description: 'Use the Silubridge OpenAI-compatible API',
		defaults: {
			name: 'Silubridge',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'silubridgeApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Chat Completion',
						value: 'chatCompletion',
					},
					{
						name: 'List Models',
						value: 'listModels',
					},
				],
				default: '??????????????',
				required: true,
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				displayOptions: {
					show: {
						operation: ['chatCompletion'],
					},
				},
				default: 'Please briefly introduce yourself.',
				required: true,
			},
			{
				displayName: 'Temperature',
				name: 'temperature',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['chatCompletion'],
					},
				},
				typeOptions: {
					minValue: 0,
					maxValue: 2,
					numberPrecision: 1,
				},
				default: 0.7,
			},
		],
	};

	methods = {
		loadOptions: {
			async getModels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('silubridgeApi');
				const baseUrl = String(credentials.baseUrl || '').replace(/\/$/, '');
				const apiToken = String(credentials.apiToken || '');

				const data = await request(baseUrl, apiToken, 'GET', '/models');
				const models = Array.isArray((data.data as unknown[]) || []) ? (data.data as JsonObject[]) : [];

				return models
					.map((item) => {
						const id = String(item.id || '');
						if (!id) return null;
						return {
							name: id,
							value: id,
						};
					})
					.filter(Boolean) as INodePropertyOptions[];
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('silubridgeApi');
		const baseUrl = String(credentials.baseUrl || '').replace(/\/$/, '');
		const apiToken = String(credentials.apiToken || '');

		for (let i = 0; i < items.length; i++) {
			const operation = this.getNodeParameter('operation', i) as string;

			if (operation === 'listModels') {
				const response = await request(baseUrl, apiToken, 'GET', '/models');
				returnData.push({ json: response });
				continue;
			}

			const model = this.getNodeParameter('model', i) as string;
			const prompt = this.getNodeParameter('prompt', i) as string;
			const temperature = this.getNodeParameter('temperature', i) as number;

			const response = await request(baseUrl, apiToken, 'POST', '/chat/completions', {
				model,
				messages: [
					{
						role: 'user',
						content: prompt,
					},
				],
				stream: false,
				temperature,
			});

			returnData.push({ json: response });
		}

		return [returnData];
	}
}
