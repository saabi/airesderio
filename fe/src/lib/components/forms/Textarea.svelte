<script module lang="ts">
	// ===== TYPES =====
	interface Props {
		id?: string;
		name?: string;
		value?: string;
		placeholder?: string;
		rows?: number;
		required?: boolean;
		disabled?: boolean;
		class?: string;
		oninput?: (event: Event) => void;
		onchange?: (event: Event) => void;
		onblur?: (event: FocusEvent) => void;
		ariaLabel?: string;
		ariaInvalid?: boolean | 'grammar' | 'spelling';
	}
</script>

<script lang="ts">
	// ===== PROPS =====
	let {
		id,
		name,
		value = '',
		placeholder,
		rows = 4,
		required = false,
		disabled = false,
		class: className = '',
		oninput,
		onchange,
		onblur,
		ariaLabel,
		ariaInvalid
	}: Props = $props();
</script>

<textarea
	{id}
	{name}
	{value}
	{placeholder}
	{rows}
	{required}
	{disabled}
	class='form-textarea {className}'
	oninput={oninput}
	onchange={onchange}
	onblur={onblur}
	aria-label={ariaLabel}
	aria-invalid={ariaInvalid}
></textarea>

<style>
	.form-textarea {
		/* Layout */
		width: 100%;
		min-width: 0;
		padding: 0.625rem;
		resize: vertical;
		
		/* Box/Visual */
		border: 1px solid var(--color-border-default);
		border-radius: 0.25rem;
		background-color: field;
		outline: none;
		
		/* Typography */
		font-family: inherit;
		font-size: inherit;
		color: text;
	}

	.form-textarea::placeholder {
		/* Typography */
		color: var(--color-text-tertiary);
	}

	.form-textarea:focus-visible {
		/* Box/Visual */
		border-color: var(--color-border-strong);
		outline: 1px solid var(--color-border-strong);
		outline-offset: 0;
	}

	.form-textarea:disabled {
		/* Box/Visual */
		opacity: 0.6;
		
		/* Misc/Overrides */
		cursor: not-allowed;
	}
</style>

