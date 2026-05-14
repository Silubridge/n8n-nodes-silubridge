import type { ILoadOptionsFunctions, INodePropertyOptions, JsonObject } from 'n8n-workflow';

type HttpMethod = 'GET' | 'POST';

export async function requestJson(
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

export async function loadModelOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const credentials = await this.getCredentials('silubridgeApi');
	const baseUrl = String(credentials.baseUrl || '').replace(/\/$/, '');
	const apiToken = String(credentials.apiToken || '');

	const data = await requestJson(baseUrl, apiToken, 'GET', '/models');
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
}
