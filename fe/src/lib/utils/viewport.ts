import { browser } from '$app/environment';
import { readable } from 'svelte/store';

const DELAYED_SYNC_MS = 150;

/**
 * Whether the viewport is taller than wide (portrait-like).
 * Use for selecting mobile-optimized image sets in carousels.
 * SSR: always false (assume desktop).
 *
 * Prefers visualViewport when available (what's actually visible on mobile);
 * falls back to innerWidth/innerHeight. Syncs on load, resize, orientationchange,
 * visualViewport resize/scroll, and once after DELAYED_SYNC_MS to handle
 * browsers that report wrong dimensions until after first paint.
 */
function isVerticalViewport(): boolean {
	if (browser && window.visualViewport && typeof window.visualViewport.width === 'number') {
		return window.visualViewport.height > window.visualViewport.width;
	}
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
		window.addEventListener('load', sync);
		if (window.visualViewport) {
			window.visualViewport.addEventListener('resize', sync);
			window.visualViewport.addEventListener('scroll', sync);
		}
		const delayedSync = setTimeout(sync, DELAYED_SYNC_MS);
		return () => {
			window.removeEventListener('resize', sync);
			window.removeEventListener('orientationchange', sync);
			window.removeEventListener('load', sync);
			if (window.visualViewport) {
				window.visualViewport.removeEventListener('resize', sync);
				window.visualViewport.removeEventListener('scroll', sync);
			}
			clearTimeout(delayedSync);
		};
	});
}

export const verticalViewport = createVerticalViewportStore();
