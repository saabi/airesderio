<script lang="ts">
	import type { Snippet } from 'svelte';
	import SvgViewport from '$lib/components/ui/SvgViewport.svelte';

	// ===== TYPES =====
	interface Props {
		onClick: () => void;
		ariaLabel: string;
		size?: 'sm' | 'md' | 'lg' | 'xl' | number;
		variant?: 'overlay' | 'solid' | 'bordered' | 'accent';
		disabled?: boolean;
		class?: string;
		style?: string;
		type?: 'button' | 'submit' | 'reset';
		children?: Snippet;
	}

	// ===== PROPS =====
	let {
		onClick,
		ariaLabel,
		size = 'md',
		variant = 'overlay',
		disabled = false,
		class: className = '',
		style: inlineStyle = '',
		type = 'button',
		children
	}: Props = $props();

	// ===== DERIVED =====
	// Calculate size
	const sizeValue = $derived.by(() => {
		if (typeof size === 'number') return `${size}px`;
		const sizeMap = {
			sm: '2.5rem',
			md: '3rem',
			lg: '40px',
			xl: '3.5rem'
		};
		return sizeMap[size];
	});

	// Mobile size (smaller)
	const mobileSizeValue = $derived.by(() => {
		if (typeof size === 'number') return `${size * 0.875}px`;
		const sizeMap = {
			sm: '2.25rem',
			md: '2.5rem',
			lg: '35px',
			xl: '3rem'
		};
		return sizeMap[size];
	});
</script>

<button
	type={type}
	class="circular-button {variant} size-{size} {className}"
	class:disabled={disabled}
	onclick={onClick}
	aria-label={ariaLabel}
	disabled={disabled}
	style="--button-size: {sizeValue}; --button-size-mobile: {mobileSizeValue}; {inlineStyle}"
>
	<span class="button-content">
		{#if children}
			<SvgViewport width="20" height="20" viewBox="0 0 20 20">
				{@render children()}
			</SvgViewport>
		{/if}
	</span>
</button>

<style>
	.circular-button {
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--button-size);
		height: var(--button-size);
		padding: 0;
		flex-shrink: 0;

		/* Box/Visual */
		border: none;
		border-radius: 50%;

		/* Typography */
		font-size: inherit;
		line-height: 1;
		color: inherit;

		/* Misc/Overrides */
		cursor: pointer;

		/* Effects & Motion */
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease,
			transform 0.2s ease,
			opacity 0.2s ease;
	}

	.button-content {
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	/* Variant: overlay */
	.circular-button.overlay {
		background: color-mix(in oklch, var(--overlay-black-60) 80%, transparent);
		color: var(--color-text-inverse);
	}

	.circular-button.overlay:hover:not(:disabled) {
		background: color-mix(in oklch, var(--overlay-black-80) 90%, transparent);
		transform: scale(1.1);
	}

	/* Variant: solid */
	.circular-button.solid {
		background: var(--color-bg-contrast);
		border: 1px solid var(--color-border-strong);
		color: var(--color-accent-primary);
	}

	.circular-button.solid:hover:not(:disabled) {
		background: var(--color-accent-hover);
		border-color: var(--color-accent-strong);
		color: var(--color-text-on-accent);
		transform: scale(1.05);
	}

	/* Variant: bordered */
	.circular-button.bordered {
		background: color-mix(in oklch, var(--color-bg-canvas) 80%, transparent);
		border: 1px solid var(--color-border-default);
		color: var(--color-text-primary);
	}

	.circular-button.bordered:hover:not(:disabled) {
		background: var(--color-accent-primary);
		border-color: var(--color-accent-primary);
		color: var(--color-text-on-accent);
		transform: scale(1.1);
	}

	/* Variant: accent */
	.circular-button.accent {
		background: var(--color-accent-primary);
		border: 1px solid var(--color-accent-primary);
		color: var(--color-text-on-accent);
	}

	.circular-button.accent:hover:not(:disabled) {
		background: var(--color-accent-strong);
		border-color: var(--color-accent-strong);
		transform: scale(1.1);
	}

	/* Active state (all variants) */
	.circular-button:active:not(:disabled) {
		transform: scale(0.95);
	}

	/* Disabled state */
	.circular-button.disabled,
	.circular-button:disabled {
		opacity: 0.5;
		background: var(--color-bg-muted);
		border-color: var(--color-border-subtle);
		color: var(--color-text-secondary);
		cursor: not-allowed;
		pointer-events: none;
	}

	.circular-button.disabled:hover,
	.circular-button:disabled:hover {
		transform: none;
	}

	/* Focus visible */
	.circular-button:focus-visible {
		outline: 2px solid var(--color-accent-primary);
		outline-offset: 2px;
	}

	/* Mobile responsiveness */
	@media (max-width: 640px) {
		.circular-button {
			width: var(--button-size-mobile);
			height: var(--button-size-mobile);
		}
	}

	/* SVG icon sizing (SvgViewport components) */
	.circular-button :global(svg) {
		width: 1.25rem;
		height: 1.25rem;
	}

	/* Size-specific SVG icon adjustments */
	.circular-button.size-sm :global(svg) {
		width: 1rem;
		height: 1rem;
	}

	.circular-button.size-md :global(svg) {
		width: 1.25rem;
		height: 1.25rem;
	}

	.circular-button.size-lg :global(svg) {
		width: 1.25rem;
		height: 1.25rem;
	}

	@media (max-width: 640px) {
		.circular-button.size-lg :global(svg) {
			width: 1rem;
			height: 1rem;
		}
	}
</style>

