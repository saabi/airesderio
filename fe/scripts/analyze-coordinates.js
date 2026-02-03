#!/usr/bin/env node
/**
 * Analyze coordinates in map.json to find bounding box
 * 
 * Run: node scripts/analyze-coordinates.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MAP_JSON_PATH = join(__dirname, '../static/places/map.json');

// Parse SVG path "d" attribute to extract coordinates
function extractPathCoordinates(d) {
	const coords = [];
	// Match numbers (including negative and decimal)
	const numbers = d.match(/-?\d+\.?\d*/g);
	if (numbers) {
		for (let i = 0; i < numbers.length; i += 2) {
			if (i + 1 < numbers.length) {
				coords.push({
					x: parseFloat(numbers[i]),
					y: parseFloat(numbers[i + 1])
				});
			}
		}
	}
	return coords;
}

// Extract coordinates from a shape
function extractShapeCoordinates(shape) {
	const coords = [];
	
	if (shape.type === 'path') {
		coords.push(...extractPathCoordinates(shape.d));
	} else if (shape.type === 'rect') {
		coords.push({ x: shape.x, y: shape.y });
		coords.push({ x: shape.x + shape.width, y: shape.y + shape.height });
	} else if (shape.type === 'circle') {
		coords.push({ x: shape.cx - shape.r, y: shape.cy - shape.r });
		coords.push({ x: shape.cx + shape.r, y: shape.cy + shape.r });
	}
	
	return coords;
}

// Main analysis
function analyze() {
	console.log('Reading map.json...\n');
	const mapData = JSON.parse(readFileSync(MAP_JSON_PATH, 'utf-8'));
	
	let minX = Infinity, maxX = -Infinity;
	let minY = Infinity, maxY = -Infinity;
	
	const allCoords = [];
	
	// Focal shapes
	if (mapData.focal?.shapes) {
		for (const shape of mapData.focal.shapes) {
			allCoords.push(...extractShapeCoordinates(shape));
		}
	}
	
	// Focal center
	if (mapData.focal?.center) {
		allCoords.push({ x: mapData.focal.center.cx, y: mapData.focal.center.cy });
	}
	
	// Places
	for (const place of mapData.places || []) {
		// Shape(s)
		const shapes = Array.isArray(place.shape) ? place.shape : [place.shape];
		for (const shape of shapes) {
			allCoords.push(...extractShapeCoordinates(shape));
		}
		
		// Pin
		if (place.pin) {
			allCoords.push({ x: place.pin.cx, y: place.pin.cy });
		}
		
		// Labels
		for (const label of place.labels || []) {
			allCoords.push({ x: label.x, y: label.y });
		}
	}
	
	// Detail image bounds
	if (mapData.detailImage) {
		allCoords.push({ x: mapData.detailImage.x, y: mapData.detailImage.y });
		allCoords.push({ 
			x: mapData.detailImage.x + mapData.detailImage.width, 
			y: mapData.detailImage.y + mapData.detailImage.height 
		});
	}
	
	// Calculate bounds
	for (const coord of allCoords) {
		if (coord.x < minX) minX = coord.x;
		if (coord.x > maxX) maxX = coord.x;
		if (coord.y < minY) minY = coord.y;
		if (coord.y > maxY) maxY = coord.y;
	}
	
	const width = maxX - minX;
	const height = maxY - minY;
	const aspectRatio = width / height;
	
	console.log('=== Bounding Box Analysis ===\n');
	console.log(`Total coordinates analyzed: ${allCoords.length}`);
	console.log(`\nBounding Box:`);
	console.log(`  Min: (${minX.toFixed(2)}, ${minY.toFixed(2)})`);
	console.log(`  Max: (${maxX.toFixed(2)}, ${maxY.toFixed(2)})`);
	console.log(`\nDimensions:`);
	console.log(`  Width:  ${width.toFixed(2)}`);
	console.log(`  Height: ${height.toFixed(2)}`);
	console.log(`  Aspect Ratio (W/H): ${aspectRatio.toFixed(4)}`);
	
	// Image dimensions for comparison
	console.log(`\n=== For Normalization ===`);
	console.log(`\nImage dimensions: 2585 x 4385 pixels`);
	console.log(`Image aspect ratio: ${(2585/4385).toFixed(4)}`);
	
	const smallerDim = Math.min(width, height);
	const smallerDimName = width < height ? 'Width' : 'Height';
	
	console.log(`\nSmaller dimension: ${smallerDimName} (${smallerDim.toFixed(2)})`);
	console.log(`\nNormalization (smallest dim = 1):`);
	console.log(`  X range: 0 to ${(width / smallerDim).toFixed(4)}`);
	console.log(`  Y range: 0 to ${(height / smallerDim).toFixed(4)}`);
	
	console.log(`\nScaling factor from current to normalized:`);
	console.log(`  divide by: ${smallerDim.toFixed(4)}`);
	
	console.log(`\nTo denormalize for image (2585 x 4385):`);
	const imgSmallerDim = Math.min(2585, 4385);
	console.log(`  multiply normalized coords by: ${imgSmallerDim} (smaller image dimension)`);
	console.log(`  X will range: 0 to ${((width / smallerDim) * imgSmallerDim).toFixed(0)}`);
	console.log(`  Y will range: 0 to ${((height / smallerDim) * imgSmallerDim).toFixed(0)}`);
}

analyze();
