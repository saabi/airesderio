import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Map.svelte to extract SVG data
const mapSveltePath = path.join(__dirname, '../src/lib/components/features/Map.svelte');
const placesJsonPath = path.join(__dirname, '../static/places/places.json');

const mapContent = fs.readFileSync(mapSveltePath, 'utf-8');
const placesData = JSON.parse(fs.readFileSync(placesJsonPath, 'utf-8'));

// Extract SVG data from Map.svelte
const svgData = {};

// First, find the places group content
const placesGroupMatch = mapContent.match(/<g id='places'[^>]*>([\s\S]*?)<\/g>/);
if (!placesGroupMatch) {
  console.error('Could not find places group');
  process.exit(1);
}

const placesGroupContent = placesGroupMatch[1];

// Extract place groups and their SVG elements (only inside places group)
const placeGroupRegex = /<g id='([^']+)'[^>]*>([\s\S]*?)<\/g>/g;
let match;

while ((match = placeGroupRegex.exec(placesGroupContent)) !== null) {
  const placeId = match[1];
  const groupContent = match[2];
  
  // Extract shape element (path, rect, or circle with class='place-path')
  let shape = null;
  
  // Try path
  const pathMatch = groupContent.match(/<(path|rect|circle)[^>]*class=['"]place-path['"][^>]*>/);
  if (pathMatch) {
    const elementType = pathMatch[1];
    if (elementType === 'path') {
      const dMatch = groupContent.match(/d=['"]([^'"]+)['"]/);
      if (dMatch) {
        shape = { type: 'path', d: dMatch[1] };
      }
    } else if (elementType === 'rect') {
      const xMatch = groupContent.match(/x=['"]([^'"]+)['"]/);
      const yMatch = groupContent.match(/y=['"]([^'"]+)['"]/);
      const widthMatch = groupContent.match(/width=['"]([^'"]+)['"]/);
      const heightMatch = groupContent.match(/height=['"]([^'"]+)['"]/);
      if (xMatch && yMatch && widthMatch && heightMatch) {
        shape = {
          type: 'rect',
          x: parseFloat(xMatch[1]),
          y: parseFloat(yMatch[1]),
          width: parseFloat(widthMatch[1]),
          height: parseFloat(heightMatch[1])
        };
      }
    } else if (elementType === 'circle') {
      const cxMatch = groupContent.match(/cx=['"]([^'"]+)['"]/);
      const cyMatch = groupContent.match(/cy=['"]([^'"]+)['"]/);
      const rMatch = groupContent.match(/r=['"]([^'"]+)['"]/);
      if (cxMatch && cyMatch && rMatch) {
        shape = {
          type: 'circle',
          cx: parseFloat(cxMatch[1]),
          cy: parseFloat(cyMatch[1]),
          r: parseFloat(rMatch[1])
        };
      }
    }
  }
  
  // Extract pin circle
  const pinMatch = groupContent.match(/<circle[^>]*class=['"]pin-circle['"][^>]*cx=['"]([^'"]+)['"][^>]*cy=['"]([^'"]+)['"][^>]*r=['"]([^'"]+)['"]/);
  let pin = null;
  if (pinMatch) {
    pin = {
      cx: parseFloat(pinMatch[1]),
      cy: parseFloat(pinMatch[2]),
      r: parseFloat(pinMatch[3])
    };
  }
  
  // Extract text elements
  const textElements = [];
  const textRegex = /<text[^>]*xml:space=['"]preserve['"][^>]*x=['"]([^'"]+)['"][^>]*y=['"]([^'"]+)['"][^>]*>[\s\S]*?<tspan[^>]*>([^<]+)<\/tspan>/g;
  let textMatch;
  while ((textMatch = textRegex.exec(groupContent)) !== null) {
    textElements.push({
      type: 'text',
      x: parseFloat(textMatch[1]),
      y: parseFloat(textMatch[2]),
      content: textMatch[3],
      xmlSpace: 'preserve'
    });
  }
  
  if (shape && pin) {
    svgData[placeId] = {
      shape,
      pin,
      ...(textElements.length > 0 && { additionalElements: textElements })
    };
  }
}

// Update places.json with SVG data
Object.keys(placesData.places).forEach(placeId => {
  if (svgData[placeId]) {
    placesData.places[placeId].svg = svgData[placeId];
  } else {
    console.warn(`Warning: No SVG data found for place: ${placeId}`);
  }
});

// Add mapConfig
placesData.mapConfig = {
  fullViewBox: {
    x: 0,
    y: 0,
    width: 374.12082,
    height: 225.68958
  },
  nearViewBox: {
    x: 81.364487,
    y: 52.243599,
    width: 69.217209,
    height: 41.755505
  },
  airesderioCenter: {
    cx: 203.69386,
    cy: 413.82022
  },
  farImage: "/map/far.jpg",
  nearImage: "/map/near.jpg"
};

// Write updated places.json
fs.writeFileSync(placesJsonPath, JSON.stringify(placesData, null, '\t'));

console.log('SVG data extracted and added to places.json');
console.log(`Extracted SVG data for ${Object.keys(svgData).length} places`);
