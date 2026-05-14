import { ChatOpenAI } from '@langchain/openai';
import type {
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	ISupplyDataFunctions,
	NodeConnectionType,
	SupplyData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { loadModelOptions } from './shared';

export class SilubridgeChatModel implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Silubridge Chat Model',
		name: 'silubridgeChatModel',
		icon: 'file:silubridge.svg',
		group: ['transform'],
		version: 1,
		description: 'Provide a Silubridge chat model for AI Agent nodes',
		defaults: {
			name: 'Silubridge Chat Model',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.AiLanguageModel as NodeConnectionType],
		outputNames: ['Model'],
		credentials: [
			{
				name: 'silubridgeApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getModels',
				},
				default: '',
				required: true,
				description: 'Choose one of the models currently available to this token',
			},
			{
				displayName: 'Temperature',
				name: 'temperature',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 2,
					numberPrecision: 1,
				},
				default: 0.7,
			},
			{
				displayName: 'Maximum Tokens',
				name: 'maxTokens',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 2048,
				description: 'Maximum number of output tokens to request',
			},
		],
	};

	methods = {
		loadOptions: {
			getModels: loadModelOptions,
		},
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const credentials = await this.getCredentials('silubridgeApi');
		const baseUrl = String(credentials.baseUrl || '').replace(/\/$/, '');
		const apiToken = String(credentials.apiToken || '');
		const model = this.getNodeParameter('model', itemIndex) as string;
		const temperature = this.getNodeParameter('temperature', itemIndex) as number;
		const maxTokens = this.getNodeParameter('maxTokens', itemIndex) as number;

		const response = new ChatOpenAI({
			model,
			apiKey: apiToken,
			temperature,
			maxTokens,
			configuration: {
				baseURL: baseUrl,
			},
		});

		return {
			response,
		};
	}
}
