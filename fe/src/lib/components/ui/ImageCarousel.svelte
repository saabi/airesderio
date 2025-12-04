<script module lang='ts'>
	// ===== IMPORTS =====
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import type { Snippet } from 'svelte';
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

	export type NavigationPosition = 'absolute-sides' | 'around-dots';
	export type DotsPosition = 'below-image' | 'bottom-center';
	export type TransitionType = 'fade' | 'fade-scale' | 'instant';
	export type ImageFit = 'cover' | 'contain';

	interface Props {
		// Required
		images: ImageInput[];

		// Navigation
		autoRotate?: boolean;
		interval?: number;
		pauseOnHover?: boolean;
		keyboardNavigation?: boolean;

		// State
		currentIndex?: number; // If provided, makes it controlled (bindable)
		onIndexChange?: (index: number) => void;

		// Navigation UI
		showNavigation?: boolean;
		navigationPosition?: NavigationPosition;
		buttonVariant?: 'overlay' | 'solid' | 'bordered' | 'accent';
		buttonSize?: 'sm' | 'md' | 'lg' | 'xl';

		// Dots
		showDots?: boolean;
		dotsVariant?: 'default' | 'accent' | 'inverse';
		dotsPosition?: DotsPosition;

		// Transitions
		transitionType?: TransitionType;
		transitionDuration?: number;

		// Image
		imageFit?: ImageFit;
		imageSizes?: string; // For enhanced images

		// Accessibility
		ariaLabel?: string;
		imageAriaLabel?: string | ((index: number) => string);

		// Styling
		class?: string;
		containerClass?: string;
		// Note: 'class' prop is handled by Svelte, this is for additional classes

		// Slots
		header?: Snippet;
		footer?: Snippet;
	}
</script>

<script lang='ts'>
	// ===== PROPS =====
	let {
		images,
		autoRotate = false,
		interval = 5000,
		pauseOnHover = true,
		keyboardNavigation = false,
		currentIndex: controlledIndex = $bindable(undefined),
		onIndexChange,
		showNavigation = true,
		navigationPosition = 'around-dots',
		buttonVariant = 'overlay',
		buttonSize = 'md',
		showDots = true,
		dotsVariant = 'default',
		dotsPosition = 'bottom-center',
		transitionType = 'fade-scale',
		transitionDuration = 800,
		imageFit = 'cover',
		imageSizes = '100vw',
		ariaLabel = 'Carrusel de imágenes',
		imageAriaLabel = (index: number) => `Imagen ${index + 1}`,
		class: className = '',
		containerClass = '',
		header,
		footer
	}: Props = $props();

	// ===== STATE =====
	let internalIndex = $state(0);
	let carouselInterval: ReturnType<typeof setInterval> | null = null;
	let carouselElement: HTMLDivElement | null = $state(null);
	let isVisible = $state(false);
	let intersectionObserver: IntersectionObserver | null = null;

	// ===== DERIVED =====
	// Determine if component is controlled
	const isControlled = $derived.by(() => controlledIndex !== undefined);

	// Current index (controlled or uncontrolled)
	const currentImageIndex = $derived.by(() => {
		return isControlled ? controlledIndex! : internalIndex;
	});

	// ===== LIFECYCLE =====
	onMount(() => {
		if (autoRotate) {
			startCarousel();
		}
		// Set up keyboard navigation after element is bound
		// Use requestAnimationFrame to ensure element is in DOM
		if (keyboardNavigation && browser) {
			requestAnimationFrame(() => {
				setupKeyboardNavigation();
			});
		}
		return () => {
			stopCarousel();
			cleanupKeyboardNavigation();
		};
	});

	onDestroy(() => {
		stopCarousel();
		cleanupKeyboardNavigation();
	});

	// ===== KEYBOARD NAVIGATION SETUP =====
	/**
	 * Sets up keyboard navigation with Intersection Observer to handle multiple carousels.
	 * Only carousels that are at least 50% visible in the viewport will respond to keyboard events.
	 * This prevents multiple carousels from responding simultaneously when multiple are on the page.
	 */
	function setupKeyboardNavigation() {
		if (!browser || !keyboardNavigation) return;

		// Set up Intersection Observer to track visibility
		if (carouselElement) {
			intersectionObserver = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						// Consider visible if at least 50% of the carousel is in viewport
						// This threshold prevents multiple carousels from responding simultaneously
						isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
					}
				},
				{
					threshold: [0, 0.5, 1.0], // Track at 0%, 50%, and 100% visibility
					rootMargin: '0px'
				}
			);
			intersectionObserver.observe(carouselElement);
		}

		// Add global keyboard listener
		// Note: All carousels listen, but only visible ones respond (checked in handleKeydown)
		window.addEventListener('keydown', handleKeydown);
	}

	function cleanupKeyboardNavigation() {
		if (intersectionObserver) {
			intersectionObserver.disconnect();
			intersectionObserver = null;
		}
		if (keyboardNavigation && browser) {
			window.removeEventListener('keydown', handleKeydown);
		}
	}

	// ===== FUNCTIONS =====
	function nextImage() {
		const newIndex = (currentImageIndex + 1) % images.length;
		goToImage(newIndex);
	}

	function previousImage() {
		const newIndex = (currentImageIndex - 1 + images.length) % images.length;
		goToImage(newIndex);
	}

	function goToImage(index: number) {
		if (isControlled) {
			onIndexChange?.(index);
		} else {
			internalIndex = index;
		}
	}

	function startCarousel() {
		if (!autoRotate || images.length <= 1) return;
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

	function handleKeydown(e: KeyboardEvent) {
		if (!keyboardNavigation) return;

		// Only respond if carousel is visible in viewport (at least 50% visible)
		// This prevents multiple carousels from responding simultaneously when multiple
		// carousels are on the same page. The Intersection Observer tracks visibility.
		if (!isVisible) return;

		// Don't handle if user is typing in an input field
		const target = e.target as HTMLElement;
		if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
			return;
		}

		switch (e.key) {
			case 'ArrowLeft':
				e.preventDefault();
				previousImage();
				break;
			case 'ArrowRight':
				e.preventDefault();
				nextImage();
				break;
		}
	}

	function handleMouseEnter() {
		if (pauseOnHover && autoRotate) {
			stopCarousel();
		}
	}

	function handleMouseLeave() {
		if (pauseOnHover && autoRotate) {
			startCarousel();
		}
	}

	// Get image source
	function getImageSrc(image: ImageInput): string {
		return typeof image === 'string' ? image : image.src;
	}

	// Get image alt text
	function getImageAlt(image: ImageInput, index: number): string {
		if (typeof image === 'string') {
			return typeof imageAriaLabel === 'function'
				? imageAriaLabel(index)
				: imageAriaLabel;
		}
		return (
			image.alt ||
			(typeof imageAriaLabel === 'function' ? imageAriaLabel(index) : imageAriaLabel)
		);
	}

	// Check if image is enhanced
	function isEnhancedImage(image: ImageInput): boolean {
		return typeof image !== 'string';
	}
</script>

<div
	bind:this={carouselElement}
	class='image-carousel {containerClass} {className}'
	class:transition-fade={transitionType === 'fade'}
	class:transition-fade-scale={transitionType === 'fade-scale'}
	class:transition-instant={transitionType === 'instant'}
	class:fit-cover={imageFit === 'cover'}
	class:fit-contain={imageFit === 'contain'}
	role='region'
	aria-label={ariaLabel}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	style='--transition-duration: {transitionDuration}ms;'
>
	{#if header}
		{@render header()}
	{/if}

	<div class='carousel-images'>
		{#each images as image, index}
			{@const isString = typeof image === 'string'}
			{@const imageSrc = getImageSrc(image)}
			{@const imageAlt = getImageAlt(image, index)}
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
						sizes={imageSizes}
						loading={index === 0 ? 'eager' : 'lazy'}
						class='carousel-image-content'
					/>
				{/if}
			</div>
		{/each}
	</div>

	{#if showNavigation && images.length > 1}
		{#if navigationPosition === 'around-dots'}
			<div class='carousel-navigation around-dots'>
				<CircularButton
					variant={buttonVariant}
					size={buttonSize}
					ariaLabel='Imagen anterior'
					onClick={previousImage}
				>
					<ArrowLeft />
				</CircularButton>
				{#if showDots}
					<CarouselDots
						total={images.length}
						currentIndex={currentImageIndex}
						onDotClick={goToImage}
						ariaLabel={(index) => `Ver imagen ${index + 1}`}
						variant={dotsVariant}
						showTransform={true}
					/>
				{/if}
				<CircularButton
					variant={buttonVariant}
					size={buttonSize}
					ariaLabel='Siguiente imagen'
					onClick={nextImage}
				>
					<ArrowRight />
				</CircularButton>
			</div>
		{:else if navigationPosition === 'absolute-sides'}
			<CircularButton
				class='nav-button prev'
				variant={buttonVariant}
				size={buttonSize}
				ariaLabel='Imagen anterior'
				onClick={previousImage}
			>
				<ArrowLeft />
			</CircularButton>
			<CircularButton
				class='nav-button next'
				variant={buttonVariant}
				size={buttonSize}
				ariaLabel='Siguiente imagen'
				onClick={nextImage}
			>
				<ArrowRight />
			</CircularButton>
		{/if}
	{/if}

	{#if showDots && dotsPosition === 'below-image' && images.length > 1}
		<CarouselDots
			total={images.length}
			currentIndex={currentImageIndex}
			onDotClick={goToImage}
			ariaLabel={(index) => `Ver imagen ${index + 1}`}
			variant={dotsVariant}
			containerClass='container'
		/>
	{/if}

	{#if footer}
		{@render footer()}
	{/if}
</div>

<style>
	.image-carousel {
		/* Positioning */
		position: relative;

		/* Layout */
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.carousel-images {
		/* Positioning */
		position: relative;

		/* Layout */
		width: 100%;
		height: 100%;
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

		/* Misc/Overrides */
		will-change: opacity, transform, filter;
	}

	/* Transition: fade-scale */
	.image-carousel.transition-fade-scale .carousel-image {
		/* Box/Visual */
		filter: blur(0);
		transform: scale(1.05);

		/* Effects & Motion */
		transition:
			opacity var(--transition-duration) cubic-bezier(0.4, 0, 0.2, 1),
			transform var(--transition-duration) cubic-bezier(0.4, 0, 0.2, 1),
			filter var(--transition-duration) cubic-bezier(0.4, 0, 0.2, 1);
	}

	.image-carousel.transition-fade-scale .carousel-image.active {
		/* Box/Visual */
		opacity: 1;
		filter: blur(0);
		transform: scale(1);
	}

	/* Transition: fade */
	.image-carousel.transition-fade .carousel-image {
		/* Effects & Motion */
		transition: opacity var(--transition-duration) ease-in-out;
	}

	.image-carousel.transition-fade .carousel-image.active {
		/* Box/Visual */
		opacity: 1;
	}

	/* Transition: instant */
	.image-carousel.transition-instant .carousel-image {
		/* Layout */
		display: none;
	}

	.image-carousel.transition-instant .carousel-image.active {
		/* Layout */
		display: block;
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
		object-position: center;
		display: block;
	}

	/* Image fit: cover */
	.image-carousel.fit-cover .carousel-image-content {
		/* Box/Visual */
		object-fit: cover;
	}

	/* Image fit: contain */
	.image-carousel.fit-contain .carousel-image-content {
		/* Box/Visual */
		object-fit: contain;
	}

	.image-carousel.fit-contain .carousel-image {
		/* Box/Visual */
		background-size: contain;
	}

	/* Navigation: around-dots */
	.carousel-navigation.around-dots {
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

	/* Navigation: absolute-sides */
	:global(.image-carousel .nav-button) {
		/* Positioning */
		position: absolute;
		top: 50%;
		z-index: 10;

		/* Effects & Motion */
		transform: translateY(-50%);
	}

	:global(.image-carousel .nav-button.prev) {
		/* Positioning */
		left: 1rem;
		right: auto;
	}

	:global(.image-carousel .nav-button.next) {
		/* Positioning */
		right: 1rem;
		left: auto;
	}

	:global(.image-carousel .nav-button:hover) {
		/* Effects & Motion */
		transform: translateY(-50%) scale(1.1);
	}

	:global(.image-carousel .nav-button:active) {
		/* Effects & Motion */
		transform: translateY(-50%) scale(0.95);
	}

	/* Mobile responsiveness */
	@media (max-width: 640px) {
		:global(.image-carousel .nav-button.prev) {
			/* Positioning */
			left: 0.5rem;
		}

		:global(.image-carousel .nav-button.next) {
			/* Positioning */
			right: 0.5rem;
		}
	}
</style>

