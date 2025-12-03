<script module lang='ts'>
	// ===== IMPORTS =====
	import Select from '$lib/components/forms/Select.svelte';
	import {
		formatPhoneNumberPartial,
		validatePhoneNumber,
		numberingPlans
	} from '$lib/utils/multiCountryPhone';

	// ===== TYPES =====
	interface Country {
		name: string;
		code: string;
		dialCode: string;
	}

	interface Props {
		name?: string;
		id?: string;
	}

	// ===== STATIC CONSTANTS =====
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
		{ name: 'Otro País', code: 'OTHER', dialCode: '+' }
	];
</script>

<script lang='ts'>
	// ===== PROPS =====
	let { name = 'telefono', id = 'telefono' }: Props = $props();

	// ===== STATE =====
	let selectedCountry = $state<Country>(countries.find((c) => c.code === 'AR') || countries[0]);

	// Store only the raw digits (without dial code and formatting)
	let phoneNumberDigits = $state('');
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

	// Format phone number using multiCountryPhone utility
	function formatPhoneNumberDisplay(digits: string, countryCode: string, dialCode: string): string {
		if (!digits) return '';

		// Handle "Otro País" case with generic format
		if (countryCode === 'OTHER') {
			// Use simple 3-3-4 grouping for unknown countries
			let formatted = '';
			let idx = 0;
			const pattern = [3, 3, 4];
			for (const size of pattern) {
				if (idx >= digits.length) break;
				if (formatted) formatted += '-';
				formatted += digits.slice(idx, idx + size);
				idx += size;
			}
			if (idx < digits.length) {
				if (formatted) formatted += '-';
				formatted += digits.slice(idx);
			}
			return formatted;
		}

		// Build full phone number with country code for utility
		const countryCodeDigits = dialCode.replace(/^\+/, '');
		const fullNumber = '+' + countryCodeDigits + digits;

		// Use formatPhoneNumberPartial which handles partial numbers gracefully
		// Pass the country code directly (e.g., 'AR', 'US') - utility now uses ISO codes
		const formatted = formatPhoneNumberPartial(fullNumber, countryCode, {
			includeCountryCode: false
		});

		// Utility returns space-separated groups, convert format based on country
		if (countryCode === 'US') {
			// Convert to (XXX) XXX-XXXX format
			const cleaned = formatted.replace(/\s+/g, '');
			if (cleaned.length <= 3) {
				return cleaned.length > 0 ? `(${cleaned}` : '';
			} else if (cleaned.length <= 6) {
				return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
			} else {
				return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
			}
		}

		// Convert spaces to dashes for all other countries
		return formatted.replace(/\s+/g, '-');
	}

	// Strip all non-digit characters
	function stripFormatting(value: string): string {
		return value.replace(/\D/g, '');
	}

	// Formatted display value
	let formattedPhoneNumber = $derived.by(() => {
		return formatPhoneNumberDisplay(phoneNumberDigits, selectedCountry.code, currentDialCode);
	});

	// Computed full phone number for form submission (raw digits only)
	let fullPhoneNumber = $derived.by(() => {
		return currentDialCode + phoneNumberDigits;
	});

	// Validate phone number using multiCountryPhone utility
	let isValidPhoneNumber = $derived.by(() => {
		if (!phoneNumberDigits) return true; // Empty is valid (not required until submit)

		// Handle "Otro País" case - skip validation for custom countries
		if (selectedCountry.code === 'OTHER') {
			return true;
		}

		// Get country plan to check expected lengths (using ISO code directly)
		const plan = numberingPlans[selectedCountry.code];
		if (!plan) {
			return true; // Unknown country, skip validation
		}

		// Only validate if number length matches one of the expected lengths
		// This prevents false negatives while user is typing
		const expectedLengths = plan.nsnLengths;
		const currentLength = phoneNumberDigits.length;

		// For Argentina, also check for special/specific service codes
		if (selectedCountry.code === 'AR') {
			// Check if it matches special/specific patterns (they have different lengths)
			if (plan.specialPrefixes) {
				for (const prefixPattern of plan.specialPrefixes) {
					if (prefixPattern.test(phoneNumberDigits)) {
						// Special numbers are valid regardless of length
						return true;
					}
				}
			}
		}

		// Only validate if the number has reached a valid length
		if (!expectedLengths.includes(currentLength)) {
			// If it's shorter than the minimum, allow it (user is still typing)
			const minLength = Math.min(...expectedLengths);
			if (currentLength < minLength) {
				return true;
			}
			// If it's longer than expected, might be invalid
			const maxLength = Math.max(...expectedLengths);
			if (currentLength > maxLength) {
				return false;
			}
			// If it's between lengths, might be a valid intermediate state
			return true;
		}

		try {
			// Build full phone number with country code for validation
			const countryCodeDigits = currentDialCode.replace(/^\+/, '');
			const fullNumber = '+' + countryCodeDigits + phoneNumberDigits;

			// Validate using utility - only validate complete numbers
			// Pass the country code directly (e.g., 'AR', 'US')
			return validatePhoneNumber(fullNumber, selectedCountry.code);
		} catch {
			// If validation throws, and we're at expected length, consider invalid
			// Otherwise might be a partial number that can't parse yet
			return (
				!expectedLengths.includes(currentLength) || currentLength < Math.min(...expectedLengths)
			);
		}
	});

	// Show validation error only when user has entered something and it's invalid
	let showValidationError = $derived.by(() => {
		return phoneNumberDigits.length > 0 && !isValidPhoneNumber;
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

	// Handle phone number input - format as user types
	function handlePhoneInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const oldCursorPosition = target.selectionStart || 0;
		const oldValue = target.value;

		// Get raw digits from current input
		let digits = stripFormatting(target.value);

		// Store raw digits (no formatting)
		phoneNumberDigits = digits;

		// Calculate new cursor position after formatting
		// Count non-digit characters before the old cursor position
		let digitsBeforeCursor = 0;
		let charsBeforeCursor = 0;

		while (charsBeforeCursor < oldCursorPosition && charsBeforeCursor < oldValue.length) {
			if (/\d/.test(oldValue[charsBeforeCursor])) {
				digitsBeforeCursor++;
			}
			charsBeforeCursor++;
		}

		// Get formatted value for cursor position calculation
		const formatted = formatPhoneNumberDisplay(digits, selectedCountry.code, currentDialCode);

		// Calculate new cursor position in formatted string
		let newCursorPosition = 0;
		let digitsCounted = 0;

		for (let i = 0; i < formatted.length && digitsCounted < digitsBeforeCursor; i++) {
			newCursorPosition++;
			if (/\d/.test(formatted[i])) {
				digitsCounted++;
			}
		}

		// Update cursor position after DOM update
		requestAnimationFrame(() => {
			if (phoneInputRef) {
				phoneInputRef.setSelectionRange(newCursorPosition, newCursorPosition);
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

<div class='group'>
	<label for={id}>Número de teléfono</label>
	<p class='hint'>Con código de área. Ej: +54 3512334353</p>
	{#if showValidationError}
		<p class='error' role='alert'>Número de teléfono inválido</p>
	{/if}
	<div class='container'>
		<Select
			id={`${id}-country`}
			name={`${name}-country`}
			value={selectedCountry.code}
			onchange={handleCountryChange}
			class='country-select'
		>
			{#snippet children()}
				{#each countries as country (country.code)}
					<option value={country.code}>{country.name}</option>
				{/each}
			{/snippet}
		</Select>
		<div class='number-wrapper'>
			{#if selectedCountry.code === 'OTHER'}
				<input
					type='text'
					class='dial-code-input'
					bind:this={customDialCodeRef}
					value={customDialCode}
					oninput={handleCustomDialCodeInput}
					placeholder='+'
					aria-label='Country code'
				/>
			{:else}
				<span class='dial-code'>{selectedCountry.dialCode}</span>
			{/if}
			<input
				type='tel'
				class='number-input'
				class:invalid={showValidationError}
				bind:this={phoneInputRef}
				value={formattedPhoneNumber}
				oninput={handlePhoneInput}
				onkeydown={handleKeyDown}
				placeholder={selectedCountry.code === 'US'
					? '(385) 500-1635'
					: selectedCountry.code === 'AR'
						? '3512-3343-53'
						: '3512-3343-53'}
				aria-label='Phone number'
				aria-invalid={showValidationError}
				inputmode='numeric'
			/>
			<!-- Hidden input for form submission with full phone number -->
			<input type='hidden' {id} {name} value={fullPhoneNumber} />
		</div>
	</div>
</div>

<style>
	.group {
		/* Layout */
		margin-bottom: 0.75rem;
	}

	.group label {
		/* Typography */
		font-family: var(--font-body);
		font-weight: var(--font-weight-medium);
		/* Layout */
		display: block;
		margin-bottom: 0.25rem;

		/* Typography */
		font-size: 1em;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.hint {
		/* Layout */
		margin: 0 0 0.5rem;

		/* Typography */
		font-size: 0.85em;
		color: var(--color-text-primary);
	}

	.container {
		/* Layout */
		display: flex;
		gap: 0.5rem;
		align-items: stretch;
	}

	/* Override Select component width for phone number country selector */
	/* Using !important is necessary here to override scoped component styles */
	:global(.country-select.select-input) {
		/* Layout */
		width: auto !important;
		flex: 0 0 auto;
		min-width: 140px;
		max-width: 200px;
	}

	.number-wrapper {
		/* Layout */
		display: flex;
		align-items: center;
		flex: 1 1 auto;
		overflow: hidden;

		/* Box/Visual */
		border: 1px solid var(--color-border-default);
		border-radius: 0.25rem;
		background-color: field;

		/* Typography */
		color: text;
	}

	.number-wrapper:has(.number-input:focus-visible),
	.number-wrapper:has(.dial-code-input:focus-visible) {
		/* Box/Visual */
		border-color: var(--color-border-strong);
		outline: 1px solid var(--color-border-strong);
		outline-offset: 0;
	}

	.dial-code {
		/* Layout */
		padding: 0.625rem 0.5rem;
		flex-shrink: 0;

		/* Box/Visual */
		background: var(--color-bg-muted);
		border-right: 1px solid var(--color-border-default);

		/* Typography */
		font-size: 0.875em;
		color: var(--color-text-primary);

		/* Misc/Overrides */
		user-select: none;
		pointer-events: none;
	}

	.dial-code-input {
		/* Layout */
		padding: 0.625rem 0.5rem;
		flex-shrink: 0;
		min-width: 60px;
		max-width: 80px;

		/* Box/Visual */
		background: var(--color-bg-muted);
		border: none;
		border-right: 1px solid var(--color-border-strong);
		outline: none;

		/* Typography */
		font-size: 0.875em;
		color: var(--color-text-primary);
	}

	.number-input {
		/* Layout */
		width: 100%;
		padding: 0.625rem;
		flex: 1 1 auto;

		/* Box/Visual */
		border: none;
		outline: none;
		background-color: transparent;

		/* Typography */
		color: text;
	}

	.number-input::placeholder {
		/* Typography */
		color: var(--color-text-tertiary);
	}

	.error {
		/* Layout */
		margin: 0.25rem 0 0;
		padding: 0;

		/* Typography */
		font-size: 0.75em;
		color: var(--color-danger-strong);
	}

	.number-wrapper:has(.number-input.invalid) {
		/* Box/Visual */
		border-color: var(--color-danger);
	}
</style>
