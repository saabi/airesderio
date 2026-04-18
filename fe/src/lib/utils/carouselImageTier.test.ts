import { describe, expect, it } from 'vitest';
import { parseTierFromCurrentSrc } from './carouselImageTier';

describe('parseTierFromCurrentSrc', () => {
	it('returns half-webp for half asset path', () => {
		expect(parseTierFromCurrentSrc('/planos/1hab-frente-half.webp')).toBe('half-webp');
		expect(parseTierFromCurrentSrc('https://x.com/a-half.webp?v=1')).toBe('half-webp');
	});

	it('returns full-webp for non-half webp', () => {
		expect(parseTierFromCurrentSrc('/planos/1hab-frente.webp')).toBe('full-webp');
	});

	it('returns raster for png and jpeg', () => {
		expect(parseTierFromCurrentSrc('/planos/1hab-frente.png')).toBe('raster');
		expect(parseTierFromCurrentSrc('/x/image.JPG')).toBe('raster');
	});
});
