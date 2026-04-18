import { json } from '@sveltejs/kit';
import type { Cookies, RequestHandler } from '@sveltejs/kit';
import { verifySessionCookie, getSessionCookieName } from '$lib/server/admin-auth.js';
import { getDb } from '$lib/server/db/index.js';
import { leads } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
	return UUID_RE.test(value);
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
