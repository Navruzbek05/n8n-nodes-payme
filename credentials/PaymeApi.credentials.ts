import type { ICredentialType, INodeProperties, Icon } from 'n8n-workflow';

// ponytail: no connection test yet. A real test needs the cashbox key (Subscribe API),
// which arrives with the receipts operations. Remove this disable then.
// eslint-disable-next-line @n8n/community-nodes/credential-test-required
export class PaymeApi implements ICredentialType {
	name = 'paymeApi';

	displayName = 'Payme API';

	icon: Icon = {
		light: 'file:../nodes/Payme/payme.svg',
		dark: 'file:../nodes/Payme/payme.dark.svg',
	};

	documentationUrl = 'https://developer.help.paycom.uz/';

	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{ name: 'Test (Sandbox)', value: 'test' },
				{ name: 'Production', value: 'production' },
			],
			default: 'test',
		},
		{
			displayName: 'Merchant ID',
			name: 'merchantId',
			type: 'string',
			default: '',
			required: true,
			description: 'ID of your web cashbox (kassa) from the Payme Business merchant account',
		},
		{
			displayName: 'Cashbox Key',
			name: 'cashboxPassword',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'Only needed for the Payme Trigger: Payme sends it in the Authorization header. Production: the cashbox key. Test: the TEST_KEY from the sandbox.',
		},
	];
}
