import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { verifySessionCookie, getSessionCookieName } from '$lib/server/admin-auth.js';
import { getDb } from '$lib/server/db/index.js';
import { leads } from '$lib/server/db/schema.js';
import { desc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ cookies }) => {
	const cookieVal = cookies.get(getSessionCookieName());
	const session = cookieVal ? verifySessionCookie(cookieVal) : null;

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
