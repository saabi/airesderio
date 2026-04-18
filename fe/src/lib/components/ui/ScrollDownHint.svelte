<script lang="ts">
	import { browser } from '$app/environment';
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
		<svg class="scroll-hint__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
			<path fill="currentColor" d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
			<path fill="currentColor" d="M7.41 13.41 12 18l4.59-4.59L18 15l-6 6-6-6 1.41-1.41z" />
		</svg>
		<span class="scroll-hint__text">Deslizá para ver más</span>
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
		max-width: min(9rem, 28vw);
		padding: 0.5rem 0.65rem;

		/* Box/Visual */
		border-radius: 0.5rem;
		background: color-mix(in oklch, var(--header-bg) 88%, transparent);
		color: var(--color-text-inverse);
		box-shadow:
			0 0.35rem 1rem rgba(0, 0, 0, 0.25),
			0 0 0 1px color-mix(in oklch, var(--color-text-inverse) 15%, transparent);
		backdrop-filter: blur(8px);
		pointer-events: none;

		/* Typography */
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: var(--font-weight-medium);
		line-height: 1.25;
		text-align: center;
	}

	.scroll-hint__icon {
		width: 1.35rem;
		height: 1.35rem;
		flex-shrink: 0;
		opacity: 0.95;
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
			font-size: 0.7rem;
			padding: 0.45rem 0.55rem;
			right: var(--scroll-hint-inset, 0.75rem);
		}

		.scroll-hint__icon {
			width: 1.2rem;
			height: 1.2rem;
		}
	}
</style>
