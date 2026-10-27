import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { buildCheckoutLink, type PaymeEnvironment } from './checkoutLink';

export class Payme implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Payme',
		name: 'payme',
		icon: { light: 'file:payme.svg', dark: 'file:payme.dark.svg' },
		group: ['input'],
		version: [1],
		subtitle: '={{$parameter["operation"]}}',
		description: 'Accept payments with Payme Business (Uzbekistan)',
		defaults: {
			name: 'Payme',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'paymeApi', required: true }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [{ name: 'Checkout', value: 'checkout' }],
				default: 'checkout',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['checkout'] } },
				options: [
					{
						name: 'Create Payment Link',
						value: 'createLink',
						description: 'Build a Payme checkout URL to send to the customer',
						action: 'Create a payment link',
					},
				],
				default: 'createLink',
			},
			{
				displayName: 'Amount (UZS)',
				name: 'amount',
				type: 'number',
				typeOptions: { minValue: 0, numberPrecision: 2 },
				default: 1000,
				required: true,
				displayOptions: { show: { resource: ['checkout'], operation: ['createLink'] } },
				description: 'Payment amount in so\'m. Converted to tiyin automatically (1 so\'m = 100 tiyin).',
			},
			{
				displayName: 'Account Fields',
				name: 'account',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['checkout'], operation: ['createLink'] } },
				description:
					'Fields of the "Account" object configured in your Payme web cashbox, usually order_id',
				options: [
					{
						displayName: 'Field',
						name: 'fields',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: 'order_id',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
							},
						],
					},
				],
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: { show: { resource: ['checkout'], operation: ['createLink'] } },
				options: [
					{
						displayName: 'Language',
						name: 'language',
						type: 'options',
						options: [
							{ name: 'English', value: 'en' },
							{ name: 'Russian', value: 'ru' },
							{ name: 'Uzbek', value: 'uz' },
						],
						default: 'ru',
						description: 'Language of the Payme payment page',
					},
					{
						displayName: 'Return URL',
						name: 'callbackUrl',
						type: 'string',
						default: '',
						description: 'Where Payme sends the customer after payment or cancellation',
					},
					{
						displayName: 'Return Delay (Ms)',
						name: 'callbackTimeoutMs',
						type: 'number',
						typeOptions: { minValue: 0 },
						default: 15,
						description: 'Wait time after a successful payment before redirecting to the return URL',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('paymeApi');

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const fields = this.getNodeParameter('account.fields', itemIndex, []) as Array<{
					name: string;
					value: string;
				}>;
				const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

				const { url, amountTiyin } = buildCheckoutLink({
					merchantId: credentials.merchantId as string,
					environment: credentials.environment as PaymeEnvironment,
					amountUzs: this.getNodeParameter('amount', itemIndex) as number,
					account: Object.fromEntries(fields.map((f) => [f.name, String(f.value)])),
					language: options.language as 'ru' | 'uz' | 'en' | undefined,
					callbackUrl: (options.callbackUrl as string) || undefined,
					callbackTimeoutMs: options.callbackTimeoutMs as number | undefined,
				});

				returnData.push({ json: { url, amountTiyin }, pairedItem: itemIndex });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message }, pairedItem: itemIndex });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error, { itemIndex });
			}
		}

		return [returnData];
	}
}
