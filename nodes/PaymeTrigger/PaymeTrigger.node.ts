import type {
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { handleRequest } from './merchantApi';

export class PaymeTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Payme Trigger',
		name: 'paymeTrigger',
		icon: { light: 'file:payme.svg', dark: 'file:payme.dark.svg' },
		group: ['trigger'],
		version: [1],
		subtitle: 'Merchant API',
		description: 'Starts the workflow when Payme calls your Merchant API endpoint',
		defaults: {
			name: 'Payme Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'paymeApi', required: true }],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: '={{$parameter["responseMode"]}}',
				responseData: 'firstEntryJson',
				path: 'payme',
			},
		],
		properties: [
			{
				displayName:
					'Set this node\'s Production URL as the "Endpoint URL" in your Payme cashbox settings. The workflow must answer Payme with a JSON-RPC result or error, see the README',
				name: 'notice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Respond',
				name: 'responseMode',
				type: 'options',
				options: [
					{
						name: 'When Last Node Finishes',
						value: 'lastNode',
						description: 'Answer Payme with the first item returned by the last node',
					},
					{
						name: 'Using Respond to Webhook Node',
						value: 'responseNode',
						description: 'Answer Payme from a Respond to Webhook node',
					},
				],
				default: 'lastNode',
			},
		],
	};

	// Payme has no API to register a webhook: you paste the Production URL into the cashbox
	// settings by hand. So there is nothing to create, check or delete on Payme's side.
	webhookMethods = {
		default: {
			async checkExists(): Promise<boolean> {
				return true;
			},
			async create(): Promise<boolean> {
				return true;
			},
			async delete(): Promise<boolean> {
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const credentials = await this.getCredentials('paymeApi');
		const key = (credentials.cashboxPassword as string | undefined) ?? '';
		if (!key) {
			throw new NodeOperationError(
				this.getNode(),
				'Fill in "Cashbox Key" in the Payme API credential: Payme uses it to sign its calls',
			);
		}

		const req = this.getRequestObject();
		const result = handleRequest({
			authorization: req.headers.authorization,
			body: this.getBodyData(),
			rawBody: (req as unknown as { rawBody?: Buffer }).rawBody,
			key,
		});

		// Bad auth or a malformed call: answer Payme here, do not start the workflow.
		// Returning no `workflowData` makes n8n send `webhookResponse` as the HTTP 200 body.
		if ('respond' in result) return { webhookResponse: result.respond };

		return { workflowData: [this.helpers.returnJsonArray({ ...result.rpc })] };
	}
}
