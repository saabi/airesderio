import { writable } from 'svelte/store';

export interface FloorPlanOverlayData {
	viewBoxAttr: string;
	currentImageSrc: string;
	imageDimensions: { width: number; height: number };
	title: string;
	/** When false, the Volver button is hidden in the overlay. Default true. */
	showBackButton?: boolean;
}

export const floorPlanOverlayStore = writable<FloorPlanOverlayData | null>(null);
