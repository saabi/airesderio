#!/usr/bin/env node

/**
 * Generate SVG files from Svelte icon components
 * 
 * This script reads Svelte icon components from the icons directory,
 * extracts their SVG content, and wraps them with SvgViewport defaults
 * to create standalone SVG files.
 * 
 * Usage:
 *   node scripts/generateSvgFromIcons.js [options]
 * 
 * Options:
 *   --input-dir <path>     Input directory containing icon components (default: src/lib/components/icons)
 *   --output-dir <path>    Output directory for SVG files (default: static/svg)
 *   --viewbox <string>     SVG viewBox attribute (default: "0 0 24 24")
 *   --width <string>       SVG width attribute (default: "4.5em", use "none" to omit)
 *   --height <string>      SVG height attribute (default: "4.5em", use "none" to omit)
 *   --class <string>       Additional CSS class for SVG element (default: "")
 *   --replace-vars         Replace CSS variables with actual values (default: false)
 *   --var-fill <string>    Value to replace --svg-fill-primary (default: "currentColor")
 *   --var-stroke <string>  Value to replace --svg-stroke-primary (default: "currentColor")
 *   --no-scale             Disable automatic scaling to fit viewport (default: false)
 *   --padding <number>      Padding around content as percentage (default: 5)
 * 
 * Examples:
 *   node scripts/generateSvgFromIcons.js
 *   node scripts/generateSvgFromIcons.js --output-dir static/icons --viewbox "0 0 48 48"
 *   node scripts/generateSvgFromIcons.js --width none --height none
 *   node scripts/generateSvgFromIcons.js --no-scale
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { resolve, join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Parse command line arguments
 */
function parseArgs() {
	const args = process.argv.slice(2);
	const options = {
		inputDir: resolve(__dirname, '../src/lib/components/icons'),
		outputDir: resolve(__dirname, '../static/svg'),
		viewBox: '0 0 24 24',
		width: '4.5em',
		height: '4.5em',
		class: '',
		replaceVars: false,
		varFill: 'currentColor',
		varStroke: 'currentColor',
		autoScale: true,
		padding: 5
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		const nextArg = args[i + 1];

		switch (arg) {
			case '--input-dir':
				if (nextArg) {
					options.inputDir = resolve(nextArg);
					i++;
				}
				break;
			case '--output-dir':
				if (nextArg) {
					options.outputDir = resolve(nextArg);
					i++;
				}
				break;
			case '--viewbox':
				if (nextArg) {
					options.viewBox = nextArg;
					i++;
				}
				break;
			case '--width':
				if (nextArg) {
					options.width = nextArg === 'none' ? null : nextArg;
					i++;
				}
				break;
			case '--height':
				if (nextArg) {
					options.height = nextArg === 'none' ? null : nextArg;
					i++;
				}
				break;
			case '--class':
				if (nextArg) {
					options.class = nextArg;
					i++;
				}
				break;
			case '--replace-vars':
				options.replaceVars = true;
				break;
			case '--var-fill':
				if (nextArg) {
					options.varFill = nextArg;
					i++;
				}
				break;
			case '--var-stroke':
				if (nextArg) {
					options.varStroke = nextArg;
					i++;
				}
				break;
			case '--no-scale':
				options.autoScale = false;
				break;
			case '--padding':
				if (nextArg) {
					options.padding = parseFloat(nextArg);
					if (isNaN(options.padding)) {
						console.warn(`Invalid padding value: ${nextArg}, using default 5`);
						options.padding = 5;
					}
					i++;
				}
				break;
			case '--help':
			case '-h':
				console.log(`
Generate SVG files from Svelte icon components

Usage:
  node scripts/generateSvgFromIcons.js [options]

Options:
  --input-dir <path>     Input directory containing icon components
                         (default: src/lib/components/icons)
  --output-dir <path>    Output directory for SVG files
                         (default: static/svg)
  --viewbox <string>     SVG viewBox attribute (default: "0 0 24 24")
  --width <string>       SVG width attribute (default: "4.5em", use "none" to omit)
  --height <string>      SVG height attribute (default: "4.5em", use "none" to omit)
  --class <string>       Additional CSS class for SVG element (default: "")
  --replace-vars         Replace CSS variables with actual values (default: false)
  --var-fill <string>    Value to replace --svg-fill-primary (default: "currentColor")
  --var-stroke <string>  Value to replace --svg-stroke-primary (default: "currentColor")
  --no-scale             Disable automatic scaling to fit viewport (default: false)
  --padding <number>     Padding around content as percentage (default: 5)
  --help, -h             Show this help message

Examples:
  node scripts/generateSvgFromIcons.js
  node scripts/generateSvgFromIcons.js --output-dir static/icons --viewbox "0 0 48 48"
  node scripts/generateSvgFromIcons.js --width none --height none
`);
				process.exit(0);
				break;
		}
	}

	return options;
}

/**
 * Extract SVG content from a Svelte component file
 */
function extractSvgContent(filePath) {
	try {
		const content = readFileSync(filePath, 'utf8');
		
		// Remove Svelte script blocks and style blocks (we'll handle styles separately)
		// The content should be the SVG elements themselves
		let svgContent = content
			// Remove script blocks
			.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
			// Remove style blocks (we'll extract and process them separately)
			.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, styleContent) => {
				// Store style content for later processing
				return `<!-- STYLE_BLOCK:${styleContent} -->`;
			})
			// Remove HTML comments that aren't our style markers
			.replace(/<!--(?!\s*STYLE_BLOCK:)[\s\S]*?-->/g, '')
			// Trim whitespace
			.trim();

		// Extract style blocks
		const styleBlocks = [];
		svgContent = svgContent.replace(/<!--\s*STYLE_BLOCK:([\s\S]*?)\s*-->/g, (match, styleContent) => {
			styleBlocks.push(styleContent.trim());
			return '';
		});

		return {
			content: svgContent.trim(),
			styles: styleBlocks
		};
	} catch (error) {
		throw new Error(`Failed to read file ${filePath}: ${error.message}`);
	}
}

/**
 * Replace CSS variables in content
 */
function replaceCssVariables(content, varFill, varStroke) {
	return content
		.replace(/var\(--svg-fill-primary\)/g, varFill)
		.replace(/var\(--svg-stroke-primary\)/g, varStroke)
		.replace(/var\(--svg-fill-secondary\)/g, varFill)
		.replace(/var\(--svg-stroke-secondary\)/g, varStroke);
}

/**
 * Extract viewBox from SVG content if present
 */
function extractViewBox(content) {
	const viewBoxMatch = content.match(/viewBox\s*=\s*['"]([^'"]+)['"]/i);
	if (viewBoxMatch) {
		const parts = viewBoxMatch[1].trim().split(/\s+/);
		if (parts.length === 4) {
			return {
				x: parseFloat(parts[0]),
				y: parseFloat(parts[1]),
				width: parseFloat(parts[2]),
				height: parseFloat(parts[3])
			};
		}
	}
	return null;
}

/**
 * Extract all numeric coordinates from SVG content
 * This is a simplified approach that extracts numbers from paths and simple elements
 * For paths, it extracts all numbers and pairs them - this is an approximation
 * but works well for most cases
 */
function extractCoordinates(content) {
	const coords = [];
	
	// Extract from path 'd' attributes
	// We extract all numbers and pair them - this is an approximation
	const pathMatches = content.matchAll(/d\s*=\s*['"]([^'"]+)['"]/gi);
	for (const match of pathMatches) {
		const pathData = match[1];
		// Extract all numbers (including negative and decimal, scientific notation)
		const numbers = pathData.match(/-?\d+\.?\d*(?:[eE][+-]?\d+)?/g);
		if (numbers) {
			// Pair numbers as coordinates
			for (let i = 0; i < numbers.length - 1; i += 2) {
				const x = parseFloat(numbers[i]);
				const y = parseFloat(numbers[i + 1]);
				if (!isNaN(x) && !isNaN(y)) {
					coords.push({ x, y });
				}
			}
		}
	}
	
	// Extract from rect elements
	const rectMatches = content.matchAll(/<rect[^>]*>/gi);
	for (const match of rectMatches) {
		const rect = match[0];
		const xMatch = rect.match(/x\s*=\s*['"](-?\d+\.?\d*)['"]/i);
		const yMatch = rect.match(/y\s*=\s*['"](-?\d+\.?\d*)['"]/i);
		const widthMatch = rect.match(/width\s*=\s*['"](-?\d+\.?\d*)['"]/i);
		const heightMatch = rect.match(/height\s*=\s*['"](-?\d+\.?\d*)['"]/i);
		
		if (xMatch && yMatch) {
			const x = parseFloat(xMatch[1]);
			const y = parseFloat(yMatch[1]);
			const width = widthMatch ? parseFloat(widthMatch[1]) : 0;
			const height = heightMatch ? parseFloat(heightMatch[1]) : 0;
			
			if (!isNaN(x) && !isNaN(y)) {
				coords.push({ x, y });
				if (!isNaN(width) && !isNaN(height)) {
					coords.push({ x: x + width, y: y + height });
				}
			}
		}
	}
	
	// Extract from circle elements
	const circleMatches = content.matchAll(/<circle[^>]*>/gi);
	for (const match of circleMatches) {
		const circle = match[0];
		const cxMatch = circle.match(/cx\s*=\s*['"](-?\d+\.?\d*)['"]/i);
		const cyMatch = circle.match(/cy\s*=\s*['"](-?\d+\.?\d*)['"]/i);
		const rMatch = circle.match(/r\s*=\s*['"](-?\d+\.?\d*)['"]/i);
		
		if (cxMatch && cyMatch && rMatch) {
			const cx = parseFloat(cxMatch[1]);
			const cy = parseFloat(cyMatch[1]);
			const r = parseFloat(rMatch[1]);
			
			if (!isNaN(cx) && !isNaN(cy) && !isNaN(r)) {
				coords.push({ x: cx - r, y: cy - r });
				coords.push({ x: cx + r, y: cy + r });
			}
		}
	}
	
	// Extract from line elements
	const lineMatches = content.matchAll(/<line[^>]*>/gi);
	for (const match of lineMatches) {
		const line = match[0];
		const x1Match = line.match(/x1\s*=\s*['"](-?\d+\.?\d*)['"]/i);
		const y1Match = line.match(/y1\s*=\s*['"](-?\d+\.?\d*)['"]/i);
		const x2Match = line.match(/x2\s*=\s*['"](-?\d+\.?\d*)['"]/i);
		const y2Match = line.match(/y2\s*=\s*['"](-?\d+\.?\d*)['"]/i);
		
		if (x1Match && y1Match) {
			const x1 = parseFloat(x1Match[1]);
			const y1 = parseFloat(y1Match[1]);
			if (!isNaN(x1) && !isNaN(y1)) {
				coords.push({ x: x1, y: y1 });
			}
		}
		if (x2Match && y2Match) {
			const x2 = parseFloat(x2Match[1]);
			const y2 = parseFloat(y2Match[1]);
			if (!isNaN(x2) && !isNaN(y2)) {
				coords.push({ x: x2, y: y2 });
			}
		}
	}
	
	return coords;
}

/**
 * Calculate bounding box from coordinates
 */
function calculateBoundingBox(coords) {
	if (coords.length === 0) {
		return null;
	}
	
	let minX = coords[0].x;
	let minY = coords[0].y;
	let maxX = coords[0].x;
	let maxY = coords[0].y;
	
	for (const coord of coords) {
		minX = Math.min(minX, coord.x);
		minY = Math.min(minY, coord.y);
		maxX = Math.max(maxX, coord.x);
		maxY = Math.max(maxY, coord.y);
	}
	
	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY
	};
}

/**
 * Calculate scale and transform to fit content in viewBox
 */
function calculateScaleTransform(content, targetViewBox, padding) {
	// First, try to extract viewBox from content
	const contentViewBox = extractViewBox(content);
	
	let sourceBBox;
	
	if (contentViewBox) {
		// Use the viewBox from content
		sourceBBox = contentViewBox;
	} else {
		// Calculate bounding box from coordinates
		const coords = extractCoordinates(content);
		sourceBBox = calculateBoundingBox(coords);
		
		if (!sourceBBox || sourceBBox.width === 0 || sourceBBox.height === 0) {
			// Can't calculate bounding box, return no transform
			return null;
		}
	}
	
	// Parse target viewBox
	const targetParts = targetViewBox.trim().split(/\s+/);
	if (targetParts.length !== 4) {
		return null;
	}
	
	const targetX = parseFloat(targetParts[0]);
	const targetY = parseFloat(targetParts[1]);
	const targetWidth = parseFloat(targetParts[2]);
	const targetHeight = parseFloat(targetParts[3]);
	
	if (isNaN(targetX) || isNaN(targetY) || isNaN(targetWidth) || isNaN(targetHeight)) {
		return null;
	}
	
	// Apply padding
	const paddingFactor = 1 - (padding / 100);
	const paddedTargetWidth = targetWidth * paddingFactor;
	const paddedTargetHeight = targetHeight * paddingFactor;
	const paddedTargetX = targetX + (targetWidth - paddedTargetWidth) / 2;
	const paddedTargetY = targetY + (targetHeight - paddedTargetHeight) / 2;
	
	// Calculate scale (use the smaller scale to ensure content fits)
	const scaleX = paddedTargetWidth / sourceBBox.width;
	const scaleY = paddedTargetHeight / sourceBBox.height;
	const scale = Math.min(scaleX, scaleY);
	
	// Calculate translation to center the content
	const scaledWidth = sourceBBox.width * scale;
	const scaledHeight = sourceBBox.height * scale;
	const translateX = paddedTargetX + (paddedTargetWidth - scaledWidth) / 2 - (sourceBBox.x * scale);
	const translateY = paddedTargetY + (paddedTargetHeight - scaledHeight) / 2 - (sourceBBox.y * scale);
	
	return {
		scale,
		translateX,
		translateY
	};
}

/**
 * Process styles and replace CSS variables if needed
 */
function processStyles(styles, replaceVars, varFill, varStroke) {
	if (styles.length === 0) {
		return '';
	}

	let processedStyles = styles.join('\n');

	if (replaceVars) {
		processedStyles = replaceCssVariables(processedStyles, varFill, varStroke);
	}

	return `<style type="text/css">
${processedStyles}
</style>`;
}

/**
 * Generate SVG file content
 */
function generateSvgFile(iconContent, options) {
	const { content, styles: extractedStyles } = iconContent;
	
	// Process styles
	const processedStyles = processStyles(
		extractedStyles,
		options.replaceVars,
		options.varFill,
		options.varStroke
	);

	// Replace CSS variables in SVG content if needed
	let processedContent = options.replaceVars
		? replaceCssVariables(content, options.varFill, options.varStroke)
		: content;

	// Calculate scale transform if auto-scaling is enabled
	let wrapperTransform = null;
	if (options.autoScale) {
		const transform = calculateScaleTransform(processedContent, options.viewBox, options.padding);
		if (transform && (transform.scale !== 1 || transform.translateX !== 0 || transform.translateY !== 0)) {
			wrapperTransform = `transform="translate(${transform.translateX.toFixed(6)},${transform.translateY.toFixed(6)}) scale(${transform.scale.toFixed(6)})"`;
		}
	}

	// Wrap content in a group with transform if needed
	if (wrapperTransform) {
		processedContent = `<g ${wrapperTransform}>
${processedContent}
</g>`;
	}

	// Build SVG attributes
	const attributes = [];
	
	if (options.width !== null) {
		attributes.push(`width="${options.width}"`);
	}
	if (options.height !== null) {
		attributes.push(`height="${options.height}"`);
	}
	attributes.push(`viewBox="${options.viewBox}"`);
	
	if (options.class) {
		attributes.push(`class="${options.class}"`);
	}
	
	attributes.push('xmlns="http://www.w3.org/2000/svg"');
	attributes.push('aria-hidden="true"');
	attributes.push('focusable="false"');

	// Build the complete SVG
	const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg ${attributes.join(' ')}>
${processedContent}
${processedStyles}
</svg>`;

	return svgContent;
}

/**
 * Get all Svelte files from a directory
 */
function getSvelteFiles(dir) {
	try {
		const files = readdirSync(dir);
		return files
			.filter(file => file.endsWith('.svelte') && file !== 'README.md')
			.map(file => join(dir, file));
	} catch (error) {
		throw new Error(`Failed to read directory ${dir}: ${error.message}`);
	}
}

/**
 * Get output filename from input filename
 */
function getOutputFilename(inputPath) {
	const baseName = basename(inputPath, extname(inputPath));
	return `${baseName}.svg`;
}

/**
 * Main function
 */
function main() {
	const options = parseArgs();

	try {
		// Validate input directory
		if (!statSync(options.inputDir).isDirectory()) {
			throw new Error(`Input directory does not exist: ${options.inputDir}`);
		}

		// Create output directory if it doesn't exist
		try {
			mkdirSync(options.outputDir, { recursive: true });
		} catch (error) {
			if (error.code !== 'EEXIST') {
				throw error;
			}
		}

		// Get all Svelte icon files
		console.log(`Reading icon files from: ${options.inputDir}`);
		const iconFiles = getSvelteFiles(options.inputDir);
		
		if (iconFiles.length === 0) {
			console.warn('⚠️  No Svelte icon files found in input directory');
			return;
		}

		console.log(`Found ${iconFiles.length} icon file(s)`);
		console.log(`Output directory: ${options.outputDir}`);
		console.log('');

		let successCount = 0;
		let errorCount = 0;

		// Process each icon file
		for (const iconFile of iconFiles) {
			try {
				const iconName = basename(iconFile, '.svelte');
				console.log(`Processing: ${iconName}...`);

				// Extract SVG content
				const iconContent = extractSvgContent(iconFile);

				// Generate SVG file
				const svgContent = generateSvgFile(iconContent, options);

				// Write output file
				const outputFilename = getOutputFilename(iconFile);
				const outputPath = join(options.outputDir, outputFilename);
				writeFileSync(outputPath, svgContent, 'utf8');

				console.log(`  ✓ Generated: ${outputFilename}`);
				successCount++;
			} catch (error) {
				console.error(`  ✗ Error processing ${basename(iconFile)}: ${error.message}`);
				errorCount++;
			}
		}

		console.log('');
		console.log(`✅ Successfully generated ${successCount} SVG file(s)`);
		if (errorCount > 0) {
			console.log(`⚠️  ${errorCount} file(s) had errors`);
			process.exitCode = 1;
		}
	} catch (error) {
		console.error('❌ Error:', error.message);
		process.exitCode = 1;
	}
}

main();
