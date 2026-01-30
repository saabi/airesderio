import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read places.json
const placesJsonPath = path.join(__dirname, '../static/places/places.json');
const placesData = JSON.parse(fs.readFileSync(placesJsonPath, 'utf-8'));

// Transform structure: merge shape and additionalElements into elements array
Object.keys(placesData.places).forEach(placeId => {
	const place = placesData.places[placeId];
	if (place.svg) {
		const elements = [];
		
		// Add the main shape as the first element
		if (place.svg.shape) {
			elements.push(place.svg.shape);
		}
		
		// Add additional elements if they exist
		if (place.svg.additionalElements) {
			elements.push(...place.svg.additionalElements);
		}
		
		// Replace shape and additionalElements with elements array
		place.svg.elements = elements;
		delete place.svg.shape;
		delete place.svg.additionalElements;
	}
});

// Write updated places.json
fs.writeFileSync(placesJsonPath, JSON.stringify(placesData, null, '\t'));

console.log('SVG structure transformed: merged shape and additionalElements into elements array');
