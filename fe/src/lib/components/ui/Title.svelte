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

<div class="title">
	<span class="eyebrow">{eyebrow}</span>
	<span class="big">{big}</span>
</div>

<style>
	.title {
		/* Layout */
		display: inline-block;
		margin: 4rem 0 2rem 0;

		/* Typography */
		font-size: 1.7rem;
	}

	.title .eyebrow {
		/* Layout */
		display: block;

		/* Typography */
		letter-spacing: 0.18em;
		color: var(--color-text-secondary);
		font-size: 0.6em;
		text-transform: uppercase;
	}

	.title .big {
		/* Layout */
		display: block;
		position: relative;
		padding-bottom: 0.5rem;

		/* Typography */
		font-size: 1.6em;
		font-weight: 800;
		letter-spacing: 0.04em;
		color: var(--color-accent-primary);
		text-transform: uppercase;
	}

	/* Subtle underline decoration */
	.title .big::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 3rem;
		height: 2px;
		background: var(--color-accent-primary);
		opacity: 0.3;
	}
</style>
