<script module lang='ts'>
	// ===== IMPORTS =====
	import { tweened } from 'svelte/motion';
	import PinLabel from '$lib/components/ui/PinLabel.svelte';

	// ===== TYPES =====
	import type { MapData, PlaceData, SvgShape, ViewBox } from '$lib/types';

	interface Props {
		width?: string | number;
		height?: string | number;
		class?: string;
		ariaLabel?: string;
		zoomMargin?: number;
		includeFocal?: boolean;
		showDetailImage?: boolean;
		mapData: MapData;
		/** Pin radius in pixels. If set, pins maintain constant screen size regardless of zoom. */
		pinRadius?: number;
	}

	export interface MapComponent {
		next: () => void;
		prev: () => void;
		reset: () => void;
		currentPathId: string | null;
	}

	// ===== HELPER FUNCTIONS =====
	/**
	 * Normalize shape to array (handles single shape or array of shapes)
	 */
	function normalizeShapes(shape: SvgShape | SvgShape[]): SvgShape[] {
		return Array.isArray(shape) ? shape : [shape];
	}
</script>

<script lang='ts'>
	// ===== IMPORTS =====
	import { tick } from 'svelte';
	
	// ===== PROPS =====
	let {
		width = '100%',
		height = '100%',
		class: className = '',
		ariaLabel = 'Mapa de ubicación',
		zoomMargin = 0.1,
		includeFocal = true,
		showDetailImage = false,
		mapData,
		pinRadius
	}: Props = $props();

	// ===== STATE: Image dimensions (loaded from actual images) =====
	let baseImageDimensions = $state<{ width: number; height: number } | null>(null);

	// Load base image to get natural dimensions
	$effect(() => {
		const img = new Image();
		img.onload = () => {
			baseImageDimensions = { width: img.naturalWidth, height: img.naturalHeight };
		};
		img.src = mapData.baseImage.src;
	});

	// ===== DENORMALIZATION =====
	// Scale factor: smaller image dimension (normalized coords * scale = pixel coords)
	let denormScale = $derived(
		baseImageDimensions ? Math.min(baseImageDimensions.width, baseImageDimensions.height) : 1
	);

	// Denormalize a single value
	function denorm(value: number): number {
		return value * denormScale;
	}

	// Denormalize an SVG path "d" attribute
	function denormPath(d: string): string {
		return d.replace(/-?\d+\.?\d*/g, (match) => {
			const num = parseFloat(match);
			return (num * denormScale).toString();
		});
	}

	// ===== DERIVED FROM MAP DATA (denormalized) =====
	// Full viewBox from loaded base image dimensions
	let FULL_VIEWBOX = $derived<ViewBox>({
		x: 0,
		y: 0,
		width: baseImageDimensions?.width ?? 1,
		height: baseImageDimensions?.height ?? 1
	});

	// Detail image bounds (denormalized)
	let DETAIL_VIEWBOX = $derived<ViewBox | null>(
		mapData.detailImage
			? {
					x: denorm(mapData.detailImage.x),
					y: denorm(mapData.detailImage.y),
					width: denorm(mapData.detailImage.width),
					height: denorm(mapData.detailImage.height)
				}
			: null
	);

	// Focal center (denormalized) - used for zoom calculations
	let FOCAL_CENTER = $derived({
		cx: denorm(mapData.focal.center.cx),
		cy: denorm(mapData.focal.center.cy)
	});

	// Places array
	let places = $derived(mapData.places);

	// Derived constants from places
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

	// Calculate viewBox centered on focal with given radius (in normalized coords)
	function calculateFocalViewBox(normalizedRadius: number): ViewBox {
		// Denormalize the radius
		const radiusPixels = denorm(normalizedRadius);
		
		// Calculate viewBox dimensions (diameter = 2 * radius)
		const viewBoxSize = radiusPixels * 2;

		// Center the viewBox on focal coordinates (already denormalized)
		const centerX = FOCAL_CENTER.cx;
		const centerY = FOCAL_CENTER.cy;

		// Calculate top-left corner, clamped to valid range
		const x = Math.max(0, centerX - radiusPixels);
		const y = Math.max(0, centerY - radiusPixels);

		// Calculate width and height, ensuring we don't exceed image bounds
		const viewBoxWidth = Math.min(viewBoxSize, FULL_VIEWBOX.width - x);
		const viewBoxHeight = Math.min(viewBoxSize, FULL_VIEWBOX.height - y);

		return { x, y, width: viewBoxWidth, height: viewBoxHeight };
	}

	// Compute default viewBox based on configuration
	let defaultViewBox = $derived.by((): ViewBox => {
		// Priority 1: Explicit defaultView from data (denormalize it)
		if (mapData.defaultView) {
			return {
				x: denorm(mapData.defaultView.x),
				y: denorm(mapData.defaultView.y),
				width: denorm(mapData.defaultView.width),
				height: denorm(mapData.defaultView.height)
			};
		}

		// Priority 2: If showDetailImage and detailImage exists, use detail bounds
		if (showDetailImage && DETAIL_VIEWBOX) {
			return DETAIL_VIEWBOX;
		}

		// Priority 3: Compute from focal center + radius (default 0.1 in normalized coords)
		if (baseImageDimensions) {
			const radius = mapData.defaultRadius ?? 0.1;
			return calculateFocalViewBox(radius);
		}

		// Priority 4: Fallback to full viewBox
		return FULL_VIEWBOX;
	});

	// Tweened values for smooth animation
	// Initialize with computed defaultViewBox
	let viewBoxX = tweened(defaultViewBox.x, { duration: 600, easing: (t) => t * (2 - t) });
	let viewBoxY = tweened(defaultViewBox.y, { duration: 600, easing: (t) => t * (2 - t) });
	let viewBoxWidth = tweened(defaultViewBox.width, { duration: 600, easing: (t) => t * (2 - t) });
	let viewBoxHeight = tweened(defaultViewBox.height, { duration: 600, easing: (t) => t * (2 - t) });

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

	// Reference to focal group element (for bounding box calculation)
	let focalGroup: SVGGElement | null = $state(null);
	
	// Reference to places group element (for bounding box calculation)
	let placesGroup: SVGGElement | null = $state(null);


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

	// Calculate label coordinates offset by pin radius so arrow tip touches pin edge
	let labelCoordinates = $derived.by(() => {
		if (!pinCoordinates || !currentPathId || !svgElement || !mapContainer) {
			return pinCoordinates;
		}

		const place = places.find((p) => p.id === currentPathId);
		if (!place) return pinCoordinates;

		// Get pin radius in viewBox coordinates
		const pinRadiusViewBox = getPinRadius(place.pin.r);

		// Convert pin radius from viewBox to screen pixels
		const containerRect = mapContainer.getBoundingClientRect();
		if (containerRect.width === 0 || containerRect.height === 0) {
			return pinCoordinates;
		}

		// Calculate scale: screen pixels per viewBox unit
		const scaleX = containerRect.width / $viewBoxWidth;
		const scaleY = containerRect.height / $viewBoxHeight;
		const scale = (scaleX + scaleY) / 2;

		// Pin radius in screen pixels
		const pinRadiusPixels = pinRadiusViewBox * scale;

		// Arrow dimensions (from PinLabel component)
		const arrowSize = -6; // Arrow height/width
		const arrowMargin = -4; // Margin between label and arrow
		const arrowOffset = arrowMargin + arrowSize; // Total offset from label edge to arrow tip

		// Offset coordinates based on arrow position
		// Arrow tip should be at pin edge, accounting for arrow size and margin
		let offsetX = 0;
		let offsetY = 0;

		switch (arrowPosition) {
			case 'bottom':
				// Label above pin, arrow pointing down
				// Arrow tip should touch bottom of pin (pinY + pinRadius)
				// Label bottom is at y (due to -100% transform), arrow tip is at y + arrowOffset
				// So: y + arrowOffset = pinY + pinRadius
				// Therefore: y = pinY + pinRadius - arrowOffset
				offsetY = pinRadiusPixels - arrowOffset;
				break;
			case 'top':
				// Label below pin, arrow pointing up
				// Arrow tip should touch top of pin (pinY - pinRadius)
				// Label top is at y (due to 0% transform), arrow tip is at y - arrowOffset
				// So: y - arrowOffset = pinY - pinRadius
				// Therefore: y = pinY - pinRadius + arrowOffset
				offsetY = -pinRadiusPixels + arrowOffset;
				break;
			case 'left':
				// Label right of pin, arrow pointing right
				// Arrow tip should touch left edge of pin (pinX - pinRadius)
				// Label left edge is at x (due to 0% transform), arrow tip is at x - arrowOffset
				// So: x - arrowOffset = pinX - pinRadius
				// Therefore: x = pinX - pinRadius + arrowOffset
				offsetX = -pinRadiusPixels + arrowOffset;
				break;
			case 'right':
				// Label left of pin, arrow pointing left
				// Arrow tip should touch right edge of pin (pinX + pinRadius)
				// Label right edge is at x (due to -100% transform), arrow tip is at x + arrowOffset
				// So: x + arrowOffset = pinX + pinRadius
				// Therefore: x = pinX + pinRadius - arrowOffset
				offsetX = pinRadiusPixels - arrowOffset;
				break;
		}

		console.log('pinCoordinates', pinCoordinates.x, pinCoordinates.y);
		console.log('offsetX', offsetX, 'offsetY', offsetY);
		// log pin coordinates in viewBox coordinates
		const pc = getPinCoordinates(currentPathId);
		console.log('pinCoordinates in viewBox', pc?.cx, pc?.cy);
		// log pin coordinates in parent coordinates
		if (pc) {
			console.log('pinCoordinates in parent', convertToParentOffset(pc.cx, pc.cy));
		}
		
		return {
			x: pinCoordinates.x - offsetX,
			y: pinCoordinates.y - offsetY
		};
	});

	// ===== FUNCTIONS =====
	/**
	 * Gets pin coordinates for a place ID from the places data (denormalized).
	 */
	function getPinCoordinates(placeId: string): { cx: number; cy: number } | null {
		const place = places.find((p) => p.id === placeId);
		if (!place) return null;

		return { cx: denorm(place.pin.cx), cy: denorm(place.pin.cy) };
	}

	/**
	 * Calculate pin radius in viewBox coordinates.
	 * If pinRadius prop is set (pixels), converts to viewBox coords based on current scale.
	 * Otherwise, uses the radius from JSON data (denormalized).
	 */
	function getPinRadius(jsonRadius: number): number {
		if (pinRadius === undefined) {
			// Use JSON radius (denormalized)
			return denorm(jsonRadius);
		}

		// Convert pixel radius to viewBox coordinates
		// Scale factor: viewBox units per pixel
		if (!mapContainer || !svgElement) {
			// Fallback to denormalized radius if container not ready
			return denorm(jsonRadius);
		}

		const containerRect = mapContainer.getBoundingClientRect();
		if (containerRect.width === 0 || containerRect.height === 0) {
			return denorm(jsonRadius);
		}

		// Calculate scale: viewBox width / container width
		// (or height, but they should be proportional due to preserveAspectRatio)
		const scaleX = $viewBoxWidth / containerRect.width;
		const scaleY = $viewBoxHeight / containerRect.height;
		// Use average scale for more accurate conversion
		const scale = (scaleX + scaleY) / 2;

		// Convert pixel radius to viewBox coordinates
		return pinRadius * scale;
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
			const offset = {
				x: transformedPoint.x - parentRect.left,
				y: transformedPoint.y - parentRect.top
			};
			console.log('offset', offset);
			return offset;
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
	async function zoomToBoundingBox(pathId: string) {
		// Wait for DOM to update so elements are rendered
		await tick();
		
		// Get the place group element
		let placeBbox: DOMRect | null = null;
		if (placesGroup && svgElement) {
			const placeGroup = placesGroup.querySelector(`#${CSS.escape(pathId)}`) as SVGGElement | null;
			if (placeGroup) {
				try {
					placeBbox = placeGroup.getBBox();
				} catch (error) {
					console.warn('Could not get bounding box for place:', pathId, error);
				}
			}
		}
		
		// Get the focal group bounding box
		let focalBbox: DOMRect | null = null;
		if (includeFocal && focalGroup) {
			try {
				focalBbox = focalGroup.getBBox();
			} catch (error) {
				console.warn('Could not get bounding box for focal:', error);
			}
		}
		
		// Calculate union of bounding boxes
		let bbox: DOMRect;
		if (placeBbox && focalBbox) {
			// Union of both
			const minX = Math.min(placeBbox.x, focalBbox.x);
			const minY = Math.min(placeBbox.y, focalBbox.y);
			const maxX = Math.max(placeBbox.x + placeBbox.width, focalBbox.x + focalBbox.width);
			const maxY = Math.max(placeBbox.y + placeBbox.height, focalBbox.y + focalBbox.height);
			bbox = new DOMRect(minX, minY, maxX - minX, maxY - minY);
		} else if (placeBbox) {
			bbox = placeBbox;
		} else if (focalBbox) {
			bbox = focalBbox;
		} else {
			// Fallback: use pin coordinates
			const place = places.find((p) => p.id === pathId);
			if (!place) return;
			const pinCx = denorm(place.pin.cx);
			const pinCy = denorm(place.pin.cy);
			const pinR = denorm(place.pin.r);
			bbox = new DOMRect(pinCx - pinR, pinCy - pinR, pinR * 2, pinR * 2);
		}
		
		// Calculate margin as percentage of content size
		const marginX = bbox.width * zoomMargin;
		const marginY = bbox.height * zoomMargin;
		
		// If content has zero size, use a minimum margin
		const minMargin = denorm(0.05); // 5% of smaller image dimension as fallback
		const finalMarginX = bbox.width > 0 ? marginX : minMargin;
		const finalMarginY = bbox.height > 0 ? marginY : minMargin;
		
		// Content area with margin
		const contentX = bbox.x - finalMarginX;
		const contentY = bbox.y - finalMarginY;
		const paddedWidth = bbox.width + finalMarginX * 2;
		const paddedHeight = bbox.height + finalMarginY * 2;

		// Get container aspect ratio from mapContainer (the display area)
		let containerAspect = FULL_VIEWBOX.width / FULL_VIEWBOX.height;
		if (mapContainer) {
			const rect = mapContainer.getBoundingClientRect();
			if (rect.width > 0 && rect.height > 0) {
				containerAspect = rect.width / rect.height;
			}
		}

		// Calculate viewBox that fits content while maintaining container aspect ratio
		const contentAspect = paddedWidth / paddedHeight;
		
		let viewWidth: number;
		let viewHeight: number;

		if (contentAspect > containerAspect) {
			// Content is wider than container - fit by width
			viewWidth = paddedWidth;
			viewHeight = paddedWidth / containerAspect;
		} else {
			// Content is taller than container - fit by height
			viewHeight = paddedHeight;
			viewWidth = paddedHeight * containerAspect;
		}

		// Center the content in the viewBox
		const viewX = contentX - (viewWidth - paddedWidth) / 2;
		const viewY = contentY - (viewHeight - paddedHeight) / 2;

		// Clamp to valid viewBox bounds
		const x = Math.max(0, Math.min(viewX, FULL_VIEWBOX.width - viewWidth));
		const y = Math.max(0, Math.min(viewY, FULL_VIEWBOX.height - viewHeight));
		const width = Math.min(viewWidth, FULL_VIEWBOX.width - x);
		const height = Math.min(viewHeight, FULL_VIEWBOX.height - y);

		// Tween to the new viewBox (smooth animation)
		viewBoxX.set(x);
		viewBoxY.set(y);
		viewBoxWidth.set(width);
		viewBoxHeight.set(height);
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

<div class='map-viewport' bind:this={mapContainer}>
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
		<!-- Base and detail images -->
		<g id='maps'>
			{#if baseImageDimensions}
				<image
					id='base'
					href={mapData.baseImage.src}
					x='0'
					y='0'
					width={baseImageDimensions.width}
					height={baseImageDimensions.height}
					preserveAspectRatio='none'
				/>
			{/if}
		{#if showDetailImage && mapData.detailImage && DETAIL_VIEWBOX}
			<image
				id='detail'
				href={mapData.detailImage.src}
				x={DETAIL_VIEWBOX.x}
				y={DETAIL_VIEWBOX.y}
				width={DETAIL_VIEWBOX.width}
				height={DETAIL_VIEWBOX.height}
				preserveAspectRatio='none'
			/>
		{/if}
		</g>

		<!-- Selected place rendering (coordinates denormalized) -->
		{#if currentPathId}
			{@const selectedPlace = places.find((p) => p.id === currentPathId)}
			{#if selectedPlace}
				<g id='places' class='places-group' class:zoom-active={currentZoomedIndex !== null} bind:this={placesGroup}>
					<g id={selectedPlace.id} class='group-active'>
						<!-- Render shape(s) -->
						{#each normalizeShapes(selectedPlace.shape) as shape}
							{#if shape.type === 'path'}
								<path
									class='place-path'
									fill='#00be4d'
									vector-effect='non-scaling-stroke'
									role='button'
									tabindex='0'
									aria-label={selectedPlace.name}
									d={denormPath(shape.d)}
								/>
							{:else if shape.type === 'rect'}
								<rect
									class='place-path'
									fill='#00be4d'
									vector-effect='non-scaling-stroke'
									role='button'
									tabindex='0'
									aria-label={selectedPlace.name}
									x={denorm(shape.x)}
									y={denorm(shape.y)}
									width={denorm(shape.width)}
									height={denorm(shape.height)}
								/>
							{:else if shape.type === 'circle'}
								<circle
									class='place-path'
									fill='#00be4d'
									vector-effect='non-scaling-stroke'
									role='button'
									tabindex='0'
									aria-label={selectedPlace.name}
									cx={denorm(shape.cx)}
									cy={denorm(shape.cy)}
									r={denorm(shape.r)}
								/>
							{/if}
						{/each}

						<!-- Render labels if present -->
						{#if selectedPlace.labels}
							{#each selectedPlace.labels as label}
								<text xml:space={label.xmlSpace || 'preserve'} x={denorm(label.x)} y={denorm(label.y)}>
									<tspan x={denorm(label.x)} y={denorm(label.y)}>{label.content}</tspan>
								</text>
							{/each}
						{/if}

						<!-- Pin circle -->
						<circle
							class='pin-circle'
							cx={denorm(selectedPlace.pin.cx)}
							cy={denorm(selectedPlace.pin.cy)}
							r={getPinRadius(selectedPlace.pin.r)}
						/>
					</g>
				</g>
			{/if}
		{/if}

		<!-- Focal (main subject) rendering - coordinates denormalized -->
		{#if includeFocal && mapData.focal.shapes && mapData.focal.shapes.length > 0}
			<g id='focal' class='focal-group' bind:this={focalGroup}>
				<!-- Pin circle behind focal shapes (same settings as zone pins) -->
				{#if places.length > 0 && places[0].pin.r !== undefined}
					<circle
						class='pin-circle'
						cx={FOCAL_CENTER.cx}
						cy={FOCAL_CENTER.cy}
						r={getPinRadius(places[0].pin.r)}
					/>
				{/if}
				{#each mapData.focal.shapes as shape}
					{#if shape.type === 'path'}
						<path class='focal-path' d={denormPath(shape.d)} />
					{:else if shape.type === 'circle'}
						<circle class='focal-pin' cx={denorm(shape.cx)} cy={denorm(shape.cy)} r={denorm(shape.r)} />
					{:else if shape.type === 'rect'}
						<rect class='focal-path' x={denorm(shape.x)} y={denorm(shape.y)} width={denorm(shape.width)} height={denorm(shape.height)} />
					{/if}
				{/each}
			</g>
		{/if}
	</svg>

	{#if selectedGroupName && pinCoordinates && labelCoordinates}
		<!-- Hidden label for measurement -->
		<div bind:this={measurementLabel} class='pin-label-measure' aria-hidden='true'>
			{selectedGroupName}
		</div>

		<!-- Actual label -->
		<PinLabel x={labelCoordinates.x} y={labelCoordinates.y} text={selectedGroupName} {arrowPosition} />
	{/if}
</div>

<style>
	.map-viewport {
		/* Layout */
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
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

	.focal-group {
		/* Box/Visual */
		opacity: 1;

		/* Effects & Motion */
		transition: opacity 0.4s ease;
	}

	.focal-path {
		/* Box/Visual */
		vector-effect: non-scaling-stroke;
		fill: #e6f900;
		fill-opacity: 0.51257861;
		stroke-width: 0.1997;
	}

	.focal-pin {
		/* Box/Visual */
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

	/* Show focal pin circle (always visible) */
	.focal-group .pin-circle {
		/* Box/Visual */
		fill-opacity: 1;
	}
</style>
