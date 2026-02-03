#!/usr/bin/env node
/**
 * Migration script: Transform places.json to new map.json format
 * 
 * This script:
 * 1. Reads the current places.json structure
 * 2. Transforms it to the new MapData format
 * 3. Extracts focal shape from hardcoded component values
 * 4. Outputs the new map.json
 * 
 * Run: node scripts/migrate-map-data.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const INPUT_PATH = join(__dirname, '../static/places/places.json');
const OUTPUT_PATH = join(__dirname, '../static/places/map.json');

// Hardcoded focal shapes from Map.svelte (lines 601-614)
// These need to be extracted and made data-driven
const FOCAL_SHAPES = [
	{
		type: 'path',
		d: 'm 202.97288,409.90271 2.2931,0.0425 0.29238,0.2863 -0.002,5.19212 -0.23275,0.44892 0.001,1.48465 -3.31504,-0.0163 -0.0239,-1.23152 0.11181,-5.11477 z'
	},
	{
		type: 'circle',
		cx: 203.69386,
		cy: 413.82022,
		r: 4.3814869
	}
];

/**
 * Transform a single place from old format to new format
 */
function transformPlace(id, oldPlace) {
	// Separate text elements (labels) from shape elements
	const shapeElements = [];
	const labels = [];

	for (const element of oldPlace.svg.elements) {
		if (element.type === 'text') {
			labels.push({
				type: 'text',
				x: element.x,
				y: element.y,
				content: element.content,
				...(element.xmlSpace && { xmlSpace: element.xmlSpace })
			});
		} else {
			shapeElements.push(element);
		}
	}

	// Determine shape: single shape or array
	const shape = shapeElements.length === 1 ? shapeElements[0] : shapeElements;

	const newPlace = {
		id,
		name: oldPlace.nombre,
		description: oldPlace.descripcion,
		details: oldPlace.thingstodo,
		photos: oldPlace.photos || [],
		shape,
		pin: oldPlace.svg.pin
	};

	// Only add labels if there are any
	if (labels.length > 0) {
		newPlace.labels = labels;
	}

	return newPlace;
}

/**
 * Main migration function
 */
function migrate() {
	console.log('Reading current places.json...');
	const input = JSON.parse(readFileSync(INPUT_PATH, 'utf-8'));

	console.log('Transforming data structure...');

	// Transform places from object to array
	const places = Object.entries(input.places).map(([id, place]) => 
		transformPlace(id, place)
	);

	// Build new structure
	// Note: width/height are read from the image at runtime, not stored in JSON
	const mapData = {
		baseImage: {
			src: input.mapConfig.farImage
		},
		detailImage: {
			src: input.mapConfig.nearImage,
			x: input.mapConfig.nearViewBox.x,
			y: input.mapConfig.nearViewBox.y,
			width: input.mapConfig.nearViewBox.width,
			height: input.mapConfig.nearViewBox.height
		},
		focal: {
			shapes: FOCAL_SHAPES,
			center: {
				cx: input.mapConfig.airesderioCenter.cx,
				cy: input.mapConfig.airesderioCenter.cy
			}
		},
		// Default radius for computed default view (when not showing detail image)
		defaultRadius: 50,
		places
	};

	console.log('Writing new map.json...');
	writeFileSync(OUTPUT_PATH, JSON.stringify(mapData, null, '\t'), 'utf-8');

	console.log(`
Migration complete!

Summary:
- Base image: ${mapData.baseImage.src} (${mapData.baseImage.width}x${mapData.baseImage.height})
- Detail image: ${mapData.detailImage.src}
- Focal center: (${mapData.focal.center.cx}, ${mapData.focal.center.cy})
- Focal shapes: ${mapData.focal.shapes.length}
- Places migrated: ${places.length}
- Places with labels: ${places.filter(p => p.labels).length}
- Places with photos: ${places.filter(p => p.photos.length > 0).length}

Output: ${OUTPUT_PATH}
`);
}

// Run migration
migrate();
