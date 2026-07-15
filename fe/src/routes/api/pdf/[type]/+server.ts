/**
 * PDF Download API
 *
 * Validates access token, streams PDF from static folder, records first successful use,
 * and increments a per-email download counter.
 */
import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db/index.js';
import { leads, pdfAccessTokens } from '$lib/server/db/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { readFile } from 'fs/promises';
import { join } from 'path';

/** Current slug; legacy values kept so old email links still validate until tokens expire. */
const VALID_PDF_TYPES = [
	'departamentos',
	'ficha-tecnica',
	'ficha-tecnica-harmony',
	'ficha-tecnica-luxury',
	'planos'
] as const;

const STATIC_PDF_DIR = 'static/pdf';
/** Single PDF served for every valid type (see VALID_PDF_TYPES). */
const UNIFIED_PDF_FILENAME = 'Aires de Río - Ficha técnica.pdf';
/** ASCII-only fallback for Content-Disposition `filename` (RFC 5987 uses filename* for UTF-8). */
const UNIFIED_PDF_FILENAME_ASCII_FALLBACK = 'Aires-de-Rio-Ficha-tecnica.pdf';

function isPdfType(type: string): type is (typeof VALID_PDF_TYPES)[number] {
	return VALID_PDF_TYPES.includes(type as (typeof VALID_PDF_TYPES)[number]);
}

export const GET: import('@sveltejs/kit').RequestHandler = async ({ params, url }) => {
	const type = params.type;
	const token = url.searchParams.get('token');

	if (!type || !token) {
		throw error(400, 'Token requerido para descargar el PDF.');
	}

	if (!isPdfType(type)) {
		throw error(404, 'Tipo de PDF no válido.');
	}

	const db = getDb();
	const now = new Date();

	// Find valid token: exists and not expired (no longer single-use)
	const [row] = await db
		.select()
		.from(pdfAccessTokens)
		.where(
			and(eq(pdfAccessTokens.token, token), eq(pdfAccessTokens.pdfType, type))
		)
		.limit(1);

	if (!row) {
		throw error(404, 'Enlace de descarga no válido.');
	}

	if (row.expiresAt < now) {
		throw error(410, 'El enlace de descarga ha expirado.');
	}

	const filePath = join(process.cwd(), STATIC_PDF_DIR, UNIFIED_PDF_FILENAME);

	let buffer: Buffer;
	try {
		buffer = await readFile(filePath);
	} catch (err) {
		console.error('PDF file not found:', filePath, err);
		throw error(500, 'Archivo no disponible.');
	}

	// Mark first successful use timestamp (if not already set)
	if (!row.usedAt) {
		await db.update(pdfAccessTokens).set({ usedAt: now }).where(eq(pdfAccessTokens.id, row.id));
	}

	// Update lead: increment per-email download counter (use column ref so PG resolves type correctly)
	await db
		.update(leads)
		.set({
			downloadCount: sql`${leads.downloadCount} + 1`
		})
		.where(eq(leads.id, row.leadId));

	const forceDownload = url.searchParams.get('download') === '1';
	const dispositionType = forceDownload ? 'attachment' : 'inline';
	const disposition = `${dispositionType}; filename="${UNIFIED_PDF_FILENAME_ASCII_FALLBACK}"; filename*=UTF-8''${encodeURIComponent(UNIFIED_PDF_FILENAME)}`;

	return new Response(new Uint8Array(buffer), {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': disposition,
			'Content-Length': String(buffer.length)
		}
	});
};
