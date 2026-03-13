#!/usr/bin/env node
/**
 * Analyze image directories: report dimensions and file sizes per category.
 * Run: npm run images:analyze (from fe/)
 *
 * Uses rules from image-rules.js. Does not modify any files.
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { statSync } from 'fs';
import sharp from 'sharp';
import { IMAGE_RULES, expandFilesForRule } from './image-rules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const STATIC_DIR = join(ROOT, 'static');

/**
 * @param {sharp.Metadata} meta
 * @param {{ maxWidth?: number|null; maxHeight?: number|null; maxLongSide?: number|null }} rule
 */
function isOverMaxDimensions(meta, rule) {
	const w = meta.width ?? 0;
	const h = meta.height ?? 0;
	if (rule.maxLongSide != null) {
		return Math.max(w, h) > rule.maxLongSide;
	}
	if (rule.maxWidth != null && rule.maxHeight != null) {
		return w > rule.maxWidth || h > rule.maxHeight;
	}
	return false;
}

async function getMeta(filePath) {
	try {
		const meta = await sharp(filePath).metadata();
		const stat = statSync(filePath);
		return { ...meta, size: stat.size };
	} catch (err) {
		return null;
	}
}

function formatBytes(n) {
	if (n >= 1024 * 1024) return (n / (1024 * 1024)).toFixed(2) + ' MB';
	if (n >= 1024) return (n / 1024).toFixed(1) + ' KB';
	return n + ' B';
}

async function main() {
	console.log('Image analysis (fe/static)\n');

	const rows = [];

	for (const rule of IMAGE_RULES) {
		const files = expandFilesForRule(STATIC_DIR, rule);
		if (files.length === 0) {
			rows.push({
				category: rule.name,
				count: 0,
				totalMB: '0',
				minSize: '-',
				avgSize: '-',
				maxSize: '-',
				overMax: 0
			});
			continue;
		}

		const metas = await Promise.all(files.map((f) => getMeta(f)));
		const valid = metas.filter(Boolean);
		const sizes = valid.map((m) => m.size);
		const totalBytes = sizes.reduce((a, b) => a + b, 0);
		const overMax = valid.filter((m) => isOverMaxDimensions(m, rule)).length;

		rows.push({
			category: rule.name,
			count: files.length,
			totalMB: (totalBytes / (1024 * 1024)).toFixed(2),
			minSize: sizes.length ? formatBytes(Math.min(...sizes)) : '-',
			avgSize: sizes.length ? formatBytes(Math.round(totalBytes / sizes.length)) : '-',
			maxSize: sizes.length ? formatBytes(Math.max(...sizes)) : '-',
			overMax
		});
	}

	// Table
	const col = (str, w) => String(str).padEnd(w);
	console.log(col('Category', 14) + col('Count', 8) + col('Total', 12) + col('Min', 12) + col('Avg', 12) + col('Max', 12) + 'Over max');
	console.log('-'.repeat(80));
	for (const r of rows) {
		console.log(
			col(r.category, 14) +
				col(r.count, 8) +
				col(r.totalMB + ' MB', 12) +
				col(r.minSize, 12) +
				col(r.avgSize, 12) +
				col(r.maxSize, 12) +
				r.overMax
		);
	}
	const totalCount = rows.reduce((a, r) => a + r.count, 0);
	const totalMB = rows.reduce((a, r) => a + parseFloat(r.totalMB), 0);
	console.log('-'.repeat(80));
	console.log(col('TOTAL', 14) + col(totalCount, 8) + col(totalMB.toFixed(2) + ' MB', 12));
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
