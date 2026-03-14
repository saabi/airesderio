/**
 * Per-category image optimization rules for analyze and optimize scripts.
 * Paths are relative to fe/static/.
 *
 * @typedef {Object} ImageCategoryRule
 * @property {string} name - Category id (hero, interior, planos, exteriores, places)
 * @property {string} glob - Pattern: "dir/*.ext" or "dir/**" with extensions
 * @property {string[]} [extensions] - For recursive glob (e.g. places), which extensions to include
 * @property {number|null} maxWidth - Max width (fit inside); null if using maxLongSide
 * @property {number|null} maxHeight - Max height (fit inside); null if using maxLongSide
 * @property {number|null} maxLongSide - Max px on longest side (for planos/exteriores)
 * @property {number} jpegQuality - Quality for JPEG output (e.g. 82-92)
 * @property {number} webpQuality - Quality for WebP sibling
 * @property {number|null} skipIfUnderBytes - If within dimensions and smaller than this, only emit WebP
 */

import { readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Expand a category rule to absolute file paths under staticDir.
 * @param {string} staticDir - Absolute path to fe/static
 * @param {ImageCategoryRule} rule
 * @returns {string[]} Absolute paths to image files
 */
export function expandFilesForRule(staticDir, rule) {
	const paths = [];
	if (rule.extensions) {
		// Recursive: e.g. places/**/* with extensions ['.jpg', '.jpeg', '.png']
		const dir = join(staticDir, rule.glob.split('/')[0]);
		function walk(d) {
			try {
				const entries = readdirSync(d, { withFileTypes: true });
				for (const e of entries) {
					const full = join(d, e.name);
					if (e.isDirectory()) {
						walk(full);
					} else if (e.isFile() && rule.extensions.some((ext) => e.name.toLowerCase().endsWith(ext))) {
						paths.push(full);
					}
				}
			} catch (err) {
				if (err.code !== 'ENOENT') throw err;
			}
		}
		walk(dir);
	} else {
		// Single dir: e.g. "carrousel-hero/*.jpg"
		const [dir, pattern] = rule.glob.split('/');
		const ext = pattern?.replace('*', '') || '';
		const dirPath = join(staticDir, dir);
		try {
			const entries = readdirSync(dirPath, { withFileTypes: true });
			for (const e of entries) {
				if (e.isFile() && e.name.toLowerCase().endsWith(ext)) {
					paths.push(join(dirPath, e.name));
				}
			}
		} catch (err) {
			if (err.code !== 'ENOENT') throw err;
		}
	}
	return paths;
}

/** @type {ImageCategoryRule[]} */
export const IMAGE_RULES = [
	{
		name: 'hero',
		glob: 'carrousel-hero',
		extensions: ['.jpg', '.jpeg', '.png'],
		maxWidth: 1920,
		maxHeight: 1080,
		maxLongSide: null,
		jpegQuality: 84,
		webpQuality: 81,
		skipIfUnderBytes: 250 * 1024
	},
	{
		name: 'interior',
		glob: 'carrousel-interior/*.png',
		maxWidth: 1920,
		maxHeight: 1080,
		maxLongSide: null,
		jpegQuality: 81,
		webpQuality: 79,
		skipIfUnderBytes: 250 * 1024
	},
	{
		name: 'planos',
		glob: 'planos/*.png',
		maxWidth: null,
		maxHeight: null,
		maxLongSide: 2400,
		jpegQuality: 90,
		webpQuality: 90,
		skipIfUnderBytes: 500 * 1024
	},
	{
		name: 'exteriores',
		glob: 'exteriores/*.png',
		maxWidth: null,
		maxHeight: null,
		maxLongSide: 1920,
		jpegQuality: 84,
		webpQuality: 81,
		skipIfUnderBytes: null
	},
	{
		name: 'places',
		glob: 'places/**/*',
		extensions: ['.jpg', '.jpeg', '.png'],
		maxWidth: 1920,
		maxHeight: 1080,
		maxLongSide: null,
		jpegQuality: 84,
		webpQuality: 81,
		skipIfUnderBytes: 250 * 1024
	}
];
