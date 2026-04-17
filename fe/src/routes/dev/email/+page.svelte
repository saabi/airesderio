<script lang="ts">
	import type { PageData } from './$types';

	type EmailPreview = PageData['previews'][number];

	let { data }: { data: PageData } = $props();

	const previews = $derived(data.previews ?? []);
	let selectedId = $state('');

	const selectedPreview = $derived.by<EmailPreview | null>(() => {
		if (previews.length === 0) return null;
		return previews.find((preview) => preview.id === selectedId) ?? previews[0];
	});

	const selectedHtml = $derived.by(() => {
		if (!selectedPreview) return '';
		return sanitizePreviewHtml(selectedPreview.html);
	});

	function sanitizePreviewHtml(html: string) {
		return html
			.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
			.replace(/\son\w+=(["']).*?\1/gi, '');
	}
</script>

<svelte:head>
	<title>Email Preview | Aires de Río</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="email-preview-route">
	<div class="email-preview-shell">
		<h1>Email preview</h1>
		<p class="description">Inspect the generated email templates used by contact and download flows.</p>

		{#if previews.length === 0}
			<div class="empty-state" role="status">
				No previews are available right now. Add at least one preview in <code>+page.server.ts</code>.
			</div>
		{:else if selectedPreview}
			<div class="controls">
				<label for="email-preview-select">Template</label>
				<select id="email-preview-select" bind:value={selectedId}>
					{#each previews as preview (preview.id)}
						<option value={preview.id}>{preview.label} ({preview.id})</option>
					{/each}
				</select>
			</div>

			<div class="meta">
				<span class="meta-label">Subject</span>
				<strong>{selectedPreview.subject}</strong>
			</div>

			<section class="preview-body" aria-label="Email HTML preview">
				{@html selectedHtml}
			</section>
		{/if}
	</div>
</main>

<style>
	.email-preview-route {
		margin-top: var(--header-height);
		padding: 2rem 1rem 3rem;
	}

	.email-preview-shell {
		max-width: 960px;
		margin: 0 auto;
		display: grid;
		gap: 1rem;
	}

	h1 {
		margin: 0;
		font-size: clamp(1.5rem, 2vw + 1rem, 2rem);
	}

	.description {
		margin: 0;
		color: var(--text-secondary, var(--color-text-secondary));
	}

	.controls {
		display: grid;
		gap: 0.5rem;
		max-width: 420px;
	}

	.controls label {
		font-size: 0.875rem;
		color: var(--text-secondary, var(--color-text-secondary));
	}

	.controls select {
		border: 1px solid var(--card-border, color-mix(in srgb, var(--color-text) 18%, transparent));
		background: var(--card-bg, var(--color-surface));
		color: inherit;
		border-radius: 0.5rem;
		padding: 0.6rem 0.75rem;
	}

	.meta {
		display: grid;
		gap: 0.25rem;
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
		background: var(--card-bg, var(--color-surface));
		border: 1px solid var(--card-border, color-mix(in srgb, var(--color-text) 16%, transparent));
	}

	.meta-label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-secondary, var(--color-text-secondary));
	}

	.preview-body {
		background: var(--card-bg, var(--color-surface));
		border: 1px solid var(--card-border, color-mix(in srgb, var(--color-text) 16%, transparent));
		border-radius: 0.75rem;
		padding: 1rem;
		overflow: auto;
	}

	.preview-body :global(*) {
		max-width: 100%;
	}

	.empty-state {
		padding: 1rem;
		border-radius: 0.75rem;
		border: 1px dashed var(--card-border, color-mix(in srgb, var(--color-text) 16%, transparent));
		background: var(--card-bg, var(--color-surface));
	}
</style>
