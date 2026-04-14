<script module lang='ts'>
	interface Props {
		eyebrow: string;
		big: string;
		bigSize?: 'small' | 'big' | 'large';
		align?: 'left' | 'center';
	}
</script>

<script lang='ts'>
	let { eyebrow, big, bigSize = 'big', align = 'center' }: Props = $props();
</script>

<div class='subtitle' class:align-left={align === 'left'} class:align-center={align === 'center'}>
	<span class='eyebrow'>{eyebrow}</span>
	<span class={['big', `big-${bigSize}`]}>{big}</span>
</div>

<style>
	.subtitle {
		display: inline-block;
		margin: 2rem 0 1.25rem;
		font-family: var(--font-heading);
		font-size: 1.7rem;
	}

	.subtitle.align-center {
		display: block;
		width: fit-content;
		margin-inline: auto;
		text-align: center;
	}

	.subtitle.align-left {
		text-align: left;
	}

	.subtitle .eyebrow {
		display: block;
		font-family: var(--font-body);
		font-size: 0.62em;
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--letter-spacing-wider);
		text-transform: uppercase;
		color: var(--color-text-secondary);
	}

	.subtitle .big {
		display: block;
		font-family: var(--font-heading);
		font-size: 1.35em;
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--letter-spacing-wide);
		text-transform: uppercase;
		color: #3f8fae;
		line-height: 1.05;
	}

	.subtitle .big.big-small {
		font-size: 1.2em;
	}

	.subtitle .big.big-large {
		font-size: 1.9em;
	}

	@media (max-width: 640px) {
		.subtitle {
			font-size: 1.35rem;
		}

		.subtitle .eyebrow {
			font-size: 0.66em;
		}

		.subtitle .big {
			font-size: 1.25em;
		}

		.subtitle .big.big-small {
			font-size: 1.12em;
		}

		.subtitle .big.big-large {
			font-size: 1.55em;
		}
	}
</style>
