<script lang="ts">
	import { browser } from '$app/environment';
	import ScrollDownArrowsIcon from '$lib/components/ui/ScrollDownArrowsIcon.svelte';
	import {
		SCROLL_HINT_DELAY_MS,
		SCROLL_HINT_FLASH_DURATION_MS,
		SCROLL_HINT_FLASH_DURATION_REDUCED_MS,
		SCROLL_HINT_SCROLL_THRESHOLD,
		SCROLL_HINT_STORAGE_KEY,
		shouldStartScrollHintTimer
	} from '$lib/utils/scrollDownHint';

	/** Matches common mobile layout breakpoint (see ImageCarousel / sections). */
	const MOBILE_MAX_WIDTH_PX = 850;

	let visible = $state(false);
	/** Hero carousel swipe uses touch; only hint lateral swipe on narrow viewports with touch. */
	let showSwipeHints = $state(false);

	$effect(() => {
		if (!browser) return;
		const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`);
		function syncSwipeHints(): void {
			const touch =
				'ontouchstart' in window || (typeof navigator !== 'undefined' && (navigator.maxTouchPoints ?? 0) > 0);
			showSwipeHints = mq.matches && touch;
		}
		syncSwipeHints();
		mq.addEventListener('change', syncSwipeHints);
		return () => mq.removeEventListener('change', syncSwipeHints);
	});

	function persistDismissed(): void {
		try {
			localStorage.setItem(SCROLL_HINT_STORAGE_KEY, '1');
		} catch {
			/* ignore quota / private mode */
		}
	}

	function readStoredDismissed(): boolean {
		try {
			return localStorage.getItem(SCROLL_HINT_STORAGE_KEY) === '1';
		} catch {
			return false;
		}
	}

	$effect(() => {
		if (!browser) return;

		if (readStoredDismissed()) return;

		const scrollY = window.scrollY;
		const scrollHeight = document.documentElement.scrollHeight;
		const innerHeight = window.innerHeight;

		if (scrollY > SCROLL_HINT_SCROLL_THRESHOLD) {
			persistDismissed();
			return;
		}

		if (
			!shouldStartScrollHintTimer({
				storedDismissed: false,
				scrollY,
				scrollHeight,
				innerHeight
			})
		) {
			return;
		}

		let initialTimer: ReturnType<typeof setTimeout> | null = null;
		let hideAfterFlashTimer: ReturnType<typeof setTimeout> | null = null;
		let nextShowTimer: ReturnType<typeof setTimeout> | null = null;
		let done = false;

		const flashDurationMs = window.matchMedia('(prefers-reduced-motion: reduce)').matches
			? SCROLL_HINT_FLASH_DURATION_REDUCED_MS
			: SCROLL_HINT_FLASH_DURATION_MS;

		function clearCycleTimers(): void {
			if (initialTimer !== null) {
				clearTimeout(initialTimer);
				initialTimer = null;
			}
			if (hideAfterFlashTimer !== null) {
				clearTimeout(hideAfterFlashTimer);
				hideAfterFlashTimer = null;
			}
			if (nextShowTimer !== null) {
				clearTimeout(nextShowTimer);
				nextShowTimer = null;
			}
		}

		function dismissFromScroll(): void {
			if (done) return;
			if (window.scrollY <= SCROLL_HINT_SCROLL_THRESHOLD) return;
			done = true;
			visible = false;
			persistDismissed();
			clearCycleTimers();
			window.removeEventListener('scroll', onScroll);
		}

		function onScroll(): void {
			dismissFromScroll();
		}

		function runFlashCycle(): void {
			if (done) return;
			visible = true;
			hideAfterFlashTimer = setTimeout(() => {
				hideAfterFlashTimer = null;
				if (done) return;
				visible = false;
				nextShowTimer = setTimeout(() => {
					nextShowTimer = null;
					if (done) return;
					runFlashCycle();
				}, SCROLL_HINT_DELAY_MS);
			}, flashDurationMs);
		}

		window.addEventListener('scroll', onScroll, { passive: true });

		initialTimer = setTimeout(() => {
			initialTimer = null;
			if (done) return;
			runFlashCycle();
		}, SCROLL_HINT_DELAY_MS);

		return () => {
			done = true;
			clearCycleTimers();
			window.removeEventListener('scroll', onScroll);
		};
	});
</script>

{#if visible}
	<div
		class="gesture-hint gesture-hint--flash"
		role="status"
		aria-live="polite"
		aria-label={showSwipeHints
			? 'Deslizá hacia abajo para ver más, o hacia los lados para cambiar de imagen en la galería.'
			: 'Deslizá hacia abajo para ver más.'}
	>
		<div class="gesture-hint__center">
			<div class="gesture-hint__panel-container">
				{#if showSwipeHints}
					<ScrollDownArrowsIcon
						class="gesture-hint__arrows gesture-hint__arrows--side gesture-hint__arrows--next"
					/>
				{/if}
				<div class="gesture-hint__panel">
					<span class="gesture-hint__text">Deslizá para ver más</span>
				</div>
				{#if showSwipeHints}
					<ScrollDownArrowsIcon
						class="gesture-hint__arrows gesture-hint__arrows--side gesture-hint__arrows--prev"
					/>
				{/if}
			</div>
			<ScrollDownArrowsIcon class="gesture-hint__arrows gesture-hint__arrows--down" />
		</div>
	</div>
{/if}

<style>
	.gesture-hint {
		/* Positioning: vertically at three-quarters viewport height */
		position: fixed;
		top: 75%;
		right: var(--gesture-hint-inset, var(--scroll-hint-inset, 1rem));
		z-index: 35;
		transform: translateY(-50%);

		/* Layout: side arrows + label + down arrows */
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		max-width: min(13rem, 90vw);
		padding: 0.5rem 0.5rem;
		color: var(--color-text-inverse);
		pointer-events: none;
	}

	.gesture-hint__panel-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.35rem;
	}
	.gesture-hint__center {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		min-width: 0;
		flex: 0 1 auto;
	}

	.gesture-hint__panel {
		width: 100%;
		padding: 0.25rem 0.325rem;
		border-radius: 0.25rem;
		background: var(--color-title-emphasis);
		color: var(--color-text-inverse);
		box-shadow:
			0 0.175rem 0.5rem rgba(0, 0, 0, 0.2),
			0 0 0 1px color-mix(in oklch, var(--color-text-inverse) 22%, transparent);

		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: var(--font-weight-medium);
		line-height: 1.25;
		text-align: center;
	}

	/* Same SVG as down chevrons; rotated for horizontal swipe */
	.gesture-hint :global(.gesture-hint__arrows--prev) {
		transform: rotate(-90deg);
	}

	.gesture-hint :global(.gesture-hint__arrows--next) {
		transform: rotate(90deg);
	}

	.gesture-hint :global(.gesture-hint__arrows--side) {
		width: 0.85rem;
		height: 0.85rem;
		flex-shrink: 0;
		opacity: 0.95;
		color: var(--color-title-emphasis);
		filter: drop-shadow(0 0.05rem 0.125rem rgba(0, 0, 0, 0.3));
		pointer-events: none;
	}

	.gesture-hint :global(.gesture-hint__arrows--down) {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		opacity: 0.95;
		color: var(--color-title-emphasis);
		filter: drop-shadow(0 0.05rem 0.125rem rgba(0, 0, 0, 0.3));
		pointer-events: none;
	}

	.gesture-hint__text {
		text-wrap: balance;
		pointer-events: none;
	}

	/* Attention “flash”: a few opacity pulses */
	.gesture-hint--flash {
		animation: gesture-hint-pulse 0.65s ease-in-out 3;
	}

	@keyframes gesture-hint-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.35;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.gesture-hint--flash {
			animation: gesture-hint-fade-in 0.35s ease-out 1;
		}

		@keyframes gesture-hint-fade-in {
			from {
				opacity: 0;
			}
			to {
				opacity: 1;
			}
		}
	}

	@media (max-width: 850px) {
		.gesture-hint {
			right: var(--gesture-hint-inset, var(--scroll-hint-inset, 0.75rem));
		}

		.gesture-hint__panel {
			font-size: 0.6rem;
			padding: 0.225rem 0.275rem;
		}

		.gesture-hint :global(.gesture-hint__arrows--down) {
			width: 3rem;
			height: 3rem;
		}

		.gesture-hint :global(.gesture-hint__arrows--side) {
			width: 1.75rem;
			height: 1.75rem;
		}
	}
</style>
