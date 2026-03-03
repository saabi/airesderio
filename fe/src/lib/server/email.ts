import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from '$env/dynamic/private';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
	if (!transporter) {
		const host = env.SMTP_HOST;
		const port = parseInt(env.SMTP_PORT ?? '465', 10);
		const secure = env.SMTP_SECURE === 'true' || port === 465;
		const user = env.SMTP_USER;
		const pass = env.SMTP_PASS;

		if (!host || !user || !pass) {
			throw new Error('SMTP configuration missing: SMTP_HOST, SMTP_USER, SMTP_PASS required');
		}

		transporter = nodemailer.createTransport({
			host,
			port,
			secure,
			auth: { user, pass }
		});
	}
	return transporter;
}

export interface SendContactNotificationParams {
	leadName: string;
	leadEmail: string;
	leadPhone?: string;
	leadMessage?: string;
	intent: string;
}

export async function sendContactNotification(params: SendContactNotificationParams): Promise<void> {
	const { leadName, leadEmail, leadPhone, leadMessage, intent } = params;
	const recipient = env.CONTACT_FORM_RECIPIENT || 'info@airesderio.com';
	const from = env.CONTACT_FORM_FROM || 'noreply@airesderio.com';

	const subject = `Nueva consulta: ${intent} - Aires de Río`;
	const html = `
		<h2>Nueva consulta desde el sitio web</h2>
		<p><strong>Nombre:</strong> ${leadName}</p>
		<p><strong>Correo:</strong> ${leadEmail}</p>
		${leadPhone ? `<p><strong>Teléfono:</strong> ${leadPhone}</p>` : ''}
		<p><strong>Intención:</strong> ${intent}</p>
		${leadMessage ? `<p><strong>Mensaje:</strong></p><p>${leadMessage.replace(/\n/g, '<br>')}</p>` : ''}
		<hr>
		<p><small>Enviado desde el formulario de contacto de Aires de Río</small></p>
	`;

	await getTransporter().sendMail({
		from,
		to: recipient,
		replyTo: leadEmail,
		subject,
		html
	});
}
