<script module lang='ts'>
	// ===== IMPORTS =====
	import ImageCarousel from '$lib/components/ui/ImageCarousel.svelte';
	import Slide from '$lib/components/ui/Slide.svelte';

	import { verticalViewport } from '$lib/utils/viewport';
	import { animationDuration, animationOffset } from '$lib/constants/animation';
	import { scrollReveal } from '$lib/utils/scrollReveal';

	// ===== STATIC CONSTANTS =====
	const CAROUSEL_IMAGES = [
		{ src: '/carrousel-hero/desktop/d-9-pasillos.jpg', alt: 'Pasillos' },
		{ src: '/carrousel-hero/desktop/d-11-cocina.jpg', alt: 'Cocina' },
		{ src: '/carrousel-hero/desktop/d-12-cocina.jpg', alt: 'Cocina' },
		{ src: '/carrousel-hero/desktop/d-14-living.jpg', alt: 'Living' },
		{ src: '/carrousel-hero/desktop/d-15-cocina-living-comedor.jpg', alt: 'Cocina, living y comedor' },
		{ src: '/carrousel-hero/desktop/d-16-habitacion-simple.jpg', alt: 'Habitación' },
		{ src: '/carrousel-hero/desktop/d-17-vestidor-simple.jpg', alt: 'Vestidor' },
		{ src: '/carrousel-hero/desktop/d-18-baño-simple.jpg', alt: 'Baño' },
		{ src: '/carrousel-hero/desktop/d-22-banitori.jpg', alt: 'Bañador' },
	];

	const CAROUSEL_IMAGES_MOBILE = [...CAROUSEL_IMAGES];
</script>

<script lang='ts'>
	const activeImages = $derived($verticalViewport ? CAROUSEL_IMAGES_MOBILE : CAROUSEL_IMAGES);
</script>

<section
	id='interior'
	class='carousel-section carousel-section--harmony'
	aria-labelledby='interior-heading'
>
	<div class='carousel-container'>
		<div
			class='carousel-gallery scroll-animate'
			use:scrollReveal
			style={`--scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration('slow')}; --scroll-animate-scale: 0.95;`}
		>
			{#key $verticalViewport}
				<ImageCarousel
					slideCount={activeImages.length}
					slideAriaLabel={(index) => activeImages[index].alt}
					autoRotate={true}
					interval={2500}
					pauseOnHover={true}
					showNavigation={true}
					navigationPosition={$verticalViewport ? 'below-image' : 'around-dots'}
					buttonVariant="overlay"
					buttonSize="md"
					showDots={true}
					dotsVariant="default"
					transitionType="fade-scale"
					imageFit="cover"
					ariaLabel='Galería de imágenes del diseño interior Harmony'
				>
					{#snippet slide(index)}
						<Slide
							type="image"
							src={activeImages[index].src}
							alt={activeImages[index].alt}
						/>
					{/snippet}
				</ImageCarousel>
			{/key}
		</div>
		<div class='carousel-text'>
			<p
				class='scroll-animate'
				use:scrollReveal
				style={`--scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
			>
				Ambientes amplios que combinan diseño contemporáneo y funcionalidad, con
				materiales ecológicos, formas curvas y detalles en madera.
			</p>
		</div>
	</div>
</section>

<style>
	.carousel-section {
		max-width: var(--max);
		margin: 0 auto;
		font-size: 1.4rem;
	}

	.carousel-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2.5rem;
		margin-top: 1.5rem;
	}

	.carousel-text {
		max-width: 56rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.carousel-text p {
		margin-top: 0;
	}

	.carousel-gallery {
		aspect-ratio: 16 / 9;
		width: 100%;
		max-width: 56rem;
		margin: 0 auto;
		overflow: visible;
		will-change: transform, opacity;
	}

	/* Sombra y bordes solo sobre el área de imagen (no flechas/puntos debajo) */
	.carousel-gallery :global(.image-carousel) {
		overflow: visible;
	}

	.carousel-gallery :global(.carousel-images) {
		border-radius: 0.5rem;
		overflow: hidden;
		box-shadow: 0 0.25rem 0.75rem var(--shadow-soft);
	}

	@media (max-width: 850px) {
		.carousel-gallery {
			aspect-ratio: 4 / 3;
		}
	}
</style>
