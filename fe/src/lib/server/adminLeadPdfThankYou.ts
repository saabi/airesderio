import { randomBytes } from 'crypto';
import { getDb } from '$lib/server/db/index.js';
import { pdfAccessTokens } from '$lib/server/db/schema.js';
import { sendDirectContactThankYou, sendWhatsappLeadThankYou } from '$lib/server/email.js';
import { enqueueOutboundEmailJob } from '$lib/server/emailRetryQueue.js';

/** Drizzle DB handle (same as `getDb()`). */
export type AdminLeadDb = ReturnType<typeof getDb>;

export const ADMIN_LEAD_PDF_TYPE = 'departamentos';
const TOKEN_EXPIRY_HOURS = 24;

export function adminLeadGeneratePdfToken(): string {
	return randomBytes(32).toString('hex');
}

/**
 * Inserts a PDF access token and sends the thank-you email (or enqueues retry).
 * Caller must pass a valid non-empty email.
 */
export async function issuePdfTokenAndSendThankYou(
	db: AdminLeadDb,
	params: {
		leadId: string;
		thankYouLeadName: string;
		leadEmail: string;
		intent: string;
		dontInviteToWhatsapp: boolean;
	}
): Promise<void> {
	const { leadId, thankYouLeadName, leadEmail, intent, dontInviteToWhatsapp } = params;
	const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
	const token = adminLeadGeneratePdfToken();
	await db.insert(pdfAccessTokens).values({
		leadId,
		token,
		pdfType: ADMIN_LEAD_PDF_TYPE,
		expiresAt
	});

	const useWhatsappTemplate = intent === 'whatsapp-lead' && dontInviteToWhatsapp;
	try {
		if (useWhatsappTemplate) {
			await sendWhatsappLeadThankYou({
				leadName: thankYouLeadName,
				leadEmail,
				pdfType: ADMIN_LEAD_PDF_TYPE,
				token
			});
		} else {
			await sendDirectContactThankYou({
				leadName: thankYouLeadName,
				leadEmail,
				pdfType: ADMIN_LEAD_PDF_TYPE,
				token
			});
		}
	} catch (emailErr) {
		console.error('SMTP error (manual lead PDF thank-you):', emailErr);
		await enqueueOutboundEmailJob(
			db,
			leadId,
			useWhatsappTemplate ? 'lead_whatsapp' : 'lead_thankyou',
			{
				leadName: thankYouLeadName,
				leadEmail,
				pdfType: ADMIN_LEAD_PDF_TYPE,
				token
			}
		);
	}
}

export function normalizeLeadEmail(value: string | null | undefined): string {
	if (value == null) return '';
	return value.trim().toLowerCase();
}
