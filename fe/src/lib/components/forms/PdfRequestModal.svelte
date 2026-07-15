<script module lang="ts">
	import Input from '$lib/components/forms/Input.svelte';
	import PhoneNumberInput from '$lib/components/forms/PhoneNumberInput.svelte';
	import Textarea from '$lib/components/forms/Textarea.svelte';
	import type { PdfIntent, PdfRequestSource } from '$lib/stores/pdfRequestModal';

	const EMAIL_REGEX =
		/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
</script>

<script lang="ts">
	import { pdfRequestModalStore } from '$lib/stores/pdfRequestModal';
	import { formToastStore } from '$lib/stores/formToast';
	import { isLeadPhoneFilled } from '$lib/utils/leadPhone.js';
	import { suggestEmailCorrection } from '$lib/utils/emailSuggest.js';

	let { intent, source }: { intent: PdfIntent; source: PdfRequestSource } = $props();

	const submitButtonId = $derived(
		source === 'luxury'
			? 'submit-ficha-luxury'
			: source === 'planos'
				? 'submit-planos'
				: 'submit-ficha-basica'
	);

	let formElement: HTMLFormElement | null = $state(null);
	let errorMessage = $state<string | null>(null);
	let canSubmit = $state(false);
	let submitting = $state(false);
	let correo = $state('');
	let emailSuggestion = $state<string | null>(null);

	function isPdfRequestFormComplete(form: HTMLFormElement): boolean {
		const fd = new FormData(form);
		const nombre = String(fd.get('nombre') ?? '').trim();
		const apellido = String(fd.get('apellido') ?? '').trim();
		const correoVal = String(fd.get('correo') ?? '').trim();
		const telefono = String(fd.get('telefono') ?? '');
		return (
			nombre.length > 0 &&
			apellido.length > 0 &&
			correoVal.length > 0 &&
			EMAIL_REGEX.test(correoVal) &&
			isLeadPhoneFilled(telefono)
		);
	}

	function syncSubmitEnabled() {
		if (!formElement) {
			canSubmit = false;
			return;
		}
		canSubmit = isPdfRequestFormComplete(formElement);
	}

	function updateEmailSuggestion(value: string) {
		correo = value;
		emailSuggestion = suggestEmailCorrection(value);
		syncSubmitEnabled();
	}

	function applyEmailSuggestion() {
		if (!emailSuggestion) return;
		correo = emailSuggestion;
		emailSuggestion = null;
		syncSubmitEnabled();
	}

	$effect(() => {
		void formElement;
		syncSubmitEnabled();
	});

	function handleClose() {
		if (submitting) return;
		pdfRequestModalStore.close();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (!formElement || submitting) return;

		errorMessage = null;

		if (!formElement.checkValidity()) {
			formElement.reportValidity();
			return;
		}

		const formData = new FormData(formElement);
		const payload = {
			nombre: formData.get('nombre') as string,
			apellido: formData.get('apellido') as string,
			correo: (formData.get('correo') as string) || correo,
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

		if (!isLeadPhoneFilled(payload.telefono)) {
			errorMessage =
				'Por favor ingresá un número de teléfono completo con código de país.';
			return;
		}

		submitting = true;
		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			let result: { error?: string; message?: string; pdfUrl?: string } = {};
			try {
				result = await response.json();
			} catch {
				/* non-JSON body */
			}

			if (!response.ok) {
				errorMessage =
					result.error || 'Error al enviar el formulario. Por favor, intenta de nuevo.';
				formToastStore.show(errorMessage, 'error');
				return;
			}

			const pdfUrl = result.pdfUrl;
			const message =
				result.message ||
				'¡Listo! Ya podés abrir la ficha técnica. También te enviamos el enlace por correo para que la tengas a mano.';

			formElement.reset();
			correo = '';
			emailSuggestion = null;
			syncSubmitEnabled();
			pdfRequestModalStore.close();

			if (pdfUrl) {
				try {
					window.open(pdfUrl, '_blank', 'noopener,noreferrer');
				} catch {
					/* popup may be blocked */
				}
				formToastStore.show(message, 'success', [
					{ label: 'Abrir ficha técnica', href: pdfUrl },
					{ label: 'Descargar', href: `${pdfUrl}&download=1` }
				]);
			} else {
				formToastStore.show(message, 'success');
			}
		} catch (error) {
			console.error('Form submission error:', error);
			const msg =
				'Error de conexión. Por favor, verifica tu conexión a internet e intenta de nuevo.';
			errorMessage = msg;
			formToastStore.show(msg, 'error');
		} finally {
			submitting = false;
		}
	}
</script>

<div
	class="modal-backdrop"
	role="dialog"
	aria-modal="true"
	aria-labelledby="pdf-modal-title"
	aria-describedby="pdf-modal-desc"
	tabindex="-1"
	onclick={handleBackdropClick}
	onkeydown={(e) => e.key === 'Escape' && handleClose()}
>
	<div class="modal-content">
		<button type="button" class="modal-close" aria-label="Cerrar" onclick={handleClose}>×</button>
		<h2 id="pdf-modal-title">Solicitar Ficha Técnica</h2>
		<p id="pdf-modal-desc">
			Completá tus datos y te damos acceso a la ficha al instante. También te la enviamos por
			correo para que la tengas a mano.
		</p>

		<form
			bind:this={formElement}
			action="#"
			method="POST"
			onsubmit={handleSubmit}
			oninput={syncSubmitEnabled}
			onchange={syncSubmitEnabled}
			novalidate
		>
			<input
				type="text"
				name="website"
				autocomplete="off"
				tabindex="-1"
				aria-hidden="true"
				style="position: absolute; left: -9999px;"
			/>

			{#if errorMessage}
				<div class="form-message form-message--error" role="alert">{errorMessage}</div>
			{/if}

			<div class="form-row">
				<div class="form-group">
					<label for="pdf-nombre">
						Nombre<span class="field-required-indicator" aria-hidden="true"> *</span>
					</label>
					<Input type="text" id="pdf-nombre" name="nombre" required ariaLabel="Nombre" />
				</div>
				<div class="form-group">
					<label for="pdf-apellido">
						Apellido<span class="field-required-indicator" aria-hidden="true"> *</span>
					</label>
					<Input type="text" id="pdf-apellido" name="apellido" required ariaLabel="Apellido" />
				</div>
			</div>
			<div class="form-group">
				<label for="pdf-correo">
					Correo<span class="field-required-indicator" aria-hidden="true"> *</span>
				</label>
				<Input
					type="email"
					id="pdf-correo"
					name="correo"
					value={correo}
					required
					ariaLabel="Correo electrónico"
					oninput={(e) => updateEmailSuggestion((e.currentTarget as HTMLInputElement).value)}
					onblur={(e) => updateEmailSuggestion((e.currentTarget as HTMLInputElement).value)}
				/>
				{#if emailSuggestion}
					<button type="button" class="email-suggest" onclick={applyEmailSuggestion}>
						¿Quisiste decir <strong>{emailSuggestion}</strong>?
					</button>
				{/if}
			</div>
			<PhoneNumberInput
				id="pdf-telefono"
				name="telefono"
				label="Contacto de WhatsApp"
				required
				onPhoneValueChange={syncSubmitEnabled}
			/>
			<div class="form-group">
				<label for="pdf-mensaje">Mensaje (opcional)</label>
				<Textarea id="pdf-mensaje" name="mensaje" rows={3} ariaLabel="Mensaje" />
			</div>
			<div class="form-group">
				<button
					id={submitButtonId}
					type="submit"
					class="btn-cta-primary"
					aria-label="Solicitar ficha técnica"
					disabled={!canSubmit || submitting}
				>
					{submitting ? 'ENVIANDO…' : 'SOLICITAR FICHA TÉCNICA'}
				</button>
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
		color: var(--color-title-emphasis);
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

	.form-group button.btn-cta-primary {
		width: 100%;
		padding: 0.75rem;
		border-radius: 0.25rem;
		font-family: var(--font-body);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
	}

	.form-group button.btn-cta-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.email-suggest {
		display: block;
		margin-top: 0.35rem;
		padding: 0;
		border: none;
		background: transparent;
		font-family: var(--font-body);
		font-size: 0.8rem;
		color: var(--color-text-link, var(--color-accent-primary));
		text-align: left;
		cursor: pointer;
	}

	.email-suggest:hover {
		text-decoration: underline;
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
