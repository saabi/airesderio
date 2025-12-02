<script module lang="ts">
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

<script lang="ts">
	// ===== PROPS =====
	let {
		x,
		y,
		text,
		arrowPosition = 'bottom',
		class: className = ''
	}: Props = $props();
</script>

<div
	class="pin-label {className}"
	class:arrow-bottom={arrowPosition === 'bottom'}
	class:arrow-top={arrowPosition === 'top'}
	class:arrow-left={arrowPosition === 'left'}
	class:arrow-right={arrowPosition === 'right'}
	style="left: {x}px; top: {y}px;"
>
	{text}
</div>

<style>
	.pin-label {
		/* Layout */
		position: absolute;
		
		/* Box/Visual */
		background-color: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 6px 12px;
		border-radius: 4px;
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
		pointer-events: none;
		
		/* Effects & Motion */
		transition: opacity 0.3s ease, transform 0.3s ease;
		opacity: 0;
	}

	/* Positioning for each arrow direction */
	.pin-label.arrow-bottom {
		transform: translate(-50%, -100%);
		margin-bottom: 8px;
		animation: fadeInLabelBottom 0.3s ease forwards;
	}

	.pin-label.arrow-top {
		transform: translate(-50%, 0);
		margin-top: 8px;
		animation: fadeInLabelTop 0.3s ease forwards;
	}

	.pin-label.arrow-left {
		transform: translate(0, -50%);
		margin-right: 8px;
		animation: fadeInLabelLeft 0.3s ease forwards;
	}

	.pin-label.arrow-right {
		transform: translate(-100%, -50%);
		margin-left: 8px;
		animation: fadeInLabelRight 0.3s ease forwards;
	}

	.pin-label::after {
		/* Layout */
		content: '';
		position: absolute;
		
		/* Box/Visual */
		width: 0;
		height: 0;
	}

	/* Arrow pointing down (bottom) */
	.pin-label.arrow-bottom::after {
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border-left: 6px solid transparent;
		border-right: 6px solid transparent;
		border-top: 6px solid rgba(0, 0, 0, 0.8);
	}

	/* Arrow pointing up (top) */
	.pin-label.arrow-top::after {
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		border-left: 6px solid transparent;
		border-right: 6px solid transparent;
		border-bottom: 6px solid rgba(0, 0, 0, 0.8);
	}

	/* Arrow pointing right (left) */
	.pin-label.arrow-left::after {
		right: 100%;
		top: 50%;
		transform: translateY(-50%);
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid rgba(0, 0, 0, 0.8);
	}

	/* Arrow pointing left (right) */
	.pin-label.arrow-right::after {
		left: 100%;
		top: 50%;
		transform: translateY(-50%);
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid rgba(0, 0, 0, 0.8);
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

