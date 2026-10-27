// Run: npm test
// Tests are not published ("files": ["dist"]), so the cloud import ban does not apply here.
/* eslint-disable @n8n/community-nodes/no-restricted-imports */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { MERCHANT_METHODS, handleRequest, isAuthorized } from '../nodes/PaymeTrigger/merchantApi.ts';

const KEY = 'test-key-123';
const basic = (login: string, password: string) =>
	'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');
const AUTH = basic('Paycom', KEY);

// The call as Payme sends it (example from the Payme docs)
const performCall = {
	method: 'PerformTransaction',
	params: { id: '53327b3fc92af52c0b72b695' },
	id: 2032,
};

test('accepts only Basic Paycom:<key>', () => {
	assert.equal(isAuthorized(AUTH, KEY), true);
	assert.equal(isAuthorized(AUTH.replace('Basic', 'basic'), KEY), true);
	assert.equal(isAuthorized(basic('Paycom', 'wrong'), KEY), false);
	assert.equal(isAuthorized(basic('Login', KEY), KEY), false);
	assert.equal(isAuthorized('Bearer abc', KEY), false);
	assert.equal(isAuthorized(undefined, KEY), false);
	assert.equal(isAuthorized(AUTH, ''), false);
});

test('Payme sends text/json: n8n leaves body empty, JSON comes from rawBody', () => {
	const result = handleRequest({
		authorization: AUTH,
		body: {},
		rawBody: Buffer.from(JSON.stringify(performCall)),
		key: KEY,
	});
	assert.deepEqual(result, {
		rpc: { id: 2032, method: 'PerformTransaction', params: { id: '53327b3fc92af52c0b72b695' } },
	});
});

test('application/json: body is already parsed by n8n', () => {
	const result = handleRequest({ authorization: AUTH, body: performCall, key: KEY });
	assert.ok('rpc' in result);
});

test('all documented methods are accepted', () => {
	for (const method of MERCHANT_METHODS) {
		const result = handleRequest({
			authorization: AUTH,
			body: { method, params: {}, id: 1 },
			key: KEY,
		});
		assert.ok('rpc' in result, method);
	}
});

test('wrong auth answers -32504 and echoes the request id', () => {
	const result = handleRequest({
		authorization: basic('Paycom', 'wrong'),
		body: performCall,
		key: KEY,
	});
	assert.ok('respond' in result);
	assert.equal(result.respond.error.code, -32504);
	assert.equal(result.respond.id, 2032);
	assert.ok(result.respond.error.message.ru && result.respond.error.message.uz && result.respond.error.message.en);
});

test('missing Authorization header is rejected before the body is looked at', () => {
	const result = handleRequest({ authorization: undefined, body: 'not json', key: KEY });
	assert.ok('respond' in result);
	assert.equal(result.respond.error.code, -32504);
});

test('invalid JSON answers -32700', () => {
	const result = handleRequest({
		authorization: AUTH,
		body: {},
		rawBody: Buffer.from('{"method": '),
		key: KEY,
	});
	assert.ok('respond' in result);
	assert.equal(result.respond.error.code, -32700);
	assert.equal(result.respond.id, null);
});

test('empty body answers -32700', () => {
	const result = handleRequest({ authorization: AUTH, body: {}, key: KEY });
	assert.ok('respond' in result);
	assert.equal(result.respond.error.code, -32700);
});

test('missing method or params answers -32600', () => {
	for (const body of [{ params: {}, id: 5 }, { method: 'PerformTransaction', id: 5 }, [performCall]]) {
		const result = handleRequest({ authorization: AUTH, body, key: KEY });
		assert.ok('respond' in result);
		assert.equal(result.respond.error.code, -32600);
	}
});

test('unknown method answers -32601 with the method name in data', () => {
	const result = handleRequest({
		authorization: AUTH,
		body: { method: 'DropTable', params: {}, id: 9 },
		key: KEY,
	});
	assert.ok('respond' in result);
	assert.equal(result.respond.error.code, -32601);
	assert.equal(result.respond.error.data, 'DropTable');
	assert.equal(result.respond.id, 9);
});
