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

	type CarouselItem = { type: 'video'; src: string } | { type: 'image'; src: string; alt: string };

	// ===== STATIC CONSTANTS =====
	const CAROUSEL_ITEMS: CarouselItem[] = [
		{ type: 'video', src: '/carrousel-hero/desktop/promo.webm' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-2-frente-edificio.jpg', alt: 'Frente del edificio Aires de Río' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-2-z-bar-poblada.png', alt: 'Vista Z Bar Poblada' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-4-piscina.png', alt: 'Piscina' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-5-piscina.png', alt: 'Piscina' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-5a-piscina.png', alt: 'Piscina' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-6-piscina.png', alt: 'Piscina' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-7-patio-atras.png', alt: 'Patio trasero' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-8-lobby.png', alt: 'Lobby' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-9-pasillos.png', alt: 'Pasillos' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-10-puertas.png', alt: 'Puertas' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-11-cocina.png', alt: 'Cocina' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-12-cocina.png', alt: 'Cocina' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-13-cocina.png', alt: 'Cocina' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-14-living.png', alt: 'Living' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-15-cocina-living-comedor.png', alt: 'Cocina, living y comedor' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-16-habitacion-simple.png', alt: 'Habitación' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-17-vestidor-simple.png', alt: 'Vestidor' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-18-baño-simple.png', alt: 'Baño' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-19-habitacion.png', alt: 'Habitación' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-20-vestidor-iluminado.png', alt: 'Vestidor iluminado' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-21-baño-pituco.png', alt: 'Baño' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-22-banitori.png', alt: 'Bañador' },
		{ type: 'image', src: '/carrousel-hero/desktop/d-23-living-4amb.png', alt: 'Living 4 ambientes' }
	];

	const CAROUSEL_ITEMS_MOBILE: CarouselItem[] = [
		{ type: 'video', src: '/carrousel-hero/desktop/promo.webm' },
		{ type: 'image', src: '/carrousel-hero/mobile/m-2-frente-edificio.png', alt: 'Frente del edificio Aires de Río' },
		{ type: 'image', src: '/carrousel-hero/mobile/m-2-z-bar-poblada.png', alt: 'Vista Z Bar Poblada' },
		{ type: 'image', src: '/carrousel-hero/mobile/m-3-piscina.png', alt: 'Piscina' },
		{ type: 'image', src: '/carrousel-hero/mobile/m-4-piscina.png', alt: 'Piscina' },
		{ type: 'image', src: '/carrousel-hero/mobile/m-6-piscina.png', alt: 'Piscina' },
		{ type: 'image', src: '/carrousel-hero/mobile/m-7-patio-atras.png', alt: 'Patio trasero' },
		{ type: 'image', src: '/carrousel-hero/mobile/m-8-lobby.png', alt: 'Lobby' },
		{ type: 'image', src: '/carrousel-hero/mobile/m-9-cocina.png', alt: 'Cocina' },
		{ type: 'image', src: '/carrousel-hero/mobile/m-10-cocina.png', alt: 'Cocina' },
		{ type: 'image', src: '/carrousel-hero/mobile/m-11-livings.png', alt: 'Livings' },
		{ type: 'image', src: '/carrousel-hero/mobile/m-12-banitori.png', alt: 'Bañador' },
		{ type: 'image', src: '/carrousel-hero/mobile/m-13-lavadero.png', alt: 'Lavadero' },
		{ type: 'image', src: '/carrousel-hero/mobile/m-14-plano-vestidores.png', alt: 'Plano vestidores' }
	];
</script>

<script lang='ts'>
	// ===== PROPS =====
	let {}: Props = $props();

	// ===== STATE =====
	let currentIndex = $state(0);
	let videoNotEnded = $state(true);

	// ===== DERIVED =====
	/** Mobile carousel shows clamped index so switching from desktop (e.g. 20) doesn't overflow. */
	const mobileIndex = $derived(Math.min(currentIndex, CAROUSEL_ITEMS_MOBILE.length - 1));

	// Clamp index when it exceeds desktop length (e.g. after navigating on mobile then rotating)
	$effect(() => {
		if (currentIndex >= CAROUSEL_ITEMS.length) {
			currentIndex = Math.max(0, CAROUSEL_ITEMS.length - 1);
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
		<!-- Desktop carousel: visible in landscape; hidden in portrait via CSS so browser picks correct set without JS. -->
		<div class='hero-carousel-desktop'>
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
		<!-- Mobile carousel: visible only in portrait via CSS; avoids wrong JS viewport on load. -->
		<div class='hero-carousel-mobile'>
			<ImageCarousel
				currentIndex={mobileIndex}
				onIndexChange={(i) => (currentIndex = i)}
				slideCount={CAROUSEL_ITEMS_MOBILE.length}
				slideAriaLabel={(index) => CAROUSEL_ITEMS_MOBILE[index].type === 'video' ? 'Video promocional Aires de Río' : CAROUSEL_ITEMS_MOBILE[index].alt}
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
					{@const item = CAROUSEL_ITEMS_MOBILE[index]}
					<Slide
						type={item.type}
						src={item.src}
						alt={item.type === 'image' ? item.alt : undefined}
						autoplay={item.type === 'video'}
						onVideoEnd={item.type === 'video' ? handleVideoEnd : undefined}
						isActive={index === mobileIndex}
					/>
				{/snippet}
			</ImageCarousel>
		</div>
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
		/* Box/Visual */
		color: var(--color-text-inverse);
	}

	.hero-carousel {
		/* Positioning */
		position: absolute;

		/* Layout */
		width: 100%;
		height: 100%;
	}

	/* Show desktop in landscape, mobile in portrait; browser applies media query so correct set shows without JS. */
	.hero-carousel-desktop {
		display: block;
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.hero-carousel-mobile {
		display: none;
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	@media (orientation: portrait) {
		.hero-carousel-desktop {
			display: none;
		}
		.hero-carousel-mobile {
			display: block;
		}
	}

	.hero::before {
		/* Positioning */
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;

		/* Box/Visual */
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.25) 0%,
			rgba(0, 0, 0, 0.05) 40%,
			transparent 100%
		);
		pointer-events: none;
	}
</style>
