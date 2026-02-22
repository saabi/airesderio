<script module lang='ts'>
	// ===== IMPORTS =====
	import { onMount, setContext } from 'svelte';
	import { browser } from '$app/environment';
	import type { Snippet } from 'svelte';
	import CircularButton from '$lib/components/ui/CircularButton.svelte';
	import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
	import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
	import CarouselDots from '$lib/components/ui/CarouselDots.svelte';

	// ===== TYPES =====
	export type NavigationPosition = 'absolute-sides' | 'around-dots';
	export type DotsPosition = 'below-image' | 'bottom-center';
	export type TransitionType = 'fade' | 'fade-scale' | 'instant';
	export type ImageFit = 'cover' | 'contain';

	interface Props {
		// Required: slot-based API
		slideCount: number;
		slide: Snippet<[number]>;

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

		// Image (passed to Slide via context for type="image")
		imageFit?: ImageFit;
		imageSizes?: string;

		// Accessibility
		ariaLabel?: string;
		slideAriaLabel?: (index: number) => string;

		// Styling
		class?: string;
		containerClass?: string;

		// Slots
		header?: Snippet;
		footer?: Snippet;
	}
</script>

<script lang='ts'>
	// ===== PROPS =====
	let {
		slideCount,
		slide,
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
		slideAriaLabel = (i: number) => `Slide ${i + 1}`,
		class: className = '',
		containerClass = '',
		header,
		footer
	}: Props = $props();

	// ===== CONTEXT =====
	// Slide (image type) reads this for imageSizes and imageFit; use getters so values stay current
	setContext('imageCarousel', {
		get imageFit() {
			return imageFit;
		},
		get imageSizes() {
			return imageSizes;
		}
	});

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
		const newIndex = (currentImageIndex + 1) % slideCount;
		goToImage(newIndex);
	}

	function previousImage() {
		const newIndex = (currentImageIndex - 1 + slideCount) % slideCount;
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
		if (!autoRotate || slideCount <= 1) return;
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
</script>

<div
	bind:this={carouselElement}
	class='image-carousel {containerClass} {className}'
	class:transition-fade={transitionType === 'fade'}
	class:transition-fade-scale={transitionType === 'fade-scale'}
	class:transition-instant={transitionType === 'instant'}
	class:fit-cover={imageFit === 'cover'}
	class:fit-contain={imageFit === 'contain'}
	class:dots-below={showDots && dotsPosition === 'below-image' && navigationPosition !== 'around-dots'}
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
		{#each Array(slideCount) as _, i}
			<div
				class='carousel-image'
				class:active={i === currentImageIndex}
				role='img'
				aria-label={slideAriaLabel(i)}
			>
				{@render slide(i)}
			</div>
		{/each}
	</div>

	{#if showNavigation && slideCount > 1}
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
						total={slideCount}
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

	{#if showDots && dotsPosition === 'below-image' && navigationPosition !== 'around-dots' && slideCount > 1}
		<CarouselDots
			total={slideCount}
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

	/* When dots are below, use flex so dots get space and are not clipped */
	.image-carousel.dots-below {
		display: flex;
		flex-direction: column;
	}

	.image-carousel.dots-below .carousel-images {
		flex: 1;
		min-height: 0;
	}

	.carousel-image {
		/* Positioning */
		position: absolute;
		top: 0;
		left: 0;
		z-index: 0;

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

	/* Active slide on top so it receives pointer events (inactive slides keep opacity 0 but were blocking) */
	.carousel-image.active {
		z-index: 1;
	}

	/* For instant transition, ensure images are positioned correctly */
	.image-carousel.transition-instant .carousel-image {
		/* Layout */
		display: none;
		opacity: 1; /* Override opacity for instant transition */
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

	/* Slide content (and legacy .carousel-image-content) fill the cell */
	.carousel-image :global(.slide-content) {
		/* Positioning */
		position: absolute;
		top: 0;
		left: 0;
		/* Layout */
		width: 100%;
		height: 100%;
		min-width: 100%;
		min-height: 100%;
	}

	/* Image fit: cover (Slide uses .carousel-image-content on img/video) */
	.image-carousel.fit-cover :global(.carousel-image-content) {
		/* Box/Visual */
		object-fit: cover;
	}

	/* Image fit: contain */
	.image-carousel.fit-contain :global(.carousel-image-content) {
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

