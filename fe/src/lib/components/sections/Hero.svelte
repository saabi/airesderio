<script module lang="ts">
	// ===== IMPORTS =====
	import { onMount, onDestroy } from 'svelte';
	import ContactForm from '$lib/components/forms/ContactForm.svelte';
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
</script>

<script lang="ts">
	// ===== PROPS =====
	interface Props {
		ctaUrl?: string;
		ctaText?: string;
	}

	let { ctaUrl = '#contacto', ctaText = 'Contactanos' }: Props = $props();

	// ===== STATIC CONSTANTS =====
	const carouselImageFiles = [
		'1_DB_EXTERIOR_01 (2).jpg',
		'2_DB_EXTERIOR_01 (8).jpg',
		'3_DB_EXTERIOR_01 (1).jpg'
	];
	
	const CAROUSEL_IMAGES = carouselImageFiles.map(file => 
		`/carrousel/${encodeURIComponent(file)}`
	);
	const CAROUSEL_INTERVAL = 5000; // 5 seconds

	// ===== INSTANCE CONSTANTS =====
	const { action: heroObserver, visible: heroVisible } = createSectionObserver('hero', {
		threshold: 0.45
	});

	// ===== STATE =====
	let currentImageIndex = $state(0);
	let carouselInterval: ReturnType<typeof setInterval> | null = null;

	// ===== FUNCTIONS =====
	function nextImage() {
		currentImageIndex = (currentImageIndex + 1) % CAROUSEL_IMAGES.length;
	}

	function previousImage() {
		currentImageIndex = (currentImageIndex - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length;
	}

	function goToImage(index: number) {
		currentImageIndex = index;
	}

	function startCarousel() {
		if (carouselInterval) {
			clearInterval(carouselInterval);
		}
		carouselInterval = setInterval(nextImage, CAROUSEL_INTERVAL);
	}

	function stopCarousel() {
		if (carouselInterval) {
			clearInterval(carouselInterval);
			carouselInterval = null;
		}
	}

	// ===== LIFECYCLE =====
	onMount(() => {
		startCarousel();
		return () => {
			stopCarousel();
		};
	});

	onDestroy(() => {
		stopCarousel();
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
		style='--scroll-animate-offset: 48px; --scroll-animate-duration: 520ms;'
		role='region'
		aria-label='Carrusel de imágenes del edificio'
		onmouseenter={stopCarousel}
		onmouseleave={startCarousel}
	>
		{#each CAROUSEL_IMAGES as image, index}
			<div
				class='carousel-image'
				class:active={index === currentImageIndex}
				style='background-image: url("{image}")'
				role='img'
				aria-label='Fachada del edificio Aires de Río - Imagen {index + 1}'
			></div>
		{/each}
		{#if CAROUSEL_IMAGES.length > 1}
			<div class='carousel-navigation'>
				<button
					class='carousel-button prev'
					onclick={previousImage}
					aria-label='Imagen anterior'
					type='button'
				>
					‹
				</button>
				<div class='carousel-dots'>
					{#each CAROUSEL_IMAGES as _, index}
						<button
							class='dot'
							class:active={index === currentImageIndex}
							onclick={() => goToImage(index)}
							aria-label='Ver imagen {index + 1}'
							type='button'
						></button>
					{/each}
				</div>
				<button
					class='carousel-button next'
					onclick={nextImage}
					aria-label='Siguiente imagen'
					type='button'
				>
					›
				</button>
			</div>
		{/if}
	</div>
	<svg class="corner-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
		<polygon points="100,0 100,100 50,0" fill="var(--color-bg-canvas)" />
	</svg>
	<div
		class='hero-contact scroll-animate'
		style='--scroll-animate-delay: 120ms; --scroll-animate-offset: 36px; --scroll-animate-duration: 520ms;'
	>
		<img
			src="/logos/aires-de-rio.svg"
			alt="Proyecto Aires de Río"
			loading="eager"
			decoding="async"
			width="100%"
		/>
		<div class="hero-contact-desktop-only">
			<p>Comunicate con nosotros</p>
			<ContactForm />
		</div>
		{#if ctaUrl}
			<a href={ctaUrl} class="hero-cta scroll-animate" style='--scroll-animate-delay: 200ms; --scroll-animate-offset: 36px; --scroll-animate-duration: 520ms;'>
				{ctaText}
			</a>
		{/if}
	</div>
</section>

<style>
	.hero {
		/* Positioning */
		position: relative;
		height: calc(100vh - var(--header-height));
		margin-top: var(--header-height);
		
		/* Layout */
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--gap);
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
		overflow: hidden;
	}

	.carousel-image {
		/* Positioning */
		position: absolute;
		top: 0;
		left: 0;
		
		/* Layout */
		width: 100%;
		height: 100%;
		
		/* Box/Visual */
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		opacity: 0;
		
		/* Effects & Motion */
		transition: opacity 0.8s ease-in-out;
	}

	.carousel-image.active {
		/* Box/Visual */
		opacity: 1;
	}

	.carousel-navigation {
		/* Positioning */
		position: absolute;
		bottom: 1rem;
		left: 50%;
		z-index: 10;
		
		/* Layout */
		display: flex;
		align-items: center;
		gap: 1rem;
		
		/* Effects & Motion */
		transform: translateX(-50%);
	}

	.carousel-button {
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		flex-shrink: 0;
		
		/* Box/Visual */
		background: color-mix(in oklch, var(--overlay-black-60) 80%, transparent);
		border: none;
		border-radius: 50%;
		
		/* Typography */
		font-size: 2rem;
		line-height: 1;
		color: var(--color-text-inverse);
		
		/* Misc/Overrides */
		cursor: pointer;
		
		/* Effects & Motion */
		transition: background-color 0.2s ease, transform 0.2s ease;
	}

	.carousel-button:hover {
		/* Box/Visual */
		background: color-mix(in oklch, var(--overlay-black-80) 90%, transparent);
		
		/* Effects & Motion */
		transform: scale(1.1);
	}

	.carousel-button:active {
		/* Effects & Motion */
		transform: scale(0.95);
	}

	.carousel-dots {
		/* Layout */
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.dot {
		/* Layout */
		width: 0.75rem;
		height: 0.75rem;
		
		/* Box/Visual */
		border: none;
		border-radius: 50%;
		background: color-mix(in oklch, var(--color-text-primary) 50%, transparent);
		
		/* Misc/Overrides */
		cursor: pointer;
		
		/* Effects & Motion */
		transition: background-color 0.2s ease, transform 0.2s ease;
	}

	.dot.active {
		/* Box/Visual */
		background: var(--color-text-inverse);
		
		/* Effects & Motion */
		transform: scale(1.2);
	}

	.dot:hover {
		/* Box/Visual */
		background: color-mix(in oklch, var(--color-text-inverse) 75%, transparent);
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

	.hero-contact {
		/* Positioning */
		position: relative;
		
		/* Layout */
		padding: 1rem;
		
		/* Box/Visual */
		border: 1px solid var(--color-border-default);
		border-radius: 0.5rem;
		background-color: color-mix(in oklch, var(--color-bg-contrast) 30%, transparent);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.hero-contact h1 {
		/* Typography */
		font-size: 1.1em;
		font-weight: 600;
		letter-spacing: 0.1em;
		color: var(--color-accent-primary);
	}

	.hero-contact p {
		/* Layout */
		margin: 0 0 1rem;
		
		/* Typography */
		font-size: 0.9em;
	}

	.hero-cta {
		/* Layout */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.875rem 2rem;
		margin-top: 1rem;
		
		/* Box/Visual */
		border: none;
		border-radius: 0.375rem;
		background: var(--color-accent-primary);
		box-shadow: 0 0.125rem 0.375rem var(--shadow-subtle);
		
		/* Typography */
		font-size: 1rem;
		font-weight: 600;
		text-decoration: none;
		color: var(--color-text-on-accent);
		
		/* Misc/Overrides */
		cursor: pointer;
		
		/* Effects & Motion */
		transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
	}

	.hero-cta:hover {
		/* Box/Visual */
		background: var(--color-accent-hover);
		box-shadow: 0 0.25rem 0.5rem var(--shadow-soft);
		
		/* Effects & Motion */
		transform: translateY(-1px);
	}

	.hero-cta:active {
		/* Effects & Motion */
		transform: translateY(0);
	}

	@media (max-width: 850px) {
		.hero-contact-desktop-only {
			/* Layout */
			display: none;
		}
	}

</style>
