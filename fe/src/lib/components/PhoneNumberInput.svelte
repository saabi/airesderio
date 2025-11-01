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

	// Phone number formatting patterns by country
	// Can be a single pattern or array of patterns for variants
	// Format: array of group sizes, e.g., [3, 3, 4] = (XXX) XXX-XXXX
	// For variants, use array of patterns, selected by digit count
	type PhoneFormat = number[] | number[][];
	
	const phoneFormats: Record<string, PhoneFormat> = {
		US: [3, 3, 4], // (XXX) XXX-XXXX
		MX: [2, 4, 4], // XX-XXXX-XXXX
		AR: [
			[4, 4, 4], // XXXX-XXXX-XXXX (11 digits - landlines)
			[3, 4, 4]  // XXX-XXXX-XXXX (10 digits - mobile)
		],
		BR: [2, 5, 4], // (XX) XXXXX-XXXX
		ES: [3, 3, 3], // XXX XXX XXX
		CL: [4, 4], // XXXX-XXXX
		CO: [3, 3, 4], // XXX XXX XXXX
		EC: [3, 3, 4], // XXX-XXX-XXXX
		PY: [3, 3, 4], // XXX XXX XXXX
		PE: [3, 3, 4], // XXX XXX XXXX
		UY: [4, 4], // XXXX-XXXX
		VE: [4, 3, 4], // XXXX-XXX-XXXX
		BO: [4, 4], // XXXX-XXXX
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

	// Select the appropriate pattern based on digit count
	function selectPattern(countryCode: string, digitCount: number): number[] {
		if (countryCode === 'OTHER') {
			return defaultFormat;
		}
		
		const format = phoneFormats[countryCode];
		if (!format) {
			return defaultFormat;
		}
		
		// Check if it's a single pattern (array of numbers) or multiple patterns (array of arrays)
		const firstElement = format[0];
		if (typeof firstElement === 'number') {
			// Single pattern: [3, 3, 4]
			return format as number[];
		}
		
		// Multiple patterns: [[4, 4, 4], [3, 4, 4]]
		const patterns = format as number[][];
		
		// For Argentina: 11 digits = 4-4-4, 10 digits = 3-4-4
		if (countryCode === 'AR') {
			if (digitCount >= 11) {
				return patterns[0]; // [4, 4, 4] - landlines
			} else if (digitCount >= 10) {
				return patterns[1]; // [3, 4, 4] - mobile
			}
			// While typing (less than 10 digits), use the shorter format as default
			// It will automatically switch when reaching 11 digits
			if (digitCount >= 4) {
				// Start with longer format, but will adapt
				return patterns[0]; // [4, 4, 4] - will adapt as more digits are added
			}
			return patterns[1]; // [3, 4, 4] - default for shorter numbers
		}
		
		// For other countries with variants, use the first pattern by default
		// or add logic here for specific countries
		return patterns[0];
	}

	// Get formatting pattern for current country based on current digit count
	let currentFormat = $derived.by(() => {
		return selectPattern(selectedCountry.code, phoneNumberDigits.length);
	});

	// Format phone number based on country pattern
	function formatPhoneNumber(digits: string, pattern: number[]): string {
		if (!digits) return '';
		
		// Special formatting for US: (XXX) XXX-XXXX
		if (selectedCountry.code === 'US' && pattern.length === 3 && pattern[0] === 3 && pattern[1] === 3 && pattern[2] === 4) {
			if (digits.length <= 3) {
				return digits.length > 0 ? `(${digits}` : '';
			} else if (digits.length <= 6) {
				return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
			} else {
				return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
			}
		}
		
		let formatted = '';
		let digitIndex = 0;
		
		for (const groupSize of pattern) {
			if (digitIndex >= digits.length) break;
			
			if (formatted) {
				// Add separator (use space for some countries, dash for others)
				const useSpace = selectedCountry.code === 'ES' || selectedCountry.code === 'CO' || selectedCountry.code === 'PY' || selectedCountry.code === 'PE';
				formatted += useSpace ? ' ' : '-';
			}
			
			const group = digits.slice(digitIndex, digitIndex + groupSize);
			formatted += group;
			digitIndex += groupSize;
		}
		
		// Add remaining digits without formatting if any
		if (digitIndex < digits.length) {
			if (formatted) {
				const useSpace = selectedCountry.code === 'ES' || selectedCountry.code === 'CO' || selectedCountry.code === 'PY' || selectedCountry.code === 'PE';
				formatted += useSpace ? ' ' : '-';
			}
			formatted += digits.slice(digitIndex);
		}
		
		return formatted;
	}

	// Strip all non-digit characters
	function stripFormatting(value: string): string {
		return value.replace(/\D/g, '');
	}

	// Get current dial code (either from selected country or custom)
	let currentDialCode = $derived.by(() => {
		if (selectedCountry.code === 'OTHER') {
			return customDialCode || '+';
		}
		return selectedCountry.dialCode;
	});

	// Formatted display value
	let formattedPhoneNumber = $derived.by(() => {
		return formatPhoneNumber(phoneNumberDigits, currentFormat);
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
		
		// Format the number
		const formatted = formatPhoneNumber(digits, currentFormat);
		
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

