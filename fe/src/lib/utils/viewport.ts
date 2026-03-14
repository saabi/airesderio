import { browser } from '$app/environment';
import { readable } from 'svelte/store';

/** Delayed syncs (ms) to catch viewport after browser stabilizes on mobile. */
const DELAYED_SYNC_MS = [0, 150, 400] as const;

/**
 * Whether the viewport is taller than wide (portrait-like).
 * Use for selecting mobile-optimized image sets in carousels.
 * SSR: always false (assume desktop).
 *
 * Uses the most reliable, early-available dimension sources in order:
 * 1. Layout viewport (document.documentElement.clientWidth/clientHeight) – same
 *    viewport used for CSS and media queries, stable once viewport meta is applied.
 * 2. Fallback: window.innerWidth/innerHeight.
 * Avoids orientation and visualViewport due to known mobile bugs; syncs on load,
 * resize, orientationchange, and several delayed runs to catch late stabilization.
 */
function getViewportAspectRatio(): { w: number; h: number } | null {
	if (typeof document === 'undefined' || !document.documentElement) return null;
	const cw = document.documentElement.clientWidth;
	const ch = document.documentElement.clientHeight;
	if (cw > 0 && ch > 0) return { w: cw, h: ch };
	if (typeof window !== 'undefined' && window.innerWidth > 0 && window.innerHeight > 0) {
		return { w: window.innerWidth, h: window.innerHeight };
	}
	return null;
}

function isVerticalViewport(): boolean {
	const dims = getViewportAspectRatio();
	return dims ? dims.h > dims.w : false;
}

function createVerticalViewportStore() {
	if (!browser) {
		return readable(false, () => {});
	}
	return readable(isVerticalViewport(), (set) => {
		const sync = () => set(isVerticalViewport());
		window.addEventListener('resize', sync);
		window.addEventListener('orientationchange', sync);
		window.addEventListener('load', sync);
		const timeouts = DELAYED_SYNC_MS.map((ms) => setTimeout(sync, ms));
		return () => {
			window.removeEventListener('resize', sync);
			window.removeEventListener('orientationchange', sync);
			window.removeEventListener('load', sync);
			timeouts.forEach(clearTimeout);
		};
	});
}

export const verticalViewport = createVerticalViewportStore();
