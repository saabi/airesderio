#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LUGARES_JSON_PATH = path.resolve(
	__dirname,
	'..',
	'static',
	'lugares',
	'lugares-direcciones.json'
);

const DEFAULT_REFERENCE_COORDS = {
	lat: -27.779686,
	lng: -64.258992
};

const DISTANCE_BANDS = [
	{ max: 200, categoria: 'MUY CERCA', cuadras: '0-3 cuadras' },
	{ max: 800, categoria: 'CERCANO', cuadras: '3-8 cuadras' },
	{ max: Infinity, categoria: 'MODERADAMENTE DISTANTE', cuadras: 'más de 8 cuadras' }
];

function parseArgs(argv) {
	const options = {
		dryRun: false,
		placeFilter: null,
		referenceOverride: { lat: null, lng: null }
	};

	for (const arg of argv) {
		if (arg === '--dry-run') {
			options.dryRun = true;
		} else if (arg.startsWith('--place=')) {
			options.placeFilter = arg.slice('--place='.length);
		} else if (arg.startsWith('--ref-lat=')) {
			options.referenceOverride.lat = Number(arg.slice('--ref-lat='.length));
		} else if (arg.startsWith('--ref-lng=')) {
			options.referenceOverride.lng = Number(arg.slice('--ref-lng='.length));
		} else if (arg === '--help') {
			printHelp();
			process.exit(0);
		} else {
			console.warn(`Unknown argument ignored: ${arg}`);
		}
	}

	return options;
}

function printHelp() {
	console.log(`Usage: node scripts/updatePlaceGeo.js [options]

Options:
  --dry-run           Compute updates without writing to the JSON file
  --place=cat/id      Only process a specific place (e.g. transporte/terminal_omnibus)
  --ref-lat=value     Override reference latitude for distance calculations
  --ref-lng=value     Override reference longitude for distance calculations
  --help              Show this message

Environment:
  GOOGLE_MAPS_API_KEY (required) - Google Maps Geocoding API key
`);
}

function selectDistanceBand(distanceMeters) {
	return (
		DISTANCE_BANDS.find((band) => distanceMeters <= band.max) ??
		DISTANCE_BANDS[DISTANCE_BANDS.length - 1]
	);
}

function formatDistance(distanceMeters) {
	if (!Number.isFinite(distanceMeters) || distanceMeters < 0) {
		return 'Distancia no disponible';
	}
	if (distanceMeters <= 1) {
		return '0 m (ubicación base)';
	}
	if (distanceMeters >= 1000) {
		const km = distanceMeters / 1000;
		const rounded = km >= 10 ? Math.round(km) : Math.round(km * 10) / 10;
		return `~${rounded} km del apartamento`;
	}
	const rounded = Math.round(distanceMeters / 10) * 10;
	return `~${rounded} m del apartamento`;
}

function haversineMeters(origin, target) {
	const R = 6371000;
	const toRad = (deg) => (deg * Math.PI) / 180;

	const dLat = toRad(target.lat - origin.lat);
	const dLng = toRad(target.lng - origin.lng);

	const lat1 = toRad(origin.lat);
	const lat2 = toRad(target.lat);

	const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return Math.round(R * c);
}

function buildQuery(place) {
	const hints = [place.nombre, place.direccion, 'Santiago del Estero', 'Argentina'].filter(Boolean);

	return hints.join(', ');
}

async function geocode(query, apiKey) {
	const params = new URLSearchParams({
		address: query,
		key: apiKey,
		region: 'ar'
	});

	const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Google Geocoding request failed (${response.status} ${response.statusText})`);
	}

	const payload = await response.json();

	if (payload.status === 'OK' && payload.results.length > 0) {
		return payload.results[0];
	}

	if (payload.status === 'ZERO_RESULTS') {
		return null;
	}

	throw new Error(`Geocoding error: ${payload.status} - ${payload.error_message ?? 'no message'}`);
}

function shouldProcess(placeFilter, categoryKey, placeKey, placeData) {
	if (!placeFilter) return true;
	if (placeFilter === placeKey) return true;

	return `${categoryKey}/${placeKey}` === placeFilter;
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_API_KEY;

	if (!apiKey) {
		console.error('Missing GOOGLE_MAPS_API_KEY environment variable.');
		process.exitCode = 1;
		return;
	}

	const raw = await fs.readFile(LUGARES_JSON_PATH, 'utf8');
	const data = JSON.parse(raw);

	if (!data || typeof data !== 'object' || !data.lugares) {
		throw new Error("Unexpected JSON structure: missing 'lugares'.");
	}

	const metadata = data.metadata ?? (data.metadata = {});
	const referenceCoords = {
		lat: Number.isFinite(options.referenceOverride.lat)
			? options.referenceOverride.lat
			: (metadata.apartment_reference_coords?.lat ?? DEFAULT_REFERENCE_COORDS.lat),
		lng: Number.isFinite(options.referenceOverride.lng)
			? options.referenceOverride.lng
			: (metadata.apartment_reference_coords?.lng ?? DEFAULT_REFERENCE_COORDS.lng)
	};

	if (!metadata.apartment_reference_coords) {
		metadata.apartment_reference_coords = referenceCoords;
	}

	const pending = [];
	const changes = [];

	for (const [categoryKey, places] of Object.entries(data.lugares)) {
		for (const [placeKey, placeData] of Object.entries(places)) {
			if (!shouldProcess(options.placeFilter, categoryKey, placeKey, placeData)) {
				continue;
			}

			const query = buildQuery(placeData);

			try {
				const result = await geocode(query, apiKey);

				if (!result) {
					console.warn(`No geocoding result for ${categoryKey}/${placeKey} (${query})`);
					pending.push(`${categoryKey}/${placeKey}`);
					continue;
				}

				const { lat, lng } = result.geometry.location;
				placeData.coordenadas_aproximadas = { lat, lng };

				const distanceMeters = haversineMeters(referenceCoords, { lat, lng });
				const band = selectDistanceBand(distanceMeters);

				placeData.distancia_metros = distanceMeters;
				placeData.distancia_aproximada = formatDistance(distanceMeters);
				placeData.distancia_categoria = band.categoria;
				placeData.distancia_cuadras = band.cuadras;

				if (!placeData.fuente_coordenadas) {
					placeData.fuente_coordenadas = 'Google Maps Geocoding API';
				}

				changes.push(`${categoryKey}/${placeKey}`);
			} catch (error) {
				console.warn(`Failed to geocode ${categoryKey}/${placeKey}: ${error.message}`);
				pending.push(`${categoryKey}/${placeKey}`);
			}
		}
	}

	if (changes.length === 0 && pending.length === 0) {
		console.log('No places processed. Specify --place or ensure entries require updates.');
		return;
	}

	console.log(`Processed ${changes.length} place(s).`);

	if (options.dryRun) {
		console.log('Dry run complete; no changes written.');
	} else if (changes.length > 0 || !metadata.apartment_reference_coords) {
		const updatedJson = JSON.stringify(data, null, 2) + '\n';
		await fs.writeFile(LUGARES_JSON_PATH, updatedJson, 'utf8');
		console.log(`Updated ${LUGARES_JSON_PATH}`);
	}

	if (pending.length > 0) {
		console.warn(`Could not geocode ${pending.length} place(s):`);
		for (const id of pending) {
			console.warn(` - ${id}`);
		}
		process.exitCode = 1;
	}
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
