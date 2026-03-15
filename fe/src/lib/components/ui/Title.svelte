<script module lang='ts'>
	// ===== IMPORTS =====
	// (No imports needed for this component)

	// ===== TYPES =====
	interface Props {
		eyebrow: string;
		big: string;
		/** Optional third line below the main title, rendered as small text. */
		below?: string;
		/** When true, renders with reduced visual importance (smaller, less bold). */
		isSubtitle?: boolean;
	}
</script>

<script lang='ts'>
	// ===== PROPS =====
	let { eyebrow, big, below, isSubtitle = false }: Props = $props();
</script>

<div class='title' class:subtitle={isSubtitle}>
	<span class='eyebrow'>{eyebrow}</span>
	<span class='big'>{big}</span>
	{#if below}
		<span class='below'>{below}</span>
	{/if}
</div>

<style>
	.title {
		/* Layout */
		display: inline-block;
		margin: 4rem 0 2rem 0;

		/* Typography */
		font-family: var(--font-heading);
		font-size: 1.7rem;
	}

	.title .eyebrow {
		/* Layout */
		display: block;

		/* Typography */
		font-family: var(--font-body);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--letter-spacing-wider);
		color: var(--color-text-secondary);
		font-size: 0.6em;
		text-transform: uppercase;
	}

	.title .big {
		/* Layout */
		display: block;
		

		/* Typography */
		font-family: var(--font-heading);
		font-size: 1.6em;
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--letter-spacing-wide);
		color: var(--color-accent-primary);
		text-transform: uppercase;
	}

	.title .below {
		/* Layout */
		display: block;

		/* Typography */
		font-family: var(--font-body);
		font-size: 1em;
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		line-height: 1.35;
		letter-spacing: 0.2em;
	}

	/* Responsive typography */
	@media (max-width: 640px) {
		.title {
			font-size: 1.4rem;
		}

		.title .big {
			font-size: 1.4em;
		}
	}

	/* Subtitle: reduced importance */
	.title.subtitle {
		margin: 2rem 0 1rem 0;
		font-size: 1.4rem;
	}

	.title.subtitle .eyebrow {
		font-size: 0.7em;
	}

	.title.subtitle .big {
		font-size: 1.25em;
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.title.subtitle .below {
		font-size: 0.85em;
		color: var(--svg-fill-primary);
	}

	@media (max-width: 640px) {
		.title.subtitle {
			font-size: 1.1rem;
		}

		.title.subtitle .big {
			font-size: 1.2em;
		}
	}
</style>
