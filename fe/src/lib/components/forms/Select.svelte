<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id?: string;
		name?: string;
		value?: string;
		placeholder?: string;
		onchange?: (event: Event) => void;
		children?: Snippet;
		class?: string;
		ariaLabel?: string;
	}

	let { 
		id,
		name,
		value = '',
		placeholder,
		onchange,
		children,
		class: className = '',
		ariaLabel
	}: Props = $props();

	let selectElement: HTMLSelectElement | null = $state(null);
	let isKeyboardFocus = $state(false);

	function handleFocus(event: FocusEvent) {
        // For Firefox, show focus ring on click too since :-moz-focusring doesn't work
        // with appearance: none. This provides needed visual feedback.
        const isFirefox = typeof navigator !== 'undefined' && 
            navigator.userAgent.toLowerCase().includes('firefox');
        
        if (isFirefox) {
            // Show focus ring on any focus in Firefox
            isKeyboardFocus = true;
        } else {
            // In other browsers, only show focus ring for keyboard navigation (standard behavior)
            isKeyboardFocus = false;
        }
	}

	function handleBlur() {
		// Keep the state briefly to avoid flicker
		setTimeout(() => {
			isKeyboardFocus = false;
		}, 100);
	}
</script>

<select
	bind:this={selectElement}
	{id}
	{name}
	class='select-input {className}'
	class:keyboard-focus={isKeyboardFocus}
	value={value}
	onchange={onchange}
	onfocus={handleFocus}
	onblur={handleBlur}
	aria-label={ariaLabel}
>
	{#if placeholder}
		<option value='' disabled hidden>{placeholder}</option>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</select>

<style>
	.select-input {
		width: 100%;
		min-width: 0;
		padding: 0.625rem;
		border: 1px solid var(--color-border-default);
		border-radius: 0.25rem;
		background-color: field;
		color: text;
		cursor: pointer;
		appearance: none;
		-moz-appearance: none;
		-webkit-appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.625rem center;
		padding-right: 2rem;
		outline: 2px solid transparent;
		outline-offset: 0;
	}

	.select-input:focus-visible {
		border-color: var(--color-border-strong);
		outline: 1px solid var(--color-border-strong);
		outline-offset: 0;
	}

	/* Firefox-specific focus ring support */
	.select-input:-moz-focusring {
		border-color: var(--color-border-strong) !important;
		outline: 1px solid var(--color-border-strong) !important;
		outline-offset: 0 !important;
	}

	/* JavaScript-based keyboard focus detection for Firefox fallback */
	.select-input.keyboard-focus:focus {
		border-color: var(--color-border-strong);
		outline: 1px solid var(--color-border-strong);
		outline-offset: 0;
	}

	/* Suppress default Firefox inner focus styling */
	.select-input::-moz-focus-inner {
		border: 0;
	}

	.select-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	:global([data-theme='dark']) .select-input {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ccc' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
	}
</style>

