<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import LeadsPerDayChart from '$lib/components/admin/LeadsPerDayChart.svelte';

	type LeadRow = {
		id: string;
		firstName: string;
		lastName: string;
		email: string | null;
		phone: string | null;
		message: string | null;
		intent: string;
		downloadCount: number | null;
		starred: boolean;
		createdAt: string;
	};

	type MessagePopoutState = {
		text: string;
		top: number;
		left: number;
		maxWidth: number;
		placeAbove: boolean;
	};

	let leads = $state<LeadRow[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let selectedIds = new SvelteSet<string>();

	let purgePassword = $state('');
	let purgeLoading = $state(false);
	let purgeError = $state<string | null>(null);

	let deleteLoading = $state(false);
	let deleteError = $state<string | null>(null);
	let starError = $state<string | null>(null);
	let activeMessagePopout = $state<MessagePopoutState | null>(null);
	let manualNombre = $state('');
	let manualApellido = $state('');
	let manualCorreo = $state('');
	let manualTelefono = $state('');
	let manualMensaje = $state('');
	let manualReason = $state<'manual-entry' | 'whatsapp-lead'>('whatsapp-lead');
	let sendPdfEmail = $state(true);
	let notifyInfoEmail = $state(false);
	let dontInviteToWhatsapp = $state(true);
	let allowDuplicate = $state(false);
	let manualSubmitLoading = $state(false);
	let manualSubmitStatus = $state<{ type: 'success' | 'error'; text: string } | null>(null);
	let showManualLeadModal = $state(false);
	let manualLeadTriggerButton: HTMLButtonElement | null = null;
	let showEditLeadModal = $state(false);
	let editLeadId = $state('');
	let editFirstName = $state('');
	let editLastName = $state('');
	let editEmail = $state('');
	let editPhone = $state('');
	let editIntent = $state('');
	let editMessage = $state('');
	let editSubmitLoading = $state(false);
	let editSubmitStatus = $state<{ type: 'success' | 'error'; text: string } | null>(null);
	let editPreventDuplicate = $state(true);
	let editInitialEmailNormalized = $state('');
	let editSendPdfEmail = $state(false);
	let editDontInviteToWhatsapp = $state(true);
	/** `datetime-local` (opcional al crear: vacío = hora del servidor al guardar) */
	let manualCreatedAt = $state('');
	let editCreatedAt = $state('');
	let editLeadRestoreTriggerId = $state<string | null>(null);
	const editLeadTriggerButtons = new SvelteMap<string, HTMLButtonElement>();

	/** Orden opcional: destacados arriba, luego por fecha (más recientes primero). */
	let starredFirst = $state(false);

	const manualEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
			const validIds = new Set(leads.map((l) => l.id));
			for (const id of selectedIds) {
				if (!validIds.has(id)) selectedIds.delete(id);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Error desconocido';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		void loadLeads();
	});

	function normalizeEmailForLead(value: string | null | undefined): string {
		if (value == null) return '';
		return value.trim().toLowerCase();
	}

	/** WhatsApp sin correo: no enviar PDF ni notificación. */
	const manualDisableEmailOptions = $derived(
		manualReason === 'whatsapp-lead' && manualCorreo.trim() === ''
	);

	$effect(() => {
		if (manualDisableEmailOptions) {
			sendPdfEmail = false;
			notifyInfoEmail = false;
		}
	});

	const canToggleDontInviteToWhatsapp = $derived(
		manualReason === 'whatsapp-lead' && sendPdfEmail
	);

	const editCanSendPdfCheckbox = $derived(
		editEmail.trim() !== '' &&
			manualEmailRegex.test(editEmail.trim()) &&
			editEmail.trim().toLowerCase() !== editInitialEmailNormalized
	);

	const editCanToggleDontInviteToWhatsapp = $derived(
		editIntent === 'whatsapp-lead' && editSendPdfEmail
	);

	const editShowSameEmailPdfHint = $derived(
		editInitialEmailNormalized !== '' &&
			editEmail.trim() !== '' &&
			manualEmailRegex.test(editEmail.trim()) &&
			editEmail.trim().toLowerCase() === editInitialEmailNormalized
	);

	$effect(() => {
		if (!editCanSendPdfCheckbox) {
			editSendPdfEmail = false;
		}
	});

	const visibleLeads = $derived(starredFirst ? sortLeadsStarredFirst(leads) : leads);

	const visibleSelectedCount = $derived(
		visibleLeads.filter((l) => selectedIds.has(l.id)).length
	);

	const selectAllChecked = $derived(
		visibleLeads.length > 0 && visibleSelectedCount === visibleLeads.length
	);
	const selectAllIndeterminate = $derived(
		visibleLeads.length > 0 && visibleSelectedCount > 0 && visibleSelectedCount < visibleLeads.length
	);

	function toggleRow(id: string, checked: boolean) {
		if (checked) selectedIds.add(id);
		else selectedIds.delete(id);
	}

	function toggleSelectAll(checked: boolean) {
		const ids = visibleLeads.map((l) => l.id);
		for (const id of ids) {
			if (checked) selectedIds.add(id);
			else selectedIds.delete(id);
		}
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
			selectedIds.clear();
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

	/** For `<input type="datetime-local" />` in the browser's local offset. */
	function isoToDatetimeLocalValue(iso: string): string {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return '';
		const pad = (n: number) => n.toString().padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}

	function downloadsFor(lead: { downloadCount: number | null }) {
		return lead.downloadCount ?? 0;
	}

	function showMessagePopout(event: MouseEvent | FocusEvent, message: string) {
		const text = message.trim();
		if (!text) return;

		const trigger = event.currentTarget;
		if (!(trigger instanceof HTMLElement)) return;

		const triggerRect = trigger.getBoundingClientRect();
		const layerPadding = 8;
		const gap = 6;
		const availableWidth = Math.max(160, Math.floor(window.innerWidth - layerPadding * 2));
		const maxWidth = Math.min(448, availableWidth);
		const baseLeft = triggerRect.left;
		const maxLeft = Math.max(layerPadding, window.innerWidth - maxWidth - layerPadding);
		const left = Math.min(Math.max(layerPadding, baseLeft), maxLeft);
		const preferAbove = window.innerHeight - triggerRect.bottom < 180;
		const top = preferAbove ? triggerRect.top - gap : triggerRect.bottom + gap;

		activeMessagePopout = { text, top, left, maxWidth, placeAbove: preferAbove };
	}

	function hideMessagePopout() {
		activeMessagePopout = null;
	}

	function handleReasonChange(reason: 'manual-entry' | 'whatsapp-lead') {
		const becameWhatsapp = manualReason !== 'whatsapp-lead' && reason === 'whatsapp-lead';
		manualReason = reason;
		if (becameWhatsapp) {
			dontInviteToWhatsapp = true;
		}
		if (reason !== 'whatsapp-lead') {
			dontInviteToWhatsapp = false;
		}
	}

	function handleSendPdfEmailChange(checked: boolean) {
		sendPdfEmail = checked;
	}

	function registerEditLeadTrigger(id: string) {
		return (node: HTMLButtonElement) => {
			editLeadTriggerButtons.set(id, node);
			return () => {
				if (editLeadTriggerButtons.get(id) === node) {
					editLeadTriggerButtons.delete(id);
				}
			};
		};
	}

	function isEmailDuplicatedForOtherLead(leadId: string, email: string): boolean {
		const normalized = email.trim().toLowerCase();
		if (!normalized) return false;
		return leads.some(
			(row) =>
				row.id !== leadId && (row.email?.trim().toLowerCase() ?? '') === normalized
		);
	}

	function openEditLeadModal(lead: LeadRow) {
		editLeadId = lead.id;
		editFirstName = lead.firstName;
		editLastName = lead.lastName;
		editInitialEmailNormalized = normalizeEmailForLead(lead.email);
		editEmail = lead.email ?? '';
		editPhone = lead.phone ?? '';
		editIntent = lead.intent;
		editMessage = lead.message ?? '';
		editCreatedAt = isoToDatetimeLocalValue(lead.createdAt);
		editPreventDuplicate = !isEmailDuplicatedForOtherLead(lead.id, lead.email ?? '');
		editSendPdfEmail = false;
		editDontInviteToWhatsapp = lead.intent === 'whatsapp-lead';
		editLeadRestoreTriggerId = lead.id;
		editSubmitStatus = null;
		showEditLeadModal = true;
	}

	async function closeEditLeadModalInternal() {
		showEditLeadModal = false;
		editSubmitStatus = null;
		const triggerId = editLeadRestoreTriggerId;
		editLeadRestoreTriggerId = null;
		await tick();
		if (triggerId) {
			editLeadTriggerButtons.get(triggerId)?.focus();
		}
	}

	function closeEditLeadModal() {
		if (editSubmitLoading) return;
		void closeEditLeadModalInternal();
	}

	function openManualLeadModal() {
		manualSubmitStatus = null;
		manualCreatedAt = '';
		showManualLeadModal = true;
	}

	function registerManualLeadTrigger(node: HTMLButtonElement) {
		manualLeadTriggerButton = node;
		return () => {
			if (manualLeadTriggerButton === node) {
				manualLeadTriggerButton = null;
			}
		};
	}

	async function closeManualLeadModalInternal() {
		showManualLeadModal = false;
		await tick();
		manualLeadTriggerButton?.focus();
	}

	function closeManualLeadModal() {
		if (manualSubmitLoading) return;
		void closeManualLeadModalInternal();
	}

	function handleManualLeadModalKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;
		event.preventDefault();
		if (showEditLeadModal) {
			closeEditLeadModal();
			return;
		}
		if (showManualLeadModal) {
			closeManualLeadModal();
		}
	}

	async function submitEditLead(event: SubmitEvent) {
		event.preventDefault();
		editSubmitStatus = null;

		const firstName = editFirstName.trim();
		const lastName = editLastName.trim();
		const email = editEmail.trim();
		const phone = editPhone.trim();
		const intent = editIntent.trim();
		const message = editMessage.trim();

		if (intent === 'whatsapp-lead') {
			if (email !== '' && !manualEmailRegex.test(email)) {
				editSubmitStatus = { type: 'error', text: 'Ingresá un correo válido.' };
				return;
			}
		} else {
			if (!email) {
				editSubmitStatus = { type: 'error', text: 'Completá el correo.' };
				return;
			}
			if (!manualEmailRegex.test(email)) {
				editSubmitStatus = { type: 'error', text: 'Ingresá un correo válido.' };
				return;
			}
		}

		if (!intent) {
			editSubmitStatus = { type: 'error', text: 'Completá la intención.' };
			return;
		}

		if (intent === 'whatsapp-lead' && !phone) {
			editSubmitStatus = {
				type: 'error',
				text: 'Ingresá teléfono cuando la intención sea whatsapp-lead.'
			};
			return;
		}

		if (!editLeadId) {
			editSubmitStatus = { type: 'error', text: 'No se encontró el lead a editar.' };
			return;
		}

		if (!editCreatedAt.trim()) {
			editSubmitStatus = { type: 'error', text: 'Completá la fecha/hora de alta.' };
			return;
		}
		const createdAtDate = new Date(editCreatedAt);
		if (Number.isNaN(createdAtDate.getTime())) {
			editSubmitStatus = { type: 'error', text: 'Fecha/hora de alta inválida.' };
			return;
		}

		editSubmitLoading = true;
		try {
			const res = await fetch(`/api/admin/leads/${encodeURIComponent(editLeadId)}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					firstName,
					lastName,
					email,
					phone,
					message,
					intent,
					allowDuplicate: !editPreventDuplicate,
					createdAt: createdAtDate.toISOString(),
					sendPdfEmail: editSendPdfEmail,
					dontInviteToWhatsapp: editDontInviteToWhatsapp
				})
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(typeof data.error === 'string' ? data.error : 'No se pudo actualizar el lead.');
			}
			await loadLeads();
			await closeEditLeadModalInternal();
		} catch (e) {
			editSubmitStatus = {
				type: 'error',
				text: e instanceof Error ? e.message : 'Error de red al actualizar el lead.'
			};
		} finally {
			editSubmitLoading = false;
		}
	}

	async function submitManualLead(event: SubmitEvent) {
		event.preventDefault();
		manualSubmitStatus = null;

		const nombre = manualNombre.trim();
		const apellido = manualApellido.trim();
		const correo = manualCorreo.trim();
		const telefono = manualTelefono.trim();
		const mensaje = manualMensaje.trim();
		const reason = manualReason;

		if (!reason) {
			manualSubmitStatus = { type: 'error', text: 'Completá la razón.' };
			return;
		}

		if (reason === 'manual-entry') {
			if (!correo) {
				manualSubmitStatus = { type: 'error', text: 'Completá el correo.' };
				return;
			}
			if (!manualEmailRegex.test(correo)) {
				manualSubmitStatus = { type: 'error', text: 'Ingresá un correo válido.' };
				return;
			}
		} else if (correo !== '' && !manualEmailRegex.test(correo)) {
			manualSubmitStatus = { type: 'error', text: 'Ingresá un correo válido.' };
			return;
		}

		if (reason === 'whatsapp-lead' && !telefono) {
			manualSubmitStatus = { type: 'error', text: 'Ingresá teléfono para leads de WhatsApp.' };
			return;
		}

		if (manualCreatedAt.trim() !== '') {
			const t = new Date(manualCreatedAt);
			if (Number.isNaN(t.getTime())) {
				manualSubmitStatus = { type: 'error', text: 'Fecha/hora de alta inválida.' };
				return;
			}
		}

		manualSubmitLoading = true;
		try {
			const payload: Record<string, unknown> = {
				nombre,
				apellido,
				correo,
				telefono,
				mensaje,
				reason,
				sendPdfEmail,
				notifyInfoEmail,
				dontInviteToWhatsapp,
				allowDuplicate
			};
			if (manualCreatedAt.trim() !== '') {
				payload.createdAt = new Date(manualCreatedAt).toISOString();
			}
			const res = await fetch('/api/admin/leads', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(
					typeof data.error === 'string' ? data.error : 'No se pudo crear el lead manualmente.'
				);
			}

			manualNombre = '';
			manualApellido = '';
			manualCorreo = '';
			manualTelefono = '';
			manualMensaje = '';
			manualCreatedAt = '';
			manualReason = 'whatsapp-lead';
			sendPdfEmail = true;
			notifyInfoEmail = false;
			dontInviteToWhatsapp = true;
			allowDuplicate = false;
			manualSubmitStatus = { type: 'success', text: 'Lead creado correctamente.' };
			await loadLeads();
			await closeManualLeadModalInternal();
		} catch (e) {
			manualSubmitStatus = {
				type: 'error',
				text: e instanceof Error ? e.message : 'Error de red al crear el lead.'
			};
		} finally {
			manualSubmitLoading = false;
		}
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
			selectedIds.clear();
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
<svelte:window onkeydown={handleManualLeadModalKeydown} />

{#if !loading && !error}
	<LeadsPerDayChart {leads} />
{/if}

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
		<button
			type="button"
			class="bulk-manual-lead"
			{@attach registerManualLeadTrigger}
			onclick={openManualLeadModal}
		>
			Nuevo lead manual
		</button>
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
		<div class="table-scroll">
			<table class="leads-table">
			<thead>
				<tr>
					<th class="th-check" scope="col">
						<input
							indeterminate={selectAllIndeterminate}
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
					<th class="th-actions">Acciones</th>
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
						<td>
							{#if lead.email?.trim()}
								<a href="mailto:{lead.email}">{lead.email}</a>
							{:else}
								—
							{/if}
						</td>
						<td>{lead.phone ?? '—'}</td>
						<td>{lead.intent}</td>
						<td>{downloadsFor(lead) > 0 ? 'Sí' : 'No'}</td>
						<td>{downloadsFor(lead)}</td>
						<td class="td-actions">
							<button
								type="button"
								class="row-edit-btn"
								{@attach registerEditLeadTrigger(lead.id)}
								onclick={() => openEditLeadModal(lead)}
							>
								Editar
							</button>
						</td>
						<td class="message-cell">
							{#if lead.message?.trim()}
								<button
									type="button"
									class="message-preview-wrap"
									aria-label="Ver mensaje completo"
									onmouseenter={(event) => showMessagePopout(event, lead.message ?? '')}
									onmouseleave={hideMessagePopout}
									onfocus={(event) => showMessagePopout(event, lead.message ?? '')}
									onblur={hideMessagePopout}
								>
									<span class="message-preview">{lead.message}</span>
								</button>
							{:else}
								—
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
			</table>
		</div>
		<div class="message-popout-layer" aria-hidden="true">
			{#if activeMessagePopout}
				<div
					class="message-popout"
					role="tooltip"
					class:above={activeMessagePopout.placeAbove}
					style={`left: ${activeMessagePopout.left}px; top: ${activeMessagePopout.top}px; max-width: ${activeMessagePopout.maxWidth}px;`}
				>
					{activeMessagePopout.text}
				</div>
			{/if}
		</div>
	</div>

	{#if showManualLeadModal}
		<div class="manual-lead-modal-backdrop">
			<button
				type="button"
				class="manual-lead-modal-dismiss"
				aria-label="Cerrar formulario de lead manual"
				disabled={manualSubmitLoading}
				onclick={closeManualLeadModal}
			></button>
			<div
				class="manual-lead-card manual-lead-modal-card"
				role="dialog"
				aria-modal="true"
				aria-labelledby="manual-lead-modal-title"
			>
				<div class="manual-lead-modal-header">
					<h2 id="manual-lead-modal-title">Cargar lead manual</h2>
					<button
						type="button"
						class="manual-lead-close"
						aria-label="Cerrar formulario de lead manual"
						disabled={manualSubmitLoading}
						onclick={closeManualLeadModal}
					>
						×
					</button>
				</div>
				<form class="manual-lead-form" onsubmit={submitManualLead}>
					<label>
						<span>Nombre</span>
						<input type="text" bind:value={manualNombre} disabled={manualSubmitLoading} />
					</label>
					<label>
						<span>Apellido</span>
						<input type="text" bind:value={manualApellido} disabled={manualSubmitLoading} />
					</label>
					<label>
						<span
							>Correo{manualReason === 'whatsapp-lead'
								? ' (opcional)'
								: ' *'}</span
						>
						<input
							type="email"
							bind:value={manualCorreo}
							required={manualReason !== 'whatsapp-lead'}
							disabled={manualSubmitLoading}
						/>
					</label>
					<label>
						<span>Teléfono{manualReason === 'whatsapp-lead' ? ' *' : ''}</span>
						<input
							type="text"
							bind:value={manualTelefono}
							required={manualReason === 'whatsapp-lead'}
							disabled={manualSubmitLoading}
						/>
					</label>
					<label>
						<span>Razón *</span>
						<select
							value={manualReason}
							required
							disabled={manualSubmitLoading}
							onchange={(event) =>
								handleReasonChange(event.currentTarget.value as 'manual-entry' | 'whatsapp-lead')}
						>
							<option value="manual-entry">manual-entry</option>
							<option value="whatsapp-lead">whatsapp-lead</option>
						</select>
					</label>
					<label>
						<span>Fecha y hora de alta (opcional)</span>
						<input
							type="datetime-local"
							bind:value={manualCreatedAt}
							disabled={manualSubmitLoading}
						/>
					</label>
					<label class="manual-lead-message">
						<span>Mensaje</span>
						<textarea rows="3" bind:value={manualMensaje} disabled={manualSubmitLoading}></textarea>
					</label>
					<div class="manual-lead-checkbox-group">
						<label class="manual-lead-checkbox">
							<input
								type="checkbox"
								bind:checked={notifyInfoEmail}
								disabled={manualSubmitLoading || manualDisableEmailOptions}
							/>
							<span>Notificar a info@airesderio.com</span>
						</label>
						<label class="manual-lead-checkbox">
							<input
								type="checkbox"
								checked={sendPdfEmail}
								disabled={manualSubmitLoading || manualDisableEmailOptions}
								onchange={(event) => handleSendPdfEmailChange(event.currentTarget.checked)}
							/>
							<span>Enviar email con ficha PDF</span>
						</label>
						<label class="manual-lead-checkbox">
							<input
								type="checkbox"
								bind:checked={dontInviteToWhatsapp}
								disabled={manualSubmitLoading || !canToggleDontInviteToWhatsapp}
							/>
							<span>No invitar a WhatsApp en el email</span>
						</label>
						<label class="manual-lead-checkbox">
							<input type="checkbox" bind:checked={allowDuplicate} disabled={manualSubmitLoading} />
							<span>Agregar aunque duplicado</span>
						</label>
					</div>
					<div class="manual-lead-actions">
						<button type="button" class="manual-lead-cancel" onclick={closeManualLeadModal}>
							Cancelar
						</button>
						<button type="submit" disabled={manualSubmitLoading}>
							{manualSubmitLoading ? 'Guardando…' : 'Crear lead manual'}
						</button>
					</div>
				</form>
				{#if manualSubmitStatus}
					<p
						class="manual-lead-status"
						class:is-success={manualSubmitStatus.type === 'success'}
						class:is-error={manualSubmitStatus.type === 'error'}
						role="status"
					>
						{manualSubmitStatus.text}
					</p>
				{/if}
			</div>
		</div>
	{/if}

	{#if showEditLeadModal}
		<div class="manual-lead-modal-backdrop">
			<button
				type="button"
				class="manual-lead-modal-dismiss"
				aria-label="Cerrar edición del lead"
				disabled={editSubmitLoading}
				onclick={closeEditLeadModal}
			></button>
			<div
				class="manual-lead-card manual-lead-modal-card edit-lead-modal-card"
				role="dialog"
				aria-modal="true"
				aria-labelledby="edit-lead-modal-title"
			>
				<div class="manual-lead-modal-header">
					<h2 id="edit-lead-modal-title">Editar lead</h2>
					<button
						type="button"
						class="manual-lead-close"
						aria-label="Cerrar edición del lead"
						disabled={editSubmitLoading}
						onclick={closeEditLeadModal}
					>
						×
					</button>
				</div>
				<form class="manual-lead-form" onsubmit={submitEditLead}>
					<label>
						<span>Nombre</span>
						<input type="text" bind:value={editFirstName} disabled={editSubmitLoading} />
					</label>
					<label>
						<span>Apellido</span>
						<input type="text" bind:value={editLastName} disabled={editSubmitLoading} />
					</label>
					<label>
						<span
							>Correo{editIntent === 'whatsapp-lead' ? ' (opcional)' : ' *'}</span
						>
						<input
							type="email"
							bind:value={editEmail}
							required={editIntent !== 'whatsapp-lead'}
							disabled={editSubmitLoading}
						/>
					</label>
					<label>
						<span>Teléfono{editIntent === 'whatsapp-lead' ? ' *' : ''}</span>
						<input
							type="text"
							bind:value={editPhone}
							required={editIntent === 'whatsapp-lead'}
							disabled={editSubmitLoading}
						/>
					</label>
					<label>
						<span>Intención</span>
						<input type="text" bind:value={editIntent} required disabled={editSubmitLoading} />
					</label>
					<label>
						<span>Fecha y hora de alta *</span>
						<input
							type="datetime-local"
							bind:value={editCreatedAt}
							required
							disabled={editSubmitLoading}
						/>
					</label>
					<label class="manual-lead-message">
						<span>Mensaje</span>
						<textarea rows="3" bind:value={editMessage} disabled={editSubmitLoading}></textarea>
					</label>
					<div class="manual-lead-checkbox-group">
						<label class="manual-lead-checkbox">
							<input
								type="checkbox"
								checked={editSendPdfEmail}
								disabled={editSubmitLoading || !editCanSendPdfCheckbox}
								onchange={(event) => {
									editSendPdfEmail = event.currentTarget.checked;
								}}
							/>
							<span>Enviar email con ficha PDF al guardar</span>
						</label>
						{#if editShowSameEmailPdfHint}
							<p class="edit-lead-email-hint">
								Mismo correo que antes; el envío ya se hizo con este contacto.
							</p>
						{/if}
						<label class="manual-lead-checkbox">
							<input
								type="checkbox"
								bind:checked={editDontInviteToWhatsapp}
								disabled={editSubmitLoading || !editCanToggleDontInviteToWhatsapp}
							/>
							<span>No invitar a WhatsApp en el email</span>
						</label>
						<label class="manual-lead-checkbox">
							<input
								type="checkbox"
								bind:checked={editPreventDuplicate}
								disabled={editSubmitLoading ||
									(editIntent === 'whatsapp-lead' && editEmail.trim() === '')}
							/>
							<span>No permitir correo duplicado</span>
						</label>
					</div>
					<div class="manual-lead-actions">
						<button type="button" class="manual-lead-cancel" onclick={closeEditLeadModal}>
							Cancelar
						</button>
						<button type="submit" disabled={editSubmitLoading}>
							{editSubmitLoading ? 'Guardando…' : 'Guardar cambios'}
						</button>
					</div>
				</form>
				{#if editSubmitStatus}
					<p
						class="manual-lead-status"
						class:is-success={editSubmitStatus.type === 'success'}
						class:is-error={editSubmitStatus.type === 'error'}
						role="status"
					>
						{editSubmitStatus.text}
					</p>
				{/if}
			</div>
		</div>
	{/if}
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

	.manual-lead-card {
		margin: 0 0 1rem;
		padding: 1rem;
		border-radius: 0.5rem;
		border: 1px solid var(--color-border-default);
		background: var(--color-bg-canvas);
	}

	.manual-lead-card h2 {
		margin: 0 0 0.75rem;
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.manual-lead-form {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: 0.75rem;
	}

	.manual-lead-form label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.85rem;
		color: var(--color-text-secondary);
	}

	.manual-lead-form input,
	.manual-lead-form textarea,
	.manual-lead-form select {
		padding: 0.5rem 0.6rem;
		border: 1px solid var(--color-border-default);
		border-radius: 0.35rem;
		font: inherit;
		color: var(--color-text-primary);
		background: var(--color-bg-canvas);
	}

	.manual-lead-message {
		grid-column: 1 / -1;
	}

	.manual-lead-checkbox-group {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		padding: 0.65rem 0.75rem;
		border: 1px solid var(--color-border-subtle, var(--color-border-default));
		border-radius: 0.45rem;
		background: color-mix(in srgb, var(--color-bg-contrast) 70%, transparent);
	}

	.manual-lead-form .manual-lead-checkbox {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.45rem;
		color: var(--color-text-primary);
	}

	.manual-lead-checkbox input {
		width: 1rem;
		height: 1rem;
		accent-color: var(--color-accent-primary, #4497b9);
	}

	.edit-lead-email-hint {
		margin: -0.15rem 0 0.15rem;
		font-size: 0.82rem;
		color: var(--color-text-muted, #666);
		line-height: 1.35;
	}

	.manual-lead-actions {
		grid-column: 1 / -1;
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
	}

	.manual-lead-actions button {
		padding: 0.5rem 0.85rem;
		font: inherit;
		font-weight: 600;
		color: #fff;
		background: var(--color-accent-primary, #4497b9);
		border: none;
		border-radius: 0.35rem;
		cursor: pointer;
	}

	.manual-lead-actions button:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}

	.manual-lead-cancel {
		color: var(--color-text-primary) !important;
		background: transparent !important;
		border: 1px solid var(--color-border-default) !important;
	}

	.manual-lead-status {
		margin: 0.75rem 0 0;
		font-size: 0.875rem;
	}

	.manual-lead-status.is-success {
		color: #166534;
	}

	.manual-lead-status.is-error {
		color: var(--color-error-text, #721c24);
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

	.bulk-manual-lead {
		padding: 0.4rem 0.75rem;
		font: inherit;
		font-weight: 600;
		font-size: 0.875rem;
		color: #fff;
		background: var(--color-accent-primary, #4497b9);
		border: none;
		border-radius: 0.35rem;
		cursor: pointer;
	}

	.bulk-manual-lead:hover {
		background: color-mix(in srgb, var(--color-accent-primary, #4497b9) 85%, black);
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

	.manual-lead-modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 12000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: color-mix(in srgb, #000 45%, transparent);
	}

	.manual-lead-modal-dismiss {
		position: absolute;
		inset: 0;
		border: 0;
		padding: 0;
		margin: 0;
		background: transparent;
		cursor: default;
	}

	.manual-lead-modal-card {
		position: relative;
		z-index: 1;
		margin: 0;
		width: min(56rem, calc(100vw - 2rem));
		max-height: calc(100vh - 2rem);
		overflow: auto;
	}

	.manual-lead-modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.manual-lead-modal-header h2 {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.manual-lead-close {
		width: 2rem;
		height: 2rem;
		padding: 0;
		font: inherit;
		font-size: 1.35rem;
		line-height: 1;
		color: var(--color-text-primary);
		background: transparent;
		border: 1px solid var(--color-border-default);
		border-radius: 0.35rem;
		cursor: pointer;
	}

	.manual-lead-close:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}

	.table-wrap {
		position: relative;
		border: 1px solid var(--color-border-default);
		border-radius: 0.5rem;
		background: var(--color-bg-canvas);
		overflow: visible;
	}

	.table-scroll {
		overflow-x: auto;
		border-radius: inherit;
		position: relative;
		z-index: 1;
	}

	.leads-table {
		width: max-content;
		min-width: 100%;
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

	.th-actions,
	.td-actions {
		width: 6.5rem;
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

	.row-edit-btn {
		padding: 0.3rem 0.6rem;
		font: inherit;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-accent-primary, #4497b9);
		background: transparent;
		border: 1px solid color-mix(in srgb, var(--color-accent-primary, #4497b9) 40%, transparent);
		border-radius: 0.3rem;
		cursor: pointer;
	}

	.row-edit-btn:hover {
		background: color-mix(in srgb, var(--color-accent-primary, #4497b9) 10%, transparent);
	}

	.row-edit-btn:focus-visible {
		outline: 2px solid var(--color-accent-primary, #4497b9);
		outline-offset: 2px;
	}

	.edit-lead-modal-card {
		width: min(46rem, calc(100vw - 2rem));
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
	}

	.message-preview-wrap {
		display: inline-block;
		max-width: 100%;
		vertical-align: top;
		padding: 0;
		border: 0;
		border-radius: 0.25rem;
		background: transparent;
		font: inherit;
		text-align: left;
		color: inherit;
		cursor: help;
	}

	.message-preview-wrap:focus-visible {
		outline: 2px solid var(--color-accent-primary, #4497b9);
		outline-offset: 2px;
	}

	.message-preview {
		display: block;
		max-width: 12rem;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}

	.message-popout {
		position: absolute;
		z-index: 10000;
		width: max-content;
		padding: 0.6rem 0.7rem;
		border: 1px solid var(--color-border-default);
		border-radius: 0.45rem;
		background: var(--color-bg-canvas);
		color: var(--color-text-primary);
		box-shadow: 0 10px 25px color-mix(in srgb, var(--color-text-primary) 18%, transparent);
		white-space: normal;
		line-height: 1.35;
		overflow-wrap: anywhere;
	}

	.message-popout.above {
		transform: translateY(-100%);
	}

	.message-popout-layer {
		position: fixed;
		inset: 0;
		overflow: visible;
		pointer-events: none;
		z-index: 9999;
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
