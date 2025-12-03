<script module lang="ts">
	// ===== IMPORTS =====
	import type { Snippet } from 'svelte';

	// ===== TYPES =====
	interface Props {
		width?: string;
		height?: string;
		viewBox?: string;
		class?: string;
		children?: Snippet;
	}
</script>

<script lang="ts">
	// ===== PROPS =====
	let {
		width = '4.5em',
		height = '4.5em',
		viewBox = '0 0 24 24',
		class: className = '',
		children
	}: Props = $props();
</script>

<svg {width} {height} {viewBox} class={className} aria-hidden="true" focusable="false">
	{#if children}
		{@render children()}
	{/if}
</svg>

<style>
	svg {
		/* Layout */
		display: inline-block;
		vertical-align: middle;
	}
</style>
