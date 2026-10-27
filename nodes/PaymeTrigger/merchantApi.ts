// Pure helpers for the Payme Merchant API (JSON-RPC 2.0 calls that Payme sends to our webhook).
// No n8n imports, so everything here is unit-tested without running n8n.
// Spec: developer.help.paycom.uz -> "Протокол Merchant API" and "Ошибки".
import { createHash, timingSafeEqual } from 'node:crypto';

export const MERCHANT_METHODS = [
	'CheckPerformTransaction',
	'CreateTransaction',
	'PerformTransaction',
	'CancelTransaction',
	'CheckTransaction',
	'GetStatement',
	'SetFiscalData',
] as const;

export type RpcId = number | string | null;

export interface RpcRequest {
	id: RpcId;
	method: string;
	params: Record<string, unknown>;
}

type Localized = { ru: string; uz: string; en: string };

export interface RpcErrorBody {
	error: { code: number; message: Localized; data?: unknown };
	id: RpcId;
}

export const RpcCode = {
	SystemError: -32400,
	InvalidAuth: -32504,
	InvalidRequest: -32600,
	MethodNotFound: -32601,
	ParseError: -32700,
} as const;

const MESSAGES: Record<number, Localized> = {
	[RpcCode.SystemError]: {
		ru: 'Системная ошибка',
		uz: 'Tizim xatosi',
		en: 'System error',
	},
	[RpcCode.InvalidAuth]: {
		ru: 'Недостаточно привилегий для выполнения метода',
		uz: "Metodni bajarish uchun huquqlar yetarli emas",
		en: 'Insufficient privileges to perform this method',
	},
	[RpcCode.InvalidRequest]: {
		ru: 'Неверный RPC-запрос',
		uz: "RPC so'rovi noto'g'ri",
		en: 'Invalid RPC request',
	},
	[RpcCode.MethodNotFound]: {
		ru: 'Метод не найден',
		uz: 'Metod topilmadi',
		en: 'Method not found',
	},
	[RpcCode.ParseError]: {
		ru: 'Ошибка разбора JSON',
		uz: 'JSON tahlil xatosi',
		en: 'JSON parse error',
	},
};

export function rpcError(id: RpcId, code: number, data?: unknown): RpcErrorBody {
	const error: RpcErrorBody['error'] = { code, message: MESSAGES[code] };
	if (data !== undefined) error.data = data;
	return { error, id };
}

/** Payme sends `Authorization: Basic base64("Paycom:<key>")`. Compared in constant time. */
export function isAuthorized(authorization: string | undefined, key: string): boolean {
	const match = /^Basic\s+(.+)$/i.exec(authorization ?? '');
	if (!match || !key) return false;
	const given = Buffer.from(match[1], 'base64').toString('utf8');
	const digest = (value: string) => createHash('sha256').update(value).digest();
	return timingSafeEqual(digest(given), digest(`Paycom:${key}`));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Payme sends "Content-Type: text/json", which n8n does not parse: `body` stays empty and the
// JSON is only in `rawBody`. With application/json n8n fills `body` itself.
function readJson(body: unknown, rawBody?: Buffer | string): { ok: boolean; value?: unknown } {
	if (Array.isArray(body) || (isPlainObject(body) && Object.keys(body).length > 0)) {
		return { ok: true, value: body };
	}
	const text = typeof body === 'string' ? body : (rawBody?.toString('utf8') ?? '');
	try {
		return { ok: true, value: JSON.parse(text) };
	} catch {
		return { ok: false };
	}
}

export type HandleResult = { respond: RpcErrorBody } | { rpc: RpcRequest };

/**
 * Decides what to do with an incoming Payme call.
 * `respond`: answer Payme right away (bad auth / bad request), the workflow does not start.
 * `rpc`: a valid, authorized call that should start the workflow.
 */
export function handleRequest(input: {
	authorization: string | undefined;
	body: unknown;
	rawBody?: Buffer | string;
	key: string;
}): HandleResult {
	const json = readJson(input.body, input.rawBody);
	const value = json.value;
	const id: RpcId =
		isPlainObject(value) && (typeof value.id === 'number' || typeof value.id === 'string')
			? value.id
			: null;

	// Auth is checked before anything else: Payme's sandbox expects -32504 for wrong credentials.
	if (!isAuthorized(input.authorization, input.key)) {
		return { respond: rpcError(id, RpcCode.InvalidAuth) };
	}
	if (!json.ok) return { respond: rpcError(null, RpcCode.ParseError) };

	if (!isPlainObject(value) || typeof value.method !== 'string' || !isPlainObject(value.params)) {
		return { respond: rpcError(id, RpcCode.InvalidRequest) };
	}
	if (!(MERCHANT_METHODS as readonly string[]).includes(value.method)) {
		return { respond: rpcError(id, RpcCode.MethodNotFound, value.method) };
	}
	return { rpc: { id, method: value.method, params: value.params } };
}
