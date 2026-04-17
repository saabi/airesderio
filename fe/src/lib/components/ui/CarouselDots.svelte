<script module lang='ts'>
	// ===== TYPES =====
	export type DotVariant = 'default' | 'accent' | 'inverse';
	export type DotSize = 'small' | 'medium' | 'large';

	interface Props {
		total: number;
		currentIndex: number;
		onDotClick: (index: number) => void;
		ariaLabel?: string | ((index: number) => string);
		variant?: DotVariant;
		size?: DotSize;
		showTransform?: boolean;
		containerClass?: string;
	}
</script>

<script lang='ts'>
	// ===== PROPS =====
	let {
		total,
		currentIndex,
		onDotClick,
		ariaLabel = (index: number) => `Go to item ${index + 1}`,
		variant = 'default',
		size = 'medium',
		showTransform = false,
		containerClass = ''
	}: Props = $props();

	// ===== FUNCTIONS =====
	function getAriaLabel(index: number): string {
		if (typeof ariaLabel === 'function') {
			return ariaLabel(index);
		}
		return ariaLabel || `Go to item ${index + 1}`;
	}
	$effect((size) => {
		// Detect parent section class (e.g. hero, location, etc) and log with `size`.
		// Also detect/log if a parent has a class with "desktop" or "mobile" in the name.
		const KNOWN_SECTIONS = ['hero', 'location', 'about', 'features', 'gallery', 'contact'];

		const carouselDotsEl = document.querySelector('.carousel-dots');
		let foundSection = null;
		let deviceClass = null;

		if (carouselDotsEl) {
			let el = carouselDotsEl.parentElement;
			while (el && el !== document.body) {
				// Section detection
				for (const sectionClass of KNOWN_SECTIONS) {
					if (el.classList.contains(sectionClass)) {
						foundSection = sectionClass;
					}
				}

				// Device class detection
				for (const className of el.classList) {
					if (className.toLowerCase().includes('desktop')) {
						deviceClass = 'desktop';
					}
					if (className.toLowerCase().includes('mobile')) {
						deviceClass = 'mobile';
					}
				}

				if (foundSection && deviceClass) break;
				el = el.parentElement;
			}

			console.log(
				`CarouselDots: section=${foundSection || 'none'}, deviceClass=${deviceClass || 'none'}, size=${size}`
			);
		} else {
			console.log(`CarouselDots: dots element not found, size: ${size}`);
		}
	});
</script>

<div class='carousel-dots' class:container={containerClass}>
	{#each Array(total) as _, index}
		<button
			class='dot'
			class:active={index === currentIndex}
			class:show-transform={showTransform && index === currentIndex}
			class:variant-default={variant === 'default'}
			class:variant-accent={variant === 'accent'}
			class:variant-inverse={variant === 'inverse'}
			class:size-small={size === 'small'}
			class:size-medium={size === 'medium'}
			class:size-large={size === 'large'}
			onclick={() => onDotClick(index)}
			aria-label={getAriaLabel(index)}
			type='button'
		></button>
	{/each}
</div>

<style>
	.carousel-dots {
		/* Layout */
		display: flex;
		/* More breathing room by default; tightens automatically on narrow/constrained widths. */
		gap: min(0.9rem, 2.5vw);
		align-items: center;
	}

	.carousel-dots.container {
		/* Layout */
		justify-content: center;
		margin-bottom: 1rem;
	}

	.dot {

		/* Box/Visual */
		border: none;
		border-radius: 50%;

		/* Misc/Overrides */
		cursor: pointer;

		/* Effects & Motion */
		transition:
			background-color 0.2s ease,
			transform 0.2s ease;
	}

	/* Size variants */
	.dot.size-small {
		/* Layout */
		width: 0.5rem;
		height: 0.5rem;
	}

	.dot.size-medium {
		/* Layout */
		width: 0.75rem;
		height: 0.75rem;
	}

	.dot.size-large {
		/* Layout */
		width: 1rem;
		height: 1rem;
	}

	/* Variant: default (for Carousel.svelte - inverse style) */
	.dot.variant-default {
		/* Box/Visual */
		background: color-mix(in oklch, var(--color-text-primary) 50%, transparent);
	}

	.dot.variant-default.active {
		/* Box/Visual */
		background: var(--color-text-inverse);
	}

	.dot.variant-default:hover {
		/* Box/Visual */
		background: color-mix(in oklch, var(--color-text-inverse) 75%, transparent);
	}

	/* Variant: accent (for PhotoCarousel.svelte and FloorPlans.svelte) */
	/* Note: FloorPlans uses color-mix for inactive, but PhotoCarousel uses var(--color-neutral-400) */
	/* We'll use var(--color-neutral-400) as default, but FloorPlans can override via CSS if needed */
	.dot.variant-accent {
		/* Box/Visual */
		background: var(--color-neutral-400);
	}

	.dot.variant-accent.active {
		/* Box/Visual */
		background: var(--color-accent-primary);
	}

	.dot.variant-accent:hover {
		/* Box/Visual */
		background: var(--color-neutral-500);
	}

	.dot.variant-accent.active:hover {
		/* Box/Visual */
		background: var(--color-accent-strong);
	}

	/* Variant: inverse (for FloorPlans.svelte - uses color-mix for inactive) */
	.dot.variant-inverse {
		/* Box/Visual */
		background: color-mix(in oklch, var(--color-text-primary) 40%, transparent);
	}

	.dot.variant-inverse.active {
		/* Box/Visual */
		background: var(--color-accent-primary);
	}

	.dot.variant-inverse:hover {
		/* Box/Visual */
		background: color-mix(in oklch, var(--color-accent-primary) 75%, transparent);
	}

	/* Transform animation (when showTransform is true) */
	.dot.active.show-transform {
		/* Effects & Motion */
		transform: scale(1.2);
	}
</style>

