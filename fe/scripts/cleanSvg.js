#!/usr/bin/env node

/**
 * Clean SVG script
 * 
 * Transforms an SVG file by:
 * 1. Removing style and class attributes from all elements
 * 2. Replacing id values with inkscape:label values for <g> elements
 * 3. Removing ids for elements inside <g> elements
 * 4. Adding appropriate class names based on component mapping
 * 5. Removing all inkscape:* and sodipodi:* attributes
 * 6. Removing elements in inkscape and sodipodi namespaces
 * 
 * Usage:
 *   node scripts/cleanSvg.js <input.svg> [output.svg]
 * 
 * If output is not specified, it will overwrite the input file.
 * 
 * Requires: npm install @xmldom/xmldom
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

/**
 * Mapping from SVG inkscape:label values to component structure
 */
const ELEMENT_MAPPING = {
	// Group mappings
	'zonas': { componentId: 'places', className: 'places-group' },
	'airesderio': { componentId: 'building', className: 'building-group' },
	
	// Place group mappings (these are inside 'zonas')
	'z-terminal': { componentId: 'gterminal', parentGroup: 'zonas' },
	'z-forum': { componentId: 'gforum', parentGroup: 'zonas' },
	'z-casagobierno': { componentId: 'gcasagob', parentGroup: 'zonas' },
	'z-plazavea': { componentId: 'gplazavea', parentGroup: 'zonas' },
	'z-parque': { componentId: 'g-parqueaguirre', parentGroup: 'zonas' },
	'z-calleroca': { componentId: 'gavroca', parentGroup: 'zonas' },
	'z-rivadavia': { componentId: 'gavroca', parentGroup: 'zonas' }, // Avenida Roca might be in rivadavia
	
	// Path mappings (these are inside place groups)
	'terminal': { componentId: 'terminal', className: 'place-path', parentGroup: 'z-terminal' },
	'forum': { componentId: 'forum', className: 'place-path', parentGroup: 'z-forum' },
	'plazavea': { componentId: 'plazavea', className: 'place-path', parentGroup: 'z-plazavea' },
	'parque': { componentId: 'parqueaguirre', className: 'place-path', parentGroup: 'z-parque' },
	'calleroca': { componentId: 'avroca', className: 'place-path', parentGroup: 'z-calleroca' },
	'airesderio': { componentId: 'airesderio', className: 'airesderio-path', parentGroup: 'airesderio' }
};

/**
 * Get class name for an element based on its context
 */
function getClassName(element, parentLabel, grandparentLabel) {
	// Get inkscape:label before it's removed, fallback to id
	const inkscapeLabel = element.getAttributeNS(
		'http://www.inkscape.org/namespaces/inkscape',
		'label'
	);
	const label = inkscapeLabel || element.getAttribute('id');

	const tagName = element.tagName.toLowerCase();

	// Check if this is a circle (pin)
	if (tagName === 'circle') {
		// If inside airesderio group, it's pin-airesderio
		if (parentLabel === 'airesderio') {
			return 'pin-airesderio';
		}
		// If inside a place group (zonas), it's pin-circle
		if (grandparentLabel === 'zonas' || parentLabel?.startsWith('z-')) {
			return 'pin-circle';
		}
	}

	// Check if this is a path or rect (both can be place paths)
	if (tagName === 'path' || tagName === 'rect') {
		// First check if element has a direct mapping via label
		if (label) {
			const mapping = ELEMENT_MAPPING[label];
			if (mapping && mapping.className) {
				return mapping.className;
			}
		}
		
		// If path/rect is inside a place group (z-*), it's likely a place-path
		// unless it's inside airesderio
		if (parentLabel?.startsWith('z-')) {
			return 'place-path';
		}
		
		// If path is inside airesderio group and has airesderio label, it's airesderio-path
		if (parentLabel === 'airesderio' && label === 'airesderio') {
			return 'airesderio-path';
		}
	}

	// Check group-level mappings
	if (tagName === 'g') {
		const mapping = ELEMENT_MAPPING[label];
		if (mapping && mapping.className) {
			return mapping.className;
		}
	}

	return null;
}

/**
 * Remove all inkscape and sodipodi attributes from an element
 */
function removeInkscapeSodipodiAttributes(element) {
	// Get all attributes
	const attrs = element.attributes;
	const attrsToRemove = [];
	
	for (let i = 0; i < attrs.length; i++) {
		const attr = attrs[i];
		const attrName = attr.name;
		
		// Remove inkscape:* and sodipodi:* attributes
		if (attrName.startsWith('inkscape:') || attrName.startsWith('sodipodi:')) {
			attrsToRemove.push(attrName);
		}
	}
	
	// Remove the attributes
	for (const attrName of attrsToRemove) {
		element.removeAttribute(attrName);
	}
}

/**
 * Recursively process SVG elements using DOM API
 */
function processElement(element, isInsideGroup = false, parentLabel = null, grandparentLabel = null) {
	if (!element || element.nodeType !== 1) {
		// Not an element node, process children if any
		if (element && element.childNodes) {
			for (let i = 0; i < element.childNodes.length; i++) {
				processElement(element.childNodes[i], isInsideGroup, parentLabel, grandparentLabel);
			}
		}
		return;
	}

	// Remove elements in inkscape or sodipodi namespaces
	const tagName = element.tagName;
	if (tagName.startsWith('inkscape:') || tagName.startsWith('sodipodi:')) {
		// Remove this element and don't process children
		if (element.parentNode) {
			element.parentNode.removeChild(element);
		}
		return;
	}

	// Get inkscape:label BEFORE removing attributes (we need it for id replacement and class mapping)
	const inkscapeLabel = element.getAttributeNS(
		'http://www.inkscape.org/namespaces/inkscape',
		'label'
	);

	// Remove style attribute
	if (element.hasAttribute('style')) {
		element.removeAttribute('style');
	}
	
	// Remove inkscape and sodipodi attributes (but we've already read inkscape:label above)
	removeInkscapeSodipodiAttributes(element);

	// Check if this is a <g> element
	const isGroup = element.tagName === 'g';
	
	let currentLabel = inkscapeLabel || element.getAttribute('id');

	// For <g> elements: replace id with inkscape:label if it exists
	if (isGroup) {
		if (inkscapeLabel) {
			// Replace id with inkscape:label value
			element.setAttribute('id', inkscapeLabel);
			// Update currentLabel to the new id value
			currentLabel = inkscapeLabel;
		}

		// Remove old class and add new class if mapping exists
		if (element.hasAttribute('class')) {
			element.removeAttribute('class');
		}
		const className = getClassName(element, parentLabel, grandparentLabel);
		if (className) {
			element.setAttribute('class', className);
		}
	} else {
		// Remove old class first
		if (element.hasAttribute('class')) {
			element.removeAttribute('class');
		}
		
		// Get class name before removing id (so getClassName can use id for mapping)
		const className = getClassName(element, parentLabel, grandparentLabel);
		if (className) {
			element.setAttribute('class', className);
		}
		
		// For non-group elements inside <g>: remove id after we've used it
		if (isInsideGroup && element.hasAttribute('id')) {
			element.removeAttribute('id');
		}
	}

	// Process child elements recursively
	// Determine if we're now inside a group and update labels
	const nowInsideGroup = isInsideGroup || isGroup;
	const newParentLabel = isGroup ? currentLabel : parentLabel;
	const newGrandparentLabel = isGroup ? parentLabel : grandparentLabel;

	if (element.childNodes) {
		for (let i = 0; i < element.childNodes.length; i++) {
			processElement(element.childNodes[i], nowInsideGroup, newParentLabel, newGrandparentLabel);
		}
	}
}

/**
 * Main processing function
 */
function cleanSvg(svgContent) {
	try {
		// Parse the SVG
		const parser = new DOMParser();
		const doc = parser.parseFromString(svgContent, 'image/svg+xml');

		// Check for parsing errors
		const parseError = doc.documentElement.getElementsByTagName('parsererror');
		if (parseError.length > 0) {
			throw new Error('XML parsing error: ' + parseError[0].textContent);
		}

		// Get the root SVG element
		const svgElement = doc.documentElement;
		if (!svgElement || svgElement.tagName !== 'svg') {
			throw new Error('Root element is not <svg>');
		}

		// Process all elements starting from root
		processElement(svgElement, false);

		// Remove inkscape and sodipodi namespace declarations from root SVG element
		// (they'll be removed automatically if no elements use them, but we can be explicit)
		if (svgElement.hasAttribute('xmlns:inkscape')) {
			svgElement.removeAttribute('xmlns:inkscape');
		}
		if (svgElement.hasAttribute('xmlns:sodipodi')) {
			svgElement.removeAttribute('xmlns:sodipodi');
		}
		if (svgElement.hasAttribute('inkscape:version')) {
			svgElement.removeAttribute('inkscape:version');
		}
		if (svgElement.hasAttribute('sodipodi:docname')) {
			svgElement.removeAttribute('sodipodi:docname');
		}

		// Serialize back to XML string
		const serializer = new XMLSerializer();
		let output = serializer.serializeToString(doc);

		// Ensure proper XML declaration
		if (!output.startsWith('<?xml')) {
			output = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' + output;
		}

		return output;
	} catch (error) {
		throw new Error(`Failed to process SVG: ${error.message}`);
	}
}

/**
 * Main function
 */
function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.error('Usage: node scripts/cleanSvg.js <input.svg> [output.svg]');
		console.error('  If output is not specified, input file will be overwritten.');
		console.error('');
		console.error('Note: This script requires @xmldom/xmldom package.');
		console.error('  Install it with: npm install --save-dev @xmldom/xmldom');
		process.exitCode = 1;
		return;
	}

	const inputPath = resolve(args[0]);
	const outputPath = args[1] ? resolve(args[1]) : inputPath;

	try {
		console.log(`Reading SVG file: ${inputPath}`);
		const svgContent = readFileSync(inputPath, 'utf8');

		console.log('Processing SVG...');
		const cleaned = cleanSvg(svgContent);

		console.log(`Writing cleaned SVG to: ${outputPath}`);
		writeFileSync(outputPath, cleaned, 'utf8');

		console.log('✅ SVG cleaned successfully!');
	} catch (error) {
		console.error('❌ Error:', error.message);
		if (error.message.includes('@xmldom/xmldom')) {
			console.error('');
			console.error('Please install the required dependency:');
			console.error('  npm install --save-dev @xmldom/xmldom');
		}
		process.exitCode = 1;
	}
}

main();
