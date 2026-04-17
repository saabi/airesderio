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
	departamentos: 'documentación del proyecto',
	// Legacy pdf_type values (retry queue / old tokens)
	'ficha-tecnica': 'documentación del proyecto',
	'ficha-tecnica-harmony': 'documentación del proyecto',
	'ficha-tecnica-luxury': 'documentación del proyecto',
	planos: 'documentación del proyecto'
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
			<img
				src="${getSiteUrl()}/airesderio-logotype.svg"
				alt="Aires de Río"
				width="240"
				style="display:inline-block; width:240px; max-width:100%; height:auto; filter: invert(1);"
			/>
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

export interface EmailPreviewPayload {
	subject: string;
	html: string;
}

export function buildContactNotificationEmail(
	params: SendContactNotificationParams
): EmailPreviewPayload {
	const { leadName, leadEmail, leadPhone, leadMessage, intent } = params;
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
	return { subject, html };
}

export async function sendContactNotification(params: SendContactNotificationParams): Promise<void> {
	const recipient = env.CONTACT_FORM_RECIPIENT || 'info@airesderio.com';
	const { subject, html } = buildContactNotificationEmail(params);

	await getTransporter().sendMail({
		from: getFrom(),
		to: recipient,
		replyTo: params.leadEmail,
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

export function buildPdfDownloadEmail(params: SendPdfLinkParams): EmailPreviewPayload {
	const { leadName, pdfType, token } = params;
	const label = PDF_LABELS[pdfType] || pdfType;
	const downloadUrl = `${getSiteUrl()}/api/pdf/${encodeURIComponent(pdfType)}?token=${encodeURIComponent(token)}`;

	const subject = 'Tu PDF de Aires de Río — Departamentos';
	const body = `
		<h2 style="margin:0 0 8px; font-size:20px; color:#1a1a2e;">¡Hola ${leadName}!</h2>
		<p style="margin:0 0 16px; font-size:15px; color:#333; line-height:1.6;">
			Gracias por tu interés en <strong>Aires de Río</strong>. Hacé clic en el botón para descargar <strong>${label}</strong>.
		</p>
		<table cellpadding="0" cellspacing="0" style="margin:24px 0;">
			<tr><td align="center" style="background:#1a1a2e; border-radius:6px;">
				<a href="${downloadUrl}" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; color:#ffffff; text-decoration:none; letter-spacing:0.03em;">
					Descargar PDF
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
	return { subject, html: emailWrapper(body) };
}

export async function sendPdfDownloadLink(params: SendPdfLinkParams): Promise<void> {
	const { subject, html } = buildPdfDownloadEmail(params);

	await getTransporter().sendMail({
		from: getFrom(),
		to: params.leadEmail,
		replyTo: env.CONTACT_FORM_RECIPIENT || 'info@airesderio.com',
		subject,
		html
	});
}

// --- Lead-facing: Direct contact thank you ---

export interface SendDirectContactThankYouParams {
	leadName: string;
	leadEmail: string;
}

export function buildDirectContactThankYouEmail(
	params: SendDirectContactThankYouParams
): EmailPreviewPayload {
	const { leadName } = params;
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
	return { subject, html: emailWrapper(body) };
}

export async function sendDirectContactThankYou(params: SendDirectContactThankYouParams): Promise<void> {
	const { subject, html } = buildDirectContactThankYouEmail(params);

	await getTransporter().sendMail({
		from: getFrom(),
		to: params.leadEmail,
		replyTo: env.CONTACT_FORM_RECIPIENT || 'info@airesderio.com',
		subject,
		html
	});
}
