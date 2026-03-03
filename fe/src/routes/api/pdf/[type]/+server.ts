/**
 * PDF Download API
 *
 * Validates one-time token, streams PDF from static folder, marks token as used,
 * and sets leads.email_verified_at on successful download.
 */
import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db/index.js';
import { leads, pdfAccessTokens } from '$lib/server/db/schema.js';
import { eq, and, isNull } from 'drizzle-orm';
import { readFile } from 'fs/promises';
import { join } from 'path';

const VALID_PDF_TYPES = ['ficha-tecnica', 'planos'] as const;
const STATIC_PDF_DIR = 'static/pdf';

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

	// Find valid token: exists, not expired, not used
	const [row] = await db
		.select()
		.from(pdfAccessTokens)
		.where(
			and(eq(pdfAccessTokens.token, token), eq(pdfAccessTokens.pdfType, type), isNull(pdfAccessTokens.usedAt))
		)
		.limit(1);

	if (!row) {
		throw error(404, 'Enlace de descarga no válido o ya utilizado.');
	}

	if (row.expiresAt < now) {
		throw error(410, 'El enlace de descarga ha expirado.');
	}

	const filename = `${type}.pdf`;
	const filePath = join(process.cwd(), STATIC_PDF_DIR, filename);

	let buffer: Buffer;
	try {
		buffer = await readFile(filePath);
	} catch (err) {
		console.error('PDF file not found:', filePath, err);
		throw error(500, 'Archivo no disponible.');
	}

	// Mark token as used and set email_verified_at on lead
	await db.update(pdfAccessTokens).set({ usedAt: now }).where(eq(pdfAccessTokens.id, row.id));

	await db
		.update(leads)
		.set({ emailVerifiedAt: now })
		.where(eq(leads.id, row.leadId));

	return new Response(new Uint8Array(buffer), {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `attachment; filename="${filename}"`,
			'Content-Length': String(buffer.length)
		}
	});
};
