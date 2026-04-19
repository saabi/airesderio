import { browser } from '$app/environment';

const ATTR = 'data-item-active';

export interface ScrollRevealOptions {
	/** Intersection ratio threshold (0–1). Default ~0.14 */
	threshold?: number;
	/** When true, stop observing after first reveal. Default true */
	once?: boolean;
	/** Passed to IntersectionObserver */
	rootMargin?: string;
}

/**
 * Svelte action: reveal `.scroll-animate` nodes when they enter the viewport.
 * Sets {@link ATTR} on the element (same attribute used elsewhere for staged items).
 */
export function scrollReveal(
	node: HTMLElement,
	{ threshold = 0.14, once = true, rootMargin = '0px 0px -5% 0px' }: ScrollRevealOptions = {}
): { destroy(): void } | void {
	if (!browser) {
		node.setAttribute(ATTR, '');
		return;
	}

	function reveal(): void {
		node.setAttribute(ATTR, '');
	}

	if (node.hasAttribute(ATTR)) {
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				reveal();
				if (once) {
					observer.unobserve(entry.target);
				}
			}
		},
		{ threshold, rootMargin }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
