<script module lang='ts'>
	// ===== IMPORTS =====
	// (No imports needed for this component)

	// ===== TYPES =====
	type ArrowPosition = 'bottom' | 'top' | 'left' | 'right';

	interface Props {
		x: number;
		y: number;
		text: string;
		arrowPosition?: ArrowPosition;
		class?: string;
	}
</script>

<script lang='ts'>
	// ===== PROPS =====
	let { x, y, text, arrowPosition = 'bottom', class: className = '' }: Props = $props();
</script>

<div
	class='pin-label {className}'
	class:arrow-bottom={arrowPosition === 'bottom'}
	class:arrow-top={arrowPosition === 'top'}
	class:arrow-left={arrowPosition === 'left'}
	class:arrow-right={arrowPosition === 'right'}
	style='left: {x}px; top: {y}px;'
>
	{text}
</div>

<style>
	.pin-label {
		/* Positioning */
		position: absolute;

		/* Layout */
		padding: 6px 12px;

		/* Box/Visual */
		background-color: rgba(0, 0, 0, 0.8);
		border-radius: 4px;
		opacity: 0;

		/* Typography */
		color: white;
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;

		/* Effects & Motion */
		transition:
			opacity 0.3s ease,
			transform 0.3s ease;

		/* Misc/Overrides */
		pointer-events: none;
	}

	/* Positioning for each arrow direction */
	.pin-label.arrow-bottom {
		/* Effects & Motion */
		transform: translate(-50%, -100%);
		animation: fadeInLabelBottom 0.3s ease forwards;
	}

	.pin-label.arrow-top {
		/* Effects & Motion */
		transform: translate(-50%, 0);
		animation: fadeInLabelTop 0.3s ease forwards;
	}

	.pin-label.arrow-left {
		/* Effects & Motion */
		transform: translate(0, -50%);
		animation: fadeInLabelLeft 0.3s ease forwards;
	}

	.pin-label.arrow-right {
		/* Effects & Motion */
		transform: translate(-100%, -50%);
		animation: fadeInLabelRight 0.3s ease forwards;
	}

	.pin-label::after {
		/* Positioning */
		position: absolute;

		/* Layout */
		content: '';
		width: 0;
		height: 0;
	}

	/* Arrow pointing down (bottom) */
	.pin-label.arrow-bottom::after {
		/* Positioning */
		top: 100%;
		left: 50%;

		/* Box/Visual */
		border-left: 6px solid transparent;
		border-right: 6px solid transparent;
		border-top: 6px solid rgba(0, 0, 0, 0.8);

		/* Effects & Motion */
		transform: translateX(-50%);
	}

	/* Arrow pointing up (top) */
	.pin-label.arrow-top::after {
		/* Positioning */
		bottom: 100%;
		left: 50%;

		/* Box/Visual */
		border-left: 6px solid transparent;
		border-right: 6px solid transparent;
		border-bottom: 6px solid rgba(0, 0, 0, 0.8);

		/* Effects & Motion */
		transform: translateX(-50%);
	}

	/* Arrow pointing right (left) */
	.pin-label.arrow-left::after {
		/* Positioning */
		right: 100%;
		top: 50%;

		/* Box/Visual */
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid rgba(0, 0, 0, 0.8);

		/* Effects & Motion */
		transform: translateY(-50%);
	}

	/* Arrow pointing left (right) */
	.pin-label.arrow-right::after {
		/* Positioning */
		left: 100%;
		top: 50%;

		/* Box/Visual */
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid rgba(0, 0, 0, 0.8);

		/* Effects & Motion */
		transform: translateY(-50%);
	}

	@keyframes fadeInLabelBottom {
		from {
			opacity: 0;
			transform: translate(-50%, -100%) translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -100%) translateY(0);
		}
	}

	@keyframes fadeInLabelTop {
		from {
			opacity: 0;
			transform: translate(-50%, 0) translateY(4px);
		}
		to {
			opacity: 1;
			transform: translate(-50%, 0) translateY(0);
		}
	}

	@keyframes fadeInLabelLeft {
		from {
			opacity: 0;
			transform: translate(0, -50%) translateX(4px);
		}
		to {
			opacity: 1;
			transform: translate(0, -50%) translateX(0);
		}
	}

	@keyframes fadeInLabelRight {
		from {
			opacity: 0;
			transform: translate(-100%, -50%) translateX(-4px);
		}
		to {
			opacity: 1;
			transform: translate(-100%, -50%) translateX(0);
		}
	}
</style>
