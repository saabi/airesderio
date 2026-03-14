import { browser } from '$app/environment';
import { readable } from 'svelte/store';

/** Delayed syncs (ms) to catch viewport after browser stabilizes on mobile. */
const DELAYED_SYNC_MS = [0, 150, 400] as const;

/** Reported width >= this on mobile UA is likely the wrong default (e.g. 980px before viewport meta); assume portrait. */
const MOBILE_DESKTOP_DEFAULT_WIDTH = 980;

/** Loose mobile user-agent check; used only to prefer portrait when dimensions look wrong on load. */
function isMobileUserAgent(): boolean {
	if (typeof navigator === 'undefined' || !navigator.userAgent) return false;
	const ua = navigator.userAgent.toLowerCase();
	return /android|webos|iphone|ipod|ipad|blackberry|iemobile|opera mini|mobile|fennec|minimo|symbian|kindle|hiptop|playbook|uc browser|silk/i.test(ua);
}

/**
 * Whether the viewport is taller than wide (portrait-like).
 * Use for selecting mobile-optimized image sets in carousels.
 * SSR: always false (assume desktop).
 *
 * Uses layout viewport (clientWidth/clientHeight) then innerWidth/innerHeight.
 * When the device looks like mobile (UA) but reports a desktop-sized width (e.g. 980px
 * before viewport meta is applied), we assume the value is wrong and return true (portrait)
 * so mobile users see the mobile set until dimensions stabilize.
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
	const fromDims = dims ? dims.h > dims.w : false;
	// On mobile UA, if reported width is the common wrong default (980px), assume portrait so we show mobile set
	if (browser && isMobileUserAgent() && dims && dims.w >= MOBILE_DESKTOP_DEFAULT_WIDTH) {
		return true;
	}
	return fromDims;
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
