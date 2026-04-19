/**
 * Resolved primary media in a carousel {@link Slide} (image, video, or future kinds).
 */
export type SlideMediaReadyInfo =
	| {
			kind: 'image';
			/** Stable URL for this slide (e.g. PNG path); use for caching, not {@link currentSrc}. */
			logicalSrc: string;
			currentSrc: string;
			naturalWidth: number;
			naturalHeight: number;
	  }
	| {
			kind: 'video';
			/** Resolved media URL when available */
			src: string;
			videoWidth: number;
			videoHeight: number;
	  };
