<script module lang='ts'>
	// ===== IMPORTS =====
	import Title from '$lib/components/ui/Title.svelte';
	import ImageCarousel from '$lib/components/ui/ImageCarousel.svelte';
	import Slide from '$lib/components/ui/Slide.svelte';

	import { createSectionObserver } from '$lib/utils/sectionVisibility';
	import { verticalViewport } from '$lib/utils/viewport';
	import {
		ANIMATION,
		animationDelay,
		animationDuration,
		animationOffset
	} from '$lib/constants/animation';

	// ===== STATIC CONSTANTS =====
	const CAROUSEL_IMAGES = [
		{ src: '/carrousel-hero/desktop/d-10-puertas.jpg', alt: 'Puertas' },
		{ src: '/carrousel-hero/desktop/d-13-cocina.jpg', alt: 'Cocina' },
		{ src: '/carrousel-hero/desktop/d-14-living.jpg', alt: 'Living' },
		{ src: '/carrousel-hero/desktop/d-19-habitacion.jpg', alt: 'Habitación' },
		{ src: '/carrousel-hero/desktop/d-20-vestidor-iluminado.jpg', alt: 'Vestidor iluminado' },
		{ src: '/carrousel-hero/desktop/d-21-baño-pituco.jpg', alt: 'Baño pituco' },
		{ src: '/carrousel-hero/desktop/d-22-banitori.jpg', alt: 'Bañador' },
		{ src: '/carrousel-hero/desktop/d-23-living-4amb.jpg', alt: 'Living 4 ambientes' },
	];

	const CAROUSEL_IMAGES_MOBILE = [...CAROUSEL_IMAGES];
</script>

<script lang='ts'>
	const activeImages = $derived($verticalViewport ? CAROUSEL_IMAGES_MOBILE : CAROUSEL_IMAGES);

	const { action: sectionObserver, visible: sectionVisible } = createSectionObserver(
		'carousel-luxury',
		{ threshold: ANIMATION.threshold.section }
	);
</script>

<section
	id='carousel-luxury'
	class='carousel-section carousel-section--luxury'
	aria-labelledby='carousel-luxury-heading'
	use:sectionObserver
	data-section-active={$sectionVisible}
>
	<div class='carousel-container'>
		<div
			class='carousel-gallery scroll-animate'
			style={`--scroll-animate-delay: ${animationDelay(3)}; --scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration('slow')}; --scroll-animate-scale: 0.95;`}
		>
			{#key $verticalViewport}
				<ImageCarousel
					slideCount={activeImages.length}
					slideAriaLabel={(index) => activeImages[index].alt}
					autoRotate={true}
					interval={2500}
					pauseOnHover={true}
					showNavigation={true}
					navigationPosition="around-dots"
					buttonVariant="overlay"
					buttonSize="md"
					showDots={true}
					dotsVariant="default"
					transitionType="fade-scale"
					imageFit="cover"
					ariaLabel='Galería de imágenes del diseño interior Luxury'
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
				style={`--scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-delay: ${animationDelay(1)}; --scroll-animate-duration: ${animationDuration()};`}
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
		border-radius: 0.5rem;
		overflow: hidden;
		box-shadow: 0 0.25rem 0.75rem var(--shadow-soft);
		will-change: transform, opacity;
	}

	@media (max-width: 850px) {
		.carousel-gallery {
			aspect-ratio: 4 / 3;
		}
	}
</style>
