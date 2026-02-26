<script lang='ts'>
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}
	let { children }: Props = $props();
</script>

<p class='highlight' role='status'>
	{#if children}
		{@render children()}
	{/if}
</p>

<style>
	.highlight {
		/* Layout */
		margin: 1rem 0 0.75rem;
		padding: 0.75rem 1rem;

		/* Box/Visual */
		background: color-mix(in oklch, var(--color-accent-primary, var(--ref-brand-primary)) 12%, var(--ref-cream));
		border-radius: 0.375rem;
		border-left: 3px solid var(--color-accent-primary, var(--ref-brand-primary));

		/* Typography */
		font-size: 0.85em;
		line-height: 1.35;
		color: var(--color-text-on-light);
	}

	:global([data-theme='dark']) .highlight {
		/* Box/Visual */
		background: color-mix(in oklch, var(--color-accent-primary) 25%, oklch(0.2 0 0deg));
		border-left-color: var(--color-accent-primary);

		/* Typography */
		color: var(--color-text-primary);
	}
</style>
