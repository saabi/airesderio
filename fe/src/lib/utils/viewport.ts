import { browser } from '$app/environment';
import { readable } from 'svelte/store';

const ORIENTATION_PORTRAIT = '(orientation: portrait)';

/**
 * Store that reports whether the viewport is in portrait/vertical orientation.
 * Use for selecting mobile-optimized image sets in carousels.
 * SSR: always false (assume desktop).
 */
function createVerticalViewportStore() {
	if (!browser) {
		return readable(false, () => {});
	}
	const mql = window.matchMedia(ORIENTATION_PORTRAIT);
	return readable(mql.matches, (set) => {
		const handler = () => set(mql.matches);
		mql.addEventListener('change', handler);
		return () => mql.removeEventListener('change', handler);
	});
}

export const verticalViewport = createVerticalViewportStore();
