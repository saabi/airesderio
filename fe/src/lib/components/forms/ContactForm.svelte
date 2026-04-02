<script module lang='ts'>
	// ===== IMPORTS =====
	import Input from '$lib/components/forms/Input.svelte';
	import PhoneNumberInput from '$lib/components/forms/PhoneNumberInput.svelte';
	import Textarea from '$lib/components/forms/Textarea.svelte';
	import { formToastStore } from '$lib/stores/formToast';

	// ===== TYPES =====
	interface Props {
		// No props currently, but interface exists for future extensibility
	}

	// ===== STATIC CONSTANTS =====
	const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
</script>

<script lang='ts'>
	// ===== PROPS =====
	let {}: Props = $props();

	// ===== STATE =====
	let formElement: HTMLFormElement | null = $state(null);
	let errorMessage = $state<string | null>(null);

	const optimisticContactSuccessMessage =
		'Formulario enviado correctamente. Nos pondremos en contacto contigo pronto.';

	// ===== EVENT HANDLERS =====
	function handleSubmit(event: Event) {
		event.preventDefault();

		if (!formElement) return;

		errorMessage = null;

		// Client-side validation
		if (!formElement.checkValidity()) {
			formElement.reportValidity();
			return;
		}

		// Collect form data
		const formData = new FormData(formElement);
		const payload = {
			nombre: formData.get('nombre') as string,
			apellido: formData.get('apellido') as string,
			correo: formData.get('correo') as string,
			telefono: (formData.get('telefono') as string) || '',
			mensaje: (formData.get('mensaje') as string) || '',
			intent: 'direct-contact' as const,
			website: (formData.get('website') as string) || ''
		};

		if (!payload.nombre || !payload.apellido || !payload.correo) {
			errorMessage = 'Por favor completa todos los campos requeridos.';
			return;
		}

		// Validate email format
		if (!EMAIL_REGEX.test(payload.correo)) {
			errorMessage = 'Por favor ingresa un correo electrónico válido.';
			return;
		}

		formElement.reset();
		formToastStore.show(optimisticContactSuccessMessage, 'success');

		void fetch('/api/contact', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		})
			.then(async (response) => {
				let result: { error?: string } = {};
				try {
					result = await response.json();
				} catch {
					/* non-JSON body */
				}
				if (!response.ok) {
					formToastStore.show(
						result.error || 'Error al enviar el formulario. Por favor, intenta de nuevo.',
						'error'
					);
				}
			})
			.catch((error) => {
				console.error('Form submission error:', error);
				formToastStore.show(
					'Error de conexión. Por favor, verifica tu conexión a internet e intenta de nuevo.',
					'error'
				);
			});
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

	{#if errorMessage}
		<div class='form-message form-message--error' role='alert'>
			{errorMessage}
		</div>
	{/if}

	<div class='form-row'>
		<div class='form-group'>
			<label for='nombre'>Nombre</label>
			<Input
				type='text'
				id='nombre'
				name='nombre'
				required
				ariaLabel='Nombre'
			/>
		</div>
		<div class='form-group'>
			<label for='apellido'>Apellido</label>
			<Input
				type='text'
				id='apellido'
				name='apellido'
				required
				ariaLabel='Apellido'
			/>
		</div>
	</div>
	<div class='form-group'>
		<label for='correo'>Correo</label>
		<Input
			type='email'
			id='correo'
			name='correo'
			required
			ariaLabel='Correo electrónico'
		/>
	</div>
	<PhoneNumberInput id='telefono' name='telefono' label='Contacto de WhatsApp' />
	<div class='form-group'>
		<label for='mensaje'>Mensaje</label>
		<Textarea
			id='mensaje'
			name='mensaje'
			rows={4}
			ariaLabel='Mensaje o consulta'
		/>
	</div>
	<div class='form-group'>
		<button type='submit' class='btn-cta-primary' aria-label='Enviar formulario de contacto'>ENVIAR</button>
	</div>
</form>

<style>
	.form-row {
		display: flex;
		gap: 0.75rem;
	}

	.form-row .form-group {
		flex: 1;
	}

	.form-group {
		margin-bottom: 0.75rem;
	}

	.form-group label {
		/* Typography */
		font-family: var(--font-body);
		font-weight: var(--font-weight-medium);
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
		background: var(--ref-cta-teal);

		/* Typography */
		font-family: var(--font-body);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-on-accent);

		/* Misc/Overrides */
		cursor: pointer;
	}

	.form-group button:hover:not(:disabled) {
		/* Box/Visual */
		background: var(--ref-cta-teal-hover);
	}

	.form-group button:focus-visible {
		/* Box/Visual */
		outline: 2px solid var(--ref-cta-teal);
		outline-offset: 2px;
	}

	.form-group button:disabled {
		/* Box/Visual */
		opacity: 0.6;

		/* Misc/Overrides */
		cursor: not-allowed;
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

	.form-message--error {
		/* Box/Visual */
		background-color: var(--color-error-bg, #f8d7da);
		border: 1px solid var(--color-error-border, #f5c6cb);

		/* Typography */
		color: var(--color-error-text, #721c24);
	}
</style>
