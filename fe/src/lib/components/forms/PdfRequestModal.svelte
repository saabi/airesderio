<script module lang='ts'>
	import Input from '$lib/components/forms/Input.svelte';
	import PhoneNumberInput from '$lib/components/forms/PhoneNumberInput.svelte';
	import Textarea from '$lib/components/forms/Textarea.svelte';
	import type { PdfIntent } from '$lib/stores/pdfRequestModal';

	const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const INTENT_LABELS: Record<PdfIntent, string> = {
		'ficha-tecnica': 'Ficha técnica',
		planos: 'Planos'
	};
</script>

<script lang='ts'>
	import { pdfRequestModalStore } from '$lib/stores/pdfRequestModal';

	let { intent }: { intent: PdfIntent } = $props();

	// ===== STATE =====
	let formElement: HTMLFormElement | null = $state(null);
	let isLoading = $state(false);
	let successMessage = $state<string | null>(null);
	let errorMessage = $state<string | null>(null);

	// ===== HANDLERS =====
	function handleClose() {
		if (!isLoading) {
			pdfRequestModalStore.close();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (!formElement) return;

		successMessage = null;
		errorMessage = null;

		if (!formElement.checkValidity()) {
			formElement.reportValidity();
			return;
		}

		const formData = new FormData(formElement);
		const data = {
			nombre: formData.get('nombre') as string,
			correo: formData.get('correo') as string,
			telefono: (formData.get('telefono') as string) || '',
			mensaje: (formData.get('mensaje') as string) || '',
			intent,
			website: (formData.get('website') as string) || ''
		};

		if (!data.nombre || !data.correo) {
			errorMessage = 'Por favor completa todos los campos requeridos.';
			return;
		}

		if (!EMAIL_REGEX.test(data.correo)) {
			errorMessage = 'Por favor ingresa un correo electrónico válido.';
			return;
		}

		isLoading = true;

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});

			const result = await response.json();

			if (!response.ok) {
				errorMessage = result.error || 'Error al enviar el formulario. Por favor, intenta de nuevo.';
				return;
			}

			successMessage = result.message || 'Revisá tu correo electrónico para descargar el archivo.';
			formElement.reset();

			setTimeout(() => {
				handleClose();
			}, 5000);
		} catch (error) {
			console.error('Form submission error:', error);
			errorMessage =
				'Error de conexión. Por favor, verifica tu conexión a internet e intenta de nuevo.';
		} finally {
			isLoading = false;
		}
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

			{#if successMessage}
				<div class='form-message form-message--success' role='alert'>{successMessage}</div>
			{/if}
			{#if errorMessage}
				<div class='form-message form-message--error' role='alert'>{errorMessage}</div>
			{/if}

			<div class='form-group'>
				<label for='pdf-nombre'>Nombre</label>
				<Input
					type='text'
					id='pdf-nombre'
					name='nombre'
					required
					ariaLabel='Nombre completo'
					disabled={isLoading}
				/>
			</div>
			<div class='form-group'>
				<label for='pdf-correo'>Correo</label>
				<Input
					type='email'
					id='pdf-correo'
					name='correo'
					required
					ariaLabel='Correo electrónico'
					disabled={isLoading}
				/>
			</div>
			<PhoneNumberInput id='pdf-telefono' name='telefono' />
			<div class='form-group'>
				<label for='pdf-mensaje'>Mensaje (opcional)</label>
				<Textarea
					id='pdf-mensaje'
					name='mensaje'
					rows={3}
					ariaLabel='Mensaje'
					disabled={isLoading}
				/>
			</div>
			<div class='form-group'>
				<button type='submit' disabled={isLoading} aria-label='Solicitar'>
					{#if isLoading}
						<span class='button-loading'>Enviando...</span>
					{:else}
						SOLICITAR
					{/if}
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
		color: var(--color-accent-primary);
	}

	.modal-content p {
		margin: 0 0 1.5rem;
		font-size: 0.9rem;
		color: var(--color-text-secondary);
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
		background: var(--color-accent-primary);
		font-family: var(--font-body);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-inverse);
		cursor: pointer;
	}

	.form-group button:hover:not(:disabled) {
		background: var(--color-accent-strong);
	}

	.form-group button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.button-loading::after {
		display: inline-block;
		width: 1rem;
		height: 1rem;
		margin-left: 0.5rem;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		content: '';
		animation: spin 0.6s linear infinite;
		vertical-align: middle;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.form-message {
		padding: 0.75rem;
		margin-bottom: 1rem;
		border-radius: 0.25rem;
		font-size: 0.9em;
	}

	.form-message--success {
		background-color: var(--color-success-bg, #d4edda);
		border: 1px solid var(--color-success-border, #c3e6cb);
		color: var(--color-success-text, #155724);
	}

	.form-message--error {
		background-color: var(--color-error-bg, #f8d7da);
		border: 1px solid var(--color-error-border, #f5c6cb);
		color: var(--color-error-text, #721c24);
	}
</style>
