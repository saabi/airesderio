import { json } from '@sveltejs/kit';
import type { Cookies, RequestHandler } from '@sveltejs/kit';
import { verifySessionCookie, getSessionCookieName } from '$lib/server/admin-auth.js';
import { getDb } from '$lib/server/db/index.js';
import { leads } from '$lib/server/db/schema.js';
import { and, eq, ne, sql } from 'drizzle-orm';

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE =
	/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function isUuid(value: string): boolean {
	return UUID_RE.test(value);
}

function isValidEmail(value: string): boolean {
	return EMAIL_RE.test(value);
}

function sanitizeInput(value: string, maxLength = 1000): string {
	return value.trim().slice(0, maxLength);
}

function requireAdmin(cookies: Cookies): ReturnType<typeof verifySessionCookie> | null {
	const cookieVal = cookies.get(getSessionCookieName());
	return cookieVal ? verifySessionCookie(cookieVal) : null;
}

/** Body: `{ "starred": boolean }` */
export const PATCH: RequestHandler = async ({ params, request, cookies }) => {
	const session = requireAdmin(cookies);

	if (!session) {
		return json({ error: 'No autorizado' }, { status: 401 });
	}

	const id = params.id;
	if (!id || !isUuid(id)) {
		return json({ error: 'ID inválido' }, { status: 400 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Cuerpo inválido' }, { status: 400 });
	}

	if (
		body === null ||
		typeof body !== 'object' ||
		!('starred' in body) ||
		typeof (body as { starred: unknown }).starred !== 'boolean'
	) {
		return json({ error: 'Se requiere { starred: boolean }' }, { status: 400 });
	}

	const starred = (body as { starred: boolean }).starred;

	try {
		const db = getDb();
		const updated = await db
			.update(leads)
			.set({ starred })
			.where(eq(leads.id, id))
			.returning({ id: leads.id });

		if (updated.length === 0) {
			return json({ error: 'No encontrado' }, { status: 404 });
		}

		return json({ success: true, starred });
	} catch (err) {
		console.error('Admin patch lead error:', err);
		return json({ error: 'Error al actualizar' }, { status: 500 });
	}
};

/**
 * Body:
 * {
 *   "firstName": string,
 *   "lastName": string,
 *   "email": string,
 *   "phone"?: string | null,
 *   "message"?: string | null,
 *   "intent": string,
 *   "allowDuplicate"?: boolean
 * }
 */
export const PUT: RequestHandler = async ({ params, request, cookies }) => {
	const session = requireAdmin(cookies);

	if (!session) {
		return json({ error: 'No autorizado' }, { status: 401 });
	}

	const id = params.id;
	if (!id || !isUuid(id)) {
		return json({ error: 'ID inválido' }, { status: 400 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Cuerpo inválido' }, { status: 400 });
	}

	if (body === null || typeof body !== 'object') {
		return json({ error: 'Cuerpo inválido' }, { status: 400 });
	}

	const obj = body as Record<string, unknown>;
	const firstName = typeof obj.firstName === 'string' ? sanitizeInput(obj.firstName, 255) : '';
	const lastName = typeof obj.lastName === 'string' ? sanitizeInput(obj.lastName, 255) : '';
	const email = typeof obj.email === 'string' ? sanitizeInput(obj.email, 255) : '';
	const phone =
		typeof obj.phone === 'string' && obj.phone.trim().length > 0 ? sanitizeInput(obj.phone, 50) : null;
	const message =
		typeof obj.message === 'string' && obj.message.trim().length > 0 ? sanitizeInput(obj.message) : null;
	const intent = typeof obj.intent === 'string' ? sanitizeInput(obj.intent, 50) : '';
	const allowDuplicate = obj.allowDuplicate === true;

	if (!email || !intent) {
		return json({ error: 'Completá correo e intención.' }, { status: 400 });
	}

	if (!isValidEmail(email)) {
		return json({ error: 'Ingresá un correo electrónico válido.' }, { status: 400 });
	}

	if (intent === 'whatsapp-lead' && !phone) {
		return json({ error: 'Ingresá teléfono para leads de WhatsApp.' }, { status: 400 });
	}

	try {
		const db = getDb();
		if (!allowDuplicate) {
			const duplicate = await db
				.select({ id: leads.id })
				.from(leads)
				.where(and(sql`lower(${leads.email}) = lower(${email})`, ne(leads.id, id)))
				.limit(1);
			if (duplicate.length > 0) {
				return json({ error: 'Ya existe otro lead con ese correo.' }, { status: 409 });
			}
		}

		const updated = await db
			.update(leads)
			.set({
				firstName,
				lastName,
				email,
				phone,
				message,
				intent
			})
			.where(eq(leads.id, id))
			.returning();

		if (updated.length === 0) {
			return json({ error: 'No encontrado' }, { status: 404 });
		}

		return json({ success: true, lead: updated[0] });
	} catch (err) {
		console.error('Admin edit lead error:', err);
		return json({ error: 'Error al actualizar' }, { status: 500 });
	}
};
