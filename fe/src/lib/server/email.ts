import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from '$env/dynamic/private';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
	if (!transporter) {
		const host = env.SMTP_HOST;
		const port = parseInt(env.SMTP_PORT ?? '465', 10);
		const secure = port === 465 ? (env.SMTP_SECURE !== 'false') : false;
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

function getFrom(): string {
	return env.CONTACT_FORM_FROM || 'noreply@airesderio.com';
}

function getSiteUrl(): string {
	return env.PUBLIC_SITE_URL || 'https://airesderio.com';
}

const PDF_LABELS: Record<string, string> = {
	'ficha-tecnica': 'Ficha Técnica',
	'ficha-tecnica-harmony': 'Ficha Técnica',
	'ficha-tecnica-luxury': 'Ficha Técnica — Luxury Style',
	planos: 'Planos'
};

const EMAIL_SIGNATURE_LINE =
	'Aires de Río - Departamentos de uno y dos habitaciones en Santiago del Estero';

function emailWrapper(body: string): string {
	return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#f5f5f5; font-family:'Nunito',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5; padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; max-width:100%;">
	<tr>
		<td style="background:#1a1a2e; padding:24px 32px; text-align:center;">
			<span style="font-family:'Roboto',Helvetica,sans-serif; font-size:24px; font-weight:700; color:#ffffff; letter-spacing:0.05em;">AIRES DE RÍO</span>
		</td>
	</tr>
	<tr>
		<td style="padding:32px;">
			${body}
		</td>
	</tr>
	<tr>
		<td style="background:#f9f9f9; padding:20px 32px; text-align:center; border-top:1px solid #eee;">
			<p style="margin:0; font-size:13px; color:#888;">${EMAIL_SIGNATURE_LINE}</p>
			<p style="margin:4px 0 0; font-size:12px; color:#aaa;"><a href="${getSiteUrl()}" style="color:#888; text-decoration:none;">${getSiteUrl()}</a></p>
		</td>
	</tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// --- Internal notification (to the team) ---

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

	const subject = `${intent === 'direct-contact' ? 'RESPONDER! -' : 'Nuevo contacto:'} ${intent} - Aires de Río`;
	const html = `
		<h2>Nueva consulta desde el sitio web</h2>
		<p><strong>Nombre completo:</strong> ${leadName}</p>
		<p><strong>Correo:</strong> ${leadEmail}</p>
		${leadPhone ? `<p><strong>Teléfono:</strong> ${leadPhone}</p>` : ''}
		<p><strong>Intención:</strong> ${intent}</p>
		${leadMessage ? `<p><strong>Mensaje:</strong></p><p>${leadMessage.replace(/\n/g, '<br>')}</p>` : ''}
		<hr>
		<p><small>Enviado desde el formulario de contacto de Aires de Río</small></p>
	`;

	await getTransporter().sendMail({
		from: getFrom(),
		to: recipient,
		replyTo: leadEmail,
		subject,
		html
	});
}

// --- Lead-facing: PDF download link ---

export interface SendPdfLinkParams {
	leadName: string;
	leadEmail: string;
	pdfType: string;
	token: string;
}

export async function sendPdfDownloadLink(params: SendPdfLinkParams): Promise<void> {
	const { leadName, leadEmail, pdfType, token } = params;
	const label = PDF_LABELS[pdfType] || pdfType;
	const downloadUrl = `${getSiteUrl()}/api/pdf/${encodeURIComponent(pdfType)}?token=${encodeURIComponent(token)}`;

	const subject = `Tu ${label} de Aires de Río`;
	const body = `
		<h2 style="margin:0 0 8px; font-size:20px; color:#1a1a2e;">¡Hola ${leadName}!</h2>
		<p style="margin:0 0 16px; font-size:15px; color:#333; line-height:1.6;">
			Gracias por tu interés en <strong>Aires de Río</strong>. Hacé clic en el botón para descargar la <strong>${label}</strong> del proyecto.
		</p>
		<table cellpadding="0" cellspacing="0" style="margin:24px 0;">
			<tr><td align="center" style="background:#1a1a2e; border-radius:6px;">
				<a href="${downloadUrl}" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; color:#ffffff; text-decoration:none; letter-spacing:0.03em;">
					Descargar ${label}
				</a>
			</td></tr>
		</table>
		<p style="margin:16px 0 0; font-size:14px; color:#666; line-height:1.5;">
			Si tenés alguna consulta, no dudes en responder este correo o contactarnos a través de nuestro sitio web.
		</p>
		<p style="margin:24px 0 0; font-size:15px; color:#333;">
			¡Saludos!<br>
			<strong>${EMAIL_SIGNATURE_LINE}</strong>
		</p>
	`;

	await getTransporter().sendMail({
		from: getFrom(),
		to: leadEmail,
		replyTo: env.CONTACT_FORM_RECIPIENT || 'info@airesderio.com',
		subject,
		html: emailWrapper(body)
	});
}

// --- Lead-facing: Direct contact thank you ---

export interface SendDirectContactThankYouParams {
	leadName: string;
	leadEmail: string;
}

export async function sendDirectContactThankYou(params: SendDirectContactThankYouParams): Promise<void> {
	const { leadName, leadEmail } = params;

	const subject = 'Gracias por tu consulta - Aires de Río';
	const body = `
		<h2 style="margin:0 0 8px; font-size:20px; color:#1a1a2e;">¡Hola ${leadName}!</h2>
		<p style="margin:0 0 16px; font-size:15px; color:#333; line-height:1.6;">
			Gracias por tu interés en <strong>Aires de Río</strong>. Recibimos tu consulta y un representante de nuestro equipo se pondrá en contacto con vos a la brevedad.
		</p>
		<p style="margin:0 0 16px; font-size:14px; color:#666; line-height:1.5;">
			Mientras tanto, te invitamos a conocer más sobre nuestro proyecto visitando nuestro sitio web.
		</p>
		<table cellpadding="0" cellspacing="0" style="margin:24px 0;">
			<tr><td align="center" style="background:#1a1a2e; border-radius:6px;">
				<a href="${getSiteUrl()}" style="display:inline-block; padding:12px 28px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; letter-spacing:0.03em;">
					Visitar Aires de Río
				</a>
			</td></tr>
		</table>
		<p style="margin:24px 0 0; font-size:15px; color:#333;">
			¡Saludos!<br>
			<strong>${EMAIL_SIGNATURE_LINE}</strong>
		</p>
	`;

	await getTransporter().sendMail({
		from: getFrom(),
		to: leadEmail,
		replyTo: env.CONTACT_FORM_RECIPIENT || 'info@airesderio.com',
		subject,
		html: emailWrapper(body)
	});
}
