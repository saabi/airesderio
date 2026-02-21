<script module lang="ts">
	// ===== IMPORTS =====
	import type { FloorPlanZone, FloorPlanZoomMode, SvgShape, ViewBox } from '$lib/types';

	// ===== TYPES =====
	export interface InteractiveFloorPlanData {
		image: string | unknown;
		title: string;
		description: string;
		interactive?: boolean;
		zones?: FloorPlanZone[];
		zoomMode?: FloorPlanZoomMode;
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
	let { plan }: { plan: InteractiveFloorPlanData } = $props();

	// ===== STATE =====
	let imageDimensions = $state<{ width: number; height: number } | null>(null);
	let hoveredZoneId = $state<string | null>(null);
	let zoomedZoneId = $state<string | null>(null);
	let currentViewBox = $state<ViewBox | null>(null);
	let imageElement = $state<HTMLImageElement | null>(null);
	let zonesGroupElement = $state<SVGGElement | null>(null);

	// Reset zoom when plan changes (e.g. carousel slide change)
	$effect(() => {
		plan;
		currentViewBox = null;
		zoomedZoneId = null;
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
	const activeViewBox = $derived.by(() => currentViewBox ?? fullViewBox);
	const viewBoxAttr = $derived.by(
		() =>
			`${activeViewBox.x} ${activeViewBox.y} ${activeViewBox.width} ${activeViewBox.height}`
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

	function handleZoneClick(zoneId: string) {
		if (!zonesGroupElement || !plan.zoomMode) return;
		const g = zonesGroupElement.querySelector(`#zone-${zoneId}`) as SVGGElement | null;
		if (!g) return;
		try {
			const bbox = g.getBBox();
			const margin = Math.min(bbox.width, bbox.height) * 0.1;
			currentViewBox = {
				x: Math.max(0, bbox.x - margin),
				y: Math.max(0, bbox.y - margin),
				width: bbox.width + margin * 2,
				height: bbox.height + margin * 2
			};
			zoomedZoneId = zoneId;
		} catch {
			// ignore getBBox errors
		}
	}

	function handleBack() {
		currentViewBox = null;
		zoomedZoneId = null;
	}
</script>

<div class="interactive-floor-plan" class:rotated={shouldRotateOnMobile}>
	{#if !isInteractive}
		<!-- Non-interactive: plain image -->
		<div class="plan-image-wrap">
			{#if typeof plan.image === 'string'}
				<img
					src={plan.image as string}
					alt={plan.title}
					class="plan-image"
					loading="lazy"
				/>
			{:else}
				<enhanced:img
					src={plan.image as any}
					alt={plan.title}
					class="plan-image"
					loading="lazy"
					sizes="(min-width: 1024px) 1024px, 100vw"
				/>
			{/if}
		</div>
	{:else}
		<!-- Interactive: image + SVG overlay with zones -->
		<div class="plan-interactive-wrap">
			<img
				bind:this={imageElement}
				src={planImageSrc}
				alt={plan.title}
				class="plan-image plan-image-hidden"
				loading="lazy"
				onload={handleImageLoad}
			/>
			{#if imageDimensions}
				<svg
					class="plan-overlay"
					viewBox={viewBoxAttr}
					preserveAspectRatio="xMidYMid meet"
					role="img"
					aria-label={plan.title}
				>
					<image
						href={currentImageSrc}
						x="0"
						y="0"
						width={imageDimensions.width}
						height={imageDimensions.height}
						preserveAspectRatio="none"
					/>
					<g bind:this={zonesGroupElement} class="zones-group">
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
				<!-- Fallback while dimensions load: show image only -->
				{#if typeof plan.image === 'string'}
					<img src={plan.image as string} alt={plan.title} class="plan-image" loading="lazy" />
				{:else}
					<enhanced:img
						src={plan.image as any}
						alt={plan.title}
						class="plan-image"
						loading="lazy"
						sizes="(min-width: 1024px) 1024px, 100vw"
					/>
				{/if}
			{/if}
			{#if zoomedZoneId}
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

	.zone {
		cursor: pointer;
	}

	.zone-shape {
		fill: transparent;
		stroke: transparent;
		transition: fill 0.15s ease, stroke 0.15s ease;
	}

	.zone:hovered .zone-shape {
		fill: color-mix(in oklch, var(--color-accent-primary, oklch(0.55 0.2 145)) 25%, transparent);
		stroke: var(--color-accent-primary, oklch(0.55 0.2 145));
		stroke-width: 2px;
	}

	.zone:focus-visible .zone-shape {
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
