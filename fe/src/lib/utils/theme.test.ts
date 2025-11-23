import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	resolveInitialTheme,
	setTheme,
	applyTheme,
	clearThemePreference,
	startThemeObserver,
	type Theme
} from './theme';

// Mock $app/environment
vi.mock('$app/environment', () => ({
	browser: true
}));

describe('theme utilities', () => {
	beforeEach(() => {
		// Reset DOM
		document.documentElement.dataset.theme = '';
		document.documentElement.style.colorScheme = '';
		localStorage.clear();

		// Reset matchMedia mock
		vi.mocked(window.matchMedia).mockReturnValue({
			matches: false,
			media: '(prefers-color-scheme: dark)',
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		} as MediaQueryList);
	});

	describe('resolveInitialTheme', () => {
		it('should return stored theme from localStorage', () => {
			localStorage.setItem('aires-theme', 'dark');
			expect(resolveInitialTheme()).toBe('dark');

			localStorage.setItem('aires-theme', 'light');
			expect(resolveInitialTheme()).toBe('light');
		});

		it('should return system preference when no stored theme', () => {
			vi.mocked(window.matchMedia).mockReturnValue({
				matches: true,
				media: '(prefers-color-scheme: dark)',
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn()
			} as MediaQueryList);

			expect(resolveInitialTheme()).toBe('dark');
		});

		it('should return light when system prefers light', () => {
			vi.mocked(window.matchMedia).mockReturnValue({
				matches: false,
				media: '(prefers-color-scheme: dark)',
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn()
			} as MediaQueryList);

			expect(resolveInitialTheme()).toBe('light');
		});

		it('should ignore invalid stored theme values', () => {
			localStorage.setItem('aires-theme', 'invalid');
			vi.mocked(window.matchMedia).mockReturnValue({
				matches: false,
				media: '(prefers-color-scheme: dark)',
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn()
			} as MediaQueryList);

			expect(resolveInitialTheme()).toBe('light');
		});
	});

	describe('applyTheme', () => {
		it('should set theme on document element', () => {
			applyTheme('dark');
			expect(document.documentElement.dataset.theme).toBe('dark');
			expect(document.documentElement.style.colorScheme).toBe('dark');

			applyTheme('light');
			expect(document.documentElement.dataset.theme).toBe('light');
			expect(document.documentElement.style.colorScheme).toBe('light');
		});

		it('should return the applied theme', () => {
			expect(applyTheme('dark')).toBe('dark');
			expect(applyTheme('light')).toBe('light');
		});
	});

	describe('setTheme', () => {
		it('should store theme in localStorage', () => {
			setTheme('dark');
			expect(localStorage.getItem('aires-theme')).toBe('dark');

			setTheme('light');
			expect(localStorage.getItem('aires-theme')).toBe('light');
		});

		it('should apply theme to document', () => {
			setTheme('dark');
			expect(document.documentElement.dataset.theme).toBe('dark');

			setTheme('light');
			expect(document.documentElement.dataset.theme).toBe('light');
		});

		it('should return the set theme', () => {
			expect(setTheme('dark')).toBe('dark');
			expect(setTheme('light')).toBe('light');
		});
	});

	describe('clearThemePreference', () => {
		it('should remove theme from localStorage', () => {
			localStorage.setItem('aires-theme', 'dark');
			clearThemePreference();
			expect(localStorage.getItem('aires-theme')).toBeNull();
		});

		it('should apply system preference after clearing', () => {
			vi.mocked(window.matchMedia).mockReturnValue({
				matches: true,
				media: '(prefers-color-scheme: dark)',
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn()
			} as MediaQueryList);

			clearThemePreference();
			expect(document.documentElement.dataset.theme).toBe('dark');
		});
	});

	describe('startThemeObserver', () => {
		it('should return cleanup function', () => {
			const cleanup = startThemeObserver();
			expect(typeof cleanup).toBe('function');
			cleanup();
		});

		it('should listen to system theme changes', () => {
			const mockMediaQuery = {
				matches: false,
				media: '(prefers-color-scheme: dark)',
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn()
			} as MediaQueryList;

			vi.mocked(window.matchMedia).mockReturnValue(mockMediaQuery);

			const cleanup = startThemeObserver();
			expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

			cleanup();
			expect(mockMediaQuery.removeEventListener).toHaveBeenCalled();
		});

		it('should not apply theme change if stored theme exists', () => {
			localStorage.setItem('aires-theme', 'light');
			applyTheme('light'); // Set initial theme

			const mockMediaQuery = {
				matches: true,
				media: '(prefers-color-scheme: dark)',
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn((event, handler) => {
					// Simulate theme change
					if (event === 'change') {
						handler({ matches: true } as MediaQueryListEvent);
					}
				}),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn()
			} as MediaQueryList;

			vi.mocked(window.matchMedia).mockReturnValue(mockMediaQuery);

			startThemeObserver();
			// Theme should remain 'light' because it's stored
			expect(document.documentElement.dataset.theme).toBe('light');
		});
	});
});

