<script module lang='ts'>
	// ===== IMPORTS =====
	import { tweened } from 'svelte/motion';
	import PinLabel from '$lib/components/ui/PinLabel.svelte';

	// ===== TYPES =====
	import type { MapPlaceData, MapConfig } from '$lib/types';

	interface Props {
		width?: string | number;
		height?: string | number;
		class?: string;
		ariaLabel?: string;
		zoomMargin?: number;
		includeAiresderio?: boolean;
		showNearImage?: boolean;
		radius?: number;
		places: MapPlaceData[];
		mapConfig: MapConfig;
	}

	export interface MapComponent {
		next: () => void;
		prev: () => void;
		reset: () => void;
		currentPathId: string | null;
	}

	// ===== STATIC CONSTANTS =====
	// (Constants will be derived from props in runtime script)
</script>

<script lang='ts'>
	// ===== PROPS =====
	let {
		width = '100%',
		height = '100%',
		class: className = '',
		ariaLabel = 'Mapa de ubicación',
		zoomMargin = 0.1,
		includeAiresderio = true,
		showNearImage = true,
		radius = 50,
		places,
		mapConfig
	}: Props = $props();

	// ===== DERIVED FROM PROPS =====
	let FULL_VIEWBOX = $derived(mapConfig.fullViewBox);
	let NEAR_VIEWBOX = $derived(mapConfig.nearViewBox);
	let AIRESDERIO_CENTER = $derived(mapConfig.airesderioCenter);
	let FAR_IMAGE = $derived(mapConfig.farImage);
	let NEAR_IMAGE = $derived(mapConfig.nearImage);

	// Derived constants from places prop
	let PLACE_PATH_IDS = $derived(places.map((place) => place.id));
	let PLACE_NAMES = $derived(
		Object.fromEntries(places.map((place) => [place.id, place.name]))
	);

	// ===== STATE =====
	let currentZoomedIndex = $state<number | null>(null);
	let selectedGroupName = $state<string | null>(null);
	let pinCoordinates = $state<{ x: number; y: number } | null>(null);
	let arrowPosition = $state<'bottom' | 'top' | 'left' | 'right'>('bottom');

	// Reference to map container for boundary calculations
	let mapContainer: HTMLDivElement | null = $state(null);

	// Reference to measurement label for getting dimensions
	let measurementLabel: HTMLDivElement | null = $state(null);

	// Calculate viewBox centered on airesderio with given radius
	function calculateAiresderioViewBox(radiusValue: number) {
		// Calculate viewBox dimensions based on radius
		// The radius represents half the width/height of the viewBox
		const viewBoxSize = radiusValue * 2;
		
		// Center the viewBox on airesderio coordinates
		const centerX = AIRESDERIO_CENTER.cx;
		const centerY = AIRESDERIO_CENTER.cy;
		
		// Calculate top-left corner
		const x = Math.max(0, centerX - radiusValue);
		const y = Math.max(0, centerY - radiusValue);
		
		// Calculate width and height, ensuring we don't go outside FULL_VIEWBOX bounds
		const width = Math.min(viewBoxSize, FULL_VIEWBOX.width - x);
		const height = Math.min(viewBoxSize, FULL_VIEWBOX.height - y);
		
		return { x, y, width, height };
	}

	// Determine default viewBox based on showNearImage prop
	let defaultViewBox = $derived(
		showNearImage ? NEAR_VIEWBOX : calculateAiresderioViewBox(radius)
	);

	// Tweened values for smooth animation
	// Initialize with mapConfig.nearViewBox (default), will be updated by effect when defaultViewBox changes
	let viewBoxX = tweened(mapConfig.nearViewBox.x, { duration: 600, easing: (t) => t * (2 - t) });
	let viewBoxY = tweened(mapConfig.nearViewBox.y, { duration: 600, easing: (t) => t * (2 - t) });
	let viewBoxWidth = tweened(mapConfig.nearViewBox.width, { duration: 600, easing: (t) => t * (2 - t) });
	let viewBoxHeight = tweened(mapConfig.nearViewBox.height, { duration: 600, easing: (t) => t * (2 - t) });

	// Update tweened values when defaultViewBox changes
	$effect(() => {
		const _ = defaultViewBox.x + defaultViewBox.y + defaultViewBox.width + defaultViewBox.height;
		viewBoxX.set(defaultViewBox.x);
		viewBoxY.set(defaultViewBox.y);
		viewBoxWidth.set(defaultViewBox.width);
		viewBoxHeight.set(defaultViewBox.height);
	});

	// Reference to SVG element for container dimensions
	let svgElement: SVGSVGElement | null = $state(null);

	// Reference to airesderio path element
	let airesderioPath: SVGPathElement | null = $state(null);

	// Map of path IDs to elements - dynamically queried from SVG DOM
	let pathElements = $derived.by(() => {
		if (!svgElement) return new Map<string, SVGPathElement | SVGRectElement | SVGCircleElement>();
		
		const placesGroup = svgElement.querySelector('#places');
		if (!placesGroup) return new Map<string, SVGPathElement | SVGRectElement | SVGCircleElement>();
		
		const map = new Map<string, SVGPathElement | SVGRectElement | SVGCircleElement>();
		for (const place of places) {
			const group = placesGroup.querySelector(`#${place.id}`);
			if (group) {
				const shapeElement = group.querySelector('path.place-path, rect.place-path, circle.place-path') as SVGPathElement | SVGRectElement | SVGCircleElement | null;
				if (shapeElement) {
					map.set(place.id, shapeElement);
				}
			}
		}
		return map;
	});

	// ===== DERIVED =====
	let widthAttr = $derived(typeof width === 'number' ? `${width}` : width);
	let heightAttr = $derived(typeof height === 'number' ? `${height}` : height);

	let viewBoxAttr = $derived(`${$viewBoxX} ${$viewBoxY} ${$viewBoxWidth} ${$viewBoxHeight}`);

	let currentPathId = $derived(
		currentZoomedIndex !== null &&
			currentZoomedIndex >= 0 &&
			currentZoomedIndex < PLACE_PATH_IDS.length
			? PLACE_PATH_IDS[currentZoomedIndex]
			: null
	);

	// ===== FUNCTIONS =====
	/**
	 * Gets pin coordinates for a place ID by reading directly from the SVG DOM.
	 * Finds the place group by ID and extracts cx/cy from its pin circle.
	 */
	function getPinCoordinates(placeId: string): { cx: number; cy: number } | null {
		if (!svgElement) return null;

		// Find the places group
		const placesGroup = svgElement.querySelector('#places');
		if (!placesGroup) return null;

		// Find the specific place group by ID
		const group = placesGroup.querySelector(`#${placeId}`);
		if (!group) return null;

		// Find the pin circle within the group
		const pinCircle = group.querySelector('circle.pin-circle') as SVGCircleElement | null;
		if (!pinCircle) return null;

		// Extract coordinates from attributes
		const cx = parseFloat(pinCircle.getAttribute('cx') || '0');
		const cy = parseFloat(pinCircle.getAttribute('cy') || '0');

		if (isNaN(cx) || isNaN(cy)) return null;

		return { cx, cy };
	}

	/**
	 * Converts SVG viewBox coordinates to parent offset coordinates
	 */
	function convertToParentOffset(svgX: number, svgY: number): { x: number; y: number } | null {
		if (!svgElement) return null;

		try {
			// Create a point in SVG coordinates
			const point = svgElement.createSVGPoint();
			point.x = svgX;
			point.y = svgY;

			// Get the transformation matrix from SVG coordinates to screen coordinates
			const ctm = svgElement.getScreenCTM();
			if (!ctm) return null;

			// Transform the point
			const transformedPoint = point.matrixTransform(ctm);

			// Get the SVG element's parent to calculate offset
			const parent = svgElement.parentElement;
			if (!parent) return null;

			const parentRect = parent.getBoundingClientRect();

			// Calculate offset relative to parent
			return {
				x: transformedPoint.x - parentRect.left,
				y: transformedPoint.y - parentRect.top
			};
		} catch (error) {
			console.error('Error converting coordinates:', error);
			return null;
		}
	}

	/**
	 * Calculates the best arrow position based on available space around the pin
	 */
	function calculateBestArrowPosition(
		pinX: number,
		pinY: number,
		labelWidth: number,
		labelHeight: number
	): 'bottom' | 'top' | 'left' | 'right' {
		if (!mapContainer) return 'bottom';

		const containerRect = mapContainer.getBoundingClientRect();
		const containerWidth = containerRect.width;
		const containerHeight = containerRect.height;

		// Calculate available space in each direction
		// For each direction, we need space for the label + arrow + margin
		const arrowSize = 6; // Arrow height/width
		const margin = 8; // Margin between label and pin
		const totalVerticalSpace = labelHeight + arrowSize + margin;
		const totalHorizontalSpace = labelWidth + arrowSize + margin;

		// Space above pin (for label with arrow pointing down)
		const spaceAbove = pinY;

		// Space below pin (for label with arrow pointing up)
		const spaceBelow = containerHeight - pinY;

		// Space to the left of pin (for label with arrow pointing right)
		const spaceLeft = pinX;

		// Space to the right of pin (for label with arrow pointing left)
		const spaceRight = containerWidth - pinX;

		// Calculate effective available space for each direction
		// We need to account for label positioning (centered for top/bottom, middle for left/right)
		const availableSpace = {
			bottom: spaceAbove - totalVerticalSpace, // Label above pin, arrow down
			top: spaceBelow - totalVerticalSpace, // Label below pin, arrow up
			right: spaceLeft - totalHorizontalSpace, // Label left of pin, arrow right
			left: spaceRight - totalHorizontalSpace // Label right of pin, arrow left
		};

		// Find the direction with the most available space
		let bestPosition: 'bottom' | 'top' | 'left' | 'right' = 'bottom';
		let maxSpace = availableSpace.bottom;

		if (availableSpace.top > maxSpace) {
			maxSpace = availableSpace.top;
			bestPosition = 'top';
		}
		if (availableSpace.left > maxSpace) {
			maxSpace = availableSpace.left;
			bestPosition = 'left';
		}
		if (availableSpace.right > maxSpace) {
			maxSpace = availableSpace.right;
			bestPosition = 'right';
		}

		// If no direction has enough space, still return the best option
		// (The label will be clipped, but at least we tried)
		return bestPosition;
	}

	// ===== EFFECTS =====
	$effect(() => {
		// Reset to default viewBox if not programmatically zoomed
		// This also updates when showNearImage changes
		if (currentZoomedIndex === null) {
			viewBoxX.set(defaultViewBox.x);
			viewBoxY.set(defaultViewBox.y);
			viewBoxWidth.set(defaultViewBox.width);
			viewBoxHeight.set(defaultViewBox.height);
			selectedGroupName = null;
			pinCoordinates = null;
		}
	});

	$effect(() => {
		// Update selected group name and pin coordinates when currentPathId changes
		if (currentPathId) {
			selectedGroupName = PLACE_NAMES[currentPathId] || null;

			const pinCoords = getPinCoordinates(currentPathId);
			if (pinCoords) {
				// Recalculate coordinates when viewBox or SVG element changes
				const updateCoordinates = () => {
					const converted = convertToParentOffset(pinCoords.cx, pinCoords.cy);
					if (converted) {
						pinCoordinates = converted;
					}
				};

				// Update immediately and also after a small delay to catch viewBox animations
				updateCoordinates();
				setTimeout(updateCoordinates, 50);
			} else {
				pinCoordinates = null;
			}
		} else {
			selectedGroupName = null;
			pinCoordinates = null;
		}
	});

	// Recalculate pin coordinates when viewBox changes (for smooth updates during animation)
	$effect(() => {
		if (currentPathId) {
			const pinCoords = getPinCoordinates(currentPathId);
			if (pinCoords) {
				// Access viewBox values to trigger recalculation when they change
				const _ = $viewBoxX + $viewBoxY + $viewBoxWidth + $viewBoxHeight;
				const converted = convertToParentOffset(pinCoords.cx, pinCoords.cy);
				if (converted) {
					pinCoordinates = converted;
				}
			}
		}
	});

	// Calculate best arrow position based on available space
	$effect(() => {
		if (pinCoordinates && measurementLabel && mapContainer && selectedGroupName) {
			// Use a small delay to ensure the measurement label is rendered
			const updateArrowPosition = () => {
				if (!measurementLabel || !mapContainer || !pinCoordinates) return;

				// Measure the label dimensions
				const labelRect = measurementLabel.getBoundingClientRect();
				const labelWidth = labelRect.width;
				const labelHeight = labelRect.height;

				// Calculate best arrow position
				const bestPosition = calculateBestArrowPosition(
					pinCoordinates.x,
					pinCoordinates.y,
					labelWidth,
					labelHeight
				);

				arrowPosition = bestPosition;
			};

			// Update immediately and after a small delay to ensure rendering
			updateArrowPosition();
			// Also update after viewBox animations complete
			setTimeout(updateArrowPosition, 100);
		} else if (!pinCoordinates) {
			// Reset to default when no pin is selected
			arrowPosition = 'bottom';
		}
	});

	// ===== ZOOM FUNCTIONS =====
	function zoomToBoundingBox(pathId: string) {
		const pathElement = pathElements.get(pathId);
		if (!pathElement) return;

		try {
			const pathBbox = pathElement.getBBox();
			let bbox = pathBbox;

			// If includeAiresderio is true, calculate union with airesderio bounding box
			if (includeAiresderio && airesderioPath) {
				try {
					const airesderioBbox = airesderioPath.getBBox();
					// Calculate union of both bounding boxes
					const minX = Math.min(pathBbox.x, airesderioBbox.x);
					const minY = Math.min(pathBbox.y, airesderioBbox.y);
					const maxX = Math.max(
						pathBbox.x + pathBbox.width,
						airesderioBbox.x + airesderioBbox.width
					);
					const maxY = Math.max(
						pathBbox.y + pathBbox.height,
						airesderioBbox.y + airesderioBbox.height
					);

					// Create a new DOMRect-like object for the union
					bbox = new DOMRect(minX, minY, maxX - minX, maxY - minY);
				} catch (error) {
					// If airesderio bbox calculation fails, use original bbox
					console.warn('Could not calculate airesderio bounding box, using path bbox only:', error);
				}
			}

			// Calculate margin based on container's actual pixel dimensions
			// Get container dimensions in pixels
			let containerWidth = FULL_VIEWBOX.width;
			let containerHeight = FULL_VIEWBOX.height;

			if (svgElement) {
				const rect = svgElement.getBoundingClientRect();
				containerWidth = rect.width;
				containerHeight = rect.height;
			}

			// Calculate the bounding box dimensions
			const bboxWidth = bbox.width;
			const bboxHeight = bbox.height;

			// Calculate container aspect ratio
			const containerAspect = containerWidth / containerHeight;
			const bboxAspect = bboxWidth / bboxHeight;

			// Calculate margin in pixels based on container dimensions
			// The margin should be a percentage of the container's smaller dimension
			const containerSize = Math.min(containerWidth, containerHeight);
			const marginPixels = containerSize * zoomMargin;

			// Calculate scale factor: how many viewBox units per pixel
			// Use FULL_VIEWBOX to get the base scale
			const scaleX = FULL_VIEWBOX.width / containerWidth;
			const scaleY = FULL_VIEWBOX.height / containerHeight;

			// Convert pixel margin to viewBox coordinates
			const marginX = marginPixels * scaleX;
			const marginY = marginPixels * scaleY;

			// Calculate content area (bbox + margins)
			const contentWidth = bboxWidth + marginX * 2;
			const contentHeight = bboxHeight + marginY * 2;
			const contentAspect = contentWidth / contentHeight;

			// Determine target viewBox dimensions that will fit the content
			// while maintaining container aspect ratio (so it fills the container)
			let targetViewBoxWidth: number;
			let targetViewBoxHeight: number;

			if (contentAspect > containerAspect) {
				// Content is wider - width determines viewBox
				targetViewBoxWidth = contentWidth;
				targetViewBoxHeight = contentWidth / containerAspect;
			} else {
				// Content is taller - height determines viewBox
				targetViewBoxHeight = contentHeight;
				targetViewBoxWidth = contentHeight * containerAspect;
			}

			// Center the bounding box in the viewBox
			const x = Math.max(0, bbox.x - (targetViewBoxWidth - bboxWidth) / 2);
			const y = Math.max(0, bbox.y - (targetViewBoxHeight - bboxHeight) / 2);

			// Ensure we don't go outside the full viewBox bounds
			const width = Math.min(FULL_VIEWBOX.width - x, targetViewBoxWidth);
			const height = Math.min(FULL_VIEWBOX.height - y, targetViewBoxHeight);

			viewBoxX.set(x);
			viewBoxY.set(y);
			viewBoxWidth.set(width);
			viewBoxHeight.set(height);
		} catch (error) {
			console.error(`Error calculating bounding box for ${pathId}:`, error);
		}
	}

	function next() {
		const nextIndex =
			currentZoomedIndex === null ? 0 : (currentZoomedIndex + 1) % PLACE_PATH_IDS.length;

		currentZoomedIndex = nextIndex;
		const pathId = PLACE_PATH_IDS[nextIndex];
		zoomToBoundingBox(pathId);
	}

	function prev() {
		const prevIndex =
			currentZoomedIndex === null
				? PLACE_PATH_IDS.length - 1
				: (currentZoomedIndex - 1 + PLACE_PATH_IDS.length) % PLACE_PATH_IDS.length;

		currentZoomedIndex = prevIndex;
		const pathId = PLACE_PATH_IDS[prevIndex];
		zoomToBoundingBox(pathId);
	}

	function reset() {
		currentZoomedIndex = null;
		viewBoxX.set(defaultViewBox.x);
		viewBoxY.set(defaultViewBox.y);
		viewBoxWidth.set(defaultViewBox.width);
		viewBoxHeight.set(defaultViewBox.height);
	}

	// Export functions, current path id, and state variables
	export { next, prev, reset, currentPathId, selectedGroupName, pinCoordinates };
</script>

<div class='map-container' bind:this={mapContainer}>
	<svg
		bind:this={svgElement}
		width={widthAttr}
		height={heightAttr}
		viewBox={viewBoxAttr}
		preserveAspectRatio='xMidYMid slice'
		class={className}
		aria-label={ariaLabel}
		role='img'
		xmlns='http://www.w3.org/2000/svg'
	>
		<g id='maps'>
			<image
				id='far'
				href='/map/far.jpg'
				x='0'
				y='0'
				width='374.12082'
				height='225.68958'
				preserveAspectRatio='none'
			/>
			{#if showNearImage}
				<image
					id='near'
					href='/map/near.jpg'
					x='81.364487'
					y='52.243599'
					width='69.217209'
					height='41.755505'
					preserveAspectRatio='none'
				/>
			{/if}
		</g>
		{#if currentPathId}
			{@const selectedPlace = places.find((p) => p.id === currentPathId)}
			{#if selectedPlace}
				<g id='places' class='places-group' class:zoom-active={currentZoomedIndex !== null}>
					<g id={selectedPlace.id} class='group-active'>
						{#each selectedPlace.svg.elements as element}
							{#if element.type === 'path'}
								<path
									class='place-path'
									fill='#00be4d'
									vector-effect='non-scaling-stroke'
									role='button'
									tabindex='0'
									aria-label={selectedPlace.name}
									d={element.d}
								/>
							{:else if element.type === 'rect'}
								<rect
									class='place-path'
									fill='#00be4d'
									vector-effect='non-scaling-stroke'
									role='button'
									tabindex='0'
									aria-label={selectedPlace.name}
									x={element.x}
									y={element.y}
									width={element.width}
									height={element.height}
								/>
							{:else if element.type === 'circle'}
								<circle
									class='place-path'
									fill='#00be4d'
									vector-effect='non-scaling-stroke'
									role='button'
									tabindex='0'
									aria-label={selectedPlace.name}
									cx={element.cx}
									cy={element.cy}
									r={element.r}
								/>
							{:else if element.type === 'text'}
								<text xml:space={element.xmlSpace || 'preserve'} x={element.x} y={element.y}>
									<tspan x={element.x} y={element.y}>{element.content}</tspan>
								</text>
							{/if}
						{/each}
						<circle
							class='pin-circle'
							cx={selectedPlace.svg.pin.cx}
							cy={selectedPlace.svg.pin.cy}
							r={selectedPlace.svg.pin.r}
						/>
					</g>
				</g>
			{/if}
		{/if}
		{#if includeAiresderio}
			<g id='building' class='building-group' class:zoom-active={currentZoomedIndex !== null}>
				<g id='airesderio' class='airesderio-path'>
					<circle
						class='pin-airesderio'
						cx={AIRESDERIO_CENTER.cx}
						cy={AIRESDERIO_CENTER.cy}
						r='4.3814869'
					/>
					<path
						bind:this={airesderioPath}
						d='m 202.97288,409.90271 2.2931,0.0425 0.29238,0.2863 -0.002,5.19212 -0.23275,0.44892 0.001,1.48465 -3.31504,-0.0163 -0.0239,-1.23152 0.11181,-5.11477 z'
					/>
				</g>
			</g>
		{/if}
	</svg>

	{#if selectedGroupName && pinCoordinates}
		<!-- Hidden label for measurement -->
		<div bind:this={measurementLabel} class='pin-label-measure' aria-hidden='true'>
			{selectedGroupName}
		</div>

		<!-- Actual label -->
		<PinLabel x={pinCoordinates.x} y={pinCoordinates.y} text={selectedGroupName} {arrowPosition} />
	{/if}
</div>

<style>
	.map-container {
		/* Layout */
		position: relative;
		width: 100%;
		height: 100%;
	}

	svg {
		/* Layout */
		display: block;
		width: 100%;
		height: 100%;
	}

	.pin-label-measure {
		/* Layout */
		position: absolute;
		visibility: hidden;
		top: -9999px;
		left: -9999px;

		/* Box/Visual */
		background-color: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 6px 12px;
		border-radius: 4px;
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
		pointer-events: none;
	}

	.pin-label {
		/* Layout */
		position: absolute;
		transform: translate(-50%, -100%);
		margin-bottom: 8px;

		/* Box/Visual */
		background-color: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 6px 12px;
		border-radius: 4px;
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
		pointer-events: none;

		/* Effects & Motion */
		transition:
			opacity 0.3s ease,
			transform 0.3s ease;
		opacity: 0;
		animation: fadeInLabel 0.3s ease forwards;
	}

	.pin-label::after {
		/* Layout */
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);

		/* Box/Visual */
		width: 0;
		height: 0;
		border-left: 6px solid transparent;
		border-right: 6px solid transparent;
		border-top: 6px solid rgba(0, 0, 0, 0.8);
	}

	@keyframes fadeInLabel {
		from {
			opacity: 0;
			transform: translate(-50%, -100%) translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -100%) translateY(0);
		}
	}

	.places-group {
		/* Box/Visual */
		opacity: 0;

		/* Effects & Motion */
		transition: opacity 0.4s ease;
	}

	.place-path {
		/* Box/Visual */
		vector-effect: non-scaling-stroke;
		fill: #008ef2;
		fill-opacity: 0;
		/* Misc/Overrides */
		cursor: pointer;

		/* Effects & Motion */
		transition: fill-opacity 0.3s ease;
	}

	/* When zoomed to a path, show the places group */
	.places-group.zoom-active {
		/* Box/Visual */
		opacity: 1;
	}

	/* When a group is active (zoomed), show its path */
	.group-active .place-path {
		/* Box/Visual */
		fill-opacity: 0.471002;
	}

	.building-group {
		/* Box/Visual */
		opacity: 0;

		/* Effects & Motion */
		transition: opacity 0.4s ease;
	}

	/* When zoomed (viewbox not in initial state), show the building */
	.building-group.zoom-active {
		/* Box/Visual */
		opacity: 1;
	}

	.building-path {
		/* Box/Visual */
		fill-opacity: 0.471002;

		/* Effects & Motion */
		transition: fill-opacity 0.3s ease;
	}

	.pin-circle {
		/* Box/Visual */
		fill: #800000;
		fill-opacity: 0;
		stroke-width: 0.0730401;
		stroke-linecap: butt;
		stroke-linejoin: miter;
		stroke-miterlimit: 4;
		stroke-dasharray: none;
		stroke-dashoffset: 0;
		stroke-opacity: 1;

		/* Misc/Overrides */
		vector-effect: non-scaling-stroke;

		/* Effects & Motion */
		transition: fill-opacity 0.3s ease;
	}

	/* Show pins in the active group when zoomed */
	.places-group.zoom-active .group-active .pin-circle {
		/* Box/Visual */
		fill-opacity: 1;
	}
	.pin-airesderio {
		font-variation-settings: normal;
		vector-effect: non-scaling-stroke;
		fill: #800000;
		fill-opacity: 0.455975;
		stroke-width: 0.16213;
		stroke-linecap: butt;
		stroke-linejoin: miter;
		stroke-miterlimit: 4;
		stroke-dasharray: none;
		stroke-dashoffset: 0;
		stroke-opacity: 1;
	}
	.airesderio-path {
		vector-effect: non-scaling-stroke;
		fill: #e6f900;
		fill-opacity: 0.51257861;
		stroke-width: 0.1997;
	}
</style>
