<script module lang="ts">
	// ===== IMPORTS =====
	import ContactForm from '$lib/components/forms/ContactForm.svelte';
	import Carousel from '$lib/components/ui/Carousel.svelte';
	import { createSectionObserver } from '$lib/utils/sectionVisibility';

	// ===== STATIC CONSTANTS =====
	const carouselImageFiles = [
		'1_DB_EXTERIOR_01 (2).jpg',
		'2_DB_EXTERIOR_01 (8).jpg',
		'3_DB_EXTERIOR_01 (1).jpg'
	];
	
	const CAROUSEL_IMAGES = carouselImageFiles.map(file => 
		`/carrousel-hero/${encodeURIComponent(file)}`
	);
</script>

<script lang="ts">
	// ===== PROPS =====
	interface Props {
		ctaUrl?: string;
		ctaText?: string;
	}

	let { ctaUrl = '#contacto', ctaText = 'Contactanos' }: Props = $props();

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
		class='hero-carousel scroll-animate'
		style='--scroll-animate-offset: 48px; --scroll-animate-duration: 500ms;'
	>
		<Carousel
			images={CAROUSEL_IMAGES}
			interval={5000}
			ariaLabel='Carrusel de imágenes del edificio'
			imageAriaLabel={(index) => `Fachada del edificio Aires de Río - Imagen ${index + 1}`}
		/>
	</div>
	<svg class="corner-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
		<polygon points="100,0 100,100 50,0" fill="var(--color-bg-canvas)" />
	</svg>
	<div
		class='hero-contact scroll-animate'
		style='--scroll-animate-delay: 80ms; --scroll-animate-offset: 40px; --scroll-animate-duration: 500ms;'
	>
		<img
			src="/logos/aires-de-rio.svg"
			alt="Proyecto Aires de Río"
			loading="eager"
			decoding="async"
			width="100%"
		/>
		<div class="hero-contact-desktop-only">
			<p>Comunicate con nosotros</p>
			<ContactForm />
		</div>
		{#if ctaUrl}
			<a href={ctaUrl} class="hero-contact-mobile-only hero-cta scroll-animate" style='--scroll-animate-delay: 160ms; --scroll-animate-offset: 40px; --scroll-animate-duration: 500ms;'>
				{ctaText}
			</a>
		{/if}
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

	.hero-carousel {
		/* Positioning */
		position: absolute;
		
		/* Layout */
		width: 100%;
		height: 100%;
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

	.hero-cta {
		/* Layout */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.875rem 2rem;
		margin-top: 1rem;
		
		/* Box/Visual */
		border: none;
		border-radius: 0.375rem;
		background: var(--color-accent-primary);
		box-shadow: 0 0.125rem 0.375rem var(--shadow-subtle);
		
		/* Typography */
		font-size: 1rem;
		font-weight: 600;
		text-decoration: none;
		color: var(--color-text-on-accent);
		text-align: center;
		
		/* Misc/Overrides */
		cursor: pointer;
		
		/* Effects & Motion */
		transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
	}

	.hero-cta:hover {
		/* Box/Visual */
		background: var(--color-accent-hover);
		box-shadow: 0 0.25rem 0.5rem var(--shadow-soft);
		
		/* Effects & Motion */
		transform: translateY(-1px);
	}

	.hero-cta:active {
		/* Effects & Motion */
		transform: translateY(0);
	}

	.hero-contact-mobile-only {
		/* Layout */
		display: none;
	}
	@media (max-width: 850px) {
		.hero {
			justify-items: center;
		}
		.hero-contact-desktop-only {
			/* Layout */
			display: none;
		}
		
		.hero-contact-mobile-only {
			/* Layout */
			display: block;
		}
	}
</style>
