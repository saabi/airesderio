<script module lang="ts">
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
	import type { SlideMediaReadyInfo } from '$lib/types/slideMedia';
	import { parseTierFromCurrentSrc, type CarouselImageTier } from '$lib/utils/carouselImageTier';

	// ===== TYPES =====
	interface FloorPlan {
		image: string;
		/** Vertical/mobile image; falls back to image when absent */
		imageMobile?: string;
		title: string;
		titleMobile?: string;
		subtitle: string;
	}

	// ===== STATIC CONSTANTS =====
	const FLOOR_PLANS: FloorPlan[] = [
		{
			image: '/planos/1hab-frente.png',
			title: 'Departamento de 2 ambientes con balcón',
			titleMobile: 'Dto. de 2 ambientes con balcón',
			subtitle: 'FRENTE'
		},
		{
			image: '/planos/1hab-contrafrente.png',
			title: 'Departamento de 2 ambientes',
			subtitle: 'CONTRAFRENTE'
		},
		{
			image: '/planos/2hab-contrafrente.png',
			title: 'Departamento de 4 ambientes',
			subtitle: 'CONTRAFRENTE'
		}
	];

	/** Width descriptors match intrinsic pixel widths of assets in /static/planos/. */
	const FLOOR_PLAN_WEBP_SRCSETS = [
		'/planos/1hab-frente-half.webp 1008w, /planos/1hab-frente.webp 2016w',
		'/planos/1hab-contrafrente-half.webp 1008w, /planos/1hab-contrafrente.webp 2016w',
		'/planos/2hab-contrafrente-half.webp 1008w, /planos/2hab-contrafrente.webp 2016w'
	] as const;

	const FLOOR_PLAN_IMG_SRCSETS = [
		'/planos/1hab-frente.png 2016w',
		'/planos/1hab-contrafrente.png 2016w',
		'/planos/2hab-contrafrente.png 2016w'
	] as const;
</script>

<script lang="ts">
	const DEFAULT_SLIDE_ASPECT = '4 / 3';
	const DESKTOP_BREAKPOINT_QUERY = '(min-width: 851px)';

	// ===== STATE =====
	let currentPlanIndex = $state(0);
	/** CSS `aspect-ratio` value for the active slide image (e.g. `1877 / 1549`). */
	let planAspectRatio = $state<string>(DEFAULT_SLIDE_ASPECT);
	let isDesktopCarouselLayout = $state(false);
	/** Heuristic tier from last active slide {@link HTMLImageElement.currentSrc} (for next-slide / probes). */
	let imageTier = $state<CarouselImageTier | null>(null);

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
	/** Restore cached aspect when switching slides (before active slide’s img fires decode). */
	$effect(() => {
		const src = activePlans[currentPlanIndex]?.image;
		if (!src) return;

		const cached = aspectBySrc.get(src);
		if (cached) {
			planAspectRatio = cached;
		} else {
			planAspectRatio = DEFAULT_SLIDE_ASPECT;
		}
	});

	function handleSlideMediaReady(info: SlideMediaReadyInfo): void {
		if (info.kind !== 'image') return;

		const logicalSrc = activePlans[currentPlanIndex]?.image;
		if (!logicalSrc) return;

		imageTier = parseTierFromCurrentSrc(info.currentSrc);
		const ratio = `${info.naturalWidth} / ${info.naturalHeight}`;
		aspectBySrc.set(logicalSrc, ratio);
		planAspectRatio = ratio;
	}

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
	id="planos"
	aria-labelledby="planos-heading"
	use:floorPlansObserver
	data-section-active={$floorPlansVisible}
>
	<VisuallyHidden id="planos-heading" tag="h2">Planos</VisuallyHidden>
	<div
		class="scroll-animate"
		style={`--scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<Title eyebrow="PLANOS y" big="Distribución" />
	</div>
	<div
		class="floor-plans-container scroll-animate"
		style={`--scroll-animate-delay: ${animationDelay(1)}; --scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<div
			class="carousel-wrapper"
			style:--floor-plan-slide-aspect={planAspectRatio}
			data-floor-plan-image-tier={imageTier ?? ''}
		>
			{#key $verticalViewport}
				<ImageCarousel
					class="floor-plans-carousel"
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
						<figure class="floor-plan-info">
							<figcaption class="floor-plan-title">
								{$verticalViewport && currentPlan.titleMobile
									? currentPlan.titleMobile
									: currentPlan.title}
							</figcaption>

							{#if currentPlan.subtitle}
								<p class="floor-plan-subtitle">{currentPlan.subtitle}</p>
							{/if}
						</figure>
					{/snippet}
					{#snippet slide(index)}
						<Slide
							type="image"
							src={activePlans[index].image}
							alt={activePlans[index].title}
							useAutoAlternateSrc={false}
							webpSrcset={FLOOR_PLAN_WEBP_SRCSETS[index]}
							imgSrcset={FLOOR_PLAN_IMG_SRCSETS[index]}
							isActive={index === currentPlanIndex}
							onSlideMediaReady={handleSlideMediaReady}
						/>
					{/snippet}
				</ImageCarousel>
			{/key}
		</div>
		<div class="floor-plan-download-wrap">
			<button
				id="cta-planos"
				type="button"
				class="floor-plan-download btn-cta-primary"
				onclick={() => pdfRequestModalStore.open('departamentos', 'planos')}
				aria-label="Solicitar ficha técnica"
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
 */
		background: var(--color-bg-canvas);
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
		/* Layout */
		margin: 0;
		padding: 0.75rem 1rem 0.65rem;
		border-radius: 0.5rem;

		/* Box/Visual */
		background: #bff3e3;

		/* Typography */
		text-align: center;
	}

	.floor-plan-title {
		/* Typography */
		font-family: var(--font-body);
		font-weight: var(--font-weight-bold);
		line-height: 1.15;
		color: #111827;
		margin: 0;
	}

	.floor-plan-subtitle {
		margin: 0.2rem 0 0;
		font-family: var(--font-body);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0.08em;
		line-height: 1;
		text-transform: uppercase;
		color: #ef4444;
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
			font-size: 1.15rem;
		}

		.floor-plan-subtitle {
			font-size: 1.2rem;
		}
	}
</style>
