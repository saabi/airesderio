/**
 * Generate og-image.jpg (1200x630) for social sharing preview.
 *
 * Run: node scripts/generate-og-image.js
 *
 * Uses the first hero carousel image as source. Replace with a custom
 * design when a proper OG image is available.
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = join(__dirname, '..');
const SOURCE = join(ROOT, 'static', 'carrousel-hero', 'desktop', 'd-2-frente-edificio.jpg');
const OUT = join(ROOT, 'static', 'og-image.jpg');

await sharp(SOURCE)
	.resize(1200, 630, { fit: 'cover', position: 'center' })
	.jpeg({ quality: 85 })
	.toFile(OUT);

console.log('Generated og-image.jpg (1200x630)');
