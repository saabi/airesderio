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

	let visible = $state(false);

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
	<div class="scroll-hint scroll-hint--flash" role="status" aria-live="polite">
		<div class="scroll-hint__panel">
			<span class="scroll-hint__text">Deslizá para ver más</span>
		</div>
		<ScrollDownArrowsIcon class="scroll-hint__arrows" />
	</div>
{/if}

<style>
	.scroll-hint {
		/* Positioning */
		position: fixed;
		top: 50%;
		right: var(--scroll-hint-inset, 1rem);
		z-index: 35;
		transform: translateY(-50%);

		/* Layout */
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		max-width: min(6rem, 28vw);
		padding: 0.5rem 0.65rem;
		color: var(--color-text-inverse);
		pointer-events: none;
	}


	.scroll-hint__panel {
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

	.scroll-hint :global(.scroll-hint__arrows) {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		opacity: 0.95;
		color: var(--color-title-emphasis);
		filter: drop-shadow(0 0.05rem 0.125rem rgba(0, 0, 0, 0.3));
		pointer-events: none;
	}

	.scroll-hint__text {
		text-wrap: balance;
		pointer-events: none;
	}

	/* Attention “flash”: a few opacity pulses */
	.scroll-hint--flash {
		animation: scroll-hint-pulse 0.65s ease-in-out 3;
	}

	@keyframes scroll-hint-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.35;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-hint--flash {
			animation: scroll-hint-fade-in 0.35s ease-out 1;
		}

		@keyframes scroll-hint-fade-in {
			from {
				opacity: 0;
			}
			to {
				opacity: 1;
			}
		}
	}

	@media (max-width: 850px) {
		.scroll-hint {
			right: var(--scroll-hint-inset, 0.75rem);
		}

		.scroll-hint__panel {
			font-size: 0.6rem;
			padding: 0.225rem 0.275rem;
		}

		.scroll-hint :global(.scroll-hint__arrows) {
			width: 3rem;
			height: 3rem;
		}
	}
</style>
