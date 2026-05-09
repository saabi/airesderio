/**
 * Contact Form API Route
 *
 * Stores leads in PostgreSQL, sends notification via SMTP (DreamHost),
 * and stores PDF access tokens for PDF intents and for direct-contact (ficha en el mail de agradecimiento).
 * On SMTP failure after persistence, enqueues retry jobs and still returns success.
 */
import { json, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/db/index.js';
import { leads, pdfAccessTokens } from '$lib/server/db/schema.js';
import { sendContactNotification, sendPdfDownloadLink, sendDirectContactThankYou } from '$lib/server/email.js';
import {
	enqueueOutboundEmailJob,
	type OutboundJobKind
} from '$lib/server/emailRetryQueue.js';
import { randomBytes } from 'crypto';
import { isLeadPhoneFilled } from '$lib/utils/leadPhone.js';

/** All PDF CTAs use one file: `static/pdf/Aires de Río - Ficha técnica.pdf` */
const VALID_PDF_INTENTS = ['departamentos'] as const;
const TOKEN_EXPIRY_HOURS = 24;

const submissions = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function checkRateLimit(identifier: string): boolean {
	const now = Date.now();
	const userSubmissions = submissions.get(identifier) || [];
	const recentSubmissions = userSubmissions.filter(
		(timestamp) => now - timestamp < RATE_LIMIT_WINDOW
	);
	if (recentSubmissions.length >= RATE_LIMIT_MAX) return false;
	recentSubmissions.push(now);
	submissions.set(identifier, recentSubmissions);
	return true;
}

function validateEmail(email: string): boolean {
	return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(email);
}

function sanitizeInput(input: string): string {
	return input.trim().slice(0, 1000);
}

function generateToken(): string {
	return randomBytes(32).toString('hex');
}

function isPdfIntent(intent: string): intent is (typeof VALID_PDF_INTENTS)[number] {
	return VALID_PDF_INTENTS.includes(intent as (typeof VALID_PDF_INTENTS)[number]);
}

async function safeEnqueue(
	db: ReturnType<typeof getDb>,
	leadId: string,
	jobKind: OutboundJobKind,
	payload: Record<string, unknown>,
	logError: unknown
) {
	console.error(`Enqueue ${jobKind} for lead ${leadId}:`, logError);
	try {
		await enqueueOutboundEmailJob(db, leadId, jobKind, payload);
	} catch (queueErr) {
		console.error('Failed to enqueue outbound email job:', queueErr);
	}
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();

		if (data.website) {
			return json({ success: true }, { status: 200 });
		}

		const clientIp =
			request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
			request.headers.get('x-real-ip') ||
			'unknown';

		if (!checkRateLimit(clientIp)) {
			return json(
				{ error: 'Demasiadas solicitudes. Por favor, intenta de nuevo más tarde.' },
				{ status: 429 }
			);
		}

		const { nombre, apellido, correo, telefono, mensaje, intent: rawIntent } = data;

		if (!nombre || !apellido || !correo) {
			return json({ error: 'Por favor completa todos los campos requeridos.' }, { status: 400 });
		}

		if (!validateEmail(correo)) {
			return json({ error: 'Por favor ingresa un correo electrónico válido.' }, { status: 400 });
		}

		const phoneRaw = telefono != null ? String(telefono).trim() : '';
		if (!isLeadPhoneFilled(phoneRaw)) {
			return json(
				{ error: 'Por favor ingresá un número de teléfono completo con código de país.' },
				{ status: 400 }
			);
		}

		const intent = rawIntent ? sanitizeInput(String(rawIntent)) : 'direct-contact';
		const firstName = sanitizeInput(nombre);
		const lastName = sanitizeInput(apellido);
		const email = sanitizeInput(correo);
		const phone = sanitizeInput(phoneRaw);

		const messageTrimmed = mensaje != null ? String(mensaje).trim() : '';
		if (intent === 'direct-contact' && !messageTrimmed) {
			return json(
				{ error: 'Por favor escribí tu mensaje o consulta.' },
				{ status: 400 }
			);
		}
		const message = messageTrimmed ? sanitizeInput(messageTrimmed) : null;

		const db = getDb();

		const [lead] = await db
			.insert(leads)
			.values({
				firstName,
				lastName,
				email,
				phone,
				message,
				intent,
				ipAddress: clientIp
			})
			.returning();

		if (!lead) {
			throw new Error('Failed to insert lead');
		}

		let leadPdfToken: string | null = null;
		let leadPdfType: string | null = null;

		if (isPdfIntent(intent)) {
			const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
			const token = generateToken();
			await db.insert(pdfAccessTokens).values({
				leadId: lead.id,
				token,
				pdfType: intent,
				expiresAt
			});
			leadPdfToken = token;
			leadPdfType = intent;
		} else if (intent === 'direct-contact') {
			const pdfType = 'departamentos';
			const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
			const token = generateToken();
			await db.insert(pdfAccessTokens).values({
				leadId: lead.id,
				token,
				pdfType,
				expiresAt
			});
			leadPdfToken = token;
			leadPdfType = pdfType;
		}

		const fullName = `${firstName} ${lastName}`;

		try {
			await sendContactNotification({
				leadName: fullName,
				leadEmail: email,
				leadPhone: phone ?? undefined,
				leadMessage: message ?? undefined,
				intent
			});
		} catch (emailErr) {
			console.error('SMTP error (team notification):', emailErr);
			await safeEnqueue(db, lead.id, 'team_notification', {
				intent,
				leadName: fullName,
				leadEmail: email,
				leadPhone: phone ?? undefined,
				leadMessage: message ?? undefined
			}, emailErr);
		}

		try {
			if (isPdfIntent(intent) && leadPdfToken && leadPdfType) {
				await sendPdfDownloadLink({
					leadName: firstName,
					leadEmail: email,
					pdfType: leadPdfType,
					token: leadPdfToken
				});
			} else if (intent === 'direct-contact' && leadPdfToken && leadPdfType) {
				await sendDirectContactThankYou({
					leadName: firstName,
					leadEmail: email,
					pdfType: leadPdfType,
					token: leadPdfToken
				});
			}
		} catch (emailErr) {
			console.error('SMTP error (lead email):', emailErr);
			if (isPdfIntent(intent) && leadPdfToken && leadPdfType) {
				await safeEnqueue(db, lead.id, 'lead_pdf', {
					leadName: firstName,
					leadEmail: email,
					pdfType: leadPdfType,
					token: leadPdfToken
				}, emailErr);
			} else if (intent === 'direct-contact' && leadPdfToken && leadPdfType) {
				await safeEnqueue(db, lead.id, 'lead_thankyou', {
					leadName: firstName,
					leadEmail: email,
					pdfType: leadPdfType,
					token: leadPdfToken
				}, emailErr);
			}
		}

		const responseMessage =
			intent === 'direct-contact'
				? 'Formulario enviado correctamente. Te enviamos un correo con un enlace para descargar la ficha técnica; un asesor se pondrá en contacto a la brevedad.'
				: 'Formulario enviado correctamente. Revisá tu correo electrónico para descargar el archivo.';

		return json({ success: true, message: responseMessage });
	} catch (error) {
		console.error('Form submission error:', error);
		return json(
			{ error: 'Error al procesar el formulario. Por favor, intenta de nuevo más tarde.' },
			{ status: 500 }
		);
	}
};
