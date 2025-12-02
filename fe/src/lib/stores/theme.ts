import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import {
	resolveInitialTheme,
	setTheme as setThemeUtil,
	applyTheme,
	clearThemePreference,
	type Theme
} from '$lib/utils/theme';

// ===== STORE =====
function createThemeStore() {
	// Initialize with resolved theme
	const initialTheme = resolveInitialTheme();
	const { subscribe, set, update } = writable<Theme>(initialTheme);

	// Apply initial theme
	if (browser) {
		setThemeUtil(initialTheme);
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
			// Uses same storage key as theme utilities ('aires-theme')
			const stored = window.localStorage.getItem('aires-theme');
			if (stored === 'light' || stored === 'dark') return;

			const newTheme = event.matches ? 'dark' : 'light';
			applyTheme(newTheme);
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
			setThemeUtil(theme);
			set(theme);
		},
		toggle: () => {
			update((current) => {
				const newTheme = current === 'light' ? 'dark' : 'light';
				setThemeUtil(newTheme);
				return newTheme;
			});
		},
		clear: () => {
			const newTheme = clearThemePreference();
			set(newTheme);
		},
		cleanup: () => {
			domObserver?.disconnect();
			systemPreferenceCleanup?.();
		}
	};
}

export const theme = createThemeStore();

