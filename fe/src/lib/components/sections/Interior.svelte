<script module lang='ts'>
	// ===== IMPORTS =====
	// Local components
	import Title from '$lib/components/ui/Title.svelte';
	import ImageCarousel from '$lib/components/ui/ImageCarousel.svelte';
	import Slide from '$lib/components/ui/Slide.svelte';
	import VisuallyHidden from '$lib/components/ui/VisuallyHidden.svelte';

	// Local utilities
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
	import { verticalViewport } from '$lib/utils/viewport';
	import {
		ANIMATION,
		animationDelay,
		animationDuration,
		animationOffset
	} from '$lib/constants/animation';

	// ===== STATIC CONSTANTS =====
	const INTERIOR_IMAGES = [
		{ src: '/carrousel-interior/1-lobby.png', alt: 'Lobby del edificio' },
		{ src: '/carrousel-interior/2-traba-puerta.png', alt: 'Traba de puerta' },
		{ src: '/carrousel-interior/3-1hab-cocina.png', alt: 'Cocina departamento 1 habitación' },
		{ src: '/carrousel-interior/4-2hab-living.png', alt: 'Living departamento 2 habitaciones' },
		{ src: '/carrousel-interior/5-1hab-habitacion-placard.png', alt: 'Habitación con placard' },
		{ src: '/carrousel-interior/6-baño-mampara-fija.png', alt: 'Baño con mampara fija' },
		{ src: '/carrousel-interior/7-baño-mampara-deslizante.png', alt: 'Baño con mampara deslizante' },
		{ src: '/carrousel-interior/8-lava-secarropas.png', alt: 'Lavarropas y secarropas' }
	];

	// Mobile/vertical: placeholder — duplicate desktop until vertical images are ready
	const INTERIOR_IMAGES_MOBILE = [...INTERIOR_IMAGES];
</script>

<script lang='ts'>
	// ===== DERIVED =====
	const activeImages = $derived($verticalViewport ? INTERIOR_IMAGES_MOBILE : INTERIOR_IMAGES);

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
					ariaLabel='Galería de imágenes del diseño interior'
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
		<div class='interior-text'>
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
	#interior {
		max-width: var(--max);
		margin: 0 auto;
		font-size: 1.4rem;
	}

	.interior-container {
		/* Layout */
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2.5rem;
		margin-top: 1.5rem;
	}

	.interior-text {
		/* Layout */
		max-width: 56rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.interior-text p {
		/* Layout */
		margin-top: 0;
	}

	.interior-gallery {
		/* Layout */
		aspect-ratio: 16 / 9;
		width: 100%;
		max-width: 56rem;
		margin: 0 auto;

		/* Box/Visual */
		border-radius: 0.5rem;
		overflow: hidden;
		box-shadow: 0 0.25rem 0.75rem var(--shadow-soft);

		/* Misc/Overrides */
		will-change: transform, opacity;
	}

	@media (max-width: 850px) {
		.interior-gallery {
			/* Layout */
			aspect-ratio: 4 / 3;
		}
	}

</style>
