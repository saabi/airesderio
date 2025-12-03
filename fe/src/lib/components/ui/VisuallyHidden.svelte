<script module lang='ts'>
	// ===== TYPES =====
	interface Props {
		id?: string;
		tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'span' | 'dd' | 'dt';
		children: import('svelte').Snippet;
	}
</script>

<script lang='ts'>
	// ===== PROPS =====
	let { id, tag = 'h2', children }: Props = $props();
</script>

{#if tag === 'h1'}
	<h1 {id} class='visually-hidden'>{@render children()}</h1>
{:else if tag === 'h2'}
	<h2 {id} class='visually-hidden'>{@render children()}</h2>
{:else if tag === 'h3'}
	<h3 {id} class='visually-hidden'>{@render children()}</h3>
{:else if tag === 'h4'}
	<h4 {id} class='visually-hidden'>{@render children()}</h4>
{:else if tag === 'h5'}
	<h5 {id} class='visually-hidden'>{@render children()}</h5>
{:else if tag === 'h6'}
	<h6 {id} class='visually-hidden'>{@render children()}</h6>
{:else if tag === 'p'}
	<p {id} class='visually-hidden'>{@render children()}</p>
{:else if tag === 'div'}
	<div {id} class='visually-hidden'>{@render children()}</div>
{:else if tag === 'span'}
	<span {id} class='visually-hidden'>{@render children()}</span>
{:else if tag === 'dd'}
	<dd {id} class='visually-hidden'>{@render children()}</dd>
{:else if tag === 'dt'}
	<dt {id} class='visually-hidden'>{@render children()}</dt>
{/if}

<style>
	.visually-hidden {
		/* Positioning */
		position: absolute !important;

		/* Layout */
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}
</style>
