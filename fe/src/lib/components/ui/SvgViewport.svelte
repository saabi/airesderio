<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		width?: string;
		height?: string;
		viewBox?: string;
		class?: string;
		children?: Snippet;
	}

	let {
		width = '4.5em',
		height = '4.5em',
		viewBox = '0 0 24 24',
		class: className = '',
		children
	}: Props = $props();
</script>

<svg
	width={width}
	height={height}
	viewBox={viewBox}
	class={className}
	aria-hidden="true"
	focusable="false"
>
	{#if children}
		{@render children()}
	{/if}
</svg>

<style>
	svg {
		display: inline-block;
		vertical-align: middle;
	}
</style>

