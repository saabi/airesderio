import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSectionObserver, activeSection } from './sectionVisibility';
import { get } from 'svelte/store';

// Mock $app/environment
vi.mock('$app/environment', () => ({
	browser: true
}));

describe('sectionVisibility', () => {
	beforeEach(() => {
		// Reset active section
		activeSection.set(null);
	});

	describe('createSectionObserver', () => {
		it('should return action and visible store', () => {
			const observer = createSectionObserver('test-section');
			expect(observer).toHaveProperty('action');
			expect(observer).toHaveProperty('visible');
			expect(typeof observer.action).toBe('function');
		});

		it('should set visible to true when element is intersecting', () => {
			const observer = createSectionObserver('test-section');
			const element = document.createElement('div');
			document.body.appendChild(element);

			// Mock IntersectionObserver
			const mockObserver = {
				observe: vi.fn(),
				unobserve: vi.fn(),
				disconnect: vi.fn()
			};

			global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
				// Simulate intersection
				setTimeout(() => {
					callback([
						{
							target: element,
							isIntersecting: true,
							intersectionRatio: 0.5
						}
					]);
				}, 0);
				return mockObserver;
			}) as unknown as typeof IntersectionObserver;

			const cleanup = observer.action(element);
			expect(cleanup).toBeDefined();

			// Wait for intersection callback
			return new Promise<void>((resolve) => {
				setTimeout(() => {
					expect(get(observer.visible)).toBe(true);
					expect(get(activeSection)).toBe('test-section');
					if (cleanup && typeof cleanup.destroy === 'function') {
						cleanup.destroy();
					}
					document.body.removeChild(element);
					resolve();
				}, 10);
			});
		});

		it('should unobserve element when once is true and element intersects', () => {
			const observer = createSectionObserver('test-section', { once: true });
			const element = document.createElement('div');
			document.body.appendChild(element);

			const mockUnobserve = vi.fn();
			const mockObserver = {
				observe: vi.fn(),
				unobserve: mockUnobserve,
				disconnect: vi.fn()
			};

			global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
				setTimeout(() => {
					callback([
						{
							target: element,
							isIntersecting: true,
							intersectionRatio: 0.5
						}
					]);
				}, 0);
				return mockObserver;
			}) as unknown as typeof IntersectionObserver;

			observer.action(element);

			return new Promise<void>((resolve) => {
				setTimeout(() => {
					expect(mockUnobserve).toHaveBeenCalledWith(element);
					document.body.removeChild(element);
					resolve();
				}, 10);
			});
		});

		it('should use custom threshold and rootMargin', () => {
			const observer = createSectionObserver('test-section', {
				threshold: 0.8,
				rootMargin: '100px'
			});
			const element = document.createElement('div');

			global.IntersectionObserver = vi.fn().mockImplementation((callback, options) => {
				expect(options?.threshold).toBe(0.8);
				expect(options?.rootMargin).toBe('100px');
				return {
					observe: vi.fn(),
					unobserve: vi.fn(),
					disconnect: vi.fn()
				};
			}) as unknown as typeof IntersectionObserver;

			observer.action(element);
		});

		it('should cleanup observer on destroy', () => {
			const observer = createSectionObserver('test-section');
			const element = document.createElement('div');
			const mockDisconnect = vi.fn();

			global.IntersectionObserver = vi.fn().mockImplementation(() => ({
				observe: vi.fn(),
				unobserve: vi.fn(),
				disconnect: mockDisconnect
			})) as unknown as typeof IntersectionObserver;

			const cleanup = observer.action(element);
			if (cleanup && typeof cleanup.destroy === 'function') {
				cleanup.destroy();
			}
			expect(mockDisconnect).toHaveBeenCalled();
		});
	});
});
