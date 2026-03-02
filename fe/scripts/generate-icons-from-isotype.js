/**
 * Generate favicon and manifest icons from airesderio-isotype.svg
 *
 * Run: node scripts/generate-icons-from-isotype.js
 *
 * Outputs:
 *   static/favicon.png (48x48)
 *   static/icon-192.png
 *   static/icon-512.png
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = join(__dirname, '..');
const SVG_PATH = join(ROOT, 'static', 'airesderio-isotype.svg');
const SIZES = [
	{ name: 'favicon.png', size: 48 },
	{ name: 'icon-192.png', size: 192 },
	{ name: 'icon-512.png', size: 512 }
];

const svgBuffer = readFileSync(SVG_PATH);

for (const { name, size } of SIZES) {
	const outPath = join(ROOT, 'static', name);
	await sharp(svgBuffer)
		.resize(size, size)
		.png()
		.toFile(outPath);
	console.log(`Generated ${name} (${size}x${size})`);
}
