<script lang="ts">
	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let isLoading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = null;
		isLoading = true;

		try {
			const res = await fetch('/api/admin/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});
			const data = await res.json();

			if (!res.ok) {
				error = data.error ?? 'Error al iniciar sesión.';
				return;
			}
			window.location.href = data.redirectTo ?? '/admin/contactos';
		} catch (err) {
			console.error(err);
			error = 'Error de conexión.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="login-wrap">
	<div class="login-card">
		<h1>Admin</h1>
		<p class="login-subtitle">Aires de Río</p>

		<form onsubmit={handleSubmit}>
			{#if error}
				<div class="login-error" role="alert">{error}</div>
			{/if}

			<div class="form-group">
				<label for="email">Correo</label>
				<input
					id="email"
					type="email"
					name="email"
					required
					autocomplete="email"
					bind:value={email}
					disabled={isLoading}
				/>
			</div>

			<div class="form-group">
				<label for="password">Contraseña</label>
				<input
					id="password"
					type="password"
					name="password"
					required
					autocomplete="current-password"
					bind:value={password}
					disabled={isLoading}
				/>
			</div>

			<button type="submit" disabled={isLoading}>
				{#if isLoading}Iniciando sesión...{:else}Ingresar{/if}
			</button>
		</form>
	</div>
</div>

<style>
	.login-wrap {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: var(--color-bg-base);
	}

	.login-card {
		width: 100%;
		max-width: 22rem;
		padding: 2rem;
		background: var(--color-bg-canvas);
		border-radius: 0.5rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.login-card h1 {
		margin: 0 0 0.25rem;
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.login-subtitle {
		margin: 0 0 1.5rem;
		font-size: 0.9rem;
		color: var(--color-text-secondary);
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.25rem;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.form-group input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		font-size: 1rem;
		border: 1px solid var(--color-border-default);
		border-radius: 0.25rem;
		background: var(--color-bg-base);
		color: var(--color-text-primary);
	}

	.form-group input:disabled {
		opacity: 0.7;
	}

	.login-error {
		padding: 0.75rem;
		margin-bottom: 1rem;
		background: var(--color-error-bg, #f8d7da);
		border: 1px solid var(--color-error-border, #f5c6cb);
		color: var(--color-error-text, #721c24);
		border-radius: 0.25rem;
		font-size: 0.9rem;
	}

	button {
		width: 100%;
		padding: 0.75rem;
		margin-top: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-inverse);
		background: var(--color-accent-primary);
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
	}

	button:hover:not(:disabled) {
		background: var(--color-accent-strong);
	}

	button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>
