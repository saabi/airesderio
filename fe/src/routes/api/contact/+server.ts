/**
 * Contact Form API Route
 *
 * This API route works with @sveltejs/adapter-node, which is configured for
 * Node.js deployment with PM2 on a Linode VM running Debian with Nginx.
 *
 * The application is deployed as a Node.js server, enabling full API route support.
 */
import { json, type RequestHandler } from '@sveltejs/kit';
import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// Rate limiting: simple in-memory store (for production, use Redis or similar)
const submissions = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // Max 5 submissions per window

function checkRateLimit(identifier: string): boolean {
	const now = Date.now();
	const userSubmissions = submissions.get(identifier) || [];

	// Remove old submissions outside the window
	const recentSubmissions = userSubmissions.filter(
		(timestamp) => now - timestamp < RATE_LIMIT_WINDOW
	);

	if (recentSubmissions.length >= RATE_LIMIT_MAX) {
		return false;
	}

	recentSubmissions.push(now);
	submissions.set(identifier, recentSubmissions);
	return true;
}

function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

function sanitizeInput(input: string): string {
	return input.trim().slice(0, 1000); // Limit length
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();

		// Honeypot check - if this field is filled, it's a bot
		if (data.website) {
			return json({ success: true }, { status: 200 }); // Silent fail for bots
		}

		// Rate limiting by IP
		const clientIp =
			request.headers.get('x-forwarded-for')?.split(',')[0] ||
			request.headers.get('x-real-ip') ||
			'unknown';

		if (!checkRateLimit(clientIp)) {
			return json(
				{ error: 'Demasiadas solicitudes. Por favor, intenta de nuevo más tarde.' },
				{ status: 429 }
			);
		}

		// Validate required fields
		const { nombre, correo, telefono, consulta, mensaje } = data;

		if (!nombre || !correo || !consulta) {
			return json({ error: 'Por favor completa todos los campos requeridos.' }, { status: 400 });
		}

		// Validate email format
		if (!validateEmail(correo)) {
			return json({ error: 'Por favor ingresa un correo electrónico válido.' }, { status: 400 });
		}

		// Sanitize inputs
		const sanitizedData = {
			nombre: sanitizeInput(nombre),
			correo: sanitizeInput(correo),
			telefono: telefono ? sanitizeInput(telefono) : '',
			consulta: sanitizeInput(consulta),
			mensaje: mensaje ? sanitizeInput(mensaje) : ''
		};

		// Check if Resend API key is configured
		if (!resend || !env.RESEND_API_KEY) {
			console.error('RESEND_API_KEY is not configured');
			// In development, log the submission instead
			if (import.meta.env.DEV) {
				console.log('Form submission (dev mode):', sanitizedData);
				return json({
					success: true,
					message: 'Formulario enviado correctamente (modo desarrollo)'
				});
			}
			return json(
				{ error: 'Error de configuración del servidor. Por favor, contacta al administrador.' },
				{ status: 500 }
			);
		}

		// Get recipient email from environment or use default
		const recipientEmail = env.CONTACT_FORM_RECIPIENT || 'contacto@ferreyrapons.com';
		const fromEmail = env.CONTACT_FORM_FROM || 'noreply@ferreyrapons.com';

		// Send email using Resend
		const emailResult = await resend.emails.send({
			from: fromEmail,
			to: recipientEmail,
			replyTo: sanitizedData.correo,
			subject: `Nueva consulta: ${sanitizedData.consulta} - Aires de Río`,
			html: `
				<h2>Nueva consulta desde el sitio web</h2>
				<p><strong>Nombre:</strong> ${sanitizedData.nombre}</p>
				<p><strong>Correo:</strong> ${sanitizedData.correo}</p>
				${sanitizedData.telefono ? `<p><strong>Teléfono:</strong> ${sanitizedData.telefono}</p>` : ''}
				<p><strong>Tipo de consulta:</strong> ${sanitizedData.consulta}</p>
				${sanitizedData.mensaje ? `<p><strong>Mensaje:</strong></p><p>${sanitizedData.mensaje.replace(/\n/g, '<br>')}</p>` : ''}
				<hr>
				<p><small>Enviado desde el formulario de contacto de Aires de Río</small></p>
			`
		});

		if (emailResult.error) {
			console.error('Resend error:', emailResult.error);
			return json(
				{ error: 'Error al enviar el formulario. Por favor, intenta de nuevo más tarde.' },
				{ status: 500 }
			);
		}

		return json({
			success: true,
			message: 'Formulario enviado correctamente. Nos pondremos en contacto contigo pronto.'
		});
	} catch (error) {
		console.error('Form submission error:', error);
		return json(
			{ error: 'Error al procesar el formulario. Por favor, intenta de nuevo más tarde.' },
			{ status: 500 }
		);
	}
};
