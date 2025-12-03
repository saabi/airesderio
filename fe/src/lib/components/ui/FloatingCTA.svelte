<script module lang="ts">
	// ===== IMPORTS =====
	import { browser } from '$app/environment';

	// ===== TYPES =====
	interface Props {
		delay?: number; // Scroll delay in milliseconds
		ctaUrl?: string; // URL to navigate to
		ctaText?: string; // Button text
		fadeDuration?: number; // Fade transition duration in milliseconds
	}

	// ===== STATIC CONSTANTS =====
	const DEFAULT_DELAY = 200;
	const DEFAULT_CTA_URL = '#contacto';
	const DEFAULT_CTA_TEXT = 'Contactanos';
	const DEFAULT_FADE_DURATION = 300;
</script>

<script lang="ts">
	// ===== PROPS =====
	let {
		delay = DEFAULT_DELAY,
		ctaUrl = DEFAULT_CTA_URL,
		ctaText = DEFAULT_CTA_TEXT,
		fadeDuration = DEFAULT_FADE_DURATION
	}: Props = $props();

	// ===== STATE =====
	let scrollY = $state(0);
	let delayedScrollY = $state(0);
	let isContactVisible = $state(false);
	let scrollHistory: number[] = [];
	let animationFrameId: number | null = null;
	let contactObserver: IntersectionObserver | null = null;

	// ===== DERIVED =====
	let showCTA = $derived(!isContactVisible);
	let transformY = $derived(delayedScrollY);
	let opacity = $derived(showCTA ? 1 : 0);

	// ===== EFFECTS =====
	$effect(() => {
		if (!browser) return;

		// Calculate delay in frames (assuming ~60fps = 16ms per frame)
		const delayFrames = Math.max(1, Math.ceil(delay / 16));

		// Initialize scroll position
		scrollY = window.scrollY;
		delayedScrollY = scrollY;
		scrollHistory = [scrollY];

		// Scroll handler with delay
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			scrollY = currentScrollY;

			// Add current scroll position to history
			scrollHistory.push(currentScrollY);

			// Keep only the necessary history
			if (scrollHistory.length > delayFrames) {
				scrollHistory.shift();
			}

			// Update delayed scroll position (use oldest value in history)
			if (scrollHistory.length > 0) {
				delayedScrollY = scrollHistory[0];
			}
		};

		// Use requestAnimationFrame for smooth updates
		const updateScroll = () => {
			handleScroll();
			animationFrameId = requestAnimationFrame(updateScroll);
		};

		// Start animation loop
		animationFrameId = requestAnimationFrame(updateScroll);

		// Set up IntersectionObserver for contact section
		const contactElement = document.getElementById('contacto');
		if (contactElement) {
			contactObserver = new IntersectionObserver(
				(entries) => {
					isContactVisible = entries[0]?.isIntersecting ?? false;
				},
				{
					threshold: 0.1,
					rootMargin: '0px'
				}
			);

			contactObserver.observe(contactElement);
		}

		// Cleanup
		return () => {
			if (animationFrameId !== null) {
				cancelAnimationFrame(animationFrameId);
			}
			if (contactObserver) {
				contactObserver.disconnect();
			}
		};
	});

	// ===== FUNCTIONS =====
	function handleClick(event: MouseEvent) {
		// Handle anchor links with smooth scroll
		if (ctaUrl.startsWith('#')) {
			event.preventDefault();
			const targetId = ctaUrl.slice(1);
			const targetElement = document.getElementById(targetId);

			if (targetElement) {
				// Get header height from CSS variable
				const headerHeight =
					parseFloat(
						getComputedStyle(document.documentElement).getPropertyValue('--header-height')
					) || 80;

				const targetPosition =
					targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

				window.scrollTo({
					top: targetPosition,
					behavior: 'smooth'
				});
			}
		}
	}
</script>

{#if showCTA || opacity > 0}
	<a
		href={ctaUrl}
		class="floating-cta"
		style={`transform: translateY(${transformY}px); opacity: ${opacity}; transition-duration: ${fadeDuration}ms;`}
		onclick={handleClick}
		aria-label={ctaText}
	>
		{ctaText}
	</a>
{/if}

<style>
	.floating-cta {
		/* Positioning */
		position: absolute;
		top: calc(var(--header-height) + var(--floating-cta-top-padding, 1rem));
		right: var(--floating-cta-right-padding, 1.5rem);
		z-index: 40;

		/* Layout */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.875rem 2rem;

		/* Box/Visual */
		border: none;
		border-radius: 0.375rem;
		background: var(--color-accent-primary);
		box-shadow:
			0 0.75rem 0.75rem var(--shadow-soft),
			0 0.5rem 0.25rem var(--shadow-subtle);

		/* Typography */
		font-size: 1rem;
		font-weight: 600;
		text-decoration: none;
		color: var(--color-text-on-accent);
		text-align: center;

		/* Misc/Overrides */
		cursor: pointer;
		white-space: nowrap;

		/* Effects & Motion */
		transition:
			background-color 0.2s ease,
			transform 0.2s ease,
			box-shadow 0.2s ease,
			opacity var(--floating-cta-fade-duration, 300ms) ease;
	}

	.floating-cta:hover {
		/* Box/Visual */
		background: var(--color-accent-hover);
		box-shadow: 0 0.25rem 0.5rem var(--shadow-soft);

		/* Effects & Motion */
		transform: translateY(-1px);
	}

	.floating-cta:active {
		/* Effects & Motion */
		transform: translateY(0);
	}

	.floating-cta:focus-visible {
		/* Box/Visual */
		outline: 2px solid var(--color-accent-secondary);
		outline-offset: 2px;
	}

	@media (max-width: 850px) {
		.floating-cta {
			/* Layout */
			padding: 0.75rem 1.5rem;

			/* Typography */
			font-size: 0.9rem;
		}
	}
</style>
