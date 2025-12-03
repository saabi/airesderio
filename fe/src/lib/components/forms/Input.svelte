<script module lang="ts">
	// ===== TYPES =====
	interface Props {
		id?: string;
		name?: string;
		type?: string;
		value?: string;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		class?: string;
		oninput?: (event: Event) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		onchange?: (event: Event) => void;
		onblur?: (event: FocusEvent) => void;
		inputmode?: 'text' | 'search' | 'none' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal';
		ariaLabel?: string;
		ariaInvalid?: boolean | 'grammar' | 'spelling';
		elementRef?: (element: HTMLInputElement | null) => void;
	}
</script>

<script lang="ts">
	// ===== PROPS =====
	let {
		id,
		name,
		type = 'text',
		value = '',
		placeholder,
		required = false,
		disabled = false,
		class: className = '',
		oninput,
		onkeydown,
		onchange,
		onblur,
		inputmode,
		ariaLabel,
		ariaInvalid,
		elementRef
	}: Props = $props();

	// ===== REFS =====
	let inputElement: HTMLInputElement | null = $state(null);

	// ===== EFFECTS =====
	$effect(() => {
		if (elementRef) {
			elementRef(inputElement);
		}
	});
</script>

<input
	bind:this={inputElement}
	{id}
	{name}
	{type}
	{value}
	{placeholder}
	{required}
	{disabled}
	class="form-input {className}"
	{oninput}
	{onkeydown}
	{onchange}
	{onblur}
	{inputmode}
	aria-label={ariaLabel}
	aria-invalid={ariaInvalid}
/>

<style>
	.form-input {
		/* Layout */
		width: 100%;
		min-width: 0;
		padding: 0.625rem;

		/* Box/Visual */
		border: 1px solid var(--color-border-default);
		border-radius: 0.25rem;
		background-color: field;
		outline: none;

		/* Typography */
		color: text;
	}

	.form-input::placeholder {
		/* Typography */
		color: var(--color-text-tertiary);
	}

	.form-input:focus-visible {
		/* Box/Visual */
		border-color: var(--color-border-strong);
		outline: 1px solid var(--color-border-strong);
		outline-offset: 0;
	}

	.form-input:disabled {
		/* Box/Visual */
		opacity: 0.6;

		/* Misc/Overrides */
		cursor: not-allowed;
	}
</style>
