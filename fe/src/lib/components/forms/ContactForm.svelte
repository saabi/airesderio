<script module lang='ts'>
	// ===== IMPORTS =====
	import Input from '$lib/components/forms/Input.svelte';
	import PhoneNumberInput from '$lib/components/forms/PhoneNumberInput.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import Textarea from '$lib/components/forms/Textarea.svelte';

	// ===== TYPES =====
	interface Props {
		// No props currently, but interface exists for future extensibility
	}

	// ===== STATIC CONSTANTS =====
	const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const SUCCESS_MESSAGE_TIMEOUT = 5000;
</script>

<script lang='ts'>
	// ===== PROPS =====
	let {}: Props = $props();

	// ===== STATE =====
	let formElement: HTMLFormElement | null = $state(null);
	let isLoading = $state(false);
	let successMessage = $state<string | null>(null);
	let errorMessage = $state<string | null>(null);

	// ===== EVENT HANDLERS =====
	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (!formElement) return;

		// Reset messages
		successMessage = null;
		errorMessage = null;

		// Client-side validation
		if (!formElement.checkValidity()) {
			formElement.reportValidity();
			return;
		}

		// Collect form data
		const formData = new FormData(formElement);
		const data = {
			nombre: formData.get('nombre') as string,
			correo: formData.get('correo') as string,
			telefono: (formData.get('telefono') as string) || '',
			consulta: formData.get('consulta') as string,
			mensaje: (formData.get('mensaje') as string) || '',
			website: (formData.get('website') as string) || '' // Honeypot
		};

		// Validate required fields
		if (!data.nombre || !data.correo || !data.consulta) {
			errorMessage = 'Por favor completa todos los campos requeridos.';
			return;
		}

		// Validate email format
		if (!EMAIL_REGEX.test(data.correo)) {
			errorMessage = 'Por favor ingresa un correo electrónico válido.';
			return;
		}

		isLoading = true;

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			const result = await response.json();

			if (!response.ok) {
				errorMessage =
					result.error || 'Error al enviar el formulario. Por favor, intenta de nuevo.';
				return;
			}

			// Success
			successMessage =
				result.message ||
				'Formulario enviado correctamente. Nos pondremos en contacto contigo pronto.';

			// Reset form
			formElement.reset();

			// Clear success message after timeout
			setTimeout(() => {
				successMessage = null;
			}, SUCCESS_MESSAGE_TIMEOUT);
		} catch (error) {
			console.error('Form submission error:', error);
			errorMessage =
				'Error de conexión. Por favor, verifica tu conexión a internet e intenta de nuevo.';
		} finally {
			isLoading = false;
		}
	}
</script>

<form bind:this={formElement} action='#' method='POST' onsubmit={handleSubmit} novalidate>
	<!-- Honeypot field for spam protection -->
	<input
		type='text'
		name='website'
		autocomplete='off'
		tabindex='-1'
		aria-hidden='true'
		style='position: absolute; left: -9999px;'
	/>

	{#if successMessage}
		<div class='form-message form-message--success' role='alert'>
			{successMessage}
		</div>
	{/if}

	{#if errorMessage}
		<div class='form-message form-message--error' role='alert'>
			{errorMessage}
		</div>
	{/if}

	<div class='form-group'>
		<label for='nombre'>Nombre</label>
		<Input
			type='text'
			id='nombre'
			name='nombre'
			required
			ariaLabel='Nombre completo'
			disabled={isLoading}
		/>
	</div>
	<div class='form-group'>
		<label for='correo'>Correo</label>
		<Input
			type='email'
			id='correo'
			name='correo'
			required
			ariaLabel='Correo electrónico'
			disabled={isLoading}
		/>
	</div>
	<PhoneNumberInput id='telefono' name='telefono' />
	<div class='form-group'>
		<label for='consulta'>Consulta</label>
		<Select
			id='consulta'
			name='consulta'
			placeholder='Seleccioná'
			ariaLabel='Tipo de consulta'
			disabled={isLoading}
		>
			{#snippet children()}
				<option>Precio y Financiación</option>
				<option>Visitar el Showroom</option>
				<option>Otras consultas</option>
			{/snippet}
		</Select>
	</div>
	<div class='form-group'>
		<label for='mensaje'>Mensaje</label>
		<Textarea
			id='mensaje'
			name='mensaje'
			rows={4}
			ariaLabel='Mensaje o consulta'
			disabled={isLoading}
		/>
	</div>
	<div class='form-group'>
		<button type='submit' disabled={isLoading} aria-label='Enviar formulario de contacto'>
			{#if isLoading}
				<span class='button-loading'>Enviando...</span>
			{:else}
				ENVIAR
			{/if}
		</button>
	</div>
</form>

<style>
	.form-group {
		/* Layout */
		margin-bottom: 0.75rem;
	}

	.form-group label {
		/* Layout */
		display: block;
		margin-bottom: 0.25rem;

		/* Typography */
		font-size: 0.85em;
		color: var(--color-text-primary);
	}

	.form-group button {
		/* Layout */
		width: 100%;
		padding: 0.75rem;

		/* Box/Visual */
		border: none;
		border-radius: 0.25rem;
		background: var(--color-accent-primary);

		/* Typography */
		font-weight: 600;
		color: var(--color-text-inverse);

		/* Misc/Overrides */
		cursor: pointer;
	}

	.form-group button:hover:not(:disabled) {
		/* Box/Visual */
		background: var(--color-accent-strong);
	}

	.form-group button:disabled {
		/* Box/Visual */
		opacity: 0.6;

		/* Misc/Overrides */
		cursor: not-allowed;
	}

	.button-loading {
		/* Layout */
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.button-loading::after {
		/* Layout */
		width: 1rem;
		height: 1rem;

		/* Box/Visual */
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;

		/* Misc/Overrides */
		content: '';

		/* Effects & Motion */
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			/* Effects & Motion */
			transform: rotate(360deg);
		}
	}

	.form-message {
		/* Layout */
		padding: 0.75rem;
		margin-bottom: 1rem;

		/* Box/Visual */
		border-radius: 0.25rem;

		/* Typography */
		font-size: 0.9em;
	}

	.form-message--success {
		/* Box/Visual */
		background-color: var(--color-success-bg, #d4edda);
		border: 1px solid var(--color-success-border, #c3e6cb);

		/* Typography */
		color: var(--color-success-text, #155724);
	}

	.form-message--error {
		/* Box/Visual */
		background-color: var(--color-error-bg, #f8d7da);
		border: 1px solid var(--color-error-border, #f5c6cb);

		/* Typography */
		color: var(--color-error-text, #721c24);
	}
</style>
