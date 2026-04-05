<script lang="ts">
	import {
		LITERAL_COLORS,
		THEME_SECTIONS,
		UNDEFINED_TOKENS,
		type ThemeRole,
		type ThemeTokenDoc
	} from '$lib/data/theme-route-data';

	const roleLabel: Record<ThemeRole, string> = {
		foreground: 'Foreground',
		background: 'Background',
		border: 'Border',
		outline: 'Outline',
		fill: 'Fill (SVG)',
		stroke: 'Stroke',
		shadow: 'Shadow / glow',
		gradient: 'Gradient',
		accent: 'Accent',
		mixed: 'Mixed',
		indirect: 'Indirect'
	};

	function roleClass(role: ThemeRole): string {
		if (role === 'foreground' || role === 'fill' || role === 'stroke') return 'theme-role--fg';
		if (role === 'background' || role === 'gradient') return 'theme-role--bg';
		if (role === 'border' || role === 'outline') return 'theme-role--border';
		if (role === 'shadow') return 'theme-role--shadow';
		if (role === 'indirect') return 'theme-role--indirect';
		if (role === 'accent') return 'theme-role--accent';
		return 'theme-role--mixed';
	}

	function swatchStyle(t: ThemeTokenDoc): string {
		const v = `var(${t.token})`;
		if (t.swatch === 'foreground') {
			return `background: var(--color-bg-canvas); color: ${v};`;
		}
		return `background: ${v};`;
	}

	function overlayFillStyle(t: ThemeTokenDoc): string {
		return `background: var(${t.token});`;
	}
</script>

<svelte:head>
	<title>Tema · Aires de Río</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="page-shell theme-page">
	<header class="theme-page__header">
		<h1>Tema y tokens de color</h1>
		<p class="theme-page__lede">
			Listado de variables CSS del sitio, dónde se usan y si actúan como primer plano, fondo, borde u otros
			roles. Las muestras respetan el <strong>tema activo</strong> (claro / oscuro) del sitio.
		</p>
		<p class="theme-page__meta">
			Fuente de tokens: <code>src/app.css</code>. Actualizá <code>src/lib/data/theme-route-data.ts</code> cuando
			añadas usos nuevos.
		</p>
	</header>

	<nav class="theme-page__toc" aria-label="Secciones">
		{#each THEME_SECTIONS as s (s.id)}
			<a href="#{s.id}">{s.title}</a>
		{/each}
		<a href="#literal">Colores literales</a>
		<a href="#undefined">Tokens no definidos</a>
	</nav>

	{#each THEME_SECTIONS as section (section.id)}
		<section class="theme-section" id={section.id} aria-labelledby="heading-{section.id}">
			<h2 class="theme-section__title" id="heading-{section.id}">{section.title}</h2>
			{#if section.description}
				<p class="theme-section__desc">{section.description}</p>
			{/if}

			<div class="theme-token-list">
				{#each section.tokens as token (token.token)}
					<article class="theme-token">
						<div class="theme-token__swatch-wrap">
							{#if token.swatch === 'overlay'}
								<div class="theme-token__swatch theme-token__swatch--overlay" aria-hidden="true">
									<div class="theme-token__overlay-fill" style={overlayFillStyle(token)}></div>
								</div>
							{:else}
								<div
									class="theme-token__swatch"
									style={swatchStyle(token)}
									aria-hidden="true"
								>
									{#if token.swatch === 'foreground'}
										<span class="theme-token__swatch-text">Aa</span>
									{/if}
								</div>
							{/if}
						</div>
						<div class="theme-token__body">
							<code class="theme-token__name">{token.token}</code>
							{#if token.note}
								<p class="theme-token__note">{token.note}</p>
							{/if}
							<table class="theme-usage-table">
								<thead>
									<tr>
										<th scope="col">Componente / área</th>
										<th scope="col">Elemento</th>
										<th scope="col">Rol</th>
									</tr>
								</thead>
								<tbody>
									{#each token.usages as u, i (i)}
										<tr>
											<td>{u.where}</td>
											<td>{u.element ?? '—'}</td>
											<td>
												<ul class="theme-role-list">
													{#each u.roles as r (r)}
														<li>
															<span class="theme-role {roleClass(r)}">{roleLabel[r]}</span>
														</li>
													{/each}
												</ul>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</article>
				{/each}
			</div>
		</section>
	{/each}

	<section class="theme-section" id="literal" aria-labelledby="heading-literal">
		<h2 class="theme-section__title" id="heading-literal">Colores fuera de variables</h2>
		<p class="theme-section__desc">
			Hex u otros valores fijos en componentes (no pasan por <code>:root</code>).
		</p>
		<table class="theme-usage-table theme-usage-table--wide">
			<thead>
				<tr>
					<th scope="col">Ubicación</th>
					<th scope="col">Elemento</th>
					<th scope="col">Valor</th>
					<th scope="col">Rol</th>
				</tr>
			</thead>
			<tbody>
				{#each LITERAL_COLORS as row, i (i)}
					<tr>
						<td><code>{row.where}</code></td>
						<td>{row.element}</td>
						<td><code>{row.value}</code></td>
						<td>
							<ul class="theme-role-list">
								{#each row.roles as r (r)}
									<li><span class="theme-role {roleClass(r)}">{roleLabel[r]}</span></li>
								{/each}
							</ul>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>

	<section class="theme-section" id="undefined" aria-labelledby="heading-undefined">
		<h2 class="theme-section__title" id="heading-undefined">Referencias a tokens inexistentes</h2>
		<p class="theme-section__desc">
			Variables usadas en código pero no definidas en <code>app.css</code> (conviene alinearlas con el tema).
		</p>
		<table class="theme-usage-table theme-usage-table--wide">
			<thead>
				<tr>
					<th scope="col">Token</th>
					<th scope="col">Archivo</th>
					<th scope="col">Nota</th>
				</tr>
			</thead>
			<tbody>
				{#each UNDEFINED_TOKENS as row, i (i)}
					<tr>
						<td><code>{row.token}</code></td>
						<td><code>{row.where}</code></td>
						<td>{row.note}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
</main>

<style>
	.theme-page {
		padding-block: 2.5rem 4rem;
		color: var(--color-text-primary);
	}

	.theme-page__header {
		margin-bottom: 2rem;
	}

	.theme-page__header h1 {
		margin-bottom: 0.75rem;
	}

	.theme-page__lede {
		max-width: 52rem;
		line-height: var(--line-height-relaxed);
		margin: 0 0 0.75rem;
		color: var(--color-text-secondary);
	}

	.theme-page__meta {
		font-size: 0.9rem;
		color: var(--color-text-tertiary);
		margin: 0;
	}

	.theme-page__toc {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		margin-bottom: 2.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.theme-page__toc a {
		font-size: 0.9rem;
		font-weight: var(--font-weight-medium);
	}

	.theme-section {
		margin-bottom: 3rem;
		scroll-margin-top: calc(var(--header-height) + 1rem);
	}

	.theme-section__title {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.theme-section__desc {
		margin: 0 0 1.25rem;
		max-width: 48rem;
		color: var(--color-text-secondary);
		line-height: var(--line-height-relaxed);
	}

	.theme-token-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.theme-token {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 1rem 1.25rem;
		padding: 1rem 1.25rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border-subtle);
		border-radius: 10px;
	}

	@media (max-width: 640px) {
		.theme-token {
			grid-template-columns: 1fr;
		}
	}

	.theme-token__swatch-wrap {
		align-self: start;
	}

	.theme-token__swatch {
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 8px;
		border: 1px solid var(--color-border-default);
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-heading);
		font-weight: var(--font-weight-bold);
		font-size: 1rem;
	}

	.theme-token__swatch--overlay {
		position: relative;
		overflow: hidden;
		background-color: #e8e8e8;
		background-image:
			linear-gradient(45deg, #ccc 25%, transparent 25%),
			linear-gradient(-45deg, #ccc 25%, transparent 25%),
			linear-gradient(45deg, transparent 75%, #ccc 75%),
			linear-gradient(-45deg, transparent 75%, #ccc 75%);
		background-size: 8px 8px;
		background-position:
			0 0,
			0 4px,
			4px -4px,
			-4px 0;
	}

	.theme-token__overlay-fill {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.theme-token__name {
		display: block;
		font-size: 0.85rem;
		margin-bottom: 0.35rem;
		word-break: break-all;
		color: var(--color-accent-primary);
	}

	.theme-token__note {
		font-size: 0.85rem;
		color: var(--color-text-tertiary);
		margin: 0 0 0.75rem;
	}

	.theme-usage-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.85rem;
	}

	.theme-usage-table th {
		text-align: left;
		font-weight: var(--font-weight-semibold);
		padding: 0.35rem 0.5rem 0.35rem 0;
		border-bottom: 1px solid var(--color-border-subtle);
		color: var(--color-text-secondary);
	}

	.theme-usage-table td {
		vertical-align: top;
		padding: 0.5rem 0.75rem 0.5rem 0;
		border-bottom: 1px solid var(--color-border-subtle);
		line-height: var(--line-height-normal);
	}

	.theme-usage-table--wide code {
		font-size: 0.8rem;
		word-break: break-word;
	}

	.theme-role-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.theme-role {
		display: inline-block;
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
		font-size: 0.72rem;
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.theme-role--fg {
		background: color-mix(in oklch, var(--color-text-primary) 12%, var(--color-bg-canvas));
		color: var(--color-text-primary);
	}

	.theme-role--bg {
		background: color-mix(in oklch, var(--ref-cta-teal) 15%, var(--color-bg-canvas));
		color: var(--color-text-primary);
	}

	.theme-role--border {
		background: color-mix(in oklch, var(--color-border-strong) 35%, var(--color-bg-canvas));
		color: var(--color-text-primary);
	}

	.theme-role--shadow {
		background: color-mix(in oklch, var(--ref-purple-500) 20%, var(--color-bg-canvas));
		color: var(--color-text-primary);
	}

	.theme-role--indirect {
		background: var(--color-bg-muted);
		color: var(--color-text-secondary);
		text-transform: none;
		font-weight: var(--font-weight-medium);
	}

	.theme-role--accent {
		background: color-mix(in oklch, var(--color-accent-primary) 22%, var(--color-bg-canvas));
		color: var(--color-text-primary);
	}

	.theme-role--mixed {
		background: var(--color-bg-inset);
		color: var(--color-text-secondary);
		text-transform: none;
		font-weight: var(--font-weight-medium);
	}
</style>
