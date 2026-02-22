<script module lang="ts">
	// ===== IMPORTS =====
	import { tweened } from 'svelte/motion';
	import { floorPlanOverlayStore } from '$lib/stores/floorPlanOverlay';
	import type { FloorPlanZone, FloorPlanZoomMode, SvgShape, ViewBox } from '$lib/types';

	const ZOOM_TWEEN = { duration: 400, easing: (t: number) => t * (2 - t) };

	// ===== TYPES =====
	export interface InteractiveFloorPlanData {
		image: string | unknown;
		title: string;
		description: string;
		interactive?: boolean;
		zones?: FloorPlanZone[];
		/** When true (default), hover shows semi-transparent fill + stroke over the zone so the image stays visible; cursor is pointer when zones are interactive regardless. */
		highlightOnHover?: boolean;
		zoomMode?: FloorPlanZoomMode;
		/** When true, clicking a zone opens a viewport-sized overlay (full screen) instead of zooming in-place. */
		zoomToViewport?: boolean;
		/** When false, the Volver (back) button is hidden; click outside the zone still zooms out. Default true. */
		showBackButton?: boolean;
		highResImage?: string | unknown;
		rotateOnMobile?: boolean;
		aspectRatio?: number; // width / height
	}

	function normalizeShapes(shape: SvgShape | SvgShape[]): SvgShape[] {
		return Array.isArray(shape) ? shape : [shape];
	}
</script>

<script lang="ts">
	// ===== PROPS =====
	let { plan, isActive = true }: { plan: InteractiveFloorPlanData; isActive?: boolean } = $props();

	// ===== STATE =====
	let imageDimensions = $state<{ width: number; height: number } | null>(null);
	let hoveredZoneId = $state<string | null>(null);
	let zoomedZoneId = $state<string | null>(null);
	let currentViewBox = $state<ViewBox | null>(null);
	let maximized = $state(false);
	let imageElement = $state<HTMLImageElement | null>(null);
	let zonesGroupElement = $state<SVGGElement | null>(null);

	// Reset zoom when plan changes or when this slide is no longer active (e.g. user switched to another slide)
	$effect(() => {
		plan;
		if (!isActive) {
			currentViewBox = null;
			zoomedZoneId = null;
			maximized = false;
			floorPlanOverlayStore.set(null);
		}
	});

	// Sync overlay state to store so overlay can be rendered in parent (avoids clipping by carousel overflow)
	$effect(() => {
		if (maximized && zoomedZoneId && imageDimensions) {
			floorPlanOverlayStore.set({
				viewBoxAttr,
				currentImageSrc,
				imageDimensions,
				title: plan.title,
				showBackButton: plan.showBackButton !== false
			});
		} else {
			floorPlanOverlayStore.set(null);
		}
	});

	// When overlay is closed from outside (e.g. Volver in FloorPlans), reset local state
	$effect(() => {
		if ($floorPlanOverlayStore === null) {
			maximized = false;
			currentViewBox = null;
			zoomedZoneId = null;
		}
	});

	// ===== DERIVED =====
	const isInteractive = $derived.by(
		() => Boolean(plan.interactive && plan.zones && plan.zones.length > 0)
	);
	const denormScale = $derived.by(() =>
		imageDimensions ? Math.min(imageDimensions.width, imageDimensions.height) : 1
	);
	const fullViewBox = $derived.by(
		(): ViewBox =>
			imageDimensions
				? { x: 0, y: 0, width: imageDimensions.width, height: imageDimensions.height }
				: { x: 0, y: 0, width: 1, height: 1 }
	);

	// Tweened viewBox for animated zoom / volver
	let viewBoxX = tweened(0, ZOOM_TWEEN);
	let viewBoxY = tweened(0, ZOOM_TWEEN);
	let viewBoxWidth = tweened(1, ZOOM_TWEEN);
	let viewBoxHeight = tweened(1, ZOOM_TWEEN);

	$effect(() => {
		const target = currentViewBox ?? fullViewBox;
		viewBoxX.set(target.x, ZOOM_TWEEN);
		viewBoxY.set(target.y, ZOOM_TWEEN);
		viewBoxWidth.set(target.width, ZOOM_TWEEN);
		viewBoxHeight.set(target.height, ZOOM_TWEEN);
	});

	const viewBoxAttr = $derived(
		`${$viewBoxX} ${$viewBoxY} ${$viewBoxWidth} ${$viewBoxHeight}`
	);
	/** Plan image URL (for dimension loading); enhanced imports use .img.src */
	const planImageSrc = $derived.by(() => {
		if (typeof plan.image === 'string') return plan.image;
		const o = plan.image as { img?: { src?: string }; src?: string };
		return o?.img?.src ?? o?.src ?? '';
	});
	/** Image to display: high-res when zoomed with zoomMode highRes, else plan image */
	const displayImage = $derived.by(() =>
		zoomedZoneId && plan.zoomMode === 'highRes' && plan.highResImage != null
			? plan.highResImage
			: plan.image
	);
	/** Display image as URL string; enhanced imports use .img.src */
	const currentImageSrc = $derived.by(() => {
		if (typeof displayImage === 'string') return displayImage;
		const o = displayImage as { img?: { src?: string }; src?: string };
		return o?.img?.src ?? o?.src ?? planImageSrc;
	});

	// Mobile rotation: elongated plan on narrow viewport when rotateOnMobile is true
	const shouldRotateOnMobile = $derived.by(() => {
		if (!plan.rotateOnMobile) return false;
		const ratio = plan.aspectRatio ?? (imageDimensions ? imageDimensions.width / imageDimensions.height : 0);
		// Elongated = width much larger than height (landscape) or vice versa
		return ratio > 1.5 || (ratio > 0 && ratio < 1 / 1.5);
	});

	// ===== FUNCTIONS =====
	function denorm(value: number): number {
		return value * denormScale;
	}

	function denormPath(d: string): string {
		const scale = denormScale;
		return d.replace(/-?\d+\.?\d*(?:[eE][+-]?\d+)?/g, (match) => {
			const num = parseFloat(match);
			if (isNaN(num)) return match;
			const denormalized = num * scale;
			if (Math.abs(denormalized) < 0.000001 && denormalized !== 0) {
				return denormalized.toFixed(10).replace(/\.?0+$/, '');
			}
			return denormalized.toFixed(6).replace(/\.?0+$/, '');
		});
	}

	function handleImageLoad() {
		if (!imageElement) return;
		const w = imageElement.naturalWidth;
		const h = imageElement.naturalHeight;
		if (w && h) imageDimensions = { width: w, height: h };
	}

	function getOverlayAspectRatio(): number {
		if (typeof document === 'undefined' || !window) return 16 / 9;
		const headerEl = document.querySelector('.site') as HTMLElement | null;
		const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
		const w = window.innerWidth;
		const h = Math.max(1, window.innerHeight - headerHeight);
		return w / h;
	}

	function handleZoneClick(zoneId: string) {
		if (!zonesGroupElement || !plan.zoomMode || !imageDimensions) return;
		const g = zonesGroupElement.querySelector(`#zone-${zoneId}`) as SVGGElement | null;
		if (!g) return;
		try {
			// Prefer bbox that includes stroke (SVG 2) so hover/focus stroke is not clipped
			let bbox: DOMRect;
			try {
				bbox = (g.getBBox as (opts?: { stroke?: boolean }) => DOMRect)({ stroke: true });
			} catch {
				bbox = g.getBBox();
			}
			const imgW = imageDimensions.width;
			const imgH = imageDimensions.height;
			// Generous margin so the full path is never clipped (vertically or horizontally)
			const minSide = Math.min(bbox.width, bbox.height);
			const margin = Math.max(minSide * 0.2, 8);
			let x = Math.max(0, bbox.x - margin);
			let y = Math.max(0, bbox.y - margin);
			let width = bbox.width + margin * 2;
			let height = bbox.height + margin * 2;

			// When opening viewport overlay, expand viewBox to match overlay aspect ratio
			// so the zoomed area fits the overlay well (overlay uses "meet" so full viewBox is always visible)
			if (plan.zoomToViewport) {
				const overlayAspect = getOverlayAspectRatio();
				const viewAspect = width / height;
				if (viewAspect < overlayAspect) {
					// Overlay is wider: expand height so viewBox aspect matches
					const newHeight = width / overlayAspect;
					const addH = (newHeight - height) / 2;
					y = Math.max(0, y - addH);
					height = newHeight;
					if (y + height > imgH) {
						height = imgH - y;
					}
					if (y < 0) {
						y = 0;
						height = Math.min(newHeight, imgH);
					}
				} else if (viewAspect > overlayAspect) {
					// Overlay is taller: expand width
					const newWidth = height * overlayAspect;
					const addW = (newWidth - width) / 2;
					x = Math.max(0, x - addW);
					width = newWidth;
					if (x + width > imgW) {
						width = imgW - x;
					}
					if (x < 0) {
						x = 0;
						width = Math.min(newWidth, imgW);
					}
				}
			}

			// Clamp to image bounds
			x = Math.max(0, Math.min(x, imgW - 1));
			y = Math.max(0, Math.min(y, imgH - 1));
			width = Math.max(1, Math.min(width, imgW - x));
			height = Math.max(1, Math.min(height, imgH - y));

			currentViewBox = { x, y, width, height };
			zoomedZoneId = zoneId;
			if (plan.zoomToViewport) maximized = true;
		} catch {
			// ignore getBBox errors
		}
	}

	function handleBack() {
		maximized = false;
		currentViewBox = null;
		zoomedZoneId = null;
	}
</script>

<div class="interactive-floor-plan" class:rotated={shouldRotateOnMobile}>
	<!-- Full-component click-outside layer: when zoomed, covers entire component so clicking anywhere (including outside image) zooms out -->
	{#if isInteractive && zoomedZoneId}
		<button
			type="button"
			class="zoom-out-backdrop"
			aria-label="Volver al plano completo"
			onclick={handleBack}
		></button>
	{/if}
	{#if !isInteractive}
		<!-- Non-interactive: plain image (always use resolved URL to avoid [object Object]) -->
		<div class="plan-image-wrap">
			{#if planImageSrc}
				<img
					src={planImageSrc}
					alt={plan.title}
					class="plan-image"
					loading="lazy"
				/>
			{/if}
		</div>
	{:else}
		<!-- Interactive: image + SVG overlay with zones -->
		<div
			class="plan-interactive-wrap"
			class:zoomed={zoomedZoneId != null}
		>
			<img
				bind:this={imageElement}
				src={planImageSrc}
				alt={plan.title}
				class="plan-image plan-image-hidden"
				loading="eager"
				onload={handleImageLoad}
			/>
			{#if imageDimensions}
				<svg
					class="plan-overlay"
					viewBox={viewBoxAttr}
					preserveAspectRatio="xMidYMid meet"
					role="img"
					aria-label={plan.title}
					data-interactive-floor-plan="overlay"
				>
					<image
						href={currentImageSrc}
						x="0"
						y="0"
						width={imageDimensions.width}
						height={imageDimensions.height}
						preserveAspectRatio="none"
					/>
					<rect
						class="zoom-backdrop"
						class:active={zoomedZoneId != null}
						x="0"
						y="0"
						width={imageDimensions.width}
						height={imageDimensions.height}
						fill="transparent"
						aria-hidden="true"
						onclick={zoomedZoneId != null ? handleBack : undefined}
					/>
					<g
						bind:this={zonesGroupElement}
						class="zones-group"
						class:highlight-on-hover={plan.highlightOnHover !== false}
						data-floor-plan-zones
					>
						{#each plan.zones ?? [] as zone}
							<g
								id="zone-{zone.id}"
								class="zone"
								class:hovered={hoveredZoneId === zone.id}
								class:zoomed={zoomedZoneId === zone.id}
								role="button"
								tabindex="0"
								aria-label={zone.label}
								onclick={() => handleZoneClick(zone.id)}
								onkeydown={(e) => e.key === 'Enter' && handleZoneClick(zone.id)}
								onmouseenter={() => (hoveredZoneId = zone.id)}
								onmouseleave={() => (hoveredZoneId = null)}
							>
								{#each normalizeShapes(zone.shape) as shape}
									{#if shape.type === 'path'}
										<path class="zone-shape" d={denormPath(shape.d)} />
									{:else if shape.type === 'rect'}
										<rect
											class="zone-shape"
											x={denorm(shape.x)}
											y={denorm(shape.y)}
											width={denorm(shape.width)}
											height={denorm(shape.height)}
										/>
									{:else if shape.type === 'circle'}
										<circle
											class="zone-shape"
											cx={denorm(shape.cx)}
											cy={denorm(shape.cy)}
											r={denorm(shape.r)}
										/>
									{/if}
								{/each}
							</g>
						{/each}
					</g>
				</svg>
			{:else}
				<!-- Fallback while dimensions load: show image only (use resolved URL) -->
				{#if planImageSrc}
					<img src={planImageSrc} alt={plan.title} class="plan-image" loading="lazy" />
				{/if}
			{/if}
			{#if zoomedZoneId && !maximized && plan.showBackButton !== false}
				<button
					type="button"
					class="back-button"
					aria-label="Volver al plano completo"
					onclick={handleBack}
				>
					Volver
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.interactive-floor-plan {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 100%;
		overflow: hidden;
	}

	.interactive-floor-plan.rotated {
		@media (max-width: 640px) {
			transform: rotate(-90deg);
			transform-origin: center center;
			width: 100vh;
			height: 100vw;
			max-width: none;
			max-height: none;
		}
	}

	.plan-image-wrap,
	.plan-interactive-wrap {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	/* When zoomed, wrap is click-through so the zoom-out-backdrop (full component) receives clicks; zones still receive clicks */
	.plan-interactive-wrap.zoomed {
		pointer-events: none;
	}
	.plan-interactive-wrap.zoomed .zones-group {
		pointer-events: auto;
	}

	.plan-interactive-wrap {
		z-index: 1;
	}

	.zoom-out-backdrop {
		position: absolute;
		inset: 0;
		z-index: 0;
		cursor: pointer;
		border: none;
		background: transparent;
	}

	.plan-image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
		object-position: center;
	}

	.plan-image-hidden {
		position: absolute;
		opacity: 0;
		pointer-events: none;
		width: 100%;
		height: auto;
		max-height: none;
	}

	.plan-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: block;
		pointer-events: none;
	}

	.plan-overlay .zones-group {
		pointer-events: auto;
	}

	/* Click outside zone when zoomed → volver; inactive so it doesn't block zone clicks */
	.plan-overlay .zoom-backdrop {
		pointer-events: none;
	}
	.plan-overlay .zoom-backdrop.active {
		pointer-events: auto;
		cursor: pointer;
	}

	/* Cursor reflects interactivity whenever zones are present */
	.zone {
		cursor: pointer;
	}

	.zone-shape {
		fill: transparent;
		stroke: transparent;
		transition: fill 0.15s ease, stroke 0.15s ease;
	}

	/* Optional hover/focus highlight: semi-transparent fill so the image below stays visible.
	   .hovered is the class added by Svelte (class:hovered), not the :hover pseudo. */
	.zones-group.highlight-on-hover .zone.hovered .zone-shape {
		fill: color-mix(in oklch, var(--color-accent-primary, oklch(0.55 0.2 145)) 25%, transparent);
		stroke: var(--color-accent-primary, oklch(0.55 0.2 145));
		stroke-width: 2px;
	}

	.zones-group.highlight-on-hover .zone:focus-visible .zone-shape {
		fill: color-mix(in oklch, var(--color-accent-primary, oklch(0.55 0.2 145)) 20%, transparent);
		stroke: var(--color-accent-primary, oklch(0.55 0.2 145));
		stroke-width: 2px;
	}

	.back-button {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 10;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		border-radius: 0.5rem;
		background: var(--color-bg-canvas);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border-strong);
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.back-button:hover {
		background: var(--color-bg-contrast);
	}
</style>
