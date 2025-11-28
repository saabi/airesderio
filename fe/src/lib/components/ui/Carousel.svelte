<script module lang="ts">
	// ===== IMPORTS =====
	import { onMount, onDestroy } from 'svelte';

	// ===== TYPES =====
	interface Props {
		images: string[];
		interval?: number;
		ariaLabel?: string;
		imageAriaLabel?: string | ((index: number) => string);
	}
</script>

<script lang="ts">
	// ===== PROPS =====
	let {
		images,
		interval = 5000,
		ariaLabel = 'Carrusel de imágenes',
		imageAriaLabel = (index: number) => `Imagen ${index + 1}`
	}: Props = $props();

	// ===== STATE =====
	let currentImageIndex = $state(0);
	let carouselInterval: ReturnType<typeof setInterval> | null = null;

	// ===== FUNCTIONS =====
	function nextImage() {
		currentImageIndex = (currentImageIndex + 1) % images.length;
	}

	function previousImage() {
		currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
	}

	function goToImage(index: number) {
		currentImageIndex = index;
	}

	function startCarousel() {
		if (carouselInterval) {
			clearInterval(carouselInterval);
		}
		carouselInterval = setInterval(nextImage, interval);
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

<div
	class='carousel'
	role='region'
	aria-label={ariaLabel}
	onmouseenter={stopCarousel}
	onmouseleave={startCarousel}
>
	{#each images as image, index}
		<div
			class='carousel-image'
			class:active={index === currentImageIndex}
			style='background-image: url("{image}")'
			role='img'
			aria-label={typeof imageAriaLabel === 'function' ? imageAriaLabel(index) : imageAriaLabel}
		></div>
	{/each}
	{#if images.length > 1}
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
				{#each images as _, index}
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

<style>
	.carousel {
		/* Positioning */
		position: relative;
		
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
		filter: blur(0);
		
		/* Effects & Motion */
		transition:
			opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.8s cubic-bezier(0.4, 0, 0.2, 1),
			filter 0.8s cubic-bezier(0.4, 0, 0.2, 1);
		transform: scale(1.05);
		
		/* Misc/Overrides */
		will-change: opacity, transform, filter;
	}

	.carousel-image.active {
		/* Box/Visual */
		opacity: 1;
		filter: blur(0);
		
		/* Effects & Motion */
		transform: scale(1);
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
</style>

