import { browser } from '$app/environment';
import { readable } from 'svelte/store';

/**
 * Whether the viewport is taller than wide (portrait-like).
 * Use for selecting mobile-optimized image sets in carousels.
 * SSR: always false (assume desktop).
 *
 * Uses window.innerHeight > innerWidth instead of matchMedia('(orientation: portrait)')
 * because on some mobile browsers (e.g. iPhone X+ Safari) the orientation media query
 * can return inverted or wrong values on load; viewport dimensions are reliable.
 */
function isVerticalViewport(): boolean {
	return window.innerHeight > window.innerWidth;
}

function createVerticalViewportStore() {
	if (!browser) {
		return readable(false, () => {});
	}
	return readable(isVerticalViewport(), (set) => {
		const sync = () => set(isVerticalViewport());
		window.addEventListener('resize', sync);
		window.addEventListener('orientationchange', sync);
		return () => {
			window.removeEventListener('resize', sync);
			window.removeEventListener('orientationchange', sync);
		};
	});
}

export const verticalViewport = createVerticalViewportStore();
