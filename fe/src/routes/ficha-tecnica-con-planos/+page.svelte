<script lang="ts">
	import DocListIcon from '$lib/components/dev/DocListIcon.svelte';
	import AiresDeRioLogo from '$lib/components/ui/AiresDeRioLogo.svelte';
	import Title from '$lib/components/ui/Title.svelte';
	import fichaMarkdownRaw from '../../../../docs/proposals/PDFs/ficha-tecnica-con-planos.md?raw';

	type FichaSection = {
		title: string;
		items: string[];
	};

	const parseFichaMarkdown = (markdown: string): FichaSection[] => {
		const sections: FichaSection[] = [];
		let currentSection: FichaSection | null = null;

		for (const rawLine of markdown.split('\n')) {
			const line = rawLine.replace(/\r$/, '');

			const sectionMatch = line.match(/^- (.+)$/);
			if (sectionMatch) {
				currentSection = { title: sectionMatch[1].trim(), items: [] };
				sections.push(currentSection);
				continue;
			}

			const itemMatch = line.match(/^  - (.+)$/);
			if (itemMatch && currentSection) {
				currentSection.items.push(itemMatch[1].trim());
			}
		}

		return sections;
	};

	const fichaSections = parseFichaMarkdown(fichaMarkdownRaw).slice(0, 2);

	const planos = [
		{
			src: '/planos_pdf/plano-2-ambientes-A.png',
			alt: 'Plano 2 ambientes A',
			title: 'Modelo: 2 ambientes "A" - Frente',
			area: '53.25m<sup>2</sup> propios'
		},
		{
			src: '/planos_pdf/plano-2-ambientes-B.png',
			alt: 'Plano 2 ambientes B',
			title: 'Modelo: 2 ambientes "B" - Frente',
			area: '55.24m<sup>2</sup> propios'
		},
		{
			src: '/planos_pdf/plano-2-ambientes-C.png',
			alt: 'Plano 2 ambientes C',
			title: 'Modelo: 2 ambientes "C" - Frente',
			area: '53.25m<sup>2</sup> propios'
		},/*
		{
			src: '/planos_pdf/plano-2-ambientes-D.png',
			alt: 'Plano 2 ambientes D',
			title: 'Modelo: 2 ambientes "D" - Frente',
			area: '51.47m<sup>2</sup> propios'
		},*/
		{
			src: '/planos_pdf/plano-4-ambientes.png',
			alt: 'Plano 4 ambientes',
			title: 'Modelo: 4 ambientes "A" - Contrafrente',
			area: '108m<sup>2</sup> propios'
		}
	] as const;
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="ficha-tecnica-route">
	<p class="doc-logotype doc-logotype-shared">
		<AiresDeRioLogo
			class="doc-logo"
			height="6rem"
			theme="light"
			showIsotype={true}
			showDepartamentos={true}
			loading="eager"
		/>
	</p>

	{#each fichaSections as section, index (section.title)}
		<article class="ficha-tecnica-doc">
			{#if index === 0}
				<div class="ficha-shared-title">
					<Title eyebrow="" big="EQUIPAMIENTO" below="e interiores" />
				</div>
			{:else}
				<div class="ficha-shared-title">
					<Title eyebrow="" big="EQUIPAMIENTO OPCIONAL" below="Luxury Style" />
				</div>
			{/if}

			<ul class="doc-list" role="list">
				{#each section.items as item, itemIndex (itemIndex)}
					<li class="doc-list-item">
						<span class="doc-list-icon" aria-hidden="true">
							<DocListIcon icon={index === 0 ? 'harmony' : 'tilde'} size="3em" />
						</span>
						<span class="doc-list-content">{item}</span>
					</li>
				{/each}
			</ul>
		</article>
	{/each}

	<section class="planos-page" aria-label="Planos">
		<h2 class="planos-title">Planos</h2>
		<div class="planos-grid">
			{#each planos as plano (plano.src)}
				<figure class="plano-card">
					<img src={plano.src} alt={plano.alt} loading="lazy" decoding="async" />
					<figcaption class="plano-caption">
						<span class="plano-title">{plano.title}</span>
						<span class="plano-area">{@html plano.area}</span>
					</figcaption>
				</figure>
			{/each}
		</div>
	</section>
</main>

<style>
	.ficha-tecnica-route {
		margin-top: var(--header-height);
		padding-bottom: 3rem;
	}

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

	.ficha-shared-title {
		margin: 0 0 0.5rem;
	}

	.ficha-shared-title :global(.title) {
		margin: 0;
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
		align-items: center;
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

	.doc-logotype-shared {
		max-width: 42rem;
		margin: 1.5rem auto 0.5rem;
		padding: 0 1.5rem;
	}

	.doc-logotype :global(.doc-logo) {
		display: block;
	}

	.planos-page {
		margin: 2rem auto 0;
		max-width: 64rem;
		padding: 0 1rem;
	}

	.planos-title {
		font-family: var(--font-heading);
		font-size: 1.5rem;
		margin: 0 0 1rem;
		color: var(--color-text-primary);
	}

	.planos-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.plano-card {
		margin: 0;
		border: 1px solid var(--color-border-subtle);
		border-radius: 0.25rem;
		padding: 0.35rem;
		background: var(--color-surface-primary);
		break-inside: avoid;
	}

	.plano-card img {
		display: block;
		width: 100%;
		height: auto;
		object-fit: contain;
	}

	.plano-caption {
		margin-top: 0.4rem;
		text-align: center;
		line-height: 1.35;
	}

	.plano-title,
	.plano-area {
		display: block;
	}

	.plano-title {
		font-weight: 600;
	}

	@media (max-width: 48rem) {
		.planos-grid {
			grid-template-columns: 1fr;
		}
	}

	@media print {
		.ficha-tecnica-route {
			margin-top: 0;
		}

		.ficha-tecnica-doc {
			padding-left: 2cm;
			padding-right: 2cm;
			padding-top: 0.5cm;
			padding-bottom: 1cm;
			max-width: none;
		}

		.doc-logotype-shared {
			max-width: none;
			padding-left: 2cm;
			padding-right: 2cm;
			margin: 0;
		}

		.doc-list-item {
			padding-top: 0.5cm;
			margin-top: 0;
			margin-bottom: 0.25cm;
		}

		.doc-list-item:first-child {
			padding-top: 0;
		}

		.ficha-tecnica-doc :global(h1) {
			margin-left: 1.8cm !important;
			font-size: 1.5cm !important;
			font-weight: normal !important;
		}

		.ficha-shared-title :global(.title) {
			margin-left: 1.8cm !important;
			break-after: avoid;
			break-before: avoid;
		}

		.planos-page {
			break-before: page;
			page-break-before: always;
			margin: 0;
			max-width: none;
			padding: 0.8cm 1cm 0.8cm;
			min-height: calc(100vh - 1.6cm);
			display: grid;
			grid-template-rows: auto 1fr;
			gap: 0.5cm;
		}

		.planos-title {
			margin: 0;
			font-size: 0.55cm;
		}

		.planos-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			grid-auto-rows: auto;
			gap: 0.3cm;
			align-items: start;
		}

		.plano-card {
			padding: 0.2cm;
			border-width: 0.02cm;
			break-inside: avoid;
		}

		.plano-card img {
			width: 100%;
			height: auto;
		}

		.plano-caption {
			margin-top: 0.12cm;
			font-size: 0.34cm;
			line-height: 1.2;
		}
	}
</style>
