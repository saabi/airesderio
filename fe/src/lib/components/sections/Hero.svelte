<script module lang='ts'>
	// ===== IMPORTS =====
	import ImageCarousel from '$lib/components/ui/ImageCarousel.svelte';
	import Slide from '$lib/components/ui/Slide.svelte';
	import VisuallyHidden from '$lib/components/ui/VisuallyHidden.svelte';
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
	import { verticalViewport } from '$lib/utils/viewport';
	import { ANIMATION, animationDuration, animationOffset } from '$lib/constants/animation';

	// ===== TYPES =====
	interface Props {
		// Props removed - no longer needed
	}

	type CarouselItem = { type: 'video'; src: string } | { type: 'image'; src: string; alt: string };

	// ===== STATIC CONSTANTS =====
	const CAROUSEL_ITEMS: CarouselItem[] = [
		{ type: 'video', src: '/carrousel-hero/promo.mov' },
		{ type: 'image', src: '/carrousel-hero/1-db-exterior-01-2.jpg', alt: 'Fachada del edificio Aires de Río - Imagen 1' },
		{ type: 'image', src: '/carrousel-hero/2-db-exterior-01-8.jpg', alt: 'Fachada del edificio Aires de Río - Imagen 2' },
		{ type: 'image', src: '/carrousel-hero/3-db-exterior-01-1.jpg', alt: 'Fachada del edificio Aires de Río - Imagen 3' }
	];

	// Mobile/vertical: placeholder — duplicate desktop until vertical images are ready
	const CAROUSEL_ITEMS_MOBILE: CarouselItem[] = [...CAROUSEL_ITEMS];
</script>

<script lang='ts'>
	// ===== PROPS =====
	let {}: Props = $props();

	// ===== STATE =====
	let currentIndex = $state(0);
	let videoNotEnded = $state(true);

	// ===== DERIVED =====
	const activeItems = $derived($verticalViewport ? CAROUSEL_ITEMS_MOBILE : CAROUSEL_ITEMS);

	// Clamp index when active list changes length
	$effect(() => {
		const len = activeItems.length;
		if (currentIndex >= len) {
			currentIndex = Math.max(0, len - 1);
		}
	});

	// Pause carousel auto-step while the video slide is active and video is still playing
	const pauseAutoRotate = $derived(currentIndex === 0 && videoNotEnded);

	// Reset video-not-ended when leaving the video slide so next time we pause again
	$effect(() => {
		if (currentIndex !== 0) {
			videoNotEnded = true;
		}
	});

	function handleVideoEnd() {
		videoNotEnded = false;
		currentIndex = (currentIndex + 1) % activeItems.length;
	}

	// ===== INSTANCE CONSTANTS =====
	const { action: heroObserver, visible: heroVisible } = createSectionObserver('hero', {
		threshold: ANIMATION.threshold.hero
	});
</script>

<section
	id='top'
	class='hero'
	role='banner'
	aria-labelledby='hero-heading'
	use:heroObserver
	data-section-active={$heroVisible}
>
	<VisuallyHidden id='hero-heading' tag='h2'>Presentación y Contacto - Aires de Río</VisuallyHidden>
	<div
		class='hero-carousel scroll-animate'
		style={`--scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<ImageCarousel
			bind:currentIndex
			onIndexChange={(i) => (currentIndex = i)}
			slideCount={activeItems.length}
			slideAriaLabel={(index) => activeItems[index].type === 'video' ? 'Video promocional Aires de Río' : activeItems[index].alt}
			autoRotate={true}
			interval={5000}
			pauseOnHover={true}
			pauseAutoRotate={pauseAutoRotate}
			showNavigation={true}
			navigationPosition="around-dots"
			buttonVariant="overlay"
			buttonSize="md"
			showDots={true}
			dotsVariant="default"
			transitionType="fade-scale"
			imageFit="cover"
			ariaLabel='Carrusel de imágenes del edificio'
		>
			{#snippet slide(index)}
				{@const item = activeItems[index]}
				<Slide
					type={item.type}
					src={item.src}
					alt={item.type === 'image' ? item.alt : undefined}
					autoplay={item.type === 'video'}
					onVideoEnd={item.type === 'video' ? handleVideoEnd : undefined}
					isActive={index === currentIndex}
				/>
			{/snippet}
		</ImageCarousel>
	</div>
	<!--
		<svg class="corner-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
			<polygon points="100,0 100,100 50,0" fill="var(--color-bg-canvas)" />
		</svg>
	-->
</section>

<style>
	.hero {
		/* Positioning */
		position: relative;

		/* Layout */
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--gap);
		height: calc(100vh - var(--header-height));
		margin-top: var(--header-height);
		padding: 1.5rem;
		align-items: center;
		justify-items: end;
	}

	.hero-carousel {
		/* Positioning */
		position: absolute;

		/* Layout */
		width: 100%;
		height: 100%;
	}
</style>
