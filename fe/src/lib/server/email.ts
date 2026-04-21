import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
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

const DEFAULT_FROM_ADDRESS = 'noreply@airesderio.com';
/** Shown in mail clients as the sender name; address still comes from CONTACT_FORM_FROM. */
const FROM_DISPLAY_NAME = 'Aires de Rio';
const EMAIL_LOGO_CID = 'airesderio-logo@cid';

function getSmtpFromAddress(): string {
	const raw = env.CONTACT_FORM_FROM?.trim();
	if (!raw) return DEFAULT_FROM_ADDRESS;
	const bracket = raw.match(/<([^>]+)>/);
	if (bracket) return bracket[1].trim();
	return raw;
}

function getFrom(): string {
	return `${FROM_DISPLAY_NAME} <${getSmtpFromAddress()}>`;
}

function getSiteUrl(): string {
	return env.PUBLIC_SITE_URL || 'https://airesderio.com';
}

function getEmailHeaderLogoHttpsUrl(): string {
	return `${getSiteUrl()}/airesderio-logotype-email-white.png`;
}

/**
 * White raster logo for HTML mail (Gmail often blocks remote or SVG images).
 * Use `airesderio-logotype-email-raster.svg`: same paths as the web logotype but a padded `viewBox`
 * so ImageMagick/librsvg do not clip; keep that file in sync when the brand SVG changes.
 * From `fe/static`:
 * `convert -background none -density 720 airesderio-logotype-email-raster.svg -filter Lanczos -resize 1272 -channel RGB -negate -alpha set PNG32:airesderio-logotype-email-white.png`
 */
function getEmailLogoPngPath(): string {
	const file = 'airesderio-logotype-email-white.png';
	const chunkDir = dirname(fileURLToPath(import.meta.url));
	const candidates = [
		join(process.cwd(), 'static', file),
		join(process.cwd(), 'build/client', file),
		join(chunkDir, '..', '..', 'client', file),
		join(chunkDir, '..', '..', '..', 'static', file)
	];
	for (const p of candidates) {
		if (existsSync(p)) return p;
	}
	throw new Error(`${file} not found (email header); checked static/, build/client/, and paths relative to server bundle`);
}

function getInlineLogoAttachment() {
	return {
		filename: 'airesderio-logotype-email-white.png',
		path: getEmailLogoPngPath(),
		cid: EMAIL_LOGO_CID
	};
}

const EMAIL_SIGNATURE_LINE =
	'Aires de Río - Departamentos de 2 y 4 ambientes en Santiago del Estero';

/** Same as `app.css` `--header-bg` (site header bar). */
const EMAIL_HEADER_BG = '#022b3a';

/** Same as `app.css` `.btn-cta-primary`: `--nav-button-fill`, `--nav-button-border`. */
const EMAIL_CTA_BUTTON_BG = '#4497b9';
const EMAIL_CTA_BUTTON_BORDER = '#000000';

/** Single tappable WhatsApp CTA for HTML mail (wa.me + visible number). */
const WHATSAPP_PHONE_ANCHOR = `<a href="https://wa.me/5493856222266" target="_blank" rel="noopener noreferrer" style="color:#0f766e;font-weight:600;text-decoration:underline;">WhatsApp al +54 9 385 6222266</a>`;

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
		<td style="background:${EMAIL_HEADER_BG}; padding:24px 32px; text-align:center;">
			<img
				src="cid:${EMAIL_LOGO_CID}"
				srcset="${getEmailHeaderLogoHttpsUrl()} 1x"
				onerror="this.onerror=null;this.src='${getEmailHeaderLogoHttpsUrl()}';"
				alt="Aires de Río"
				width="240"
				style="display:inline-block; width:240px; max-width:100%; height:auto; border:0; outline:none; text-decoration:none;"
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
		html,
		attachments: [getInlineLogoAttachment()]
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
	const downloadUrl = `${getSiteUrl()}/api/pdf/${encodeURIComponent(pdfType)}?token=${encodeURIComponent(token)}`;

	const subject = 'Tu ficha técnica — Aires de Río';
	const body = `
		<h2 style="margin:0 0 8px; font-size:20px; color:${EMAIL_HEADER_BG};">¡Hola ${leadName}!</h2>
		<p style="margin:0 0 16px; font-size:15px; color:#333; line-height:1.6;">
			Gracias por tu interés en <strong>Aires de Río</strong>. Hacé clic en el botón para descargar la ficha técnica del proyecto.
		</p>
		<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
			<tr>
				<td align="center">
					<table cellpadding="0" cellspacing="0" role="presentation">
						<tr>
							<td align="center" style="background:${EMAIL_CTA_BUTTON_BG}; border:2px solid ${EMAIL_CTA_BUTTON_BORDER}; border-radius:6px;">
								<a href="${downloadUrl}" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; color:#ffffff; text-decoration:none; letter-spacing:0.03em;">
									Descargar ficha técnica
								</a>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
		<p style="margin:0 0 16px; font-size:15px; color:#333; line-height:1.6;">
			¿Querés coordinar una reunión en persona con un asesor? Escribinos por ${WHATSAPP_PHONE_ANCHOR} (sólo mensajes de texto) y coordinamos día y horario.
		</p>
		<p style="margin:0 0 8px; font-size:15px; color:#333; line-height:1.6;">
			Quedamos a disposición para acompañarte en cada paso.
		</p>
		<p style="margin:0; font-size:15px; color:#333;">
			<strong>Equipo Aires de Río</strong>
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
		html,
		attachments: [getInlineLogoAttachment()]
	});
}

// --- Lead-facing: Direct contact thank you ---

export interface SendDirectContactThankYouParams {
	leadName: string;
	leadEmail: string;
	pdfType: string;
	token: string;
}

export function buildDirectContactThankYouEmail(
	params: SendDirectContactThankYouParams
): EmailPreviewPayload {
	const { leadName, pdfType, token } = params;
	const downloadUrl = `${getSiteUrl()}/api/pdf/${encodeURIComponent(pdfType)}?token=${encodeURIComponent(token)}`;

	const subject = 'Gracias por tu consulta — Aires de Río';
	const body = `
		<h2 style="margin:0 0 8px; font-size:20px; color:${EMAIL_HEADER_BG};">¡Hola ${leadName}!</h2>
		<p style="margin:0 0 16px; font-size:15px; color:#333; line-height:1.6;">
			Gracias por tu interés en <strong>Aires de Río</strong>. Recibimos tu consulta y un asesor de nuestro equipo se pondrá en contacto con vos a la brevedad para brindarte información personalizada.
		</p>
		<p style="margin:0 0 16px; font-size:15px; color:#333; line-height:1.6;">
			Mientras tanto, podés descargar la ficha técnica del proyecto y de las unidades disponibles para conocer en detalle sus características, terminaciones, superficies y equipamiento.
		</p>
		<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
			<tr>
				<td align="center">
					<table cellpadding="0" cellspacing="0" role="presentation">
						<tr>
							<td align="center" style="background:${EMAIL_CTA_BUTTON_BG}; border:2px solid ${EMAIL_CTA_BUTTON_BORDER}; border-radius:6px;">
								<a href="${downloadUrl}" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; color:#ffffff; text-decoration:none; letter-spacing:0.03em;">
									Descargar ficha técnica
								</a>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
		<p style="margin:0 0 16px; font-size:15px; color:#333; line-height:1.6;">
			Para coordinar una reunión en persona con un asesor, escribinos por ${WHATSAPP_PHONE_ANCHOR} (sólo mensajes de texto) y coordinamos día y horario.
		</p>
		<p style="margin:0 0 8px; font-size:15px; color:#333; line-height:1.6;">
			Quedamos a disposición para acompañarte en cada paso.
		</p>
		<p style="margin:0; font-size:15px; color:#333;">
			<strong>Equipo Aires de Río</strong>
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
		html,
		attachments: [getInlineLogoAttachment()]
	});
}

export function buildWhatsappLeadThankYouEmail(
	params: SendDirectContactThankYouParams
): EmailPreviewPayload {
	const { leadName, pdfType, token } = params;
	const downloadUrl = `${getSiteUrl()}/api/pdf/${encodeURIComponent(pdfType)}?token=${encodeURIComponent(token)}`;

	const subject = 'Gracias por tu consulta — Aires de Río';
	const body = `
		<h2 style="margin:0 0 8px; font-size:20px; color:${EMAIL_HEADER_BG};">¡Hola ${leadName}!</h2>
		<p style="margin:0 0 16px; font-size:15px; color:#333; line-height:1.6;">
			Gracias por tu interés en <strong>Aires de Río</strong> y por haberte comunicado con nuestro equipo.
		</p>
		<p style="margin:0 0 16px; font-size:15px; color:#333; line-height:1.6;">
			Te compartimos la ficha técnica del proyecto y de las unidades disponibles para que puedas revisar sus características, superficies y equipamiento.
		</p>
		<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
			<tr>
				<td align="center">
					<table cellpadding="0" cellspacing="0" role="presentation">
						<tr>
							<td align="center" style="background:${EMAIL_CTA_BUTTON_BG}; border:2px solid ${EMAIL_CTA_BUTTON_BORDER}; border-radius:6px;">
								<a href="${downloadUrl}" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; color:#ffffff; text-decoration:none; letter-spacing:0.03em;">
									Descargar ficha técnica
								</a>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
		<p style="margin:0 0 8px; font-size:15px; color:#333; line-height:1.6;">
			Quedamos a disposición para acompañarte en cada paso.
		</p>
		<p style="margin:0; font-size:15px; color:#333;">
			<strong>Equipo Aires de Río</strong>
		</p>
	`;
	return { subject, html: emailWrapper(body) };
}

export async function sendWhatsappLeadThankYou(
	params: SendDirectContactThankYouParams
): Promise<void> {
	const { subject, html } = buildWhatsappLeadThankYouEmail(params);

	await getTransporter().sendMail({
		from: getFrom(),
		to: params.leadEmail,
		replyTo: env.CONTACT_FORM_RECIPIENT || 'info@airesderio.com',
		subject,
		html,
		attachments: [getInlineLogoAttachment()]
	});
}
