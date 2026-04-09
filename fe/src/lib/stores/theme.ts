import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// ===== TYPES =====
export type Theme = 'light' | 'dark';

// ===== CONSTANTS =====
const STORAGE_KEY = 'aires-theme';

const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark';

// ===== UTILITIES =====
const applyThemeToDOM = (theme: Theme): void => {
	if (!browser) return;
	document.documentElement.dataset.theme = theme;
	document.documentElement.style.colorScheme = theme;
};

const saveThemeToStorage = (theme: Theme): void => {
	if (!browser) return;
	window.localStorage.setItem(STORAGE_KEY, theme);
};

const clearThemeFromStorage = (): void => {
	if (!browser) return;
	window.localStorage.removeItem(STORAGE_KEY);
};

// ===== STORE =====
function createThemeStore() {
	/** Site default: always light (no theme selector in UI). */
	const initialTheme: Theme = 'light';
	const { subscribe, set, update } = writable<Theme>(initialTheme);

	if (browser) {
		applyThemeToDOM(initialTheme);
		saveThemeToStorage('light');
	}

	let domObserver: MutationObserver | null = null;

	if (browser) {
		domObserver = new MutationObserver(() => {
			const themeAttr = document.documentElement.dataset.theme;
			if (isTheme(themeAttr)) {
				set(themeAttr);
			}
		});

		domObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});
	}

	return {
		subscribe,
		set: (next: Theme) => {
			saveThemeToStorage(next);
			applyThemeToDOM(next);
			set(next);
		},
		toggle: () => {
			update((current) => {
				const newTheme = current === 'light' ? 'dark' : 'light';
				saveThemeToStorage(newTheme);
				applyThemeToDOM(newTheme);
				return newTheme;
			});
		},
		clear: () => {
			clearThemeFromStorage();
			applyThemeToDOM('light');
			set('light');
		},
		cleanup: () => {
			domObserver?.disconnect();
		}
	};
}

export const theme = createThemeStore();
