import { browser } from '$app/environment';
import { readable } from 'svelte/store';

const ORIENTATION_PORTRAIT = '(orientation: portrait)';

/**
 * Store that reports whether the viewport is in portrait/vertical orientation.
 * Use for selecting mobile-optimized image sets in carousels.
 * SSR: always false (assume desktop).
 * Listens to load and orientationchange so the initial value corrects on devices
 * that report orientation only after those events.
 */
function createVerticalViewportStore() {
	if (!browser) {
		return readable(false, () => {});
	}
	const mql = window.matchMedia(ORIENTATION_PORTRAIT);
	return readable(mql.matches, (set) => {
		const sync = () => set(mql.matches);
		mql.addEventListener('change', sync);
		// Re-sync after load and on orientationchange; some mobile browsers report
		// wrong initial orientation until these fire.
		window.addEventListener('load', sync);
		window.addEventListener('orientationchange', sync);
		return () => {
			mql.removeEventListener('change', sync);
			window.removeEventListener('load', sync);
			window.removeEventListener('orientationchange', sync);
		};
	});
}

export const verticalViewport = createVerticalViewportStore();
