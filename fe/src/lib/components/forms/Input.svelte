<script lang="ts">
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
		inputmode?: string;
		ariaLabel?: string;
		ariaInvalid?: boolean | string;
		elementRef?: (element: HTMLInputElement | null) => void;
	}

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

	let inputElement: HTMLInputElement | null = $state(null);

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
	class='form-input {className}'
	oninput={oninput}
	onkeydown={onkeydown}
	onchange={onchange}
	onblur={onblur}
	{inputmode}
	aria-label={ariaLabel}
	aria-invalid={ariaInvalid}
/>

<style>
	.form-input {
		width: 100%;
		min-width: 0;
		padding: 0.625rem;
		border: 1px solid var(--color-border-default);
		border-radius: 0.25rem;
		background-color: field;
		color: text;
		outline: none;
	}

	.form-input::placeholder {
		color: var(--color-text-tertiary);
	}

	.form-input:focus-visible {
		border-color: var(--color-border-strong);
		outline: 1px solid var(--color-border-strong);
		outline-offset: 0;
	}

	.form-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>

