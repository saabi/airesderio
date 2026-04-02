<script lang="ts">
	let leads = $state<
		Array<{
			id: string;
			firstName: string;
			lastName: string;
			email: string;
			phone: string | null;
			message: string | null;
			intent: string;
			downloadCount: number | null;
			createdAt: string;
		}>
	>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let purgePassword = $state('');
	let purgeLoading = $state(false);
	let purgeError = $state<string | null>(null);

	async function loadLeads() {
		loading = true;
		error = null;
		try {
			const res = await fetch('/api/admin/leads');
			const data = await res.json();
			if (!res.ok) throw new Error(data.error ?? 'Error al cargar');
			leads = data.leads ?? [];
		} catch (e) {
			error = e instanceof Error ? e.message : 'Error desconocido';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		loadLeads();
	});

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('es-AR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function downloadsFor(lead: { downloadCount: number | null }) {
		return lead.downloadCount ?? 0;
	}

	async function clearContactData() {
		purgeError = null;
		if (
			!confirm(
				'¿Eliminar todos los contactos, tokens de PDF y trabajos de correo pendientes? No se puede deshacer.'
			)
		) {
			return;
		}
		if (!purgePassword) {
			purgeError = 'Ingresá la contraseña de administrador.';
			return;
		}
		purgeLoading = true;
		try {
			const res = await fetch('/api/admin/leads/clear', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password: purgePassword })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				purgeError =
					typeof data.error === 'string' ? data.error : 'No se pudo vaciar la base de datos.';
				return;
			}
			purgePassword = '';
			leads = [];
		} catch {
			purgeError = 'Error de red al vaciar los datos.';
		} finally {
			purgeLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Contactos - Admin | Aires de Río</title>
</svelte:head>

<h1>Contactos</h1>

{#if loading}
	<p>Cargando...</p>
{:else if error}
	<p class="error">{error}</p>
{:else if leads.length === 0}
	<p>No hay contactos aún.</p>
{:else}
	<div class="table-wrap">
		<table class="leads-table">
			<thead>
				<tr>
					<th>Fecha</th>
					<th>Nombre</th>
					<th>Apellido</th>
					<th>Correo</th>
					<th>Teléfono</th>
					<th>Intención</th>
					<th>Email verificado</th>
					<th>Descargas PDF</th>
					<th>Mensaje</th>
				</tr>
			</thead>
			<tbody>
				{#each leads as lead}
					<tr>
						<td>{formatDate(lead.createdAt)}</td>
						<td>{lead.firstName}</td>
						<td>{lead.lastName}</td>
						<td><a href="mailto:{lead.email}">{lead.email}</a></td>
						<td>{lead.phone ?? '—'}</td>
						<td>{lead.intent}</td>
						<td>{downloadsFor(lead) > 0 ? 'Sí' : 'No'}</td>
						<td>{downloadsFor(lead)}</td>
						<td class="message-cell">{lead.message ?? '—'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<section class="danger-zone" aria-labelledby="danger-zone-title">
	<h2 id="danger-zone-title">Zona de peligro</h2>
	<p class="danger-zone-desc">
		Elimina todos los registros de contactos, enlaces de descarga de PDF y cola de correos asociados a
		leads. No afecta otras tablas ni el esquema.
	</p>
	<div class="danger-zone-row">
		<label class="sr-only" for="purge-password">Contraseña de administrador</label>
		<input
			id="purge-password"
			class="danger-password"
			type="password"
			name="purge-password"
			autocomplete="current-password"
			placeholder="Contraseña de administrador"
			bind:value={purgePassword}
			disabled={purgeLoading}
		/>
		<button
			type="button"
			class="danger-button"
			disabled={purgeLoading}
			onclick={clearContactData}
		>
			{purgeLoading ? 'Procesando…' : 'Vaciar datos de contactos'}
		</button>
	</div>
	{#if purgeError}
		<p class="danger-error" role="alert">{purgeError}</p>
	{/if}
</section>

<style>
	h1 {
		margin: 0 0 1rem;
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.error {
		color: var(--color-error-text, #721c24);
	}

	.table-wrap {
		overflow-x: auto;
		border: 1px solid var(--color-border-default);
		border-radius: 0.5rem;
		background: var(--color-bg-canvas);
	}

	.leads-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
	}

	.leads-table th,
	.leads-table td {
		padding: 0.5rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.leads-table th {
		background: var(--color-bg-contrast);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.leads-table td a {
		color: var(--color-accent-primary);
		text-decoration: none;
	}

	.leads-table td a:hover {
		text-decoration: underline;
	}

	.message-cell {
		max-width: 12rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.danger-zone {
		margin-top: 2.5rem;
		padding: 1.25rem;
		max-width: 36rem;
		border: 1px solid var(--color-error-border, #f5c6cb);
		border-radius: 0.5rem;
		background: var(--color-error-bg, #fdf2f2);
	}

	.danger-zone h2 {
		margin: 0 0 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-error-text, #721c24);
	}

	.danger-zone-desc {
		margin: 0 0 1rem;
		font-size: 0.875rem;
		line-height: 1.45;
		color: var(--color-text-secondary);
	}

	.danger-zone-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
	}

	.danger-password {
		flex: 1 1 12rem;
		min-width: 0;
		padding: 0.5rem 0.65rem;
		border: 1px solid var(--color-border-default);
		border-radius: 0.35rem;
		font: inherit;
		background: var(--color-bg-canvas);
		color: var(--color-text-primary);
	}

	.danger-button {
		padding: 0.5rem 0.85rem;
		font: inherit;
		font-weight: 600;
		color: #fff;
		background: #b91c1c;
		border: none;
		border-radius: 0.35rem;
		cursor: pointer;
	}

	.danger-button:hover:not(:disabled) {
		background: #991b1b;
	}

	.danger-button:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}

	.danger-error {
		margin: 0.75rem 0 0;
		font-size: 0.875rem;
		color: var(--color-error-text, #721c24);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
