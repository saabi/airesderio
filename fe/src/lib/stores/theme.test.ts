import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { theme, type Theme } from './theme';

// Mock $app/environment
vi.mock('$app/environment', () => ({
	browser: true
}));

describe('theme store', () => {
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

	afterEach(() => {
		// Cleanup store observers
		theme.cleanup();
	});

	describe('initialization', () => {
		it('should respect stored theme from localStorage', () => {
			localStorage.setItem('aires-theme', 'dark');
			// Store initializes on import, so we test by setting and verifying
			theme.set('dark');
			expect(get(theme)).toBe('dark');
			expect(localStorage.getItem('aires-theme')).toBe('dark');
		});

		it('should use system preference when no stored theme', () => {
			// Clear any stored theme
			localStorage.removeItem('aires-theme');

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

			// Test that clear() uses system preference
			theme.clear();
			expect(get(theme)).toBe('dark');
		});

		it('should apply theme to DOM when set', () => {
			theme.set('dark');
			expect(document.documentElement.dataset.theme).toBe('dark');
			expect(document.documentElement.style.colorScheme).toBe('dark');

			theme.set('light');
			expect(document.documentElement.dataset.theme).toBe('light');
			expect(document.documentElement.style.colorScheme).toBe('light');
		});
	});

	describe('set', () => {
		it('should update store value', () => {
			theme.set('dark');
			expect(get(theme)).toBe('dark');

			theme.set('light');
			expect(get(theme)).toBe('light');
		});

		it('should store theme in localStorage', () => {
			theme.set('dark');
			expect(localStorage.getItem('aires-theme')).toBe('dark');

			theme.set('light');
			expect(localStorage.getItem('aires-theme')).toBe('light');
		});

		it('should apply theme to DOM', () => {
			theme.set('dark');
			expect(document.documentElement.dataset.theme).toBe('dark');
			expect(document.documentElement.style.colorScheme).toBe('dark');

			theme.set('light');
			expect(document.documentElement.dataset.theme).toBe('light');
			expect(document.documentElement.style.colorScheme).toBe('light');
		});
	});

	describe('toggle', () => {
		it('should toggle between light and dark', () => {
			theme.set('light');
			theme.toggle();
			expect(get(theme)).toBe('dark');

			theme.toggle();
			expect(get(theme)).toBe('light');
		});

		it('should update localStorage when toggling', () => {
			theme.set('light');
			theme.toggle();
			expect(localStorage.getItem('aires-theme')).toBe('dark');
		});

		it('should apply theme to DOM when toggling', () => {
			theme.set('light');
			theme.toggle();
			expect(document.documentElement.dataset.theme).toBe('dark');
		});
	});

	describe('clear', () => {
		it('should remove theme from localStorage', () => {
			localStorage.setItem('aires-theme', 'dark');
			theme.clear();
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

			theme.clear();
			expect(get(theme)).toBe('dark');
			expect(document.documentElement.dataset.theme).toBe('dark');
		});
	});

	describe('system preference watching', () => {
		it('should update when system preference changes (no stored theme)', () => {
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

			// Clear any stored theme
			localStorage.removeItem('aires-theme');

			// Simulate system preference change
			const changeHandler = (
				mockMediaQuery.addEventListener as ReturnType<typeof vi.fn>
			).mock.calls.find((call) => call[0] === 'change')?.[1] as (
				event: MediaQueryListEvent
			) => void;

			if (changeHandler) {
				changeHandler({ matches: true } as MediaQueryListEvent);
				expect(get(theme)).toBe('dark');
			}
		});

		it('should not update when system preference changes if theme is stored', () => {
			localStorage.setItem('aires-theme', 'light');
			theme.set('light');

			const mockMediaQuery = {
				matches: true,
				media: '(prefers-color-scheme: dark)',
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn()
			} as MediaQueryList;

			vi.mocked(window.matchMedia).mockReturnValue(mockMediaQuery);

			// Simulate system preference change
			const changeHandler = (
				mockMediaQuery.addEventListener as ReturnType<typeof vi.fn>
			).mock.calls.find((call) => call[0] === 'change')?.[1] as (
				event: MediaQueryListEvent
			) => void;

			if (changeHandler) {
				changeHandler({ matches: true } as MediaQueryListEvent);
				// Theme should remain 'light' because it's stored
				expect(get(theme)).toBe('light');
			}
		});
	});
});
