import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'aires-theme';

const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark';

const systemPreference = (): Theme => {
	if (!browser) return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const resolveInitialTheme = (): Theme => {
	if (!browser) return 'light';
	const stored = window.localStorage.getItem(STORAGE_KEY);
	if (isTheme(stored)) return stored;
	return systemPreference();
};

export const applyTheme = (theme: Theme): Theme => {
	if (!browser) return theme;
	document.documentElement.dataset.theme = theme;
	document.documentElement.style.colorScheme = theme;
	return theme;
};

export const setTheme = (theme: Theme): Theme => {
	if (!browser) return theme;
	window.localStorage.setItem(STORAGE_KEY, theme);
	return applyTheme(theme);
};

export const clearThemePreference = (): Theme => {
	if (!browser) return 'light';
	window.localStorage.removeItem(STORAGE_KEY);
	return applyTheme(systemPreference());
};

export const startThemeObserver = (): (() => void) => {
	if (!browser) return () => {};

	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	const handler = (event: MediaQueryListEvent) => {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		if (isTheme(stored)) return;
		applyTheme(event.matches ? 'dark' : 'light');
	};

	mediaQuery.addEventListener('change', handler);
	return () => mediaQuery.removeEventListener('change', handler);
};
