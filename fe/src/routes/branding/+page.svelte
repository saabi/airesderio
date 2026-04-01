<script lang="ts">
	import AiresDeRioLogo from '$lib/components/ui/AiresDeRioLogo.svelte';
	import LogoExportButton from '$lib/components/ui/LogoExportButton.svelte';

	let primaryDark = $state(false);
	let primaryNoTaglineDark = $state(false);
	let isotypeDark = $state(false);
	let headerDark = $state(true);
	let inlineDark = $state(false);
	let mapDark = $state(true);
</script>

<svelte:head>
	<title>Branding | Aires de Río</title>
	<meta
		name="description"
		content="Aires de Río branding assets. Download the logo directly from your browser."
	/>
</svelte:head>

<main class="branding-page">
	<section class="branding-intro">
		<h1>Branding assets</h1>
		<p>
			Below you can find the current Aires de Río logo in the main combinations used across the
			site. Right–click any image and use your browser&apos;s context menu to save it. The SVG is
			vector based, so it will export at high resolution regardless of the display size.
		</p>
	</section>

	<section class="branding-grid" aria-label="Logo variants">
		<article class="branding-card">
			<h2>Primary logotype</h2>
			<p>Full logo including tagline &quot;DEPARTAMENTOS&quot;.</p>
			<div
				class={`branding-logo ${primaryDark ? 'branding-logo--dark' : ''}`}
				id="branding-logo-primary"
			>
				<AiresDeRioLogo
					theme={primaryDark ? 'dark' : 'light'}
					showIsotype={true}
					showDepartamentos={true}
					height="80"
				/>
			</div>
			<label class="branding-theme-toggle">
				<input type="checkbox" bind:checked={primaryDark} />
				<span>{primaryDark ? 'Dark preview' : 'Light preview'}</span>
			</label>
			<LogoExportButton
				targetSelector="#branding-logo-primary svg"
				filename="airesderio-logotype-primary"
				variantTheme={primaryDark ? 'dark' : 'light'}
				enableSizeControls={true}
				label="Export PNG (primary logotype)"
				class="branding-export-button"
			/>
		</article>

		<article class="branding-card">
			<h2>Logotype without tagline</h2>
			<p>Wordmark without the &quot;DEPARTAMENTOS&quot; line.</p>
			<div
				class={`branding-logo ${primaryNoTaglineDark ? 'branding-logo--dark' : ''}`}
				id="branding-logo-primary-notagline"
			>
				<AiresDeRioLogo
					theme={primaryNoTaglineDark ? 'dark' : 'light'}
					showIsotype={true}
					showDepartamentos={false}
					height="80"
				/>
			</div>
			<label class="branding-theme-toggle">
				<input type="checkbox" bind:checked={primaryNoTaglineDark} />
				<span>{primaryNoTaglineDark ? 'Dark preview' : 'Light preview'}</span>
			</label>
			<LogoExportButton
				targetSelector="#branding-logo-primary-notagline svg"
				filename="airesderio-logotype-primary-notagline"
				variantTheme={primaryNoTaglineDark ? 'dark' : 'light'}
				enableSizeControls={true}
				label="Export PNG (logotype without tagline)"
				class="branding-export-button"
			/>
		</article>

		<article class="branding-card">
			<h2>Isotype</h2>
			<p>Symbol only, without any text.</p>
			<div
				class={`branding-logo branding-logo--isotype ${isotypeDark ? 'branding-logo--dark' : ''}`}
				id="branding-logo-isotype"
			>
				<AiresDeRioLogo
					theme={isotypeDark ? 'dark' : 'light'}
					isotypeOnly={true}
					fitViewBox={true}
					height="80"
				/>
			</div>
			<label class="branding-theme-toggle">
				<input type="checkbox" bind:checked={isotypeDark} />
				<span>{isotypeDark ? 'Dark preview' : 'Light preview'}</span>
			</label>
			<LogoExportButton
				targetSelector="#branding-logo-isotype svg"
				filename="airesderio-isotype"
				variantTheme={isotypeDark ? 'dark' : 'light'}
				enableSizeControls={true}
				label="Export PNG (isotype)"
				class="branding-export-button"
			/>
		</article>

		<article class="branding-card">
			<h2>Inline logo (text only)</h2>
			<p>Inline wordmark without isotype or tagline (used in Intro/Location paragraphs).</p>
			<div
				class={`branding-logo branding-logo--inline ${inlineDark ? 'branding-logo--dark' : ''}`}
				id="branding-logo-inline-text"
			>
				<AiresDeRioLogo
					class="logo-inline"
					theme={inlineDark ? 'dark' : 'light'}
					showIsotype={false}
					showDepartamentos={false}
					fitViewBox={true}
					height="48"
				/>
			</div>
			<label class="branding-theme-toggle">
				<input type="checkbox" bind:checked={inlineDark} />
				<span>{inlineDark ? 'Dark preview' : 'Light preview'}</span>
			</label>
			<LogoExportButton
				targetSelector="#branding-logo-inline-text svg"
				filename="airesderio-logotype-inline"
				variantTheme={inlineDark ? 'dark' : 'light'}
				enableSizeControls={true}
				label="Export PNG (inline logo)"
				class="branding-export-button"
			/>
		</article>

	</section>
</main>

<style>
	.branding-page {
		max-width: 72rem;
		margin: 0 auto;
		padding: 2rem 1.5rem 3rem;
	}

	.branding-intro {
		margin-bottom: 2.5rem;
	}

	.branding-intro h1 {
		font-size: clamp(2.25rem, 2.6vw, 2.8rem);
		margin-bottom: 0.75rem;
	}

	.branding-intro p {
		max-width: 40rem;
		line-height: 1.6;
	}

	.branding-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 1.75rem;
	}

	.branding-card {
		background: var(--surface, #ffffff);
		border-radius: 0.9rem;
		padding: 1.5rem;
		box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.branding-card h2 {
		font-size: 1.1rem;
		margin: 0;
	}

	.branding-card p {
		margin: 0;
		color: var(--muted-foreground, #64748b);
	}

	.branding-logo {
		margin-top: 0.75rem;
		border-radius: 0.75rem;
		padding: 1.5rem;
		background: #f8fafc;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.branding-logo--dark {
		background: radial-gradient(circle at top left, #1f2933, #020617);
	}

	.branding-logo--inline {
		justify-content: flex-start;
	}

	.branding-theme-toggle {
		margin-top: 0.25rem;
		font-size: 0.8rem;
		color: var(--muted-foreground, #64748b);
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}

	.branding-theme-toggle input[type='checkbox'] {
		accent-color: var(--ref-brand-primary, #0f172a);
	}

	.branding-export-button {
		align-self: flex-start;
		margin-top: 0.5rem;
	}

	.branding-export-button .export-button {
		padding: 0.375rem 0.9rem;
		border-radius: 999px;
		border: 1px solid rgba(15, 23, 42, 0.16);
		background: #ffffff;
		color: #0f172a;
		font-size: 0.8rem;
		font-weight: 500;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			color 0.15s ease,
			box-shadow 0.15s ease,
			transform 0.15s ease,
			border-color 0.15s ease;
	}

	.branding-export-button .export-button:hover:enabled {
		background: #0f172a;
		color: #ffffff;
		border-color: rgba(15, 23, 42, 0.6);
		box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
		transform: translateY(-1px);
	}

	.branding-export-button .export-button:disabled {
		opacity: 0.6;
		cursor: default;
		box-shadow: none;
	}

	@media (min-width: 768px) {
		.branding-page {
			padding-inline: 2.5rem;
		}
	}
</style>

