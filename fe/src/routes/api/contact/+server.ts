/**
 * Contact Form API Route
 *
 * Stores leads in PostgreSQL, sends notification via SMTP (DreamHost),
 * and returns PDF access tokens when intent is a PDF type.
 */
import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getDb } from '$lib/server/db/index.js';
import { leads, pdfAccessTokens } from '$lib/server/db/schema.js';
import { sendContactNotification, sendPdfDownloadLink, sendDirectContactThankYou } from '$lib/server/email.js';
import { randomBytes } from 'crypto';

const VALID_PDF_INTENTS = ['ficha-tecnica', 'planos'] as const;
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

		const intent = rawIntent ? sanitizeInput(String(rawIntent)) : 'direct-contact';
		const firstName = sanitizeInput(nombre);
		const lastName = sanitizeInput(apellido);
		const email = sanitizeInput(correo);
		const phone = telefono ? sanitizeInput(telefono) : null;
		const message = mensaje ? sanitizeInput(mensaje) : null;

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

		let tokens: Record<string, string> = {};
		if (isPdfIntent(intent)) {
			const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
			const token = generateToken();
			await db.insert(pdfAccessTokens).values({
				leadId: lead.id,
				token,
				pdfType: intent,
				expiresAt
			});
			tokens[intent] = token;
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

			if (isPdfIntent(intent) && tokens[intent]) {
				await sendPdfDownloadLink({
					leadName: firstName,
					leadEmail: email,
					pdfType: intent,
					token: tokens[intent]
				});
			} else if (intent === 'direct-contact') {
				await sendDirectContactThankYou({
					leadName: firstName,
					leadEmail: email
				});
			}
		} catch (emailErr) {
			console.error('SMTP error:', emailErr);
			if (!env.SMTP_HOST || import.meta.env.PROD) {
				return json(
					{ error: 'Error al enviar el formulario. Por favor, intenta de nuevo más tarde.' },
					{ status: 500 }
				);
			}
		}

		const responseMessage =
			intent === 'direct-contact'
				? 'Formulario enviado correctamente. Nos pondremos en contacto contigo pronto.'
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
