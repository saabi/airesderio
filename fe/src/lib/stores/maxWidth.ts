import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Default max width from CSS
const DEFAULT_MAX_WIDTH = 1200;
const EXPANDED_MAX_WIDTH = 1800; // 50% more (1200 * 1.5)

function createMaxWidthStore() {
	const { subscribe, set, update } = writable<number>(DEFAULT_MAX_WIDTH);
	let isExpanded = false;

	return {
		subscribe,
		toggle: () => {
			update((current) => {
				isExpanded = !isExpanded;
				const newValue = isExpanded ? EXPANDED_MAX_WIDTH : DEFAULT_MAX_WIDTH;
				
				// Apply to CSS variable
				if (browser) {
					document.documentElement.style.setProperty('--max', `${newValue}px`);
				}
				
				return newValue;
			});
		},
		reset: () => {
			isExpanded = false;
			const value = DEFAULT_MAX_WIDTH;
			if (browser) {
				document.documentElement.style.setProperty('--max', `${value}px`);
			}
			set(value);
		},
		init: () => {
			// Initialize CSS variable on mount
			if (browser) {
				const currentValue = getComputedStyle(document.documentElement)
					.getPropertyValue('--max')
					.trim();
				
				if (currentValue) {
					const parsed = parseInt(currentValue);
					if (!isNaN(parsed)) {
						isExpanded = parsed >= EXPANDED_MAX_WIDTH;
						set(parsed);
						return;
					}
				}
				
				// Set default if not found
				document.documentElement.style.setProperty('--max', `${DEFAULT_MAX_WIDTH}px`);
				set(DEFAULT_MAX_WIDTH);
			}
		}
	};
}

export const maxWidth = createMaxWidthStore();

