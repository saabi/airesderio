<script module lang='ts'>
	// ===== IMPORTS =====
	import Title from '$lib/components/ui/Title.svelte';
	import VisuallyHidden from '$lib/components/ui/VisuallyHidden.svelte';
	import ImageCarousel from '$lib/components/ui/ImageCarousel.svelte';
	import Slide from '$lib/components/ui/Slide.svelte';
	import InteractiveFloorPlan from '$lib/components/features/InteractiveFloorPlan.svelte';
	import { floorPlanOverlayStore } from '$lib/stores/floorPlanOverlay';

	// Local utilities
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
	import { pdfRequestModalStore } from '$lib/stores/pdfRequestModal';
	import { verticalViewport } from '$lib/utils/viewport';
	import {
		ANIMATION,
		animationDelay,
		animationDuration,
		animationOffset
	} from '$lib/constants/animation';

	import type { ClipShape } from '$lib/components/features/InteractiveFloorPlan.svelte';

	// ===== TYPES =====
	interface FloorPlan {
		image: string | any; // Enhanced image type
		/** Vertical/mobile image; falls back to image when absent */
		imageMobile?: string;
		title: string;
		description: string;
		interactive?: boolean;
		zones?: import('$lib/types').FloorPlanZone[];
		highlightOnHover?: boolean;
		zoomMode?: import('$lib/types').FloorPlanZoomMode;
		zoomToViewport?: boolean;
		showBackButton?: boolean;
		highResImage?: string | unknown;
		rotateOnMobile?: boolean;
		aspectRatio?: number;
		clipShape?: ClipShape;
	}

	// ===== STATIC CONSTANTS =====
	const FLOOR_PLANS: FloorPlan[] = [
		{
			image: '/planos/depto-1hab-balcon.jpg',
			title: 'Departamento de 2 ambientes con balcón',
			description: 'FRENTE',
			clipShape: {
				type: 'path',
				d: 'M30.5 561.5l1575.141 0.575 -1.141 220.425 213 -2 0.09 184.684c1.743,14.108 7.443,23.575 20,25l145.91 1.316 -1 558 -1741 4 0 -5 -211 1 0 -988z'
			}
		},
		{
			image: '/planos/depto-1hab-contrafrente.jpg',
			title: 'Departamento de 2 ambientes',
			description: 'CONTRAFRENTE',
			clipShape: {
				type: 'polygon',
				points: '139.5,563.5 1877.5,559.5 1877.379,1549.742 516.5,1549.5 516.5,1334.426 279.5,1334.5 279.527,1116.5 139.5,1116.5'
			}
		},
		{
			image: '/planos/depto-2hab-1ofi.jpg',
			title: 'Departamento de 4 ambientes',
			description: 'CONTRAFRENTE',
			clipShape: {
				type: 'polygon',
				points: '151.5,95.5 152.475,653.306 292.5,653.5 292.5,1462.5 152.5,1463.5 152.5,2006.5 1246.5,2006.5 1247.5,2026.5 1278.5,2026.5 1278.5,2023.5 1889.5,2024.5 1889.5,94.5'
			}
		}
	];
</script>

<script lang='ts'>
	// ===== STATE =====
	let currentPlanIndex = $state(0);

	// ===== DERIVED =====
	const activePlans = $derived.by(() =>
		FLOOR_PLANS.map((p) => ({
			...p,
			image: $verticalViewport && p.imageMobile ? p.imageMobile : p.image
		}))
	);
	let currentPlan = $derived.by(() => activePlans[currentPlanIndex]);

	// ===== INSTANCE CONSTANTS =====
	const { action: floorPlansObserver, visible: floorPlansVisible } = createSectionObserver(
		'floor-plans',
		{
			threshold: ANIMATION.threshold.section
		}
	);

	// ===== FUNCTIONS =====
	function handleIndexChange(index: number) {
		currentPlanIndex = index;
	}
</script>

<section
	id='planos'
	aria-labelledby='planos-heading'
	use:floorPlansObserver
	data-section-active={$floorPlansVisible}
>
	<VisuallyHidden id='planos-heading' tag='h2'>Planos</VisuallyHidden>
	<div
		class='scroll-animate'
		style={`--scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<Title eyebrow='PLANOS y' big='Distribución' />
	</div>
	<div
		class='floor-plans-container scroll-animate'
		style={`--scroll-animate-delay: ${animationDelay(1)}; --scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<div class='carousel-wrapper'>
			{#key $verticalViewport}
				<ImageCarousel
					slideCount={activePlans.length}
					slideAriaLabel={(index) => `Plano ${index + 1}: ${activePlans[index].title}`}
					bind:currentIndex={currentPlanIndex}
					onIndexChange={handleIndexChange}
					autoRotate={false}
					showNavigation={true}
					navigationPosition="above-image"
					buttonVariant="bordered"
					buttonSize="md"
					showDots={true}
					dotsVariant="inverse"
					dotsPosition="above-image"
					transitionType="fade"
					transitionDuration={600}
					imageFit="contain"
					imageSizes="(min-width: 1024px) 1024px, 100vw"
					ariaLabel="Galería de planos de distribución"
				>
					{#snippet slide(index)}
						<Slide
							type="component"
							component={InteractiveFloorPlan as import('svelte').Component}
							props={{ plan: activePlans[index], isActive: currentPlanIndex === index }}
						/>
					{/snippet}
				</ImageCarousel>
			{/key}
		</div>
		<figure class='floor-plan-info'>
			<figcaption class='floor-plan-title'>{currentPlan.title}</figcaption>
			<p class='floor-plan-description'>{currentPlan.description}</p>
		</figure>
		<div class='floor-plan-download-wrap'>
			<button
				type='button'
				class='floor-plan-download'
				onclick={() => pdfRequestModalStore.open('planos')}
				aria-label='Solicitar planos'
			>
				SOLICITAR PLANOS
			</button>
		</div>
	</div>
	{#if $floorPlanOverlayStore}
		{@const overlay = $floorPlanOverlayStore}
		<div
			class='floor-plan-viewport-overlay'
			role='dialog'
			aria-modal='true'
			aria-label={overlay.title}
		>
			<button
				type='button'
				class='floor-plan-viewport-overlay-backdrop'
				aria-label='Cerrar'
				onclick={() => floorPlanOverlayStore.set(null)}
			></button>
			<div class='floor-plan-viewport-overlay-content'>
				<svg
					class='floor-plan-viewport-overlay-svg'
					viewBox={overlay.viewBoxAttr}
					preserveAspectRatio='xMidYMid meet'
					aria-hidden='true'
				>
					<image
						href={overlay.currentImageSrc}
						x='0'
						y='0'
						width={overlay.imageDimensions.width}
						height={overlay.imageDimensions.height}
						preserveAspectRatio='none'
					/>
				</svg>
			</div>
			{#if overlay.showBackButton !== false}
				<button
					type='button'
					class='floor-plan-viewport-overlay-close'
					aria-label='Volver al plano completo'
					onclick={() => floorPlanOverlayStore.set(null)}
				>
					Volver
				</button>
			{/if}
		</div>
	{/if}
</section>

<style>
	#planos {
		max-width: var(--max);
		margin: 0 auto;
	}

	.floor-plans-container {
		/* Layout */
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.carousel-wrapper {
		/* Positioning */
		position: relative;

		/* Layout */
		width: 100%;
		height: 80vh;
		overflow: hidden;

		/* Box/Visual */
		border: 1px solid var(--color-border-default);
		border-radius: 0.5rem;
		background: var(--color-bg-canvas);
	}

	/* ImageCarousel handles image and navigation styles */



	.floor-plan-info {
		/* Layout */
		margin: 0;
		padding: 0 1rem;

		/* Typography */
		text-align: center;
	}

	.floor-plan-title {
		/* Typography */
		font-family: var(--font-heading);
		font-size: 1.1rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-accent-primary);
		margin-bottom: 0.5rem;
	}

	.floor-plan-description {
		/* Typography */
		font-family: var(--font-body);
		font-size: 0.95rem;
		color: var(--color-text-secondary);
		line-height: var(--line-height-normal);
		margin: 0;
	}

	.floor-plan-download-wrap {
		display: flex;
		justify-content: center;
		margin-top: 1rem;
	}

	.floor-plan-download {
		display: block;
		padding: 0.75rem 1.25rem;
		font-size: 0.85rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		text-align: center;
		color: var(--color-text-on-accent);
		background: var(--color-accent-primary);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-family: inherit;
		transition: opacity 0.2s;
	}

	.floor-plan-download:hover {
		opacity: 0.92;
	}

	.floor-plan-download:focus-visible {
		outline: 2px solid var(--color-accent-primary);
		outline-offset: 2px;
	}

	/* Viewport overlay: fixed below the page header, full width and remaining height */
	.floor-plan-viewport-overlay {
		position: fixed;
		top: var(--header-height);
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1000;
		background: rgba(0, 0, 0, 0.6);
	}

	.floor-plan-viewport-overlay-backdrop {
		position: absolute;
		inset: 0;
		cursor: pointer;
		border: none;
		background: transparent;
	}

	.floor-plan-viewport-overlay-content {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.floor-plan-viewport-overlay-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
	}

	.floor-plan-viewport-overlay-close {
		position: absolute;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1001;
		pointer-events: auto;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		border-radius: 0.5rem;
		background: var(--color-bg-canvas);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border-strong);
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.floor-plan-viewport-overlay-close:hover {
		background: var(--color-bg-contrast);
	}

	/* Mobile responsiveness */
	@media (max-width: 640px) {
		.floor-plans-container {
			gap: 1rem;
			margin-top: 1.5rem;
		}

		.carousel-wrapper {
			height: 60vh;
		}


		.floor-plan-title {
			font-size: 1rem;
		}

		.floor-plan-description {
			font-size: 0.875rem;
		}
	}
</style>
