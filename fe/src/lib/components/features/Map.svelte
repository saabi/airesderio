<script module lang="ts">
	// ===== IMPORTS =====
	import { tweened } from 'svelte/motion';
	import PinLabel from '$lib/components/ui/PinLabel.svelte';

	// ===== TYPES =====
	interface Props {
		width?: string | number;
		height?: string | number;
		class?: string;
		ariaLabel?: string;
		zoomMargin?: number;
		includeAiresderio?: boolean;
	}

	export interface MapComponent {
		next: () => void;
		prev: () => void;
		reset: () => void;
		currentPathId: string | null;
	}

	// ===== STATIC CONSTANTS =====
	// Full viewBox (entire map)
	const FULL_VIEWBOX = {
		x: 0,
		y: 0,
		width: 374.12082,
		height: 225.68958
	};

	// Near image viewBox (default state)
	const NEAR_VIEWBOX = {
		x: 81.364487,
		y: 52.243599,
		width: 69.217209,
		height: 41.755505
	};

	// Place paths in order for navigation
	const PLACE_PATH_IDS = ['terminal', 'forum', 'casagob', 'plazavea', 'parque', 'avroca'] as const;

	// Map of path IDs to their data-name attributes
	const PLACE_NAMES: Record<string, string> = {
		terminal: 'Terminal de Omnibus',
		forum: 'Forum',
		casagob: 'Casa de Gobierno',
		plazavea: 'Plaza Vea',
		parque: 'Parque Aguirre',
		avroca: 'Avenida Roca'
	};

	// Map of path IDs to pin coordinates (in SVG viewBox coordinates)
	const PIN_COORDINATES: Record<string, { cx: number; cy: number }> = {
		terminal: { cx: 36.098015, cy: 46.98563 },
		forum: { cx: 58.824978, cy: 79.12207 },
		casagob: { cx: 9.6377773, cy: 136.76311 },
		plazavea: { cx: 138.37157, cy: 29.165194 },
		parque: { cx: 276.63824, cy: 127.52752 },
		avroca: { cx: 145.09337, cy: 156.96059 }
	};
</script>

<script lang="ts">
	// ===== PROPS =====
	let {
		width = '100%',
		height = '100%',
		class: className = '',
		ariaLabel = 'Mapa de ubicación',
		zoomMargin = 0.1,
		includeAiresderio = true
	}: Props = $props();

	// ===== STATE =====
	let currentZoomedIndex = $state<number | null>(null);
	let selectedGroupName = $state<string | null>(null);
	let pinCoordinates = $state<{ x: number; y: number } | null>(null);
	let arrowPosition = $state<'bottom' | 'top' | 'left' | 'right'>('bottom');

	// Reference to map container for boundary calculations
	let mapContainer: HTMLDivElement | null = $state(null);

	// Reference to measurement label for getting dimensions
	let measurementLabel: HTMLDivElement | null = $state(null);

	// Tweened values for smooth animation
	let viewBoxX = tweened(NEAR_VIEWBOX.x, { duration: 600, easing: (t) => t * (2 - t) });
	let viewBoxY = tweened(NEAR_VIEWBOX.y, { duration: 600, easing: (t) => t * (2 - t) });
	let viewBoxWidth = tweened(NEAR_VIEWBOX.width, { duration: 600, easing: (t) => t * (2 - t) });
	let viewBoxHeight = tweened(NEAR_VIEWBOX.height, { duration: 600, easing: (t) => t * (2 - t) });

	// References to path elements for bounding box calculation
	let terminalPath: SVGPathElement | null = $state(null);
	let forumPath: SVGPathElement | null = $state(null);
	let casagobPath: SVGPathElement | null = $state(null);
	let plazaveaPath: SVGPathElement | null = $state(null);
	let parquePath: SVGPathElement | null = $state(null);
	let avrocaPath: SVGPathElement | null = $state(null);

	// Reference to SVG element for container dimensions
	let svgElement: SVGSVGElement | null = $state(null);

	// Reference to airesderio path element
	let airesderioPath: SVGPathElement | null = $state(null);

	// Map of path IDs to elements
	let pathElements = $derived(
		new Map(
			[
				['terminal', terminalPath],
				['forum', forumPath],
				['casagob', casagobPath],
				['plazavea', plazaveaPath],
				['parque', parquePath],
				['avroca', avrocaPath]
			].filter(([_, el]) => el !== null) as Array<[string, SVGPathElement]>
		)
	);

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
		// Reset to near viewBox if not programmatically zoomed
		if (currentZoomedIndex === null) {
			viewBoxX.set(NEAR_VIEWBOX.x);
			viewBoxY.set(NEAR_VIEWBOX.y);
			viewBoxWidth.set(NEAR_VIEWBOX.width);
			viewBoxHeight.set(NEAR_VIEWBOX.height);
			selectedGroupName = null;
			pinCoordinates = null;
		}
	});

	$effect(() => {
		// Update selected group name and pin coordinates when currentPathId changes
		if (currentPathId) {
			selectedGroupName = PLACE_NAMES[currentPathId] || null;

			const pinCoords = PIN_COORDINATES[currentPathId];
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
			const pinCoords = PIN_COORDINATES[currentPathId];
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
		viewBoxX.set(NEAR_VIEWBOX.x);
		viewBoxY.set(NEAR_VIEWBOX.y);
		viewBoxWidth.set(NEAR_VIEWBOX.width);
		viewBoxHeight.set(NEAR_VIEWBOX.height);
	}

	// Export functions, current path id, and state variables
	export { next, prev, reset, currentPathId, selectedGroupName, pinCoordinates };
</script>

<div class="map-container" bind:this={mapContainer}>
	<svg
		bind:this={svgElement}
		width={widthAttr}
		height={heightAttr}
		viewBox={viewBoxAttr}
		preserveAspectRatio="xMidYMid slice"
		class={className}
		aria-label={ariaLabel}
		role="img"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g id="maps">
			<image
				id="far"
				href="/map/far.jpg"
				x="0"
				y="0"
				width="374.12082"
				height="225.68958"
				preserveAspectRatio="none"
			/>
			<image
				id="near"
				href="/map/near.jpg"
				x="81.364487"
				y="52.243599"
				width="69.217209"
				height="41.755505"
				preserveAspectRatio="none"
			/>
		</g>
		<g id="places" class="places-group" class:zoom-active={currentZoomedIndex !== null}>
			<g
				id="gterminal"
				data-name="Terminal de Omnibus"
				class:group-active={currentPathId === 'terminal'}
			>
				<path
					bind:this={terminalPath}
					class="place-path"
					fill="#00be4d"
					vector-effect="non-scaling-stroke"
					role="button"
					tabindex="0"
					aria-label="Terminal"
					d="m 28.247054,37.089611 4.175651,0.491252 6.509105,2.824708 3.070333,2.210638 3.070331,2.579079 1.473761,1.596573 1.228132,1.719384 0.36844,2.456267 -0.614068,2.579079 -1.596573,1.842199 -2.70189,1.719387 c 0,0 -3.807212,-0.491255 -4.05284,-0.614067 C 38.93181,56.371296 33.2824,53.546591 33.2824,53.546591 l -3.930025,-3.193145 -3.807212,-4.42128 -2.824706,-4.666903 z"
					id="terminal"
				/>
				<circle class="pin-circle" id="pin-terminal" cx="36.098015" cy="46.98563" r="2.0137656" />
			</g>
			<g id="gforum" data-name="Forum" class:group-active={currentPathId === 'forum'}>
				<path
					bind:this={forumPath}
					class="place-path"
					fill="#00be4d"
					vector-effect="non-scaling-stroke"
					role="button"
					tabindex="0"
					aria-label="Forum"
					d="M 43.421053,72.078947 61.310527,57.663159 87.884211,89.447369 87.363159,90.489473 70.863157,104.38421 69.299999,103.86316 43.594736,72.947368 Z"
					id="forum"
				/>
				<circle class="pin-circle" id="pin-forum" cx="58.824978" cy="79.12207" r="2.0137656" />
			</g>
			<g
				id="gcasagob"
				data-name="Casa de Gobierno"
				class:group-active={currentPathId === 'casagob'}
			>
				<path
					bind:this={casagobPath}
					class="place-path"
					fill="#00be4d"
					vector-effect="non-scaling-stroke"
					role="button"
					tabindex="0"
					aria-label="Casa de Gobierno"
					d="M 37.212426,158.92039 9.4566228,123.9186 7.9828632,123.42735 0,129.69083 v 6.26347 l 27.510176,30.94895 z"
					id="casagob"
				/>
				<circle class="pin-circle" id="pin-casagob" cx="9.6377773" cy="136.76311" r="2.0137656" />
				<circle
					class="pin-circle"
					id="pin-plazasanmartin"
					cx="26.456091"
					cy="156.33569"
					r="2.0137656"
				/>
			</g>
			<g id="gplazavea" data-name="Plaza Vea" class:group-active={currentPathId === 'plazavea'}>
				<path
					bind:this={plazaveaPath}
					class="place-path"
					fill="#00be4d"
					vector-effect="non-scaling-stroke"
					role="button"
					tabindex="0"
					aria-label="Plaza Vea"
					d="m 139.27026,5.7722243 19.65013,16.4569797 c 0,0 -2.7019,2.210639 -1.96502,1.965012 0.73688,-0.245626 3.43878,4.421278 3.43878,4.421278 l -27.75581,23.088897 -20.387,-24.317029 z"
					id="plazavea"
				/>
				<circle class="pin-circle" id="pin-plazavea" cx="138.37157" cy="29.165194" r="2.0137656" />
			</g>
			<g id="g-parque" data-name="Parque Aguirre" class:group-active={currentPathId === 'parque'}>
				<path
					bind:this={parquePath}
					class="place-path"
					fill="#00be4d"
					vector-effect="non-scaling-stroke"
					role="button"
					tabindex="0"
					aria-label="Parque"
					d="m 199.0421,0 0.69474,4.5157895 1.38947,4.8631577 6.25264,7.2947368 -23.62106,35.569919 18.41053,24.090312 0.26053,3.387138 -29.96053,20.494737 22.23158,26.05263 0.20468,4.15928 -20.63263,17.43949 v 3.6844 l 61.77508,74.13799 h 138.0737 V 86.460551 L 350.8421,67.910527 329.65263,54.710525 319.57893,48.110526 317.49473,44.63684 309.85264,43.594736 304.98946,40.815789 292.4842,30.394738 291.78948,27.268421 290.4,26.226315 285.88422,26.573683 278.58947,23.1 l -2.0842,-3.473685 -2.4316,-0.694736 h -1.38946 l -1.73686,-1.389474 0.34737,-1.736842 -0.34737,-1.389474 h -1.38946 l -3.47368,1.389474 -3.47369,-1.042105 -1.73684,-3.473684 -0.69474,-2.4315794 -1.73684,0.6947368 -3.82105,2.4315786 -7.29474,-5.5578942 V 5.3842104 L 243.85263,5.0368422 238.6421,0 Z"
					id="parque"
				/>
				<circle class="pin-circle" id="pin-parque" cx="276.63824" cy="127.52752" r="2.0137656" />
			</g>
			<g id="gavroca" data-name="Avenida Roca" class:group-active={currentPathId === 'avroca'}>
				<path
					bind:this={avrocaPath}
					class="place-path"
					fill="#00be4d"
					vector-effect="non-scaling-stroke"
					role="button"
					tabindex="0"
					aria-label="Avenida Roca"
					d="m 89.273683,91.18421 109.808187,134.44005 4.47726,0.12282 L 91.950889,89.142142 Z"
					id="avroca"
				/>
				<circle class="pin-circle" id="pin-avroca" cx="145.09337" cy="156.96059" r="2.0137656" />
			</g>
		</g>
		<g id="building" class="building-group" class:zoom-active={currentZoomedIndex !== null}>
			<g id="gairesderio">
				<circle
					class="pin-airesderio"
					id="pin-airesderio"
					cx="114.75736"
					cy="73.439285"
					r="4.4700313"
				/>
				<path
					bind:this={airesderioPath}
					class="airesderio-path"
					d="m 111.26556,71.791805 1.52949,-1.228227 1.59901,0.463483 2.47962,3.058973 0.30126,0.115865 0.7184,0.880615 -1.52949,1.251402 -0.60252,-0.787914 -1.50631,-0.301271 z"
					id="airesderio"
				/>
			</g>
		</g>
	</svg>

	{#if selectedGroupName && pinCoordinates}
		<!-- Hidden label for measurement -->
		<div bind:this={measurementLabel} class="pin-label-measure" aria-hidden="true">
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
