<script module lang='ts'>
	import Input from '$lib/components/forms/Input.svelte';
	import PhoneNumberInput from '$lib/components/forms/PhoneNumberInput.svelte';
	import Textarea from '$lib/components/forms/Textarea.svelte';
	import type { PdfIntent } from '$lib/stores/pdfRequestModal';

	const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
	const INTENT_LABELS: Record<PdfIntent, string> = {
		'ficha-tecnica': 'Ficha técnica',
		'ficha-tecnica-harmony': 'Ficha técnica',
		'ficha-tecnica-luxury': 'Ficha técnica — Luxury Style',
		planos: 'Planos'
	};
</script>

<script lang='ts'>
	import { pdfRequestModalStore } from '$lib/stores/pdfRequestModal';
	import { formToastStore } from '$lib/stores/formToast';

	let { intent }: { intent: PdfIntent } = $props();

	// ===== STATE =====
	let formElement: HTMLFormElement | null = $state(null);
	let errorMessage = $state<string | null>(null);

	const optimisticPdfSuccessMessage =
		'Formulario enviado correctamente. Revisá tu correo electrónico para descargar el archivo.';

	// ===== HANDLERS =====
	function handleClose() {
		pdfRequestModalStore.close();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	}

	function handleSubmit(event: Event) {
		event.preventDefault();
		if (!formElement) return;

		errorMessage = null;

		if (!formElement.checkValidity()) {
			formElement.reportValidity();
			return;
		}

		const formData = new FormData(formElement);
		const payload = {
			nombre: formData.get('nombre') as string,
			apellido: formData.get('apellido') as string,
			correo: formData.get('correo') as string,
			telefono: (formData.get('telefono') as string) || '',
			mensaje: (formData.get('mensaje') as string) || '',
			intent,
			website: (formData.get('website') as string) || ''
		};

		if (!payload.nombre || !payload.apellido || !payload.correo) {
			errorMessage = 'Por favor completa todos los campos requeridos.';
			return;
		}

		if (!EMAIL_REGEX.test(payload.correo)) {
			errorMessage = 'Por favor ingresa un correo electrónico válido.';
			return;
		}

		formElement.reset();
		formToastStore.show(optimisticPdfSuccessMessage, 'success');
		pdfRequestModalStore.close();

		void fetch('/api/contact', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
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

<div
	class='modal-backdrop'
	role='dialog'
	aria-modal='true'
	aria-labelledby='pdf-modal-title'
	aria-describedby='pdf-modal-desc'
	tabindex='-1'
	onclick={handleBackdropClick}
	onkeydown={(e) => e.key === 'Escape' && handleClose()}
>
	<div class='modal-content'>
		<button type='button' class='modal-close' aria-label='Cerrar' onclick={handleClose}>×</button>
		<h2 id='pdf-modal-title'>Solicitar {INTENT_LABELS[intent]}</h2>
		<p id='pdf-modal-desc'>Completá tus datos y te enviaremos la {INTENT_LABELS[intent].toLowerCase()} a tu correo.</p>

		<form bind:this={formElement} action='#' method='POST' onsubmit={handleSubmit} novalidate>
			<input
				type='text'
				name='website'
				autocomplete='off'
				tabindex='-1'
				aria-hidden='true'
				style='position: absolute; left: -9999px;'
			/>

			{#if errorMessage}
				<div class='form-message form-message--error' role='alert'>{errorMessage}</div>
			{/if}

			<div class='form-row'>
				<div class='form-group'>
					<label for='pdf-nombre'>Nombre</label>
					<Input
						type='text'
						id='pdf-nombre'
						name='nombre'
						required
						ariaLabel='Nombre'
					/>
				</div>
				<div class='form-group'>
					<label for='pdf-apellido'>Apellido</label>
					<Input
						type='text'
						id='pdf-apellido'
						name='apellido'
						required
						ariaLabel='Apellido'
					/>
				</div>
			</div>
			<div class='form-group'>
				<label for='pdf-correo'>Correo</label>
				<Input
					type='email'
					id='pdf-correo'
					name='correo'
					required
					ariaLabel='Correo electrónico'
				/>
			</div>
			<PhoneNumberInput id='pdf-telefono' name='telefono' label='Contacto de WhatsApp' />
			<div class='form-group'>
				<label for='pdf-mensaje'>Mensaje (opcional)</label>
				<Textarea
					id='pdf-mensaje'
					name='mensaje'
					rows={3}
					ariaLabel='Mensaje'
				/>
			</div>
			<div class='form-group'>
				<button type='submit' class='btn-cta-primary' aria-label='Solicitar'>SOLICITAR</button>
			</div>
		</form>
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 1100;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.4);
		-webkit-backdrop-filter: blur(6px);
		backdrop-filter: blur(6px);
		padding: 1rem;
	}

	.modal-content {
		position: relative;
		width: 100%;
		max-width: 28rem;
		max-height: 90vh;
		overflow-y: auto;
		padding: 2rem;
		background: var(--color-bg-canvas);
		border-radius: 0.5rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
	}

	.modal-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 2rem;
		height: 2rem;
		padding: 0;
		font-size: 1.5rem;
		line-height: 1;
		border: none;
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
	}
	.modal-close:hover {
		color: var(--color-text-primary);
	}

	.modal-content h2 {
		margin: 0 0 0.5rem;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-accent-primary);
	}

	.modal-content p {
		margin: 0 0 1.5rem;
		font-size: 0.9rem;
		color: var(--color-text-secondary);
	}

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
		font-family: var(--font-body);
		font-weight: var(--font-weight-medium);
		display: block;
		margin-bottom: 0.25rem;
		font-size: 0.85em;
		color: var(--color-text-primary);
	}

	.form-group button {
		width: 100%;
		padding: 0.75rem;
		border: none;
		border-radius: 0.25rem;
		background: var(--ref-cta-teal);
		font-family: var(--font-body);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-on-accent);
		cursor: pointer;
	}

	.form-group button:hover:not(:disabled) {
		background: var(--ref-cta-teal-hover);
	}

	.form-group button:focus-visible {
		outline: 2px solid var(--ref-cta-teal);
		outline-offset: 2px;
	}

	.form-group button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.form-message {
		padding: 0.75rem;
		margin-bottom: 1rem;
		border-radius: 0.25rem;
		font-size: 0.9em;
	}

	.form-message--error {
		background-color: var(--color-error-bg, #f8d7da);
		border: 1px solid var(--color-error-border, #f5c6cb);
		color: var(--color-error-text, #721c24);
	}
</style>
