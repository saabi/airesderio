<script lang="ts">
	import AiresDeRioLogo from '$lib/components/ui/AiresDeRioLogo.svelte';
	import DocListIcon from '$lib/components/dev/DocListIcon.svelte';
	import {
		HARMONY_FICHA_ITEMS,
		LUXURY_FICHA_ITEMS
	} from '$lib/data/ficha-tecnica-lineas';

	let { variant }: { variant: 'harmony' | 'luxury' } = $props();

	const items = $derived(variant === 'harmony' ? HARMONY_FICHA_ITEMS : LUXURY_FICHA_ITEMS);
	const listIcon = $derived<'harmony' | 'tilde'>(variant === 'harmony' ? 'harmony' : 'tilde');
	const lineLabel = $derived(variant === 'harmony' ? 'Harmony' : 'Luxury');
</script>

<svelte:head>
	<title>Ficha técnica — {lineLabel} (preview) | Aires de Río</title>
</svelte:head>

<article class="ficha-tecnica-doc">

	<p class="doc-logotype">
		<AiresDeRioLogo
			class="doc-logo"
			height="6rem"
			theme="light"
			showIsotype={true}
			showDepartamentos={true}
			loading="eager"
		/>
	</p>

	<h1>Ficha técnica</h1>
	{#if variant === 'luxury'}
		<h2>{lineLabel} Style</h2>
	{/if}

	<ul class="doc-list" role="list">
		{#each items as item, index (index)}
			<li class="doc-list-item">
				<span class="doc-list-icon" aria-hidden="true">
					<DocListIcon icon={listIcon} size="3em" />
				</span>
				<span class="doc-list-content">{@html item.html}</span>
			</li>
		{/each}
	</ul>
</article>

<style>
	.ficha-tecnica-doc {
		max-width: 42rem;
		margin: 0 auto;
		padding: 2rem 1.5rem;
		font-family: var(--font-body);
		font-size: 1rem;
		line-height: 1.6;
		color: var(--color-text-primary);
		orphans: 2;
		widows: 2;
	}

	.ficha-tecnica-doc :global(h1) {
		font-family: var(--font-heading);
		font-size: 1.75rem;
		font-weight: var(--font-weight-bold);
		margin: 1.5rem 0 0.5rem;
		color: var(--color-text-primary);
		break-after: avoid;
		break-before: avoid;
	}

	.ficha-tecnica-doc :global(h1:first-child) {
		margin-top: 0;
	}

	.ficha-tecnica-doc :global(h2) {
		font-family: var(--font-heading);
		font-size: 1.35rem;
		font-weight: var(--font-weight-bold);
		margin: 1.25rem 0 0.5rem;
		color: var(--color-accent-primary);
		break-after: avoid;
		break-before: avoid;
	}

	.ficha-tecnica-doc :global(h3) {
		font-family: var(--font-heading);
		font-size: 1.1rem;
		font-weight: var(--font-weight-bold);
		margin: 1rem 0 0.5rem;
		color: var(--color-text-primary);
		break-after: avoid;
		break-before: avoid;
	}

	.doc-list {
		list-style: none;
		margin: 2.75rem 0 1rem;
		padding: 0;
		break-before: avoid;
	}

	.doc-list-item:first-child {
		margin-top: 0;
	}

	.doc-list-item {
		display: grid;
		grid-template-columns: 4rem 1fr;
		gap: 0.75rem;
		align-items: start;
		margin-top: 1rem;
		margin-bottom: 1rem;
		break-inside: avoid;
	}

	.doc-list-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 4rem;
		min-height: 3em;
		color: var(--color-contrast-low);
	}

	.doc-list-content {
		min-width: 0;
	}

	.doc-logotype {
		margin: 1rem 0;
	}

	.doc-logotype :global(.doc-logo) {
		display: block;
	}

	@media print {
		.ficha-tecnica-doc {
			padding-left: 2cm;
			padding-right: 2cm;
			padding-top: 1cm;
			padding-bottom: 1cm;
			max-width: none;
		}
		.doc-list-item {
			padding-top: 0.5cm;
			margin-top: 0;
			margin-bottom: 0.25cm;
		}

		.doc-list-item:first-child {
			padding-top: 0;
		}
	}

	h1,
	h2,
	h3 {
		margin-left: 1.8cm !important;
	}
	h1 {
		font-size: 1.5cm !important;
		font-weight: normal !important;
	}
	h2 {
		font-size: 0.9cm !important;
		font-weight: normal !important;
	}
	h3 {
		font-size: 1cm !important;
		font-weight: normal !important;
	}
</style>
