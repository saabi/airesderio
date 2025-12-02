import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// ===== TYPES =====
export type Theme = 'light' | 'dark';

// ===== CONSTANTS =====
const STORAGE_KEY = 'aires-theme';

// ===== UTILITIES =====
const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark';

const getSystemPreference = (): Theme => {
	if (!browser) return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveInitialTheme = (): Theme => {
	if (!browser) return 'light';
	const stored = window.localStorage.getItem(STORAGE_KEY);
	if (isTheme(stored)) return stored;
	return getSystemPreference();
};

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
	// Initialize with resolved theme
	const initialTheme = resolveInitialTheme();
	const { subscribe, set, update } = writable<Theme>(initialTheme);

	// Apply initial theme to DOM
	if (browser) {
		applyThemeToDOM(initialTheme);
	}

	// Watch for DOM changes (in case theme is changed elsewhere)
	let domObserver: MutationObserver | null = null;
	let systemPreferenceCleanup: (() => void) | null = null;

	if (browser) {
		// Watch for DOM changes to keep store in sync
		domObserver = new MutationObserver(() => {
			const themeAttr = document.documentElement.dataset.theme;
			if (themeAttr === 'light' || themeAttr === 'dark') {
				set(themeAttr);
			}
		});

		domObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});

		// Watch for system preference changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleSystemPreferenceChange = (event: MediaQueryListEvent) => {
			// Only update if user hasn't set a preference
			const stored = window.localStorage.getItem(STORAGE_KEY);
			if (stored === 'light' || stored === 'dark') return;

			const newTheme = event.matches ? 'dark' : 'light';
			applyThemeToDOM(newTheme);
			set(newTheme);
		};

		mediaQuery.addEventListener('change', handleSystemPreferenceChange);
		systemPreferenceCleanup = () => {
			mediaQuery.removeEventListener('change', handleSystemPreferenceChange);
		};
	}

	return {
		subscribe,
		set: (theme: Theme) => {
			saveThemeToStorage(theme);
			applyThemeToDOM(theme);
			set(theme);
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
			const newTheme = getSystemPreference();
			applyThemeToDOM(newTheme);
			set(newTheme);
		},
		cleanup: () => {
			domObserver?.disconnect();
			systemPreferenceCleanup?.();
		}
	};
}

export const theme = createThemeStore();
