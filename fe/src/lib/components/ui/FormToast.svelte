<script lang="ts">
	import { formToastStore } from '$lib/stores/formToast';
</script>

{#if $formToastStore}
	<div
		id={$formToastStore.variant === 'success' ? 'form-success-message' : undefined}
		class="form-toast"
		class:form-toast--success={$formToastStore.variant === 'success'}
		class:form-toast--error={$formToastStore.variant === 'error'}
		role="alert"
		aria-live="polite"
	>
		<div class="form-toast__body">
			<p class="form-toast__text">{$formToastStore.message}</p>
			{#if $formToastStore.actions && $formToastStore.actions.length > 0}
				<div class="form-toast__actions">
					{#each $formToastStore.actions as action, i (action.href + action.label)}
						<a
							href={action.href}
							class="form-toast__action"
							class:form-toast__action--primary={i === 0}
							target="_blank"
							rel="noopener noreferrer"
						>
							{action.label}
						</a>
					{/each}
				</div>
			{/if}
		</div>
		<button
			type="button"
			class="form-toast__dismiss"
			aria-label="Cerrar notificación"
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

	.form-toast__body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.form-toast__text {
		margin: 0;
	}

	.form-toast__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.form-toast__action {
		display: inline-block;
		padding: 0.45rem 0.85rem;
		border-radius: 0.25rem;
		font-size: 0.875rem;
		font-weight: 600;
		text-decoration: none;
		border: 1px solid rgba(255, 255, 255, 0.35);
		color: #fff;
		background: transparent;
	}

	.form-toast__action:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.form-toast__action--primary {
		background: var(--color-accent-primary, #b63f3c);
		border-color: transparent;
	}

	.form-toast__action--primary:hover {
		filter: brightness(1.08);
		background: var(--color-accent-primary, #b63f3c);
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
