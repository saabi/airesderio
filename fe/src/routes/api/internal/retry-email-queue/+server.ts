/**
 * Processes pending outbound email jobs (cron). Protect with CRON_SECRET.
 */
import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getDb } from '$lib/server/db/index.js';
import { processDueEmailOutboundJobs } from '$lib/server/emailRetryQueue.js';

export const POST: RequestHandler = async ({ request }) => {
	const secret = env.CRON_SECRET;
	if (!secret) {
		return json({ error: 'Cron not configured' }, { status: 503 });
	}

	const auth = request.headers.get('authorization');
	if (auth !== `Bearer ${secret}`) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const db = getDb();
		const result = await processDueEmailOutboundJobs(db);
		return json({ ok: true, ...result });
	} catch (e) {
		console.error('retry-email-queue:', e);
		return json({ error: 'Processing failed' }, { status: 500 });
	}
};
