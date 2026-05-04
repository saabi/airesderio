import { json } from '@sveltejs/kit';
import type { Cookies, RequestHandler } from '@sveltejs/kit';
import { verifySessionCookie, getSessionCookieName } from '$lib/server/admin-auth.js';
import { getDb } from '$lib/server/db/index.js';
import { leads, pdfAccessTokens, emailOutboundJobs } from '$lib/server/db/schema.js';
import { sendContactNotification } from '$lib/server/email.js';
import { enqueueOutboundEmailJob } from '$lib/server/emailRetryQueue.js';
import { issuePdfTokenAndSendThankYou } from '$lib/server/adminLeadPdfThankYou.js';
import { desc, inArray, sql } from 'drizzle-orm';

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE =
	/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const MANUAL_REASONS = ['manual-entry', 'whatsapp-lead'] as const;
type ManualReason = (typeof MANUAL_REASONS)[number];

function isUuid(value: string): boolean {
	return UUID_RE.test(value);
}

function isValidEmail(value: string): boolean {
	return EMAIL_RE.test(value);
}

function sanitizeInput(value: string, maxLength = 1000): string {
	return value.trim().slice(0, maxLength);
}

function isManualReason(value: string): value is ManualReason {
	return MANUAL_REASONS.includes(value as ManualReason);
}

/** If admin sends a non-empty `createdAt` (ISO), use it; otherwise leave undefined so the DB default applies. */
function parseOptionalCreatedAtForInsert(
	value: unknown
): { ok: true; date: Date } | { ok: false; error: string } | { ok: true; date: null } {
	if (value === undefined || value === null) {
		return { ok: true, date: null };
	}
	if (typeof value !== 'string') {
		return { ok: false, error: 'Fecha inválida.' };
	}
	const trimmed = value.trim();
	if (trimmed === '') {
		return { ok: true, date: null };
	}
	const d = new Date(trimmed);
	if (Number.isNaN(d.getTime())) {
		return { ok: false, error: 'Fecha/hora de alta inválida.' };
	}
	return { ok: true, date: d };
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
 * Body:
 * {
 *   "nombre": string,
 *   "apellido": string,
 *   "correo"?: string (required for manual-entry; optional for whatsapp-lead → NULL if empty),
 *   "telefono"?: string,
 *   "mensaje"?: string,
 *   "reason": "manual-entry" | "whatsapp-lead",
 *   "sendPdfEmail": boolean,
 *   "dontInviteToWhatsapp"?: boolean,
 *   "notifyInfoEmail"?: boolean,
 *   "allowDuplicate"?: boolean
 *   "createdAt"?: string (ISO) — if omitted, server uses time of insert
 * }
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
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

	if (body === null || typeof body !== 'object') {
		return json({ error: 'Cuerpo inválido' }, { status: 400 });
	}

	const obj = body as Record<string, unknown>;
	const nombre = typeof obj.nombre === 'string' ? sanitizeInput(obj.nombre, 255) : '';
	const apellido = typeof obj.apellido === 'string' ? sanitizeInput(obj.apellido, 255) : '';
	const correoRaw = typeof obj.correo === 'string' ? sanitizeInput(obj.correo, 255) : '';
	const trimmedCorreo = correoRaw.trim();
	const emailForDb: string | null = trimmedCorreo === '' ? null : trimmedCorreo;
	const telefono =
		typeof obj.telefono === 'string' && obj.telefono.trim().length > 0
			? sanitizeInput(obj.telefono, 50)
			: null;
	const mensaje =
		typeof obj.mensaje === 'string' && obj.mensaje.trim().length > 0
			? sanitizeInput(obj.mensaje)
			: null;
	const reasonRaw = typeof obj.reason === 'string' ? sanitizeInput(obj.reason, 50) : '';
	const sendPdfEmail = obj.sendPdfEmail === true;
	const dontInviteToWhatsapp = obj.dontInviteToWhatsapp === true;
	const notifyInfoEmail = obj.notifyInfoEmail === true;
	const allowDuplicate = obj.allowDuplicate === true;
	const createdAtParsed = parseOptionalCreatedAtForInsert(obj.createdAt);
	if (createdAtParsed.ok === false) {
		return json({ error: createdAtParsed.error }, { status: 400 });
	}

	if (!reasonRaw) {
		return json({ error: 'Completá la razón.' }, { status: 400 });
	}

	if (!isManualReason(reasonRaw)) {
		return json({ error: 'Razón inválida.' }, { status: 400 });
	}

	if (reasonRaw === 'manual-entry') {
		if (!emailForDb || !isValidEmail(emailForDb)) {
			return json({ error: 'Ingresá un correo electrónico válido.' }, { status: 400 });
		}
	} else {
		if (!telefono) {
			return json({ error: 'Ingresá teléfono para leads de WhatsApp.' }, { status: 400 });
		}
		if (emailForDb !== null && !isValidEmail(emailForDb)) {
			return json({ error: 'Ingresá un correo electrónico válido.' }, { status: 400 });
		}
	}

	const effectiveSendPdf =
		sendPdfEmail && emailForDb !== null && isValidEmail(emailForDb);
	const effectiveNotify =
		notifyInfoEmail && emailForDb !== null && isValidEmail(emailForDb);

	try {
		const db = getDb();
		if (!allowDuplicate && emailForDb !== null) {
			const existing = await db
				.select({ id: leads.id })
				.from(leads)
				.where(sql`lower(${leads.email}) = lower(${emailForDb})`)
				.limit(1);
			if (existing.length > 0) {
				return json({ error: 'Ya existe un lead con ese correo.' }, { status: 409 });
			}
		}
		const [lead] = await db
			.insert(leads)
			.values({
				firstName: nombre,
				lastName: apellido,
				email: emailForDb,
				phone: telefono,
				message: mensaje,
				intent: reasonRaw,
				ipAddress: 'admin-manual',
				...(createdAtParsed.date != null ? { createdAt: createdAtParsed.date } : {})
			})
			.returning();

		if (!lead) {
			throw new Error('Failed to insert lead');
		}

		const leadName = `${nombre} ${apellido}`.trim();

		if (effectiveNotify && emailForDb) {
			try {
				await sendContactNotification({
					leadName,
					leadEmail: emailForDb,
					leadPhone: telefono ?? undefined,
					leadMessage: mensaje ?? undefined,
					intent: reasonRaw
				});
			} catch (emailErr) {
				console.error('SMTP error (team notification):', emailErr);
				await enqueueOutboundEmailJob(db, lead.id, 'team_notification', {
					intent: reasonRaw,
					leadName,
					leadEmail: emailForDb,
					leadPhone: telefono ?? undefined,
					leadMessage: mensaje ?? undefined
				});
			}
		}

		if (effectiveSendPdf && emailForDb) {
			await issuePdfTokenAndSendThankYou(db, {
				leadId: lead.id,
				thankYouLeadName: nombre,
				leadEmail: emailForDb,
				intent: reasonRaw,
				dontInviteToWhatsapp
			});
		}

		return json({ success: true, leadId: lead.id });
	} catch (err) {
		console.error('Admin create lead error:', err);
		return json({ error: 'Error al crear contacto manual' }, { status: 500 });
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
