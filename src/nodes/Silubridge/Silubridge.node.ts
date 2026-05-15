import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { requestJson, searchModels } from './shared';

export class Silubridge implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Silubridge',
		name: 'silubridge',
		icon: 'file:silubridge.svg',
		group: ['transform'],
		version: 1,
		description: 'Call the Silubridge OpenAI-compatible API',
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
						description: 'Send one chat request and return the raw API response',
					},
					{
						name: 'List Models',
						value: 'listModels',
						description: 'Return the models currently available to this token',
					},
				],
				default: 'chatCompletion',
			},
			{
				displayName: 'Model Source',
				name: 'modelSource',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['chatCompletion'],
					},
				},
				options: [
					{
						name: 'Choose From List',
						value: 'list',
					},
					{
						name: 'Enter Manually',
						value: 'manual',
					},
				],
				default: 'list',
				description: 'Use the live model list when available, or type a model name manually',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'Select a model...',
						typeOptions: {
							searchListMethod: 'searchModels',
							searchable: true,
						},
					},
				],
				displayOptions: {
					show: {
						operation: ['chatCompletion'],
						modelSource: ['list'],
					},
				},
				required: true,
			},
			{
				displayName: 'Model Name',
				name: 'manualModel',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['chatCompletion'],
						modelSource: ['manual'],
					},
				},
				default: '',
				required: true,
				placeholder: 'deepseek-v4-flash',
				description: 'Manually enter a model name if the live dropdown is empty',
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
		listSearch: {
			searchModels,
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
				const response = await requestJson(baseUrl, apiToken, 'GET', '/models');
				returnData.push({ json: response });
				continue;
			}

			const modelSource = this.getNodeParameter('modelSource', i, 'list') as string;
			const model =
				modelSource === 'manual'
					? (this.getNodeParameter('manualModel', i) as string)
					: (this.getNodeParameter('model.value', i) as string);
			const prompt = this.getNodeParameter('prompt', i) as string;
			const temperature = this.getNodeParameter('temperature', i) as number;

			const response = await requestJson(baseUrl, apiToken, 'POST', '/chat/completions', {
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
