<script module lang="ts">
	// ===== IMPORTS =====
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { Component } from 'svelte';

	// ===== TYPES =====
	export type SlideType = 'image' | 'video' | 'component' | 'custom';

	export interface ImageCarouselContext {
		imageFit?: 'cover' | 'contain';
		imageSizes?: string;
	}

	interface Props {
		type: SlideType;
		// Image
		src?: string | unknown; // string | Enhanced image type
		alt?: string;
		// Video
		poster?: string;
		muted?: boolean;
		playsInline?: boolean;
		controls?: boolean;
		autoplay?: boolean;
		onVideoEnd?: () => void;
		/** When true and type is video, resets playback to start (e.g. when carousel steps to this slide). */
		isActive?: boolean;
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
		poster,
		muted = true,
		playsInline = true,
		controls = false,
		autoplay = false,
		onVideoEnd,
		isActive = false,
		component,
		props = {},
		children
	}: Props = $props();

	// ===== CONTEXT =====
	// Optional: ImageCarousel provides imageSizes for enhanced images; fit is applied by parent CSS
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
</script>

<div class="slide-content">
	{#if type === 'image' && src != null}
		{@const imageSrc = typeof src === 'string' ? src : (src as { img?: { src?: string }; src?: string })?.img?.src ?? (src as { src?: string })?.src ?? ''}
		{#if imageSrc}
			<img
				src={imageSrc}
				alt={alt}
				class="carousel-image-content"
				loading="lazy"
			/>
		{/if}
	{:else if type === 'video' && src != null && typeof src === 'string'}
		<video
			bind:this={videoEl}
			class="carousel-image-content"
			{src}
			poster={poster}
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
