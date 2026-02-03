#!/usr/bin/env node
/**
 * Normalize coordinates in map.json
 * 
 * Normalization approach:
 * - Smallest dimension becomes 0-1
 * - Largest dimension scaled to maintain aspect ratio
 * - At runtime, multiply by image's smaller pixel dimension to denormalize
 * 
 * Run: node scripts/normalize-coordinates.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MAP_JSON_PATH = join(__dirname, '../static/places/map.json');
const OUTPUT_PATH = join(__dirname, '../static/places/map.json');

// Known bounding box from original SVG viewBox
const ORIGINAL_VIEWBOX = {
	x: 0,
	y: 0,
	width: 463.54998,
	height: 776.28749
};

// The smaller dimension for normalization
const SCALE_FACTOR = Math.min(ORIGINAL_VIEWBOX.width, ORIGINAL_VIEWBOX.height);

console.log('=== Coordinate Normalization ===\n');
console.log(`Original viewBox: ${ORIGINAL_VIEWBOX.width} x ${ORIGINAL_VIEWBOX.height}`);
console.log(`Scale factor (divide by): ${SCALE_FACTOR}`);
console.log(`Normalized X range: 0 to ${(ORIGINAL_VIEWBOX.width / SCALE_FACTOR).toFixed(6)}`);
console.log(`Normalized Y range: 0 to ${(ORIGINAL_VIEWBOX.height / SCALE_FACTOR).toFixed(6)}`);

// Normalize a single coordinate value
function normalizeValue(value) {
	return value / SCALE_FACTOR;
}

// Normalize an SVG path "d" attribute
function normalizePath(d) {
	// Replace all numbers with their normalized versions
	// This works because SVG path coordinates are just numbers
	return d.replace(/-?\d+\.?\d*/g, (match) => {
		const num = parseFloat(match);
		const normalized = normalizeValue(num);
		// Keep reasonable precision
		return normalized.toFixed(6).replace(/\.?0+$/, '');
	});
}

// Normalize a shape object
function normalizeShape(shape) {
	if (shape.type === 'path') {
		return {
			type: 'path',
			d: normalizePath(shape.d)
		};
	} else if (shape.type === 'rect') {
		return {
			type: 'rect',
			x: normalizeValue(shape.x),
			y: normalizeValue(shape.y),
			width: normalizeValue(shape.width),
			height: normalizeValue(shape.height)
		};
	} else if (shape.type === 'circle') {
		return {
			type: 'circle',
			cx: normalizeValue(shape.cx),
			cy: normalizeValue(shape.cy),
			r: normalizeValue(shape.r)
		};
	}
	return shape;
}

// Normalize a pin
function normalizePin(pin) {
	return {
		cx: normalizeValue(pin.cx),
		cy: normalizeValue(pin.cy),
		r: normalizeValue(pin.r)
	};
}

// Normalize a label
function normalizeLabel(label) {
	return {
		...label,
		x: normalizeValue(label.x),
		y: normalizeValue(label.y)
	};
}

// Main normalization
function normalize() {
	console.log('\nReading map.json...');
	const mapData = JSON.parse(readFileSync(MAP_JSON_PATH, 'utf-8'));
	
	// Normalize focal
	if (mapData.focal) {
		if (mapData.focal.shapes) {
			mapData.focal.shapes = mapData.focal.shapes.map(normalizeShape);
		}
		if (mapData.focal.center) {
			mapData.focal.center = {
				cx: normalizeValue(mapData.focal.center.cx),
				cy: normalizeValue(mapData.focal.center.cy)
			};
		}
	}
	
	// Normalize detail image bounds
	if (mapData.detailImage) {
		mapData.detailImage = {
			src: mapData.detailImage.src,
			x: normalizeValue(mapData.detailImage.x),
			y: normalizeValue(mapData.detailImage.y),
			width: normalizeValue(mapData.detailImage.width),
			height: normalizeValue(mapData.detailImage.height)
		};
	}
	
	// Normalize places
	if (mapData.places) {
		mapData.places = mapData.places.map(place => {
			const normalized = { ...place };
			
			// Normalize shape(s)
			if (Array.isArray(place.shape)) {
				normalized.shape = place.shape.map(normalizeShape);
			} else {
				normalized.shape = normalizeShape(place.shape);
			}
			
			// Normalize pin
			if (place.pin) {
				normalized.pin = normalizePin(place.pin);
			}
			
			// Normalize labels
			if (place.labels) {
				normalized.labels = place.labels.map(normalizeLabel);
			}
			
			return normalized;
		});
	}
	
	// Add normalization metadata
	mapData.coordinateSystem = {
		normalized: true,
		originalViewBox: ORIGINAL_VIEWBOX,
		scaleFactor: SCALE_FACTOR,
		note: "Coordinates are normalized. Smallest dimension = 1. Multiply by image's smaller pixel dimension to denormalize."
	};
	
	// Remove defaultRadius since it was in old coordinate system
	delete mapData.defaultRadius;
	
	console.log('Writing normalized map.json...');
	writeFileSync(OUTPUT_PATH, JSON.stringify(mapData, null, '\t'), 'utf-8');
	
	console.log('\n=== Normalization Complete ===');
	console.log(`\nTo denormalize at runtime:`);
	console.log(`  1. Load image and get its naturalWidth and naturalHeight`);
	console.log(`  2. Find smaller dimension: Math.min(width, height)`);
	console.log(`  3. Multiply all normalized coordinates by smaller dimension`);
	console.log(`\nExample for 2585x4385 image:`);
	console.log(`  Smaller dimension: 2585`);
	console.log(`  X range: 0 to ${(ORIGINAL_VIEWBOX.width / SCALE_FACTOR * 2585).toFixed(0)}`);
	console.log(`  Y range: 0 to ${(ORIGINAL_VIEWBOX.height / SCALE_FACTOR * 2585).toFixed(0)}`);
}

normalize();
