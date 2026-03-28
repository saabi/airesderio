import { and, eq, isNull, lt, lte } from 'drizzle-orm';
import { getDb } from '$lib/server/db/index.js';
import { emailOutboundJobs } from '$lib/server/db/schema.js';
import {
	sendContactNotification,
	sendPdfDownloadLink,
	sendDirectContactThankYou
} from '$lib/server/email.js';

export type DbClient = ReturnType<typeof getDb>;

export type OutboundJobKind = 'team_notification' | 'lead_pdf' | 'lead_thankyou';

const RETRY_MS = 5 * 60 * 1000;

export async function enqueueOutboundEmailJob(
	db: DbClient,
	leadId: string,
	jobKind: OutboundJobKind,
	payload: Record<string, unknown>
): Promise<void> {
	const nextRetryAt = new Date(Date.now() + RETRY_MS);
	await db.insert(emailOutboundJobs).values({
		leadId,
		jobKind,
		payload: JSON.stringify(payload),
		nextRetryAt
	});
}

export async function processDueEmailOutboundJobs(
	db: DbClient
): Promise<{ processed: number; failedAttempts: number }> {
	const now = new Date();
	const jobs = await db
		.select()
		.from(emailOutboundJobs)
		.where(
			and(
				isNull(emailOutboundJobs.completedAt),
				lte(emailOutboundJobs.nextRetryAt, now),
				lt(emailOutboundJobs.attempts, emailOutboundJobs.maxAttempts)
			)
		);

	let processed = 0;
	let failedAttempts = 0;

	for (const job of jobs) {
		try {
			const payload = JSON.parse(job.payload) as Record<string, string | undefined>;

			switch (job.jobKind as OutboundJobKind) {
				case 'team_notification':
					await sendContactNotification({
						leadName: payload.leadName ?? '',
						leadEmail: payload.leadEmail ?? '',
						leadPhone: payload.leadPhone,
						leadMessage: payload.leadMessage,
						intent: payload.intent ?? 'direct-contact'
					});
					break;
				case 'lead_pdf':
					await sendPdfDownloadLink({
						leadName: payload.leadName ?? '',
						leadEmail: payload.leadEmail ?? '',
						pdfType: payload.pdfType ?? 'ficha-tecnica',
						token: payload.token ?? ''
					});
					break;
				case 'lead_thankyou':
					await sendDirectContactThankYou({
						leadName: payload.leadName ?? '',
						leadEmail: payload.leadEmail ?? ''
					});
					break;
				default:
					throw new Error(`Unknown job_kind: ${job.jobKind}`);
			}

			await db
				.update(emailOutboundJobs)
				.set({ completedAt: new Date() })
				.where(eq(emailOutboundJobs.id, job.id));
			processed++;
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			const newAttempts = job.attempts + 1;
			const nextRetryAt = new Date(Date.now() + RETRY_MS);
			const abandoned = newAttempts >= job.maxAttempts;
			if (abandoned) {
				console.error(`email_outbound_jobs ${job.id} abandoned after ${newAttempts} attempts:`, msg);
			}
			await db
				.update(emailOutboundJobs)
				.set({
					attempts: newAttempts,
					lastError: msg.slice(0, 4000),
					nextRetryAt,
					...(abandoned ? { completedAt: new Date() } : {})
				})
				.where(eq(emailOutboundJobs.id, job.id));
			failedAttempts++;
		}
	}

	return { processed, failedAttempts };
}
