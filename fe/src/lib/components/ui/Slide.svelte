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
		component,
		props = {},
		children
	}: Props = $props();

	// ===== CONTEXT =====
	// Optional: ImageCarousel provides imageSizes for enhanced images; fit is applied by parent CSS
	const carouselContext = getContext<ImageCarouselContext | undefined>('imageCarousel');
	const imageSizes = carouselContext?.imageSizes ?? '100vw';
</script>

<div class="slide-content">
	{#if type === 'image' && src != null}
		{#if typeof src === 'string'}
			<img
				src={src}
				alt={alt}
				class="carousel-image-content"
				loading="lazy"
			/>
		{:else}
			<!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
			<enhanced:img
				src={src as any}
				alt={alt}
				sizes={imageSizes}
				loading="lazy"
				class="carousel-image-content"
			/>
		{/if}
	{:else if type === 'video' && src != null && typeof src === 'string'}
		<video
			class="carousel-image-content"
			{src}
			poster={poster}
			{muted}
			playsinline={playsInline}
			{controls}
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
