<script module lang='ts'>
	// ===== IMPORTS =====
	// Local components
	import Title from '$lib/components/ui/Title.svelte';
	import ImageCarousel from '$lib/components/ui/ImageCarousel.svelte';
	import Slide from '$lib/components/ui/Slide.svelte';
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
	const INTERIOR_IMAGES = [
		{ src: '/carrousel-interior/4-db-lobby.jpg', alt: 'Lobby del edificio' },
		{ src: '/carrousel-interior/IMG-20250124-WA0018.jpg', alt: 'Diseño interior' },
		{ src: '/carrousel-interior/IMG-20250124-WA0019.jpg', alt: 'Diseño interior' },
		{ src: '/carrousel-interior/IMG-20250124-WA0020.jpg', alt: 'Diseño interior' },
		{ src: '/carrousel-interior/IMG-20250124-WA0025.jpg', alt: 'Diseño interior' },
		{ src: '/carrousel-interior/IMG-20250124-WA0026.jpg', alt: 'Diseño interior' },
		{ src: '/carrousel-interior/IMG-20250124-WA0029.jpg', alt: 'Diseño interior' },
		{ src: '/carrousel-interior/8-anteba-o-y-lavadero.jpg', alt: 'Antebaño y lavadero' },
		{ src: '/carrousel-interior/9-db-int-blanco-5.png', alt: 'Interior del departamento' }
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
			<ImageCarousel
				slideCount={INTERIOR_IMAGES.length}
				slideAriaLabel={(index) => INTERIOR_IMAGES[index].alt}
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
						src={INTERIOR_IMAGES[index].src}
						alt={INTERIOR_IMAGES[index].alt}
					/>
				{/snippet}
			</ImageCarousel>
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
