import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import {
	verifySessionCookie,
	getSessionCookieName,
	verifyAdminPassword
} from '$lib/server/admin-auth.js';
import { getDb } from '$lib/server/db/index.js';
import { leads, pdfAccessTokens, emailOutboundJobs } from '$lib/server/db/schema.js';
import { sql } from 'drizzle-orm';

/**
 * Deletes all leads and dependent rows (PDF tokens, outbound email jobs).
 * Requires admin session + correct ADMIN_PASSWORD in body.
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const cookieVal = cookies.get(getSessionCookieName());
	const session = cookieVal ? verifySessionCookie(cookieVal) : null;

	if (!session) {
		return json({ error: 'No autorizado' }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Cuerpo inválido' }, { status: 400 });
	}

	const password =
		body !== null &&
		typeof body === 'object' &&
		'password' in body &&
		typeof (body as { password: unknown }).password === 'string'
			? (body as { password: string }).password
			: '';

	if (!verifyAdminPassword(password)) {
		return json({ error: 'Contraseña incorrecta' }, { status: 403 });
	}

	try {
		const db = getDb();
		await db.transaction(async (tx) => {
			await tx.delete(pdfAccessTokens).where(sql`true`);
			await tx.delete(emailOutboundJobs).where(sql`true`);
			await tx.delete(leads).where(sql`true`);
		});
		return json({ success: true });
	} catch (err) {
		console.error('Admin clear leads error:', err);
		return json({ error: 'Error al vaciar los datos' }, { status: 500 });
	}
};
