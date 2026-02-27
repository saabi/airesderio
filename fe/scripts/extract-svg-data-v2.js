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

// Find the places group content - look for the opening tag
const placesStart = mapContent.indexOf("<g id='places'");
if (placesStart === -1) {
  console.error('Could not find places group');
  process.exit(1);
}

// Find the matching closing tag by counting depth
let depth = 0;
let placesEnd = placesStart;
let inPlaces = false;

for (let i = placesStart; i < mapContent.length; i++) {
  if (mapContent.substring(i, i + 3) === '<g ') {
    depth++;
    inPlaces = true;
    i += 2; // Skip '<g '
  } else if (mapContent.substring(i, i + 4) === '</g>') {
    depth--;
    if (depth === 0 && inPlaces) {
      placesEnd = i + 4;
      break;
    }
    i += 3; // Skip '</g'
  }
}

const placesGroupContent = mapContent.substring(placesStart, placesEnd);

// Now extract individual place groups
const placeIds = [
  'terminal', 'forum', 'casa-de-gobierno', 'plaza-vea', 'parque-aguirre',
  'avenida-roca', 'peatonales', 'mercado',
  'teatro-25-de-mayo', 'plaza-libertad', 'avenida-rivadavia',
  'avenida-alvear', 'tribunales', 'estadio-unico', 'registro-civil', 'ccb'
];

placeIds.forEach(placeId => {
  const groupStart = placesGroupContent.indexOf(`<g id='${placeId}'`);
  if (groupStart === -1) {
    console.warn(`Could not find group for: ${placeId}`);
    return;
  }
  
  // Find the matching closing tag
  let depth = 0;
  let groupEnd = groupStart;
  let inGroup = false;
  
  for (let i = groupStart; i < placesGroupContent.length; i++) {
    if (placesGroupContent.substring(i, i + 3) === '<g ') {
      depth++;
      inGroup = true;
      i += 2;
    } else if (placesGroupContent.substring(i, i + 4) === '</g>') {
      depth--;
      if (depth === 0 && inGroup) {
        groupEnd = i + 4;
        break;
      }
      i += 3;
    }
  }
  
  const groupContent = placesGroupContent.substring(groupStart, groupEnd);
  
  // Extract shape element
  let shape = null;
  
  // Try to find path, rect, or circle with class='place-path'
  const shapeElementMatch = groupContent.match(/<(path|rect|circle)[^>]*class=['"]place-path['"][^>]*>[\s\S]*?/);
  if (shapeElementMatch) {
    const elementType = shapeElementMatch[1];
    const elementContent = shapeElementMatch[0];
    
    if (elementType === 'path') {
      const dMatch = elementContent.match(/d=['"]([^'"]+)['"]/);
      if (dMatch) {
        shape = { type: 'path', d: dMatch[1] };
      }
    } else if (elementType === 'rect') {
      const xMatch = elementContent.match(/x=['"]([^'"]+)['"]/);
      const yMatch = elementContent.match(/y=['"]([^'"]+)['"]/);
      const widthMatch = elementContent.match(/width=['"]([^'"]+)['"]/);
      const heightMatch = elementContent.match(/height=['"]([^'"]+)['"]/);
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
      const cxMatch = elementContent.match(/cx=['"]([^'"]+)['"]/);
      const cyMatch = elementContent.match(/cy=['"]([^'"]+)['"]/);
      const rMatch = elementContent.match(/r=['"]([^'"]+)['"]/);
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
  } else {
    console.warn(`Missing shape or pin for: ${placeId}`);
  }
});

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
