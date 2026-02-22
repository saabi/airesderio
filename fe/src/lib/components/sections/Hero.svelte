<script module lang='ts'>
	// ===== IMPORTS =====
	import ImageCarousel from '$lib/components/ui/ImageCarousel.svelte';
	import Slide from '$lib/components/ui/Slide.svelte';
	import VisuallyHidden from '$lib/components/ui/VisuallyHidden.svelte';
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
	import { ANIMATION, animationDuration, animationOffset } from '$lib/constants/animation';

	// ===== TYPES =====
	interface Props {
		// Props removed - no longer needed
	}

	// ===== STATIC CONSTANTS =====
	// Import images with ?enhanced for optimization
	import hero1 from '$lib/assets/carousel-hero/1_DB_EXTERIOR_01 (2).jpg?enhanced';
	import hero2 from '$lib/assets/carousel-hero/2_DB_EXTERIOR_01 (8).jpg?enhanced';
	import hero3 from '$lib/assets/carousel-hero/3_DB_EXTERIOR_01 (1).jpg?enhanced';

	const heroImages = { hero1, hero2, hero3 };

	const CAROUSEL_ITEMS = [
		{ type: 'video' as const, src: '/carrousel-hero/promo.mov' },
		{ type: 'image' as const, src: heroImages.hero1, alt: 'Fachada del edificio Aires de Río - Imagen 1' },
		{ type: 'image' as const, src: heroImages.hero2, alt: 'Fachada del edificio Aires de Río - Imagen 2' },
		{ type: 'image' as const, src: heroImages.hero3, alt: 'Fachada del edificio Aires de Río - Imagen 3' }
	];
</script>

<script lang='ts'>
	// ===== PROPS =====
	let {}: Props = $props();

	// ===== STATE =====
	let currentIndex = $state(0);
	let videoNotEnded = $state(true);

	// ===== DERIVED =====
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
		currentIndex = (currentIndex + 1) % CAROUSEL_ITEMS.length;
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
			slideCount={CAROUSEL_ITEMS.length}
			slideAriaLabel={(index) => CAROUSEL_ITEMS[index].type === 'video' ? 'Video promocional Aires de Río' : CAROUSEL_ITEMS[index].alt}
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
				{@const item = CAROUSEL_ITEMS[index]}
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
