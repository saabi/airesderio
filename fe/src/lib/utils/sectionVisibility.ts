import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';

export type SectionId = string;

export const activeSection: Writable<SectionId | null> = writable(null);

export interface SectionObserverOptions {
	threshold?: number;
	rootMargin?: string;
	once?: boolean;
}

interface SectionObserverHandle {
	action: (node: HTMLElement) => { destroy(): void } | void;
	visible: Writable<boolean>;
}

export function createSectionObserver(
	id: SectionId,
	{ threshold = 0.4, rootMargin = '0px', once = true }: SectionObserverOptions = {}
): SectionObserverHandle {
	const visible = writable(false);

	function action(node: HTMLElement) {
		if (!browser) {
			visible.set(true);
			return;
		}

		let hasActivated = false;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeSection.set(id);
						visible.set(true);
						hasActivated = true;

						if (once) {
							observer.unobserve(entry.target);
						}
					} else if (!once && !hasActivated) {
						visible.set(false);
					} else if (!once && hasActivated) {
						visible.set(false);
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

	return { action, visible };
}
