<script module lang='ts'>
	// ===== IMPORTS =====
	// (No imports needed for this component)

	// ===== TYPES =====
	interface Props {
		eyebrow: string;
		big: string;
		/** Size variant for the main title line. */
		bigSize?: 'small' | 'big' | 'large';
		/** Optional third line below the main title, rendered as small text. */
		below?: string;
		/** When true, renders with reduced visual importance (smaller, less bold). */
		isSubtitle?: boolean;
	}
</script>

<script lang='ts'>
	// ===== PROPS =====
	let { eyebrow, big, bigSize = 'big', below, isSubtitle = false }: Props = $props();
</script>

<div class='title' class:subtitle={isSubtitle}>
	<span class='eyebrow'>{eyebrow}</span>
	<span class={['big', `big-${bigSize}`]}>{big}</span>
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
		color: var(--color-title-emphasis);
		text-transform: uppercase;
	}

	.title .big.big-small {
		font-size: 1.2em;
		line-height: 1;
	}

	.title .big.big-large {
		font-size: 1.9em;
	}

	.title .below {
		/* Layout */
		display: block;
		margin-top: 0em;

		/* Typography */
		font-family: var(--font-body);
		font-size: 1em;
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		line-height: 1.35;
		letter-spacing: 0.2em;
	}

	/* Smaller big line also scales/tightens the below line */
	.title .big.big-small + .below {
		font-size: 0.75em;
		margin-top: 0;
		letter-spacing: 0.16em;
		line-height: 1;
	}

	/* Responsive typography */
	@media (max-width: 640px) {
		.title {
			font-size: 1.4rem;
		}

		.title .big {
			font-size: 1.4em;
		}

		.title .big.big-small {
			font-size: 1.15em;
		}

		.title .big.big-large {
			font-size: 1.6em;
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

	.title.subtitle .big.big-small {
		font-size: 1.05em;
	}

	.title.subtitle .big.big-large {
		font-size: 1.45em;
	}

	.title.subtitle .below {
		font-size: 0.85em;
		color: var(--svg-fill-primary);
	}

	.title.subtitle .big.big-small + .below {
		font-size: 0.72em;
		margin-top: 0;
		letter-spacing: 0.14em;
	}

	@media (max-width: 640px) {
		.title.subtitle {
			font-size: 1.1rem;
		}

		.title.subtitle .big {
			font-size: 1.2em;
		}

		.title.subtitle .big.big-small {
			font-size: 1em;
		}

		.title.subtitle .big.big-large {
			font-size: 1.35em;
		}
	}
</style>
