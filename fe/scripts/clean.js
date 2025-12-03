#!/usr/bin/env node

/**
 * Clean script to remove Vite and SvelteKit cache directories
 * Removes:
 * - .svelte-kit/ (SvelteKit build cache)
 * - node_modules/.vite/ (Vite cache)
 * - .vite/ (Vite cache at root, if exists)
 */

import { rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const cacheDirs = ['.svelte-kit', 'node_modules/.vite', '.vite'];

console.log('🧹 Cleaning Vite and SvelteKit caches...\n');

let cleanedCount = 0;

for (const dir of cacheDirs) {
	const fullPath = join(projectRoot, dir);

	if (existsSync(fullPath)) {
		try {
			rmSync(fullPath, { recursive: true, force: true });
			console.log(`✅ Removed: ${dir}`);
			cleanedCount++;
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.error(`❌ Failed to remove ${dir}:`, message);
		}
	} else {
		console.log(`⏭️  Skipped: ${dir} (not found)`);
	}
}

console.log(
	`\n✨ Cleanup complete! Removed ${cleanedCount} cache ${cleanedCount === 1 ? 'directory' : 'directories'}.`
);
