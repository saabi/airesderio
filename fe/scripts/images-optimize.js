#!/usr/bin/env node
/**
 * Resize and compress images per category rules; write WebP siblings.
 * Overwrites originals in place. Run: npm run images:optimize (from fe/)
 *
 * Supports --only=hero|interior|planos|exteriores|places to run a single category.
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { statSync, renameSync, unlinkSync } from 'fs';
import sharp from 'sharp';
import { IMAGE_RULES, expandFilesForRule } from './image-rules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const STATIC_DIR = join(ROOT, 'static');

const onlyCategory = process.argv.find((a) => a.startsWith('--only='))?.slice(7);
const rules = onlyCategory
	? IMAGE_RULES.filter((r) => r.name === onlyCategory)
	: IMAGE_RULES;

if (onlyCategory && rules.length === 0) {
	console.error(`Unknown category: ${onlyCategory}`);
	process.exit(1);
}

function formatBytes(n) {
	if (n >= 1024 * 1024) return (n / (1024 * 1024)).toFixed(2) + ' MB';
	if (n >= 1024) return (n / 1024).toFixed(1) + ' KB';
	return n + ' B';
}

/**
 * Check if image is within max dimensions for the rule.
 * @param {{ width?: number; height?: number }} meta
 * @param {typeof IMAGE_RULES[0]} rule
 */
function withinDimensions(meta, rule) {
	const w = meta.width ?? 0;
	const h = meta.height ?? 0;
	if (rule.maxLongSide != null) {
		return Math.max(w, h) <= rule.maxLongSide;
	}
	if (rule.maxWidth != null && rule.maxHeight != null) {
		return w <= rule.maxWidth && h <= rule.maxHeight;
	}
	return true;
}

/**
 * Compute target width/height for resize (fit inside box or long side).
 * @param {{ width?: number; height?: number }} meta
 * @param {typeof IMAGE_RULES[0]} rule
 */
function resizeTarget(meta, rule) {
	const w = meta.width ?? 0;
	const h = meta.height ?? 0;
	if (rule.maxLongSide != null) {
		const longest = Math.max(w, h);
		if (longest <= rule.maxLongSide) return { w, h };
		const scale = rule.maxLongSide / longest;
		return { w: Math.round(w * scale), h: Math.round(h * scale) };
	}
	if (rule.maxWidth != null && rule.maxHeight != null) {
		return sharp({ create: { width: w, height: h, channels: 3 } })
			.resize(rule.maxWidth, rule.maxHeight, { fit: 'inside', withoutEnlargement: true })
			.raw()
			.toBuffer({ resolveWithObject: true })
			.then((info) => ({ w: info.info.width, h: info.info.height }))
			.catch(() => ({ w, h }));
	}
	return Promise.resolve({ w, h });
}

// Sync version: compute target dimensions without sharp
function resizeTargetSync(meta, rule) {
	const w = meta.width ?? 0;
	const h = meta.height ?? 0;
	if (rule.maxLongSide != null) {
		const longest = Math.max(w, h);
		if (longest <= rule.maxLongSide) return { w, h };
		const scale = rule.maxLongSide / longest;
		return { w: Math.round(w * scale), h: Math.round(h * scale) };
	}
	if (rule.maxWidth != null && rule.maxHeight != null) {
		const scale = Math.min(
			rule.maxWidth / w,
			rule.maxHeight / h,
			1
		);
		if (scale >= 1) return { w, h };
		return { w: Math.round(w * scale), h: Math.round(h * scale) };
	}
	return { w, h };
}

/**
 * Process one image: optionally resize/recompress and overwrite, then write WebP.
 * @param {string} filePath
 * @param {typeof IMAGE_RULES[0]} rule
 */
async function processFile(filePath, rule) {
	const meta = await sharp(filePath).metadata();
	const sizeBefore = statSync(filePath).size;
	const w = meta.width ?? 0;
	const h = meta.height ?? 0;
	const skipThreshold = rule.skipIfUnderBytes;
	const canSkip = withinDimensions(meta, rule) && (skipThreshold == null || sizeBefore < skipThreshold);

	const outputJpg = rule.outputFormat === 'jpg';
	const targetRasterPath = outputJpg
		? filePath.replace(/\.(jpe?g|png)$/i, '.jpg')
		: filePath;
	const webpPath = targetRasterPath.replace(/\.(jpe?g|png)$/i, '.webp');

	const preserveAlpha = rule.name === 'planos' && filePath.toLowerCase().endsWith('.png');

	if (outputJpg) {
		// Hero (and any rule with outputFormat 'jpg'): always emit JPG fallback + WebP; remove original PNG if present.
		// When source is already .jpg, write to .tmp then rename so sharp never uses same file for input and output.
		const jpgOutPath = filePath === targetRasterPath ? filePath + '.tmp' : targetRasterPath;
		if (canSkip) {
			await sharp(filePath)
				.jpeg({ quality: rule.jpegQuality, mozjpeg: true })
				.toFile(jpgOutPath);
			if (jpgOutPath !== targetRasterPath) {
				renameSync(jpgOutPath, targetRasterPath);
			}
			await sharp(targetRasterPath)
				.webp({ quality: rule.webpQuality })
				.toFile(webpPath);
			if (filePath !== targetRasterPath) unlinkSync(filePath);
			console.log(`  ${filePath.replace(STATIC_DIR, '')} (unchanged) → .jpg + .webp`);
		} else {
			const { w: targetW, h: targetH } = resizeTargetSync(meta, rule);
			await sharp(filePath)
				.resize(targetW, targetH, { fit: 'inside', withoutEnlargement: true })
				.jpeg({ quality: rule.jpegQuality, mozjpeg: true })
				.toFile(jpgOutPath);
			if (jpgOutPath !== targetRasterPath) {
				renameSync(jpgOutPath, targetRasterPath);
			}
			const sizeAfter = statSync(targetRasterPath).size;
			await sharp(targetRasterPath)
				.webp({ quality: rule.webpQuality })
				.toFile(webpPath);
			if (filePath !== targetRasterPath) unlinkSync(filePath);
			console.log(
				`  ${filePath.replace(STATIC_DIR, '')} ${targetW}×${targetH} ${formatBytes(sizeBefore)} → ${formatBytes(sizeAfter)} .jpg + .webp`
			);
		}
		return;
	}

	if (canSkip) {
		await sharp(filePath)
			.webp(
				preserveAlpha
					? { quality: rule.webpQuality, alphaQuality: 100 }
					: { quality: rule.webpQuality }
			)
			.toFile(webpPath);
		console.log(`  ${filePath.replace(STATIC_DIR, '')} (unchanged) → .webp`);
		return;
	}

	const { w: targetW, h: targetH } = resizeTargetSync(meta, rule);
	const isPng = filePath.toLowerCase().endsWith('.png');

	let pipeline = sharp(filePath).resize(targetW, targetH, { fit: 'inside', withoutEnlargement: true });

	if (isPng) {
		await pipeline
			.png({ compressionLevel: 9, effort: 10 })
			.toFile(filePath + '.tmp');
	} else {
		await pipeline
			.jpeg({ quality: rule.jpegQuality, mozjpeg: true })
			.toFile(filePath + '.tmp');
	}

	renameSync(filePath + '.tmp', filePath);
	const sizeAfter = statSync(filePath).size;

	await sharp(filePath)
		.webp(
			preserveAlpha
				? { quality: rule.webpQuality, alphaQuality: 100 }
				: { quality: rule.webpQuality }
		)
		.toFile(webpPath);

	console.log(
		`  ${filePath.replace(STATIC_DIR, '')} ${targetW}×${targetH} ${formatBytes(sizeBefore)} → ${formatBytes(sizeAfter)} + .webp`
	);
}

async function main() {
	console.log('Image optimize (fe/static)' + (onlyCategory ? ` --only=${onlyCategory}` : '') + '\n');

	for (const rule of rules) {
		const files = expandFilesForRule(STATIC_DIR, rule);
		if (files.length === 0) {
			console.log(`[${rule.name}] no files\n`);
			continue;
		}
		console.log(`[${rule.name}] ${files.length} file(s)`);
		for (const fp of files) {
			await processFile(fp, rule);
		}
		console.log('');
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
