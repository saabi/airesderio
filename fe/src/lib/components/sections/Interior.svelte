<script module lang='ts'>
	// ===== IMPORTS =====
	// Local components
	import Title from '$lib/components/ui/Title.svelte';
	import Carousel from '$lib/components/ui/Carousel.svelte';
	import VisuallyHidden from '$lib/components/ui/VisuallyHidden.svelte';

	// Local utilities
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
	import {
		ANIMATION,
		animationDelay,
		animationDuration,
		animationOffset
	} from '$lib/constants/animation';

	// ===== STATIC CONSTANTS =====
	// Import images with ?enhanced for optimization
	import interior1 from '$lib/assets/carousel-interior/4_DB_Lobby.jpg?enhanced';
	import interior2 from '$lib/assets/carousel-interior/5_DB_EXTERIOR_01 (6).jpg?enhanced';
	import interior3 from '$lib/assets/carousel-interior/6_DB_EXTERIOR_01 (5).jpg?enhanced';
	import interior4 from '$lib/assets/carousel-interior/7_DB_EXTERIOR_01 (7).jpg?enhanced';
	import interior5 from '$lib/assets/carousel-interior/8_Antebaño y Lavadero.jpg?enhanced';
	import interior6 from '$lib/assets/carousel-interior/9_DB_INT_BLANCO (5).png?enhanced';

	const INTERIOR_IMAGES = [
		{ src: interior1, alt: 'Lobby del edificio' },
		{ src: interior2, alt: 'Exterior del edificio' },
		{ src: interior3, alt: 'Exterior del edificio' },
		{ src: interior4, alt: 'Exterior del edificio' },
		{ src: interior5, alt: 'Antebaño y lavadero' },
		{ src: interior6, alt: 'Interior del departamento' }
	];
</script>

<script lang='ts'>
	// ===== INSTANCE CONSTANTS =====
	const { action: interiorObserver, visible: interiorVisible } = createSectionObserver('interior', {
		threshold: ANIMATION.threshold.section
	});
</script>

<section
	id='interior'
	aria-labelledby='interior-heading'
	use:interiorObserver
	data-section-active={$interiorVisible}
>
	<VisuallyHidden id='interior-heading' tag='h2'>Diseño Interior</VisuallyHidden>
	<div
		class='scroll-animate'
		style={`--scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<Title eyebrow='Diseño de' big='INTERIORES' />
	</div>
	<div class='interior-container'>
		<div
			class='interior-gallery scroll-animate'
			style={`--scroll-animate-delay: ${animationDelay(3)}; --scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration('slow')}; --scroll-animate-scale: 0.95;`}
		>
			<Carousel
				images={INTERIOR_IMAGES}
				interval={2500}
				ariaLabel='Galería de imágenes del diseño interior'
				imageAriaLabel={(index) => INTERIOR_IMAGES[index].alt}
			/>
		</div>
		<div class='interior-text'>
			<p
				class='scroll-animate'
				style={`--scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-delay: ${animationDelay(1)}; --scroll-animate-duration: ${animationDuration()};`}
			>
				Ambientes amplios de un dormitorio que combinan diseño contemporáneo y funcionalidad, con
				materiales ecológicos, formas curvas y detalles en madera y vegetación.
			</p>
			<p
				class='scroll-animate'
				style={`--scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-delay: ${animationDelay(2)}; --scroll-animate-duration: ${animationDuration()};`}
			>
				Grandes aberturas optimizan luz y ventilación natural, mejorando el confort y la eficiencia
				energética.
			</p>
			<p
				class='scroll-animate'
				style={`--scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-delay: ${animationDelay(3)}; --scroll-animate-duration: ${animationDuration()};`}
			>
				La iluminación LED, ya integrada, resalta los ambientes con luz indirecta, creando espacios
				armónicos y relajantes. Solo será necesario sumar artefactos de luz directa a gusto de cada
				usuario.
			</p>
		</div>
	</div>
</section>

<style>
	#interior {
		max-width: var(--max);
		margin: 0 auto;
		font-size: 1.2rem;
	}

	.interior-container {
		/* Layout */
		display: grid;
		grid-template-columns: 1fr 0.5fr;
		gap: 2rem;
		align-items: start;
		margin-top: 1.5rem;
	}

	.interior-text {
		/* Layout */
		display: flex;
		flex-direction: column;
	}
	.interior-text p {
		/* Layout */
		margin-top: 0;
	}

	.interior-gallery {
		/* Layout */
		aspect-ratio: 16 / 9;
		width: 100%;

		/* Box/Visual */
		border-radius: 0.5rem;
		overflow: hidden;
		box-shadow: 0 0.25rem 0.75rem var(--shadow-soft);

		/* Misc/Overrides */
		will-change: transform, opacity;
	}

	@media (max-width: 850px) {
		.interior-container {
			/* Layout */
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.interior-gallery {
			/* Layout */
			aspect-ratio: auto;
			height: 12rem;
		}
	}
</style>
