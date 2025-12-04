<script module lang='ts'>
	// ===== IMPORTS =====
	import { onMount } from 'svelte';
	import CircularButton from '$lib/components/ui/CircularButton.svelte';
	import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
	import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
	import CarouselDots from '$lib/components/ui/CarouselDots.svelte';

	// ===== TYPES =====
	interface ImageData {
		src: string | any; // Enhanced image type
		alt?: string;
	}

	type ImageInput = string | ImageData;

	interface Props {
		images: ImageInput[];
		interval?: number;
		ariaLabel?: string;
		imageAriaLabel?: string | ((index: number) => string);
	}
</script>

<script lang='ts'>
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

	// ===== LIFECYCLE =====
	onMount(() => {
		startCarousel();
		return () => {
			stopCarousel();
		};
	});

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
</script>

<div
	class='carousel'
	role='region'
	aria-label={ariaLabel}
	onmouseenter={stopCarousel}
	onmouseleave={startCarousel}
>
	{#each images as image, index}
		{@const isString = typeof image === 'string'}
		{@const imageSrc = isString ? image : image.src}
		{@const imageAlt = isString ? (typeof imageAriaLabel === 'function' ? imageAriaLabel(index) : imageAriaLabel) : (image.alt || (typeof imageAriaLabel === 'function' ? imageAriaLabel(index) : imageAriaLabel))}
		<div
			class='carousel-image'
			class:active={index === currentImageIndex}
			class:enhanced={!isString}
			style={isString ? "background-image: url('{imageSrc}')" : undefined}
			role='img'
			aria-label={imageAlt}
		>
			{#if !isString}
				<enhanced:img
					src={imageSrc}
					alt={imageAlt}
					sizes='100vw'
					loading={index === 0 ? 'eager' : 'lazy'}
					class='carousel-image-content'
				/>
			{/if}
		</div>
	{/each}
	{#if images.length > 1}
		<div class='carousel-navigation'>
			<CircularButton
				variant="overlay"
				size="md"
				ariaLabel="Imagen anterior"
				onClick={previousImage}
			>
				<ArrowLeft />
			</CircularButton>
			<CarouselDots
				total={images.length}
				currentIndex={currentImageIndex}
				onDotClick={goToImage}
				ariaLabel={(index) => `Ver imagen ${index + 1}`}
				variant='default'
				showTransform={true}
			/>
			<CircularButton
				variant="overlay"
				size="md"
				ariaLabel="Siguiente imagen"
				onClick={nextImage}
			>
				<ArrowRight />
			</CircularButton>
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

	.carousel-image.enhanced {
		/* Layout */
		display: block;
		overflow: hidden;
	}

	.carousel-image-content {
		/* Positioning */
		position: absolute;
		top: 0;
		left: 0;

		/* Layout */
		width: 100%;
		height: 100%;
		min-width: 100%;
		min-height: 100%;

		/* Box/Visual */
		object-fit: cover;
		object-position: center;
		display: block;
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


</style>
