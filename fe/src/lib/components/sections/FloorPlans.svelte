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
	import { verticalViewport } from '$lib/utils/viewport';
	import {
		ANIMATION,
		animationDelay,
		animationDuration,
		animationOffset
	} from '$lib/constants/animation';

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
	}

	// ===== STATIC CONSTANTS =====
	// Images in static/planos/ — use URL strings (no import) so Vite doesn't treat them as module scripts
	const FLOOR_PLANS: FloorPlan[] = [
		{
			image: '/planos/depto-1hab-balcon.jpg',
			title: 'Departamento 1 habitación con balcón',
			description: 'Plano de distribución del departamento de 1 dormitorio con balcón.'
		},
		{
			image: '/planos/depto-1hab-contrafrente.jpg',
			title: 'Departamento 1 habitación contrafrente',
			description: 'Plano de distribución del departamento de 1 dormitorio contrafrente.'
		},
		{
			image: '/planos/depto-2hab-1ofi.jpg',
			title: 'Departamento 2 habitaciones + 1 oficina',
			description: 'Plano de distribución del departamento con 2 habitaciones y 1 oficina.'
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
		<Title eyebrow='Distribución y' big='PLANOS' />
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
					navigationPosition="below-image"
					buttonVariant="bordered"
					buttonSize="md"
					showDots={true}
					dotsVariant="inverse"
					dotsPosition="below-image"
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
		height: 27.5rem;
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
			height: 20rem;
		}


		.floor-plan-title {
			font-size: 1rem;
		}

		.floor-plan-description {
			font-size: 0.875rem;
		}
	}
</style>
