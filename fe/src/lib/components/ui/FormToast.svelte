<script lang='ts'>
	import { formToastStore } from '$lib/stores/formToast';
</script>

{#if $formToastStore}
	<div
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
		bottom: 1.25rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 12000;
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		max-width: min(36rem, calc(100vw - 2rem));
		padding: 1rem 1rem 1rem 1.25rem;
		border-radius: 0.5rem;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
		font-family: var(--font-body);
		font-size: 0.95rem;
		line-height: 1.45;
	}

	.form-toast--success {
		background: var(--color-bg-canvas, #fff);
		border: 1px solid var(--color-success-border, #c3e6cb);
		color: var(--color-text-primary);
	}

	.form-toast--error {
		background: var(--color-bg-canvas, #fff);
		border: 1px solid var(--color-error-border, #f5c6cb);
		color: var(--color-text-primary);
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
		color: var(--color-text-secondary);
		border-radius: 0.25rem;
	}

	.form-toast__dismiss:hover {
		color: var(--color-text-primary);
	}

	.form-toast__dismiss:focus-visible {
		outline: 2px solid var(--color-accent-primary);
		outline-offset: 2px;
	}
</style>
