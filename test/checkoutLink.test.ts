// Run: npm test  (Node 22+ runs .ts directly, no extra tooling)
// Tests are not published ("files": ["dist"]), so the cloud import ban does not apply here.
/* eslint-disable @n8n/community-nodes/no-restricted-imports */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildCheckoutLink } from '../nodes/Payme/checkoutLink.ts';

const base = {
	merchantId: '587f72c72cac0d162c722ae2',
	environment: 'production' as const,
	amountUzs: 5,
	account: { order_id: '197' },
};

test('matches the example URL from the Payme docs', () => {
	const { url, amountTiyin } = buildCheckoutLink(base);
	assert.equal(amountTiyin, 500);
	assert.equal(
		url,
		'https://checkout.paycom.uz/bT01ODdmNzJjNzJjYWMwZDE2MmM3MjJhZTI7YWMub3JkZXJfaWQ9MTk3O2E9NTAw',
	);
});

test('test environment uses the sandbox host', () => {
	assert.ok(buildCheckoutLink({ ...base, environment: 'test' }).url.startsWith('https://test.paycom.uz/'));
});

test('optional params are added in order l, c, ct', () => {
	const { url } = buildCheckoutLink({
		...base,
		language: 'uz',
		callbackUrl: 'https://shop.uz/back',
		callbackTimeoutMs: 15,
	});
	const payload = Buffer.from(url.split('/').pop()!, 'base64').toString();
	assert.equal(
		payload,
		'm=587f72c72cac0d162c722ae2;ac.order_id=197;a=500;l=uz;c=https://shop.uz/back;ct=15',
	);
});

test('fractional so\'m rounds to whole tiyin', () => {
	assert.equal(buildCheckoutLink({ ...base, amountUzs: 12.345 }).amountTiyin, 1235);
});

test('rejects bad input', () => {
	assert.throws(() => buildCheckoutLink({ ...base, merchantId: ' ' }), /Merchant ID/);
	assert.throws(() => buildCheckoutLink({ ...base, amountUzs: 0 }), /Amount/);
	assert.throws(() => buildCheckoutLink({ ...base, amountUzs: NaN }), /Amount/);
	assert.throws(() => buildCheckoutLink({ ...base, account: {} }), /account field/);
	assert.throws(() => buildCheckoutLink({ ...base, account: { order_id: 'a;b' } }), /";"/);
});
