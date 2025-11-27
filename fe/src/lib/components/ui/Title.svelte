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
		display: inline-block;
		border: .2em solid var(--color-border-title);
		border-radius: 0.25rem;
		font-size: 2rem;
		padding: 0.5rem 0.875rem;
		margin: 2rem 0 0.25rem 0;
	}

	.boxed .eyebrow {
		letter-spacing: 0.18em;
		color: var(--color-ink);
		display: block;
	}

	.boxed .big {
		display: block;
		font-size: 1.75em;
		font-weight: 800;
		letter-spacing: 0.06em;
	}
</style>
