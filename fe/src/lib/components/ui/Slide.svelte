<script module lang="ts">
	// ===== IMPORTS =====
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { Component } from 'svelte';
	import Picture from '$lib/components/ui/Picture.svelte';
	import type { SlideMediaReadyInfo } from '$lib/types/slideMedia';

	// ===== TYPES =====
	export type SlideType = 'image' | 'video' | 'component' | 'custom';

	export interface ImageCarouselContext {
		imageFit?: 'cover' | 'contain';
		imageSizes?: string;
	}

	interface Props {
		type: SlideType;
		// Image
		src?: string | unknown; // URL string for image/video
		alt?: string;
		useAutoAlternateSrc?: boolean;
		/** Passed to Picture: WebP srcset with width descriptors */
		webpSrcset?: string;
		/** Passed to Picture: fallback img srcset (e.g. high-res PNG) */
		imgSrcset?: string;
		// Video
		poster?: string;
		muted?: boolean;
		playsInline?: boolean;
		controls?: boolean;
		autoplay?: boolean;
		onVideoEnd?: () => void;
		/** When true and type is video, resets playback to start (e.g. when carousel steps to this slide). */
		isActive?: boolean;
		/** Fired when primary media has intrinsic dimensions; only when {@link isActive} is true. */
		onSlideMediaReady?: (info: SlideMediaReadyInfo) => void;
		// Component
		component?: Component;
		props?: Record<string, unknown>;
		// Custom content
		children?: Snippet;
	}
</script>

<script lang="ts">
	// ===== PROPS =====
	let {
		type,
		src,
		alt = '',
		useAutoAlternateSrc = true,
		webpSrcset,
		imgSrcset,
		poster,
		muted = true,
		playsInline = true,
		controls = false,
		autoplay = false,
		onVideoEnd,
		isActive = false,
		onSlideMediaReady,
		component,
		props = {},
		children
	}: Props = $props();

	// ===== CONTEXT =====
	// Optional: ImageCarousel provides imageSizes; fit is applied by parent CSS
	const carouselContext = getContext<ImageCarouselContext | undefined>('imageCarousel');
	const imageSizes = carouselContext?.imageSizes ?? '100vw';

	// ===== VIDEO REF (for reset when slide becomes active) =====
	let videoEl: HTMLVideoElement | null = $state(null);

	// ===== EFFECTS =====
	// When stepping into this slide, reset video to start and play if autoplay
	$effect(() => {
		if (type === 'video' && isActive && videoEl) {
			videoEl.currentTime = 0;
			if (autoplay) {
				videoEl.play().catch(() => {});
			}
		}
	});

	function handleImageDecode(info: {
		currentSrc: string;
		naturalWidth: number;
		naturalHeight: number;
	}): void {
		if (!isActive || !onSlideMediaReady) return;
		onSlideMediaReady({
			kind: 'image',
			currentSrc: info.currentSrc,
			naturalWidth: info.naturalWidth,
			naturalHeight: info.naturalHeight
		});
	}

	$effect(() => {
		if (type !== 'video' || !isActive || !onSlideMediaReady || !videoEl || typeof src !== 'string')
			return;

		const v = videoEl;
		const emit = () => {
			if (!isActive || !onSlideMediaReady || !videoEl) return;
			if (videoEl.videoWidth <= 0 || videoEl.videoHeight <= 0) return;
			const url = videoEl.currentSrc || src;
			onSlideMediaReady({
				kind: 'video',
				src: url,
				videoWidth: videoEl.videoWidth,
				videoHeight: videoEl.videoHeight
			});
		};

		if (v.readyState >= 1) {
			emit();
			return;
		}

		v.addEventListener('loadedmetadata', emit, { once: true });
		return () => v.removeEventListener('loadedmetadata', emit);
	});
</script>

<div class="slide-content">
	{#if type === 'image' && src != null}
		{@const imageSrc =
			typeof src === 'string'
				? src
				: ((src as { img?: { src?: string }; src?: string })?.img?.src ??
					(src as { src?: string })?.src ??
					'')}
		{#if imageSrc}
			<Picture
				src={imageSrc}
				{alt}
				{useAutoAlternateSrc}
				{webpSrcset}
				{imgSrcset}
				sizes={imageSizes}
				onImgDecode={onSlideMediaReady ? handleImageDecode : undefined}
				class="carousel-image-content"
				loading="lazy"
			/>
		{/if}
	{:else if type === 'video' && src != null && typeof src === 'string'}
		<video
			bind:this={videoEl}
			class="carousel-image-content"
			{src}
			{poster}
			{muted}
			playsinline={playsInline}
			{controls}
			loop={false}
			onended={() => onVideoEnd?.()}
		></video>
	{:else if type === 'component' && component}
		{@const Comp = component}
		<Comp {...props} />
	{:else if type === 'custom' && children}
		{@render children()}
	{/if}
</div>

<style>
	.slide-content {
		/* Positioning */
		position: absolute;
		top: 0;
		left: 0;

		/* Layout */
		width: 100%;
		height: 100%;
		min-width: 100%;
		min-height: 100%;
		overflow: hidden;
	}

	.slide-content :global(.carousel-image-content) {
		/* Positioning */
		position: absolute;
		top: 0;
		left: 0;

		/* Layout */
		width: 100%;
		height: 100%;
		min-width: 100%;
		min-height: 100%;

		/* Box/Visual */
		object-position: center;
		display: block;
	}
</style>
