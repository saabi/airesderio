<script lang="ts">
	import { formatPhoneNumber, numberingPlans } from '$lib/utils/multiCountryPhone';

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

	// Map component country codes to utility country names
	const countryCodeToUtilityName: Record<string, string> = {
		AR: 'argentina',
		BO: 'bolivia',
		BR: 'brasil',
		CL: 'chile',
		CO: 'colombia',
		EC: 'ecuador',
		PY: 'paraguay',
		PE: 'peru',
		UY: 'uruguay',
		VE: 'venezuela',
		MX: 'mexico',
		ES: 'espana',
		US: 'usa',
	};

	// Generic format for unknown countries: XXX-XXX-XXXX (3-3-4 pattern)
	const defaultFormat: number[] = [3, 3, 4];

	let selectedCountry = $state<Country>(
		countries.find((c) => c.code === 'AR') || countries[0]
	);
	
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

	// Generic formatter using a pattern array
	function formatGeneric(digits: string, pattern: number[]): string {
		if (!digits) return '';
		
		let formatted = '';
		let digitIndex = 0;
		
		for (const groupSize of pattern) {
			if (digitIndex >= digits.length) break;
			
			if (formatted) {
				formatted += '-';
			}
			
			const group = digits.slice(digitIndex, digitIndex + groupSize);
			formatted += group;
			digitIndex += groupSize;
		}
		
		// Add remaining digits
		if (digitIndex < digits.length) {
			if (formatted) formatted += '-';
			formatted += digits.slice(digitIndex);
		}
		
		return formatted;
	}

	// Format phone number using multiCountryPhone utility
	function formatPhoneNumberDisplay(digits: string, countryCode: string, dialCode: string): string {
		if (!digits) return '';
		
		// Handle "Otro País" case with generic format
		if (countryCode === 'OTHER') {
			return formatGeneric(digits, defaultFormat);
		}
		
		const utilityCountryName = countryCodeToUtilityName[countryCode];
		if (!utilityCountryName) {
			return formatGeneric(digits, defaultFormat);
		}
		
		// Get the country plan to use its grouping
		const plan = numberingPlans[utilityCountryName];
		if (!plan) {
			return formatGeneric(digits, defaultFormat);
		}
		
		// Determine grouping from plan (same logic as utility)
		const grouping = plan.grouping && plan.grouping.length > 0 
			? plan.grouping 
			: (digits.length >= 10 ? [3, 3, 4] : digits.length >= 8 ? [4, 4] : [3, 4]);
		
		// Format using the plan's grouping
		const formatted = formatGeneric(digits, grouping);
		
		// Special handling for US: convert to (XXX) XXX-XXXX format
		if (countryCode === 'US') {
			const cleaned = digits;
			if (cleaned.length <= 3) {
				return cleaned.length > 0 ? `(${cleaned}` : '';
			} else if (cleaned.length <= 6) {
				return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
			} else {
				return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
			}
		}
		
		// For other countries, use the formatted result with dashes (already done by formatGeneric)
		return formatted;
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
				value={formattedPhoneNumber}
				oninput={handlePhoneInput}
				onkeydown={handleKeyDown}
				placeholder={selectedCountry.code === 'US' ? '(385) 500-1635' : selectedCountry.code === 'AR' ? '3512-3343-53' : '3512-3343-53'}
				aria-label='Phone number'
				inputmode='numeric'
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

