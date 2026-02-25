<script module lang='ts'>
	// ===== IMPORTS =====
	import type { Snippet } from 'svelte';

	// ===== TYPES =====
	interface Props {
		width?: string;
		height?: string;
		viewBox?: string;
		fit?: boolean;
		/** Horizontal alignment when content is letterboxed (fit or aspect ratio mismatch). Only applies when fit is true. */
		align?: 'left' | 'center' | 'right';
		class?: string;
		children?: Snippet;
	}
</script>

<script lang='ts'>
	// ===== PROPS =====
	let {
		width = '4.5em',
		height = '4.5em',
		viewBox = '0 0 24 24',
		fit = false,
		align = 'center',
		class: className = '',
		children
	}: Props = $props();

	const preserveAspectRatio = $derived(
		align === 'left' ? 'xMinYMid meet' : align === 'right' ? 'xMaxYMid meet' : 'xMidYMid meet'
	);
</script>

{#if fit}
	<svg
		class={className}
		{viewBox}
		width={width}
		height={height}
		preserveAspectRatio={preserveAspectRatio}
		aria-hidden="true"
		focusable="false"
	>
		{#if children}
			{@render children()}
		{/if}
	</svg>
{:else}
	<svg
		{width}
		{height}
		{viewBox}
		preserveAspectRatio={preserveAspectRatio}
		class={className}
		aria-hidden="true"
		focusable="false"
	>
		{#if children}
			{@render children()}
		{/if}
	</svg>
{/if}

<style>
	svg {
		display: inline-block;
		vertical-align: middle;
	}
</style>
