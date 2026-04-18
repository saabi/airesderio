import { json } from '@sveltejs/kit';
import type { Cookies, RequestHandler } from '@sveltejs/kit';
import { verifySessionCookie, getSessionCookieName } from '$lib/server/admin-auth.js';
import { getDb } from '$lib/server/db/index.js';
import { leads, pdfAccessTokens, emailOutboundJobs } from '$lib/server/db/schema.js';
import { desc, inArray } from 'drizzle-orm';

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
	return UUID_RE.test(value);
}

function requireAdmin(cookies: Cookies): ReturnType<typeof verifySessionCookie> | null {
	const cookieVal = cookies.get(getSessionCookieName());
	return cookieVal ? verifySessionCookie(cookieVal) : null;
}

export const GET: RequestHandler = async ({ cookies }) => {
	const session = requireAdmin(cookies);

	if (!session) {
		return json({ error: 'No autorizado' }, { status: 401 });
	}

	try {
		const db = getDb();
		const rows = await db.select().from(leads).orderBy(desc(leads.createdAt));
		return json({ leads: rows });
	} catch (err) {
		console.error('Admin leads error:', err);
		return json({ error: 'Error al cargar contactos' }, { status: 500 });
	}
};

/**
 * Body: `{ "ids": ["uuid", ...] }` — elimina esos leads y filas dependientes (tokens PDF, jobs de mail).
 */
export const DELETE: RequestHandler = async ({ request, cookies }) => {
	const session = requireAdmin(cookies);

	if (!session) {
		return json({ error: 'No autorizado' }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Cuerpo inválido' }, { status: 400 });
	}

	const rawIds =
		body !== null &&
		typeof body === 'object' &&
		'ids' in body &&
		Array.isArray((body as { ids: unknown }).ids)
			? (body as { ids: unknown[] }).ids
			: null;

	if (!rawIds || rawIds.length === 0) {
		return json({ error: 'Se requiere un array ids no vacío' }, { status: 400 });
	}

	if (!rawIds.every((id): id is string => typeof id === 'string' && isUuid(id))) {
		return json({ error: 'Uno o más IDs no son UUID válidos' }, { status: 400 });
	}
	const ids = [...new Set(rawIds as string[])];

	try {
		const db = getDb();
		await db.transaction(async (tx) => {
			await tx.delete(pdfAccessTokens).where(inArray(pdfAccessTokens.leadId, ids));
			await tx.delete(emailOutboundJobs).where(inArray(emailOutboundJobs.leadId, ids));
			await tx.delete(leads).where(inArray(leads.id, ids));
		});
		return json({ success: true, deleted: ids.length });
	} catch (err) {
		console.error('Admin delete leads error:', err);
		return json({ error: 'Error al eliminar contactos' }, { status: 500 });
	}
};
