#!/usr/bin/env node
/**
 * Move tracked but unreferenced images to unreferenced/ at repo root.
 * Referenced = used in app (Hero, Interior, FloorPlans, ContactSection, map.json, places, favicon).
 */

import { readFileSync, mkdirSync, renameSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';

const ROOT = join(process.cwd());
const UNREFERRED = join(ROOT, 'unreferenced');

// Paths or path prefixes that ARE referenced (keep in repo)
const REFERENCED = new Set([
	'fe/static/favicon.png',
	'fe/static/map/far.jpg',
	'fe/static/map/near.jpg',
	'fe/static/planos/plano-texturado-3.png',
	'fe/static/planos/plano-texturado-4.png',
	'fe/static/planos/2da-planta-3-deptos-a.png',
	'fe/static/planos/2 OCTUBRE_MODELO 2da PLANTA_2 DPTOS 1 DORM_1 DEPTO DOBLE.jpg',
]);
const REFERENCED_PREFIXES = [
	'fe/static/places/',
	'fe/src/lib/assets/carousel-hero/',
	'fe/src/lib/assets/carousel-interior/',
	'fe/src/lib/assets/places/',
];
const REFERENCED_EXACT = new Set(['fe/src/lib/assets/exteriores/exterior_03.png']);

function isReferenced(path) {
	if (REFERENCED.has(path) || REFERENCED_EXACT.has(path)) return true;
	return REFERENCED_PREFIXES.some((p) => path.startsWith(p));
}

const tracked = execSync('git ls-files', { encoding: 'utf8' })
	.split('\n')
	.filter((line) => /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(line));

const toMove = tracked.filter((p) => !isReferenced(p));

console.log(`Tracked images: ${tracked.length}, unreferenced: ${toMove.length}`);

for (const rel of toMove) {
	const src = join(ROOT, rel);
	const dest = join(UNREFERRED, rel);
	if (!existsSync(src)) {
		console.warn(`Skip (missing): ${rel}`);
		continue;
	}
	mkdirSync(dirname(dest), { recursive: true });
	renameSync(src, dest);
	execSync(`git rm --cached "${rel}"`, { cwd: ROOT, stdio: 'inherit' });
	console.log(`Moved: ${rel}`);
}

console.log(`Done. Moved ${toMove.length} files to unreferenced/`);
