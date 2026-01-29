<script module lang='ts'>
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
		showNearImage?: boolean;
		radius?: number;
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

	// ===== PLACE DATA =====
	// Centralized place data structure
	// Note: IDs match the cleaned SVG file (map-cleaner2.svg)
	// Order determines navigation sequence
	interface PlaceData {
		id: string;
		name: string;
		pin: { cx: number; cy: number };
	}

	const PLACES: PlaceData[] = [
		{
			id: 'terminal',
			name: 'Terminal de Ómnibus',
			pin: { cx: 151.09848, cy: 333.03827 }
		},
		{
			id: 'forum',
			name: 'Fórum Santiago del Estero',
			pin: { cx: 148.93271, cy: 376.11145 }
		},
		{
			id: 'casa-de-gobierno',
			name: 'Casa de Gobierno',
			pin: { cx: 61.8862, cy: 393.94794 }
		},
		{
			id: 'plaza-vea',
			name: 'Plaza Vea',
			pin: { cx: 255.12759, cy: 390.30475 }
		},
		{
			id: 'parque-aguirre',
			name: 'Parque Aguirre',
			pin: { cx: 279.82251, cy: 571.65515 }
		},
		{
			id: 'avenida-roca',
			name: 'Avenida Roca',
			pin: { cx: 167.47708, cy: 546.85071 }
		},
		{
			id: 'avenida-irigoyen',
			name: 'Avenida Irigoyen',
			pin: { cx: 91.090652, cy: 482.8299 }
		},
		{
			id: 'mercado',
			name: 'Mercado',
			pin: { cx: 78.624725, cy: 492.66431 }
		},
		{
			id: 'calle-absalonrojas',
			name: 'Calle Absalón Rojas',
			pin: { cx: 66.440079, cy: 502.03876 }
		},
		{
			id: 'teatro-25-de-mayo',
			name: 'Teatro 25 de Mayo',
			pin: { cx: 136.58945, cy: 564.62354 }
		},
		{
			id: 'plaza-libertad',
			name: 'Plaza Libertad',
			pin: { cx: 75.973892, cy: 542.70227 }
		},
		{
			id: 'avenida-rivadavia',
			name: 'Avenida Rivadavia',
			pin: { cx: 127.81216, cy: 409.99713 }
		},
		{
			id: 'avenida-alvear',
			name: 'Avenida Alvear',
			pin: { cx: 85.01088, cy: 376.09967 }
		},
		{
			id: 'tribunales',
			name: 'Tribunales',
			pin: { cx: 83.532181, cy: 361.98596 }
		},
		{
			id: 'estadio-unico',
			name: 'Estadio Único',
			pin: { cx: 231.18658, cy: 32.347748 }
		},
		{
			id: 'registro-civil',
			name: 'Registro Civil',
			pin: { cx: 16.490738, cy: 390.43738 }
		},
		{
			id: 'ccb',
			name: 'CCB',
			pin: { cx: 81.094269, cy: 517.92395 }
		}
	];

	// Derived constants from PLACES array
	const PLACE_PATH_IDS = PLACES.map((place) => place.id);
	const PLACE_NAMES: Record<string, string> = Object.fromEntries(
		PLACES.map((place) => [place.id, place.name])
	);
	const PIN_COORDINATES: Record<string, { cx: number; cy: number }> = Object.fromEntries(
		PLACES.map((place) => [place.id, place.pin])
	);
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
		radius = 50
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

	// Airesderio pin coordinates (used as center when showNearImage is false)
	// Updated to match map-cleaner2.svg coordinates
	const AIRESDERIO_CENTER = {
		cx: 203.69386,
		cy: 413.82022
	};

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
	// Initialize with NEAR_VIEWBOX (default), will be updated by effect if showNearImage changes
	let viewBoxX = tweened(NEAR_VIEWBOX.x, { duration: 600, easing: (t) => t * (2 - t) });
	let viewBoxY = tweened(NEAR_VIEWBOX.y, { duration: 600, easing: (t) => t * (2 - t) });
	let viewBoxWidth = tweened(NEAR_VIEWBOX.width, { duration: 600, easing: (t) => t * (2 - t) });
	let viewBoxHeight = tweened(NEAR_VIEWBOX.height, { duration: 600, easing: (t) => t * (2 - t) });

	// References to path elements for bounding box calculation
	let terminalPath: SVGPathElement | null = $state(null);
	let forumPath: SVGPathElement | null = $state(null);
	let casaDeGobiernoPath: SVGPathElement | null = $state(null);
	let plazaVeaPath: SVGPathElement | null = $state(null);
	let parqueAguirrePath: SVGPathElement | null = $state(null);
	let avenidaRocaPath: SVGPathElement | null = $state(null);
	let avenidaIrigoyenPath: SVGPathElement | null = $state(null);
	let mercadoPath: SVGPathElement | null = $state(null);
	let calleAbsalonrojasPath: SVGPathElement | null = $state(null);
	let teatro25DeMayoPath: SVGPathElement | null = $state(null);
	let plazaLibertadPath: SVGPathElement | null = $state(null);
	let avenidaRivadaviaPath: SVGPathElement | null = $state(null);
	let avenidaAlvearPath: SVGPathElement | null = $state(null);
	let tribunalesPath: SVGPathElement | null = $state(null);
	let estadioUnicoPath: SVGPathElement | null = $state(null);
	let registroCivilPath: SVGPathElement | null = $state(null);
	let ccbPath: SVGPathElement | null = $state(null);

	// Reference to SVG element for container dimensions
	let svgElement: SVGSVGElement | null = $state(null);

	// Reference to airesderio path element
	let airesderioPath: SVGPathElement | null = $state(null);

	// Map of path IDs to elements
	// Organized using PLACES array for consistency
	let pathElements = $derived(
		new Map(
			PLACES.map((place, index) => {
				const pathRefs = [
					terminalPath,
					forumPath,
					casaDeGobiernoPath,
					plazaVeaPath,
					parqueAguirrePath,
					avenidaRocaPath,
					avenidaIrigoyenPath,
					mercadoPath,
					calleAbsalonrojasPath,
					teatro25DeMayoPath,
					plazaLibertadPath,
					avenidaRivadaviaPath,
					avenidaAlvearPath,
					tribunalesPath,
					estadioUnicoPath,
					registroCivilPath,
					ccbPath
				];
				return [place.id, pathRefs[index]] as [string, SVGPathElement | null];
			}).filter(([_, el]) => el !== null) as Array<[string, SVGPathElement]>
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
		<g id='places' class='places-group' class:zoom-active={currentZoomedIndex !== null}>
			<!-- Terminal -->
			<g id='terminal' class:group-active={currentPathId === 'terminal'}>
				<path
					bind:this={terminalPath}
					class='place-path'
					fill='#00be4d'
					vector-effect='non-scaling-stroke'
					role='button'
					tabindex='0'
					aria-label='Terminal'
					d='m 151.67143,316.93007 3.38155,3.56796 3.72949,7.41057 1.10154,4.28414 0.82564,4.61497 0.12777,2.53719 -0.18475,2.46355 -1.50848,2.48144 -2.48268,1.85599 -2.81309,0.4586 -3.71363,-0.47936 c 0,0 -3.05073,-3.29207 -3.17931,-3.58627 -0.1286,-0.29421 -3.08612,-7.06103 -3.08612,-7.06103 l -1.13777,-5.81012 -0.10781,-6.82092 0.95833,-6.30575 z'
				/>
				<circle class='pin-circle' cx='151.09848' cy='333.03827' r='2.1235924' />
			</g>
			<!-- Forum -->
			<g id='forum' class:group-active={currentPathId === 'forum'}>
				<path
					bind:this={forumPath}
					class='place-path'
					fill='#00be4d'
					vector-effect='non-scaling-stroke'
					role='button'
					tabindex='0'
					aria-label='Forum'
					d='m 138.71088,351.08881 h 6.24117 21.36553 v 57.33699 h -27.6067 v -44.779 z'
				/>
				<circle class='pin-circle' cx='148.93271' cy='376.11145' r='2.1235924' />
			</g>
			<!-- Casa de Gobierno -->
			<g id='casa-de-gobierno' class:group-active={currentPathId === 'casa-de-gobierno'}>
				<rect
					bind:this={casaDeGobiernoPath}
					class='place-path'
					fill='#00be4d'
					vector-effect='non-scaling-stroke'
					role='button'
					tabindex='0'
					aria-label='Casa de Gobierno'
					width='15.76687'
					height='25.77758'
					x='53.917145'
					y='379.60132'
				/>
				<circle class='pin-circle' cx='61.8862' cy='393.94794' r='2.1235924' />
			</g>
			<!-- Plaza Vea -->
			<g id='plaza-vea' class:group-active={currentPathId === 'plaza-vea'}>
				<path
					bind:this={plazaVeaPath}
					class='place-path'
					fill='#00be4d'
					vector-effect='non-scaling-stroke'
					role='button'
					tabindex='0'
					aria-label='Plaza Vea'
					d='m 274.81336,371.94666 5.32091,29.49171 c 0,0 -4.0815,-0.0383 -3.2359,0.29297 0.8456,0.33124 -0.22301,6.54504 -0.22301,6.54504 l -42.21226,-0.0522 -0.0967,-37.10124 z'
				/>
				<circle class='pin-circle' cx='255.12759' cy='390.30475' r='2.1235924' />
			</g>
			<!-- Parque Aguirre -->
			<g id='parque-aguirre' class:group-active={currentPathId === 'parque-aguirre'}>
				<path
					bind:this={parqueAguirrePath}
					class='place-path'
					fill='#00be4d'
					vector-effect='non-scaling-stroke'
					role='button'
					tabindex='0'
					aria-label='Parque Aguirre'
					d='m 333.45789,410.82288 -2.81949,4.5402 -2.46669,5.37748 0.003,11.23851 -48.05285,13.62132 -1.97889,35.41093 -2.34627,3.20714 -46.14176,-4.34921 0.90451,39.32514 -2.49225,2.62242 -30.61788,0.28371 -1.5907,4.75905 0.19667,197.22537 55.90789,0.2771 129.08003,51.92546 82.50681,4e-5 v -43.21939 l -37.4632,-118.54888 -5.98644,-28.79039 -8.28626,-22.44787 -5.3997,-17.95057 -1.17331,-5.65448 -5.99557,-6.74157 -2.20522,-6.16963 -3.178,-18.77411 1.76206,-3.30591 -0.44123,-1.98315 -4.27585,-3.12805 -3.8365,-8.63726 0.79168,-4.67197 -1.63135,-2.46767 -1.23428,-1.05742 -0.48546,-2.55612 1.63035,-1.2785 0.74886,-1.49866 -1.23428,-1.05743 -4.14319,-1.40925 -2.29269,-3.56931 1.1007,-4.40754 1.23334,-2.68875 -2.07159,-0.70463 -5.24483,-0.7479 -2.77954,-9.54411 0.79307,-0.92573 -2.82139,-2.95215 -0.79546,-8.4397 2.43012,-6.74433 -2.23697,-10.99984 5.55571,-20.1532 0.30654,-14.74381 -10.74751,-11.65754 -3.57895,-12.36281 1.61314,-11.88697 1.26051,-25.71991 -7.46724,-10.94532 -5.00091,-21.51151 -1.06435,-15.92312 -5.20146,-29.37883 -38.33623,-1.40629 21.9523,71.22363 5.53428,12.62888 10.61512,37.51805 3.70032,6.60504 9.36692,11.15628 1.63147,4.2275 z'
				/>
				<circle class='pin-circle' cx='279.82251' cy='571.65515' r='2.1235924' />
				<text xml:space='preserve' x='313.02628' y='359.36108'>
					<tspan x='313.02628' y='359.36108'>BALNEARIO 1</tspan>
				</text>
				<text xml:space='preserve' x='326.16437' y='471.83643'>
					<tspan x='326.16437' y='471.83643'>BALNEARIO 2</tspan>
				</text>
				<text xml:space='preserve' x='374.28116' y='699.82135'>
					<tspan x='374.28116' y='699.82135'>BALNEARIO 3</tspan>
				</text>
			</g>
			<!-- Avenida Roca -->
			<g id='avenida-roca' class:group-active={currentPathId === 'avenida-roca'}>
				<path
					bind:this={avenidaRocaPath}
					class='place-path'
					fill='#00be4d'
					vector-effect='non-scaling-stroke'
					role='button'
					tabindex='0'
					aria-label='Avenida Roca'
					d='m 166.21154,410.95117 -0.85805,289.80137 3.30773,0.5892 0.31304,-290.31421 z'
				/>
				<circle class='pin-circle' cx='167.47708' cy='546.85071' r='2.1235924' />
			</g>
			<!-- Avenida Irigoyen -->
			<g id='avenida-irigoyen' class:group-active={currentPathId === 'avenida-irigoyen'}>
				<path
					bind:this={avenidaIrigoyenPath}
					class='place-path'
					fill='#00be4d'
					vector-effect='non-scaling-stroke'
					role='button'
					tabindex='0'
					aria-label='Avenida Irigoyen'
					d='m 90.211801,436.54384 2.44011,0.0626 -0.50054,91.4103 -2.50268,-0.0626 z'
				/>
				<circle class='pin-circle' cx='91.090652' cy='482.8299' r='2.1235924' />
			</g>
			<!-- Mercado -->
			<g id='mercado' class:group-active={currentPathId === 'mercado'}>
				<path
					bind:this={mercadoPath}
					class='place-path'
					fill='#00be4d'
					vector-effect='non-scaling-stroke'
					role='button'
					tabindex='0'
					aria-label='Mercado'
					d='m 68.812881,485.02638 21.64817,1.50161 -0.62567,14.26526 -22.1487,-1.75188 z'
				/>
				<circle class='pin-circle' cx='78.624725' cy='492.66431' r='2.1235924' />
			</g>
			<!-- Calle Absalón Rojas -->
			<g id='calle-absalonrojas' class:group-active={currentPathId === 'calle-absalonrojas'}>
				<path
					bind:this={calleAbsalonrojasPath}
					class='place-path'
					fill='#00be4d'
					vector-effect='non-scaling-stroke'
					role='button'
					tabindex='0'
					aria-label='Calle Absalón Rojas'
					d='m 67.658981,466.74856 h 2.50268 l -4.50482,59.06319 -2.50268,-0.25027 z'
				/>
				<circle class='pin-circle' cx='66.440079' cy='502.03876' r='2.1235924' />
			</g>
			<!-- Teatro 25 de Mayo -->
			<g id='teatro-25-de-mayo' class:group-active={currentPathId === 'teatro-25-de-mayo'}>
				<path
					bind:this={teatro25DeMayoPath}
					class='place-path'
					fill='#00be4d'
					vector-effect='non-scaling-stroke'
					role='button'
					tabindex='0'
					aria-label='Teatro 25 de Mayo'
					d='m 129.5451,557.56198 h 14.51553 l 0.87594,3.50375 -5.07121,1.31913 0.41604,1.60731 0.0895,1.8131 -0.3111,1.33008 -0.63856,0.92383 0.1085,2.31039 -0.98032,0.98061 -5.42855,0.0726 0.0466,-2.9957 -0.40255,-0.98594 -0.19589,-1.14091 0.22446,-1.92656 -3.18584,0.13323 z'
				/>
				<circle class='pin-circle' cx='136.58945' cy='564.62354' r='2.1235924' />
			</g>
			<!-- Plaza Libertad -->
			<g id='plaza-libertad' class:group-active={currentPathId === 'plaza-libertad'}>
				<path
					bind:this={plazaLibertadPath}
					class='place-path'
					fill='#00be4d'
					vector-effect='non-scaling-stroke'
					role='button'
					tabindex='0'
					aria-label='Plaza Libertad'
					d='m 64.465521,528.35564 26.0309,1.41573 -0.70786,23.30006 -26.38483,-1.76966 z'
				/>
				<circle class='pin-circle' cx='75.973892' cy='542.70227' r='2.1235924' />
			</g>
			<!-- Avenida Rivadavia -->
			<g id='avenida-rivadavia' class:group-active={currentPathId === 'avenida-rivadavia'}>
				<path
					bind:this={avenidaRivadaviaPath}
					class='place-path'
					fill='#00be4d'
					vector-effect='non-scaling-stroke'
					role='button'
					tabindex='0'
					aria-label='Avenida Rivadavia'
					d='m 24.897591,411.24854 255.074059,0.15718 -0.0162,-3.42918 -254.964559,0.5098 z'
				/>
				<circle class='pin-circle' cx='127.81216' cy='409.99713' r='2.1235924' />
			</g>
			<!-- Avenida Alvear -->
			<g id='avenida-alvear' class:group-active={currentPathId === 'avenida-alvear'}>
				<path
					bind:this={avenidaAlvearPath}
					class='place-path'
					fill='#00be4d'
					vector-effect='non-scaling-stroke'
					role='button'
					tabindex='0'
					aria-label='Avenida Alvear'
					d='m 22.425831,379.89559 115.009979,-0.25748 0.33773,-6.9685 -116.316209,-0.49127 z'
				/>
				<circle class='pin-circle' cx='85.01088' cy='376.09967' r='2.1235924' />
			</g>
			<!-- Tribunales -->
			<g id='tribunales' class:group-active={currentPathId === 'tribunales'}>
				<rect
					bind:this={tribunalesPath}
					class='place-path'
					fill='#00be4d'
					vector-effect='non-scaling-stroke'
					role='button'
					tabindex='0'
					aria-label='Tribunales'
					width='13.820243'
					height='19.05287'
					x='77.155823'
					y='352.06348'
				/>
				<circle class='pin-circle' cx='83.532181' cy='361.98596' r='2.1235924' />
			</g>
			<!-- Estadio Único -->
			<g id='estadio-unico' class:group-active={currentPathId === 'estadio-unico'}>
				<circle
					bind:this={estadioUnicoPath}
					class='place-path'
					fill='#00be4d'
					vector-effect='non-scaling-stroke'
					role='button'
					tabindex='0'
					aria-label='Estadio Único'
					cx='229.02405'
					cy='33.241516'
					r='22.39249'
				/>
				<circle class='pin-circle' cx='231.18658' cy='32.347748' r='2.1235924' />
			</g>
			<!-- Registro Civil -->
			<g id='registro-civil' class:group-active={currentPathId === 'registro-civil'}>
				<path
					bind:this={registroCivilPath}
					class='place-path'
					fill='#00be4d'
					vector-effect='non-scaling-stroke'
					role='button'
					tabindex='0'
					aria-label='Registro Civil'
					d='m 10.587451,381.52695 h 9.3792 l 2.65449,19.11233 h -9.20223 z'
				/>
				<circle class='pin-circle' cx='16.490738' cy='390.43738' r='2.1235924' />
			</g>
			<!-- CCB -->
			<g id='ccb' class:group-active={currentPathId === 'ccb'}>
				<path
					bind:this={ccbPath}
					class='place-path'
					fill='#00be4d'
					vector-effect='non-scaling-stroke'
					role='button'
					tabindex='0'
					aria-label='CCB'
					d='m 77.642551,502.46645 3.82167,0.35393 -0.57522,8.71664 4.21512,0.52408 -0.23538,4.35104 5.09271,0.35452 -0.0763,3.46314 -5.18929,-0.44551 -0.40021,7.22098 -8.77671,-0.35393 z'
				/>
				<circle class='pin-circle' cx='81.094269' cy='517.92395' r='2.1235924' />
			</g>
		</g>
		<g id='building' class='building-group' class:zoom-active={currentZoomedIndex !== null}>
			<g id='airesderio' class='airesderio-path'>
				<circle
					class='pin-airesderio'
					cx='203.69386'
					cy='413.82022'
					r='4.3814869'
				/>
				<path
					bind:this={airesderioPath}
					d='m 202.97288,409.90271 2.2931,0.0425 0.29238,0.2863 -0.002,5.19212 -0.23275,0.44892 0.001,1.48465 -3.31504,-0.0163 -0.0239,-1.23152 0.11181,-5.11477 z'
				/>
			</g>
		</g>
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
