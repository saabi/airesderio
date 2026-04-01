<script lang="ts">
	import AiresDeRioLogo from '$lib/components/ui/AiresDeRioLogo.svelte';
	import LogoExportButton from '$lib/components/ui/LogoExportButton.svelte';
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
			<div class="branding-logo branding-logo--light" id="branding-logo-primary">
				<AiresDeRioLogo theme="light" showIsotype={true} showDepartamentos={true} height="80" />
			</div>
			<LogoExportButton
				targetSelector="#branding-logo-primary svg"
				filename="airesderio-logotype-primary-4000w.png"
				enableSizeControls={true}
				label="Export PNG (primary logotype)"
				class="branding-export-button"
			/>
		</article>

		<article class="branding-card">
			<h2>Logotype without tagline</h2>
			<p>Wordmark without the &quot;DEPARTAMENTOS&quot; line.</p>
			<div class="branding-logo branding-logo--light" id="branding-logo-primary-notagline">
				<AiresDeRioLogo theme="light" showIsotype={true} showDepartamentos={false} height="80" />
			</div>
			<LogoExportButton
				targetSelector="#branding-logo-primary-notagline svg"
				filename="airesderio-logotype-primary-notagline-4000w.png"
				enableSizeControls={true}
				label="Export PNG (logotype without tagline)"
				class="branding-export-button"
			/>
		</article>

		<article class="branding-card">
			<h2>Isotype</h2>
			<p>Symbol only, without any text.</p>
			<div class="branding-logo branding-logo--isotype" id="branding-logo-isotype">
				<AiresDeRioLogo theme="light" isotypeOnly={true} fitViewBox={true} height="80" />
			</div>
			<LogoExportButton
				targetSelector="#branding-logo-isotype svg"
				filename="airesderio-isotype-2000w.png"
				enableSizeControls={true}
				label="Export PNG (isotype)"
				class="branding-export-button"
			/>
		</article>

		<article class="branding-card">
			<h2>Primary logotype (large)</h2>
			<p>Enlarged SVG for exporting a high–resolution image.</p>
			<div class="branding-logo branding-logo--large" id="branding-logo-primary-large">
				<AiresDeRioLogo theme="light" showIsotype={true} showDepartamentos={true} height="140" />
			</div>
			<LogoExportButton
				targetSelector="#branding-logo-primary-large svg"
				filename="airesderio-logotype-primary-large-5000w.png"
				enableSizeControls={true}
				label="Export PNG (primary logotype large)"
				class="branding-export-button"
			/>
		</article>

		<article class="branding-card">
			<h2>Header logo (dark theme)</h2>
			<p>Variant used in the site header on dark background.</p>
			<div class="branding-logo branding-logo--dark" id="branding-logo-header-dark">
				<AiresDeRioLogo
					class="branding-logo-header"
					theme="dark"
					showIsotype={true}
					showDepartamentos={true}
					height="80"
				/>
			</div>
			<LogoExportButton
				targetSelector="#branding-logo-header-dark svg"
				filename="airesderio-logotype-header-dark-4000w.png"
				enableSizeControls={true}
				label="Export PNG (header logo dark)"
				class="branding-export-button branding-export-button--on-dark"
			/>
		</article>

		<article class="branding-card">
			<h2>Inline logo (text only)</h2>
			<p>Inline wordmark without isotype or tagline (used in Intro/Location paragraphs).</p>
			<div class="branding-logo branding-logo--light branding-logo--inline" id="branding-logo-inline-text">
				<AiresDeRioLogo
					class="logo-inline"
					theme="light"
					showIsotype={false}
					showDepartamentos={false}
					fitViewBox={true}
					height="48"
				/>
			</div>
			<LogoExportButton
				targetSelector="#branding-logo-inline-text svg"
				filename="airesderio-logotype-inline-3000w.png"
				enableSizeControls={true}
				label="Export PNG (inline logo)"
				class="branding-export-button"
			/>
		</article>

		<article class="branding-card">
			<h2>Map focal label logo</h2>
			<p>Compact inline logo used in the map focal label.</p>
			<div class="branding-logo branding-logo--chip" id="branding-logo-map-focal">
				<AiresDeRioLogo
					class="pin-label-logo"
					theme="dark"
					showIsotype={false}
					showDepartamentos={false}
					fitViewBox={true}
					height="40"
				/>
			</div>
			<LogoExportButton
				targetSelector="#branding-logo-map-focal svg"
				filename="airesderio-logotype-map-focal-2000w.png"
				enableSizeControls={true}
				label="Export PNG (map focal logo)"
				class="branding-export-button branding-export-button--on-dark"
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

	.branding-logo--large {
		padding: 2.5rem;
	}

	.branding-logo--dark {
		background: radial-gradient(circle at top left, #1f2933, #020617);
	}

	.branding-logo--chip {
		background: #020617;
		padding-inline: 2.25rem;
	}

	.branding-logo--inline {
		justify-content: flex-start;
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

	.branding-export-button--on-dark .export-button {
		background: rgba(15, 23, 42, 0.6);
		color: #e5e7eb;
		border-color: rgba(148, 163, 184, 0.8);
	}

	.branding-export-button--on-dark .export-button:hover:enabled {
		background: #e5e7eb;
		color: #020617;
		border-color: rgba(148, 163, 184, 1);
		box-shadow: 0 8px 24px rgba(15, 23, 42, 0.45);
	}

	@media (min-width: 768px) {
		.branding-page {
			padding-inline: 2.5rem;
		}
	}
</style>

