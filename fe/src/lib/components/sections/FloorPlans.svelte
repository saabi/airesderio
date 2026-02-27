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
	import {
		ANIMATION,
		animationDelay,
		animationDuration,
		animationOffset
	} from '$lib/constants/animation';

	// ===== TYPES =====
	interface FloorPlan {
		image: string | any; // Enhanced image type
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
	const PLAN_IMAGES = {
		planT4: '/planos/plano-texturado-4.png',
		planT3: '/planos/plano-texturado-3.png',
		plan2: '/planos/1ra-planta-4-deptos-a.png',
		plan5: '/planos/2da-planta-3-deptos-a.png'
	} as const;

	// Paths from limites-deptos.svg, normalized for image 1674×792 (smaller dim = 1)
	const paths = {
		fl: 'm 0.122566 0.026901 0.814173 0.009256 -0.000335 -0.019418 0.045531 0.000000 -0.001004 0.274862 -0.077336 0.000000 0.000335 0.110815 -0.111150 0.000670 0.001339 0.104454 -0.775706 0.002678 c 0.000000 0.000000 0.000603 -0.137922 0.000335 -0.216943 C 0.018206 0.133316 0.122566 0.026901 0.122566 0.026901 Z',
		fr: 'm 0.121075 0.975656 0.859521 -0.001755 -0.000167 -0.274025 -0.063945 0.001004 c -0.015395 0.000242 -0.019184 -0.007838 -0.019250 -0.015233 -0.000167 -0.018581 0.000000 -0.089054 0.000000 -0.089054 l -0.102445 -0.001339 -0.000196 -0.105989 -0.776710 -0.000277 -0.000396 0.483597 0.103609 -0.000984 z',
		bl: 'm 2.098525 0.012162 -0.870520 0.002234 -0.000335 0.277205 0.069971 0.000335 v 0.109141 l 0.117176 -0.000670 0.000335 0.108137 0.683639 -0.000335 z',
		br: 'm 2.097709 0.979474 -0.323161 0.001792 -0.000167 -0.008872 -0.545902 0.000306 -0.000237 -0.274094 c 0.000000 0.000000 0.059200 -0.000081 0.066566 -0.000081 0.007365 0.000000 0.011538 -0.002245 0.011538 -0.011971 0.000000 -0.011383 0.001339 -0.092304 0.001339 -0.092304 l 0.107132 0.000335 v -0.105793 h 0.684308 z',
		b: 'm 1.227302 0.294412 -0.000162 -0.279519 0.871790 -0.001813 -0.000139 0.968185 -0.322067 0.001004 -0.000167 -0.010378 -0.548049 0.000502 -0.000502 -0.270677 0.068799 -0.000167 c 0.006696 -0.000018 0.008872 -0.003850 0.008872 -0.010546 0.000000 -0.012052 -0.002560 -0.234863 -0.002560 -0.234863 l -0.003899 -0.000037 -0.000348 -0.161764 z'
	}
	const FLOOR_PLANS: FloorPlan[] = [
		{
			image: PLAN_IMAGES.planT4,
			title: 'Primera Planta - 4 Departamentos',
			description: 'Plano de la primera planta con 4 departamentos de 1 dormitorio cada uno.',
			interactive: true,
			highlightOnHover: true,
			zoomMode: 'zoom',
			showBackButton: false,
			// zoomToViewport: true,
			zones: [
				{
					id: 'depto-fl',
					label: 'Depto Delantero Izquierdo',
					shape: {
						type: 'path',
						d: paths.fl
					}
				},
				{
					id: 'depto-br',
					label: 'Depto Trasero Derecho',
					shape: {
						type: 'path',
						d: paths.br
					}
				},
				{
					id: 'depto-bl',
					label: 'Depto Trasero Izquierdo',
					shape: {
						type: 'path',
						d: paths.bl
					}
				},
				{
					id: 'depto-fr',
					label: 'Depto Delantero Derecho',
					shape: {
						type: 'path',
						d: paths.fr
					}
				}
			]
		},
		{
			image: PLAN_IMAGES.plan2,
			title: 'Primera Planta - 4 Departamentos (Alternativa)',
			description: 'Vista alternativa de la primera planta con distribución de los 4 departamentos.'
		},
		{
			image: PLAN_IMAGES.planT3,
			title: 'Segunda Planta - 3 Departamentos',
			description: 'Plano de la segunda planta con 3 departamentos, incluyendo 2 departamentos de 1 dormitorio y 1 departamento doble.',
			interactive: true,
			highlightOnHover: true,
			zoomMode: 'zoom',
			showBackButton: false,
			// zoomToViewport: true,
			zones: [
				{
					id: 'depto-fl',
					label: 'Depto Delantero Izquierdo',
					shape: {
						type: 'path',
						d: paths.fl
					}
				},
				{
					id: 'depto-br',
					label: 'Depto Trasero Derecho',
					shape: {
						type: 'path',
						d: paths.br
					}
				},
				{
					id: 'depto-bl',
					label: 'Depto Trasero Izquierdo',
					shape: {
						type: 'path',
						d: paths.bl
					}
				},
				{
					id: 'depto-fr',
					label: 'Depto Delantero Derecho',
					shape: {
						type: 'path',
						d: paths.fr
					}
				},
				{
					id: 'depto-b',
					label: 'Depto Central',
					shape: {
						type: 'path',
						d: paths.b
					}
				}
			]
		},
		{
			image: PLAN_IMAGES.plan5,
			title: 'Segunda Planta - 3 Departamentos (Alternativa)',
			description: 'Vista alternativa de la segunda planta con distribución de los 3 departamentos.'
		}
	];
</script>

<script lang='ts'>
	// ===== STATE =====
	let currentPlanIndex = $state(0);

	// ===== DERIVED =====
	let currentPlan = $derived.by(() => FLOOR_PLANS[currentPlanIndex]);

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
			<ImageCarousel
				slideCount={FLOOR_PLANS.length}
				slideAriaLabel={(index) => `Plano ${index + 1}: ${FLOOR_PLANS[index].title}`}
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
						props={{ plan: FLOOR_PLANS[index], isActive: currentPlanIndex === index }}
					/>
				{/snippet}
			</ImageCarousel>
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
