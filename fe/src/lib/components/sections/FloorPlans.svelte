<script module lang='ts'>
	// ===== IMPORTS =====
	import { browser } from '$app/environment';
	import Title from '$lib/components/ui/Title.svelte';
	import VisuallyHidden from '$lib/components/ui/VisuallyHidden.svelte';
	import ImageCarousel from '$lib/components/ui/ImageCarousel.svelte';
	import Slide from '$lib/components/ui/Slide.svelte';

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

	// ===== TYPES =====
	interface FloorPlan {
		image: string;
		/** Vertical/mobile image; falls back to image when absent */
		imageMobile?: string;
		title: string;
	}

	// ===== STATIC CONSTANTS =====
	const FLOOR_PLANS: FloorPlan[] = [
		{
			image: '/planos/1hab-frente.png',
			title: 'Departamento de 2 ambientes con balcón'
		},
		{
			image: '/planos/1hab-contrafrente.png',
			title: 'Departamento de 2 ambientes'
		},
		{
			image: '/planos/2hab-contrafrente.png',
			title: 'Departamento de 4 ambientes'
		}
	];
</script>

<script lang='ts'>
	const DEFAULT_SLIDE_ASPECT = '4 / 3';
	const DESKTOP_BREAKPOINT_QUERY = '(min-width: 851px)';

	// ===== STATE =====
	let currentPlanIndex = $state(0);
	/** CSS `aspect-ratio` value for the active slide image (e.g. `1877 / 1549`). */
	let planAspectRatio = $state<string>(DEFAULT_SLIDE_ASPECT);
	let isDesktopCarouselLayout = $state(false);

	const aspectBySrc = new Map<string, string>();

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

	// ===== EFFECTS =====
	$effect(() => {
		const src = activePlans[currentPlanIndex]?.image;
		if (!src) return;

		const cached = aspectBySrc.get(src);
		if (cached) {
			planAspectRatio = cached;
			return;
		}

		planAspectRatio = DEFAULT_SLIDE_ASPECT;

		const img = new Image();
		const srcAtRequest = src;
		img.onload = () => {
			if (activePlans[currentPlanIndex]?.image !== srcAtRequest) return;
			if (!img.naturalWidth || !img.naturalHeight) return;
			const ratio = `${img.naturalWidth} / ${img.naturalHeight}`;
			aspectBySrc.set(srcAtRequest, ratio);
			planAspectRatio = ratio;
		};
		img.onerror = () => {
			/* keep DEFAULT_SLIDE_ASPECT */
		};
		img.src = src;
	});

	$effect(() => {
		if (!browser) return;
		const media = window.matchMedia(DESKTOP_BREAKPOINT_QUERY);
		const update = () => {
			isDesktopCarouselLayout = media.matches;
		};
		update();
		media.addEventListener('change', update);
		return () => media.removeEventListener('change', update);
	});

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
		<div class='carousel-wrapper' style:--floor-plan-slide-aspect={planAspectRatio}>
			{#key $verticalViewport}
				<ImageCarousel
					class='floor-plans-carousel'
					slideCount={activePlans.length}
					slideAriaLabel={(index) => `Plano ${index + 1}: ${activePlans[index].title}`}
					bind:currentIndex={currentPlanIndex}
					onIndexChange={handleIndexChange}
					autoRotate={false}
					showNavigation={true}
					navigationPosition={isDesktopCarouselLayout ? 'outside-sides' : 'above-image'}
					buttonVariant="bordered"
					buttonSize="xxl"
					showDots={true}
					dotsVariant="inverse"
					dotsPosition={isDesktopCarouselLayout ? 'below-image' : 'above-image'}
					dotsSize="large"
					transitionType="fade"
					transitionDuration={600}
					imageFit="contain"
					imageSizes="(min-width: 1024px) 1024px, 100vw"
					ariaLabel="Galería de planos de distribución"
				>
					{#snippet caption()}
						<figure class='floor-plan-info'>
							<figcaption class='floor-plan-title'>{currentPlan.title}</figcaption>
						</figure>
					{/snippet}
					{#snippet slide(index)}
						<Slide type="image" src={activePlans[index].image} alt={activePlans[index].title} useAutoAlternateSrc={false} />
					{/snippet}
				</ImageCarousel>
			{/key}
		</div>
		<div class='floor-plan-download-wrap'>
			<button
				id='cta-planos'
				type='button'
				class='floor-plan-download btn-cta-primary'
				onclick={() => pdfRequestModalStore.open('departamentos', 'planos')}
				aria-label='Solicitar ficha técnica'
			>
				SOLICITAR FICHA TÉCNICA
			</button>
		</div>
	</div>
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

		/* Layout: cap width; height still comes from aspect-ratio on .carousel-images */
		width: 100%;
		max-width: 70vh;
		margin-inline: auto;
		overflow: hidden;

		/* Box/Visual */
/* 		border: 1px solid var(--color-border-default);
		border-radius: 0.5rem;
 */		background: var(--color-bg-canvas);
	}

	/* Size slide viewport from intrinsic image ratio (this carousel instance only). */
	.carousel-wrapper :global(.image-carousel.floor-plans-carousel .carousel-images) {
		flex: 0 0 auto;
		width: 100%;
		aspect-ratio: var(--floor-plan-slide-aspect);
		min-height: 0;
		transition: aspect-ratio 0.45s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@media (prefers-reduced-motion: reduce) {
		.carousel-wrapper :global(.image-carousel.floor-plans-carousel .carousel-images) {
			transition: none;
		}
	}

	.floor-plan-info {
		/* Layout: horizontal padding provided by carousel-caption */
		margin: 0;
		padding: 0;

		/* Typography */
		text-align: center;
	}

	.floor-plan-title {
		/* Typography */
		font-family: var(--font-heading);
		font-size: 1.1rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-title-emphasis);
		margin-bottom: 0.5rem;
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
		border-radius: 4px;
		cursor: pointer;
		font-family: inherit;
	}

	/* Mobile responsiveness */
	@media (max-width: 640px) {
		.floor-plans-container {
			gap: 1rem;
			margin-top: 1.5rem;
		}

		.floor-plan-title {
			font-size: 1rem;
		}

	}
</style>
