<script module lang="ts">
	// ===== IMPORTS =====
	import ContactForm from '$lib/components/forms/ContactForm.svelte';
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
</script>

<script lang="ts">
	// ===== INSTANCE CONSTANTS =====
	const { action: heroObserver, visible: heroVisible } = createSectionObserver('hero', {
		threshold: 0.45
	});
</script>

<section
	id='top'
	class='hero'
	role='banner'
	aria-labelledby='hero-heading'
	use:heroObserver
	data-section-active={$heroVisible}
>
	<h2 id='hero-heading' class='vh'>Presentación y Contacto - Aires de Río</h2>
	<div
		class='hero-img scroll-animate'
		role='img'
		aria-label='Fachada del edificio Aires de Río'
		style='--scroll-animate-offset: 48px; --scroll-animate-duration: 520ms;'
	></div>
	<svg class="corner-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
		<polygon points="100,0 100,100 50,0" fill="var(--color-bg-canvas)" />
	</svg>
	<div
		class='hero-contact scroll-animate'
		style='--scroll-animate-delay: 120ms; --scroll-animate-offset: 36px; --scroll-animate-duration: 520ms;'
	>
		<img
			src="/logos/aires-de-rio.svg"
			alt="Proyecto Aires de Río"
			loading="eager"
			decoding="async"
			width="100%"
		/>
		<p>Comunicate con nosotros</p>
		<ContactForm />
	</div>
</section>

<style>
	.hero {
		/* Positioning */
		position: relative;
		height: calc(100vh - var(--header-height));
		margin-top: var(--header-height);
		
		/* Layout */
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--gap);
		padding: 1.5rem;
		align-items: center;
		justify-items: end;
	}

	.hero-img {
		/* Positioning */
		position: absolute;
		
		/* Layout */
		width: 100%;
		height: 100%;
		
		/* Box/Visual */
		background: url('https://placehold.co/800x600/6B4423/FFF?text=FOTO+ROTATIVA') center/cover;
	}

	.corner-overlay {
		/* Positioning */
		position: absolute;
		top: 0;
		right: 0;
		
		/* Layout */
		width: 100%;
		height: 100%;
		
		/* Misc/Overrides */
		pointer-events: none;
	}

	.hero-contact {
		/* Positioning */
		position: relative;
		
		/* Layout */
		padding: 1rem;
		
		/* Box/Visual */
		border: 1px solid var(--color-border-default);
		border-radius: 0.5rem;
		background-color: color-mix(in oklch, var(--color-bg-contrast) 30%, transparent);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.hero-contact h1 {
		/* Typography */
		font-size: 1.1em;
		font-weight: 600;
		letter-spacing: 0.1em;
		color: var(--color-accent-primary);
	}

	.hero-contact p {
		/* Layout */
		margin: 0 0 1rem;
		
		/* Typography */
		font-size: 0.9em;
	}

	@media (max-width: 850px) {
		.hero {
			/* Layout */
			grid-template-columns: 1fr;
		}

		.hero-img {
			/* Layout */
			height: 18.75rem; /* Shorter hero image on mobile */
		}
	}
</style>
