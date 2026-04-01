<script lang="ts">
	import AiresDeRioLogo from '$lib/components/ui/AiresDeRioLogo.svelte';
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
			<div class="branding-logo branding-logo--light">
				<AiresDeRioLogo theme="light" showIsotype={true} showDepartamentos={true} height="80" />
			</div>
		</article>

		<article class="branding-card">
			<h2>Logotype without tagline</h2>
			<p>Wordmark without the &quot;DEPARTAMENTOS&quot; line.</p>
			<div class="branding-logo branding-logo--light">
				<AiresDeRioLogo theme="light" showIsotype={true} showDepartamentos={false} height="80" />
			</div>
		</article>

		<article class="branding-card">
			<h2>Isotype</h2>
			<p>Symbol only, without any text.</p>
			<div class="branding-logo branding-logo--isotype">
				<AiresDeRioLogo
					theme="light"
					isotypeOnly={true}
					fitViewBox={true}
					height="80"
				/>
			</div>
		</article>

		<article class="branding-card">
			<h2>Primary logotype (large)</h2>
			<p>Enlarged SVG for exporting a high–resolution image.</p>
			<div class="branding-logo branding-logo--large">
				<AiresDeRioLogo theme="light" showIsotype={true} showDepartamentos={true} height="140" />
			</div>
		</article>

		<article class="branding-card">
			<h2>Header logo (dark theme)</h2>
			<p>Variant used in the site header on dark background.</p>
			<div class="branding-logo branding-logo--dark">
				<AiresDeRioLogo
					class="branding-logo-header"
					theme="dark"
					showIsotype={true}
					showDepartamentos={true}
					height="80"
				/>
			</div>
		</article>

		<article class="branding-card">
			<h2>Inline logo (text only)</h2>
			<p>Inline wordmark without isotype or tagline (used in Intro/Location paragraphs).</p>
			<div class="branding-logo branding-logo--light branding-logo--inline">
				<AiresDeRioLogo
					class="logo-inline"
					theme="light"
					showIsotype={false}
					showDepartamentos={false}
					fitViewBox={true}
					height="48"
				/>
			</div>
		</article>

		<article class="branding-card">
			<h2>Map focal label logo</h2>
			<p>Compact inline logo used in the map focal label.</p>
			<div class="branding-logo branding-logo--chip">
				<AiresDeRioLogo
					class="pin-label-logo"
					theme="dark"
					showIsotype={false}
					showDepartamentos={false}
					fitViewBox={true}
					height="40"
				/>
			</div>
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

	@media (min-width: 768px) {
		.branding-page {
			padding-inline: 2.5rem;
		}
	}
</style>

