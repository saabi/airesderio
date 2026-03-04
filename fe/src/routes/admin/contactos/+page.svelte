<script lang="ts">
	let leads = $state<Array<{
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone: string | null;
		message: string | null;
		intent: string;
		emailVerifiedAt: string | null;
		createdAt: string;
	}>>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

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
						<td>{lead.emailVerifiedAt ? 'Sí' : 'No'}</td>
						<td class="message-cell">{lead.message ?? '—'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

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
</style>
