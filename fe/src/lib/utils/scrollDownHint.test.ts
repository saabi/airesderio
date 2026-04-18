import { describe, expect, it } from 'vitest';
import {
	SCROLL_HINT_SCROLL_THRESHOLD,
	shouldStartScrollHintTimer,
	isPageScrollable
} from './scrollDownHint';

describe('isPageScrollable', () => {
	it('returns false when content fits in viewport', () => {
		expect(isPageScrollable(800, 800)).toBe(false);
	});

	it('returns true when content exceeds viewport plus buffer', () => {
		expect(isPageScrollable(2000, 800)).toBe(true);
	});
});

describe('shouldStartScrollHintTimer', () => {
	it('returns false when storage says dismissed', () => {
		expect(
			shouldStartScrollHintTimer({
				storedDismissed: true,
				scrollY: 0,
				scrollHeight: 5000,
				innerHeight: 800
			})
		).toBe(false);
	});

	it('returns false when user already scrolled past threshold', () => {
		expect(
			shouldStartScrollHintTimer({
				storedDismissed: false,
				scrollY: SCROLL_HINT_SCROLL_THRESHOLD + 1,
				scrollHeight: 5000,
				innerHeight: 800
			})
		).toBe(false);
	});

	it('returns false when page is not scrollable', () => {
		expect(
			shouldStartScrollHintTimer({
				storedDismissed: false,
				scrollY: 0,
				scrollHeight: 800,
				innerHeight: 800
			})
		).toBe(false);
	});

	it('returns true when eligible', () => {
		expect(
			shouldStartScrollHintTimer({
				storedDismissed: false,
				scrollY: 0,
				scrollHeight: 5000,
				innerHeight: 800
			})
		).toBe(true);
	});
});
