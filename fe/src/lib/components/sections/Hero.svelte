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

	const CAROUSEL_IMAGES = [
		{ src: hero1, alt: 'Fachada del edificio Aires de Río - Imagen 1' },
		{ src: hero2, alt: 'Fachada del edificio Aires de Río - Imagen 2' },
		{ src: hero3, alt: 'Fachada del edificio Aires de Río - Imagen 3' }
	];
</script>

<script lang='ts'>
	// ===== PROPS =====
	let {}: Props = $props();

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
			slideCount={CAROUSEL_IMAGES.length}
			slideAriaLabel={(index) => CAROUSEL_IMAGES[index].alt}
			autoRotate={true}
			interval={5000}
			pauseOnHover={true}
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
				<Slide
					type="image"
					src={CAROUSEL_IMAGES[index].src}
					alt={CAROUSEL_IMAGES[index].alt}
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
