// Pure function (no n8n imports) so it can be unit-tested without running n8n.
// Format from the Payme docs ("Отправка чека по методу GET"):
//   <checkout_url>/base64("m=<merchant>;ac.<field>=<value>;a=<tiyin>;l=<lang>;c=<url>;ct=<ms>")

export type PaymeEnvironment = 'test' | 'production';

export interface CheckoutLinkInput {
	merchantId: string;
	environment: PaymeEnvironment;
	/** Amount in UZS (so'm). Converted to tiyin (x100) because Payme counts in tiyin. */
	amountUzs: number;
	/** Account fields configured in the web cashbox, e.g. { order_id: '197' } */
	account: Record<string, string>;
	language?: 'ru' | 'uz' | 'en';
	callbackUrl?: string;
	callbackTimeoutMs?: number;
}

// ponytail: "cr" (currency) is skipped, docs do not say which code format Payme expects
const HOSTS: Record<PaymeEnvironment, string> = {
	test: 'https://test.paycom.uz',
	production: 'https://checkout.paycom.uz',
};

export function buildCheckoutLink(input: CheckoutLinkInput): { url: string; amountTiyin: number } {
	const merchantId = input.merchantId.trim();
	if (!merchantId) throw new Error('Merchant ID is required');

	if (!Number.isFinite(input.amountUzs) || input.amountUzs <= 0) {
		throw new Error('Amount must be a positive number');
	}
	const amountTiyin = Math.round(input.amountUzs * 100);

	const accountEntries = Object.entries(input.account).filter(([name]) => name.trim() !== '');
	if (accountEntries.length === 0) {
		throw new Error('At least one account field (e.g. order_id) is required');
	}

	const parts: Array<[string, string]> = [['m', merchantId]];
	for (const [name, value] of accountEntries) parts.push([`ac.${name.trim()}`, value]);
	parts.push(['a', String(amountTiyin)]);
	if (input.language) parts.push(['l', input.language]);
	if (input.callbackUrl) parts.push(['c', input.callbackUrl]);
	if (input.callbackTimeoutMs !== undefined) parts.push(['ct', String(input.callbackTimeoutMs)]);

	// ";" separates parameters, so it must not appear inside a value
	for (const [key, value] of parts) {
		if (value.includes(';')) throw new Error(`Value of "${key}" must not contain ";"`);
	}

	const payload = parts.map(([key, value]) => `${key}=${value}`).join(';');
	return {
		url: `${HOSTS[input.environment]}/${Buffer.from(payload, 'utf8').toString('base64')}`,
		amountTiyin,
	};
}
