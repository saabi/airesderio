#!/usr/bin/env node
/**
 * Import place gallery photos from docs/proposals/lugares-nuevos/ into
 * fe/static/places/{placeId}/ with normalized filenames and update map.json.
 * Run from repository root: node fe/scripts/import-lugares-nuevos.js
 */

import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const PROPOSAL_DIR = path.join(REPO_ROOT, 'docs', 'proposals', 'lugares-nuevos');
const STATIC_PLACES_DIR = path.join(REPO_ROOT, 'fe', 'static', 'places');
const MAP_JSON_PATH = path.join(REPO_ROOT, 'fe', 'static', 'places', 'map.json');

const FOLDER_TO_PLACE_ID = {
	'AV. ALVEAR-FORUM': 'forum',
	'AV. RIVADAVIA': 'avenida-rivadavia',
	'CALLE ROCA': 'avenida-roca',
	'CASA DE GOBIERNO': 'casa-de-gobierno',
	'CCB-CENTRO': 'ccb',
	'ESTADIO UNICO': 'estadio-unico',
	'MERCADO ARMONIA': 'mercado',
	'PARQUE AGUIRRE': 'parque-aguirre',
	'PEATONALES': 'peatonales',
	'PLAZA LIBERTAD': 'plaza-libertad',
	'TEATRO 25 DE MAYO': 'teatro-25-de-mayo',
	'TERMINAL DE OMNIBUS NESTOR KIRCHNER': 'terminal',
	'TRIBUNALES': 'tribunales'
};

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

/**
 * Normalize filename for URL-safe use: lowercase, replace non-alphanumeric sequences with single hyphen.
 * @param {string} filename
 * @returns {string}
 */
function normalizeFilename(filename) {
	const ext = path.extname(filename).toLowerCase();
	const base = path.basename(filename, ext);
	const normalized = base
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return (normalized || 'image') + ext;
}

async function readDirSafe(dirPath) {
	try {
		return await fs.readdir(dirPath, { withFileTypes: true });
	} catch (err) {
		if (err.code === 'ENOENT') return null;
		throw err;
	}
}

async function main() {
	const proposalEntries = await readDirSafe(PROPOSAL_DIR);
	if (!proposalEntries) {
		console.error('Proposal directory not found:', PROPOSAL_DIR);
		process.exitCode = 1;
		return;
	}

	const mapRaw = await fs.readFile(MAP_JSON_PATH, 'utf8');
	const mapData = JSON.parse(mapRaw);
	const placeById = new Map(mapData.places.map((p) => [p.id, p]));

	const addedByPlace = new Map();

	for (const entry of proposalEntries) {
		if (!entry.isDirectory()) continue;
		const placeId = FOLDER_TO_PLACE_ID[entry.name];
		if (!placeId) continue;

		const folderPath = path.join(PROPOSAL_DIR, entry.name);
		const files = await readDirSafe(folderPath);
		if (!files) continue;

		const place = placeById.get(placeId);
		if (!place) continue;
		if (!Array.isArray(place.photos)) place.photos = [];

		const destDir = path.join(STATIC_PLACES_DIR, placeId);
		await fs.mkdir(destDir, { recursive: true });

		const existingPhotos = new Set(place.photos);
		const added = [];

		for (const file of files) {
			if (!file.isFile()) continue;
			const ext = path.extname(file.name).toLowerCase();
			if (!IMAGE_EXTENSIONS.has(ext)) continue;

			const normalized = normalizeFilename(file.name);
			if (existingPhotos.has(normalized)) continue;

			const srcPath = path.join(folderPath, file.name);
			const destPath = path.join(destDir, normalized);
			await fs.copyFile(srcPath, destPath);
			existingPhotos.add(normalized);
			place.photos.push(normalized);
			added.push(normalized);
		}

		if (added.length > 0) {
			addedByPlace.set(placeId, added);
		}
	}

	await fs.writeFile(MAP_JSON_PATH, JSON.stringify(mapData, null, 2) + '\n', 'utf8');

	if (addedByPlace.size === 0) {
		console.log('No new photos added (all already present or no images in mapped folders).');
		return;
	}
	console.log('Added gallery photos:');
	for (const [placeId, filenames] of addedByPlace) {
		console.log(`  ${placeId}: ${filenames.length} photo(s) - ${filenames.slice(0, 3).join(', ')}${filenames.length > 3 ? '...' : ''}`);
	}
}

main().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
