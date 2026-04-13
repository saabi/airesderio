<script lang='ts'>
	import { formToastStore } from '$lib/stores/formToast';
</script>

{#if $formToastStore}
	<div
		id={$formToastStore.variant === 'success' ? 'form-success-message' : undefined}
		class='form-toast'
		class:form-toast--success={$formToastStore.variant === 'success'}
		class:form-toast--error={$formToastStore.variant === 'error'}
		role='alert'
		aria-live='polite'
	>
		<p class='form-toast__text'>{$formToastStore.message}</p>
		<button
			type='button'
			class='form-toast__dismiss'
			aria-label='Cerrar notificación'
			onclick={() => formToastStore.dismiss()}
		>
			×
		</button>
	</div>
{/if}

<style>
	.form-toast {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 12000;
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		max-width: min(36rem, calc(100vw - 2rem));
		padding: 1rem 1rem 1rem 1.25rem;
		border-radius: 0.5rem;
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
		font-family: var(--font-body);
		font-size: 0.95rem;
		line-height: 1.45;
		background: #022b3a;
		color: #fff;
	}

	.form-toast--success {
		border: 1px solid rgba(255, 255, 255, 0.18);
	}

	.form-toast--error {
		border: 1px solid rgba(255, 255, 255, 0.18);
	}

	.form-toast__text {
		margin: 0;
		flex: 1;
		min-width: 0;
	}

	.form-toast__dismiss {
		flex-shrink: 0;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border: none;
		background: transparent;
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
		color: rgba(255, 255, 255, 0.9);
		border-radius: 0.25rem;
	}

	.form-toast__dismiss:hover {
		color: #fff;
	}

	.form-toast__dismiss:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 2px;
	}
</style>
