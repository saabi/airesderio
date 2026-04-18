export type CarouselImageTier = 'half-webp' | 'full-webp' | 'raster';

/**
 * Infer responsive-asset tier from a resolved image URL (e.g. {@link HTMLImageElement.currentSrc}).
 */
export function parseTierFromCurrentSrc(url: string): CarouselImageTier {
	const path = url.split('?')[0] ?? url;
	const lower = path.toLowerCase();
	if (lower.includes('-half.webp')) {
		return 'half-webp';
	}
	if (lower.endsWith('.webp')) {
		return 'full-webp';
	}
	return 'raster';
}
