<script lang="ts">
	import { onMount } from 'svelte';

	type LeadRow = {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone: string | null;
		message: string | null;
		intent: string;
		downloadCount: number | null;
		starred: boolean;
		createdAt: string;
	};

	let leads = $state<LeadRow[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let selectedIds = $state(new Set<string>());
	let selectAllInput = $state<HTMLInputElement | null>(null);

	let purgePassword = $state('');
	let purgeLoading = $state(false);
	let purgeError = $state<string | null>(null);

	let deleteLoading = $state(false);
	let deleteError = $state<string | null>(null);
	let starError = $state<string | null>(null);

	/** Orden opcional: destacados arriba, luego por fecha (más recientes primero). */
	let starredFirst = $state(false);

	function sortLeadsStarredFirst(list: LeadRow[]): LeadRow[] {
		return [...list].sort((a, b) => {
			if (a.starred !== b.starred) return a.starred ? -1 : 1;
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});
	}

	async function loadLeads() {
		loading = true;
		error = null;
		try {
			const res = await fetch('/api/admin/leads');
			const data = await res.json();
			if (!res.ok) throw new Error(data.error ?? 'Error al cargar');
			const raw = data.leads ?? [];
			leads = raw.map((row: Record<string, unknown>) => ({
				...row,
				starred: Boolean(row.starred)
			})) as LeadRow[];
			selectedIds = new Set([...selectedIds].filter((id) => leads.some((l) => l.id === id)));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Error desconocido';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		void loadLeads();
	});

	const visibleLeads = $derived(starredFirst ? sortLeadsStarredFirst(leads) : leads);

	const visibleSelectedCount = $derived(
		visibleLeads.filter((l) => selectedIds.has(l.id)).length
	);

	const selectAllChecked = $derived(
		visibleLeads.length > 0 && visibleSelectedCount === visibleLeads.length
	);

	$effect(() => {
		const el = selectAllInput;
		if (!el) return;
		const len = visibleLeads.length;
		const n = visibleSelectedCount;
		el.indeterminate = len > 0 && n > 0 && n < len;
	});

	function toggleRow(id: string, checked: boolean) {
		const next = new Set(selectedIds);
		if (checked) next.add(id);
		else next.delete(id);
		selectedIds = next;
	}

	function toggleSelectAll(checked: boolean) {
		const ids = visibleLeads.map((l) => l.id);
		const next = new Set(selectedIds);
		for (const id of ids) {
			if (checked) next.add(id);
			else next.delete(id);
		}
		selectedIds = next;
	}

	async function toggleStar(lead: LeadRow) {
		starError = null;
		const next = !lead.starred;
		const prev = lead.starred;
		leads = leads.map((l) => (l.id === lead.id ? { ...l, starred: next } : l));
		try {
			const res = await fetch(`/api/admin/leads/${encodeURIComponent(lead.id)}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ starred: next })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Error');
		} catch {
			leads = leads.map((l) => (l.id === lead.id ? { ...l, starred: prev } : l));
			starError = 'No se pudo actualizar el destacado.';
		}
	}

	async function deleteSelected() {
		const ids = [...selectedIds];
		if (ids.length === 0) return;
		deleteError = null;
		if (
			!confirm(
				`¿Eliminar ${ids.length} contacto${ids.length === 1 ? '' : 's'}? No se puede deshacer.`
			)
		) {
			return;
		}
		deleteLoading = true;
		try {
			const res = await fetch('/api/admin/leads', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ids })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				deleteError =
					typeof data.error === 'string' ? data.error : 'No se pudieron eliminar los contactos.';
				return;
			}
			leads = leads.filter((l) => !ids.includes(l.id));
			selectedIds = new Set();
		} catch {
			deleteError = 'Error de red al eliminar.';
		} finally {
			deleteLoading = false;
		}
	}

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
			selectedIds = new Set();
		} catch {
			purgeError = 'Error de red al vaciar los datos.';
		} finally {
			purgeLoading = false;
		}
	}

	const selectionCount = $derived(selectedIds.size);
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
	<div class="bulk-toolbar" role="toolbar" aria-label="Acciones de contactos">
		<label class="sort-starred-first">
			<input type="checkbox" bind:checked={starredFirst} />
			<span>Destacados primero</span>
		</label>
		<span class="bulk-toolbar-spacer" aria-hidden="true"></span>
		<span class="bulk-count">{selectionCount} seleccionado{selectionCount === 1 ? '' : 's'}</span>
		<button
			type="button"
			class="bulk-delete"
			disabled={deleteLoading || selectedIds.size === 0}
			title={selectedIds.size === 0 && !deleteLoading
				? 'Seleccioná uno o más contactos para eliminar'
				: undefined}
			onclick={deleteSelected}
		>
			{deleteLoading ? 'Eliminando…' : 'Eliminar seleccionados'}
		</button>
	</div>
	{#if deleteError}
		<p class="error soft" role="alert">{deleteError}</p>
	{/if}
	{#if starError}
		<p class="error soft" role="alert">{starError}</p>
	{/if}

	<div class="table-wrap">
		<table class="leads-table">
			<thead>
				<tr>
					<th class="th-check" scope="col">
						<input
							bind:this={selectAllInput}
							type="checkbox"
							checked={selectAllChecked}
							aria-label="Seleccionar todos los contactos visibles"
							onchange={(e) => toggleSelectAll(e.currentTarget.checked)}
						/>
					</th>
					<th class="th-star" scope="col"><span class="sr-only">Importante</span></th>
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
				{#each visibleLeads as lead (lead.id)}
					<tr class:row-starred={lead.starred}>
						<td class="td-check">
							<input
								type="checkbox"
								checked={selectedIds.has(lead.id)}
								aria-label="Seleccionar {lead.firstName} {lead.lastName}"
								onchange={(e) => toggleRow(lead.id, e.currentTarget.checked)}
							/>
						</td>
						<td class="td-star">
							<button
								type="button"
								class="star-btn"
								class:starred={lead.starred}
								aria-pressed={lead.starred}
								aria-label={lead.starred ? 'Quitar importancia' : 'Marcar como importante'}
								onclick={() => toggleStar(lead)}
							>
								<span aria-hidden="true">{lead.starred ? '★' : '☆'}</span>
							</button>
						</td>
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

	.error.soft {
		margin: 0 0 0.75rem;
		font-size: 0.9rem;
	}

	.bulk-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		background: var(--color-bg-contrast);
		border: 1px solid var(--color-border-default);
	}

	.sort-starred-first {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.875rem;
		color: var(--color-text-primary);
		cursor: pointer;
		user-select: none;
	}

	.sort-starred-first input {
		width: 1rem;
		height: 1rem;
		accent-color: var(--color-accent-primary, #4497b9);
	}

	.bulk-toolbar-spacer {
		flex: 1 1 0;
		min-width: 0.5rem;
	}

	.bulk-count {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.bulk-delete {
		padding: 0.4rem 0.75rem;
		font: inherit;
		font-weight: 600;
		font-size: 0.875rem;
		color: #fff;
		background: #b91c1c;
		border: none;
		border-radius: 0.35rem;
		cursor: pointer;
	}

	.bulk-delete:hover:not(:disabled) {
		background: #991b1b;
	}

	.bulk-delete:disabled {
		opacity: 0.45;
		cursor: not-allowed;
		filter: grayscale(0.25);
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
		vertical-align: middle;
	}

	.th-check,
	.td-check {
		width: 2.25rem;
		padding-right: 0.25rem;
	}

	.th-star,
	.td-star {
		width: 2.5rem;
		text-align: center;
		padding-left: 0.25rem;
		padding-right: 0.25rem;
	}

	.leads-table th {
		background: var(--color-bg-contrast);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.row-starred {
		background: color-mix(in srgb, var(--color-accent-primary, #4497b9) 8%, transparent);
	}

	.star-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border: none;
		border-radius: 0.25rem;
		background: transparent;
		font-size: 1.25rem;
		line-height: 1;
		color: var(--color-text-muted, #888);
		cursor: pointer;
		transition: color 0.15s ease, background 0.15s ease;
	}

	.star-btn:hover {
		background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
		color: #c9a227;
	}

	.star-btn.starred {
		color: #c9a227;
	}

	.star-btn:focus-visible {
		outline: 2px solid var(--color-accent-primary);
		outline-offset: 2px;
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
