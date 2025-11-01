<script lang="ts">
	interface Country {
		name: string;
		code: string;
		dialCode: string;
	}

	interface Props {
		name?: string;
		id?: string;
	}

	let { name = 'telefono', id = 'telefono' }: Props = $props();

	const countries: Country[] = [
		{ name: 'Argentina', code: 'AR', dialCode: '+54' },
		{ name: 'Bolivia', code: 'BO', dialCode: '+591' },
		{ name: 'Brasil', code: 'BR', dialCode: '+55' },
		{ name: 'Chile', code: 'CL', dialCode: '+56' },
		{ name: 'Colombia', code: 'CO', dialCode: '+57' },
		{ name: 'Ecuador', code: 'EC', dialCode: '+593' },
		{ name: 'Paraguay', code: 'PY', dialCode: '+595' },
		{ name: 'Perú', code: 'PE', dialCode: '+51' },
		{ name: 'Uruguay', code: 'UY', dialCode: '+598' },
		{ name: 'Venezuela', code: 'VE', dialCode: '+58' },
		{ name: 'México', code: 'MX', dialCode: '+52' },
		{ name: 'España', code: 'ES', dialCode: '+34' },
		{ name: 'Estados Unidos', code: 'US', dialCode: '+1' },
		{ name: 'Otro País', code: 'OTHER', dialCode: '+' },
	];

	let selectedCountry = $state<Country>(
		countries.find((c) => c.code === 'AR') || countries[0]
	);
	
	// Store only the number part (without dial code)
	let phoneNumberPart = $state('');
	let phoneInputRef: HTMLInputElement | null = $state(null);
	let customDialCodeRef: HTMLInputElement | null = $state(null);
	
	// Custom dial code for "Otro País" option
	let customDialCode = $state('+');

	// Get current dial code (either from selected country or custom)
	let currentDialCode = $derived.by(() => {
		if (selectedCountry.code === 'OTHER') {
			return customDialCode || '+';
		}
		return selectedCountry.dialCode;
	});

	// Computed full phone number for form submission
	let fullPhoneNumber = $derived.by(() => {
		return currentDialCode + phoneNumberPart;
	});

	// Handle country change - keep the number part but update dial code
	function handleCountryChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const country = countries.find((c) => c.code === target.value);
		if (country) {
			selectedCountry = country;
			// Reset custom dial code when switching away from "Otro País"
			if (country.code !== 'OTHER') {
				customDialCode = '+';
			}
			// Number part stays the same, only dial code changes
		}
	}

	// Handle custom dial code input for "Otro País"
	function handleCustomDialCodeInput(event: Event) {
		const target = event.target as HTMLInputElement;
		let value = target.value;

		// Ensure it starts with +
		if (!value.startsWith('+')) {
			value = '+' + value.replace(/[^\d]/g, '');
		} else {
			// Allow digits after +
			value = '+' + value.slice(1).replace(/[^\d]/g, '');
		}

		customDialCode = value;

		// Restore cursor position
		requestAnimationFrame(() => {
			if (customDialCodeRef) {
				const cursorPosition = Math.min(target.selectionStart || 0, value.length);
				customDialCodeRef.setSelectionRange(cursorPosition, cursorPosition);
			}
		});
	}

	// Handle phone number input - only allow number part (no dial code editing)
	function handlePhoneInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const cursorPosition = target.selectionStart || 0;
		let value = target.value;

		// Remove any dial code attempts - user should only type numbers
		// Remove + and any non-digit characters except spaces
		value = value.replace(/[^\d\s]/g, '');

		phoneNumberPart = value;

		// Restore cursor position
		requestAnimationFrame(() => {
			if (phoneInputRef) {
				const newPosition = Math.min(cursorPosition, value.length);
				phoneInputRef.setSelectionRange(newPosition, newPosition);
			}
		});
	}

	// Handle keydown to prevent deleting the dial code prefix visually
	function handleKeyDown(event: KeyboardEvent) {
		const target = event.target as HTMLInputElement;
		const cursorPosition = target.selectionStart || 0;

		// Allow normal navigation and deletion, but maintain cursor position logic
		if (event.key === 'Backspace' && cursorPosition === 0) {
			// User tried to delete at the start - this is fine, just prevent default behavior if needed
			// Since we're only showing the number part, this should work normally
		}
	}
</script>

<div class='phone-input-group'>
	<label for={id}>Número de teléfono</label>
	<p class='phone-input-hint'>Con código de área. Ej: +54 3512334353</p>
	<div class='phone-input-container'>
		<select
			id={`${id}-country`}
			name={`${name}-country`}
			class='phone-country-select'
			value={selectedCountry.code}
			onchange={handleCountryChange}
		>
			{#each countries as country}
				<option value={country.code}>{country.name}</option>
			{/each}
		</select>
		<div class='phone-number-wrapper'>
			{#if selectedCountry.code === 'OTHER'}
				<input
					type='text'
					class='phone-dial-code-input'
					bind:this={customDialCodeRef}
					value={customDialCode}
					oninput={handleCustomDialCodeInput}
					placeholder='+'
					aria-label='Country code'
				/>
			{:else}
				<span class='phone-dial-code'>{selectedCountry.dialCode}</span>
			{/if}
			<input
				type='tel'
				class='phone-number-input'
				bind:this={phoneInputRef}
				value={phoneNumberPart}
				oninput={handlePhoneInput}
				onkeydown={handleKeyDown}
				placeholder='3512334353'
				aria-label='Phone number'
			/>
			<!-- Hidden input for form submission with full phone number -->
			<input type='hidden' {id} {name} value={fullPhoneNumber} />
		</div>
	</div>
</div>

<style>
	.phone-input-group {
		margin-bottom: 0.75rem;
	}

	.phone-input-group label {
		display: block;
		font-size: 0.85em;
		margin-bottom: 0.25rem;
		color: var(--color-text-secondary);
		font-weight: 600;
		font-size: 1em;
		color: var(--color-text);
	}

	.phone-input-hint {
		font-size: 0.85em;
		color: var(--color-text-secondary);
		margin: 0 0 0.5rem;
	}

	.phone-input-container {
		display: flex;
		gap: 0.5rem;
		align-items: stretch;
	}

	.phone-country-select {
		flex: 0 0 auto;
		min-width: 140px;
		padding: 0.625rem;
		border: 1px solid var(--color-border-default);
		border-radius: 0.25rem;
		background: var(--color-bg-contrast);
		color: var(--color-text);
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.625rem center;
		padding-right: 2rem;
	}

	.phone-number-wrapper {
		flex: 1 1 auto;
		display: flex;
		align-items: center;
		border: 1px solid var(--color-border-default);
		border-radius: 0.25rem;
		background: var(--color-bg-contrast);
		overflow: hidden;
	}

	.phone-dial-code {
		padding: 0.625rem 0.5rem;
		background: var(--color-neutral-100);
		color: var(--color-text-secondary);
		font-size: 0.875em;
		border-right: 1px solid var(--color-border-default);
		flex-shrink: 0;
		user-select: none;
		pointer-events: none;
	}

	.phone-dial-code-input {
		padding: 0.625rem 0.5rem;
		background: var(--color-neutral-100);
		color: var(--color-text);
		font-size: 0.875em;
		border: none;
		border-right: 1px solid var(--color-border-default);
		flex-shrink: 0;
		min-width: 60px;
		max-width: 80px;
		outline: none;
	}

	.phone-number-input {
		flex: 1 1 auto;
		padding: 0.625rem;
		border: none;
		background: transparent;
		color: var(--color-text);
		outline: none;
		width: 100%;
	}

	.phone-number-input::placeholder {
		color: var(--color-text-tertiary);
	}
</style>

