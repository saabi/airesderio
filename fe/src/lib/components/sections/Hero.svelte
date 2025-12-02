<script module lang="ts">
	// ===== IMPORTS =====
	import Carousel from '$lib/components/ui/Carousel.svelte';
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
	import { ANIMATION, animationDuration, animationOffset } from '$lib/constants/animation';

	// ===== TYPES =====
	interface Props {
		// Props removed - no longer needed
	}

	// ===== STATIC CONSTANTS =====
	const carouselImageFiles = [
		'1_DB_EXTERIOR_01 (2).jpg',
		'2_DB_EXTERIOR_01 (8).jpg',
		'3_DB_EXTERIOR_01 (1).jpg'
	];
	
	const CAROUSEL_IMAGES = carouselImageFiles.map(file => 
		`/carrousel-hero/${encodeURIComponent(file)}`
	);
</script>

<script lang="ts">
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
	<h2 id='hero-heading' class='vh'>Presentación y Contacto - Aires de Río</h2>
	<div
		class='hero-carousel scroll-animate'
		style={`--scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<Carousel
			images={CAROUSEL_IMAGES}
			interval={5000}
			ariaLabel='Carrusel de imágenes del edificio'
			imageAriaLabel={(index) => `Fachada del edificio Aires de Río - Imagen ${index + 1}`}
		/>
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

	.corner-overlay {
		/* Positioning */
		position: absolute;
		top: 0;
		right: 0;
		
		/* Layout */
		width: 100%;
		height: 100%;
		
		/* Misc/Overrides */
		pointer-events: none;
	}
</style>
