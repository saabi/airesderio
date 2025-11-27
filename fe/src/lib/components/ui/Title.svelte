<script module lang="ts">
	// ===== TYPES =====
	interface Props {
		eyebrow: string;
		big: string;
	}
</script>

<script lang="ts">
	// ===== PROPS =====
	let { eyebrow, big }: Props = $props();
</script>

<div class='boxed'>
	<span class='eyebrow'>{eyebrow}</span>
	<span class='big'>{big}</span>
</div>

<style>
	.boxed {
		/* Layout */
		display: inline-block;
		padding: 0.5rem 0.875rem;
		margin: 2rem 0 0.25rem 0;
		
		/* Box/Visual */
		border: .2em solid var(--color-border-title);
		border-radius: 0.25rem;
		
		/* Typography */
		font-size: 2rem;
	}

	.boxed .eyebrow {
		/* Layout */
		display: block;
		
		/* Typography */
		letter-spacing: 0.18em;
		color: var(--color-ink);
	}

	.boxed .big {
		/* Layout */
		display: block;
		
		/* Typography */
		font-size: 1.75em;
		font-weight: 800;
		letter-spacing: 0.06em;
	}
</style>
