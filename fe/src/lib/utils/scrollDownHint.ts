/**
 * Landing scroll hint: when to start the delayed prompt (client-only).
 * Uses localStorage key {@link SCROLL_HINT_STORAGE_KEY} when the user dismisses by scrolling.
 */

export const SCROLL_HINT_STORAGE_KEY = 'aires-scroll-hint-dismissed';

/** Pixels; scroll beyond this counts as "user scrolled" */
export const SCROLL_HINT_SCROLL_THRESHOLD = 8;

/** Extra slack so borderline layouts still count as scrollable */
export const SCROLL_HINT_SCROLLABLE_BUFFER_PX = 20;

export const SCROLL_HINT_DELAY_MS = 10_000;

/** Must match `.gesture-hint--flash`: `0.65s` × 3 iterations */
export const SCROLL_HINT_FLASH_DURATION_MS = Math.round(0.65 * 3 * 1000);

/** Must match reduced-motion fade-in (~0.35s) plus a short visible beat */
export const SCROLL_HINT_FLASH_DURATION_REDUCED_MS = 600;

export function isPageScrollable(scrollHeight: number, innerHeight: number): boolean {
	return scrollHeight > innerHeight + SCROLL_HINT_SCROLLABLE_BUFFER_PX;
}

export function shouldStartScrollHintTimer(params: {
	storedDismissed: boolean;
	scrollY: number;
	scrollHeight: number;
	innerHeight: number;
}): boolean {
	if (params.storedDismissed) return false;
	if (params.scrollY > SCROLL_HINT_SCROLL_THRESHOLD) return false;
	if (!isPageScrollable(params.scrollHeight, params.innerHeight)) return false;
	return true;
}
