<script module lang="ts">
	// ===== IMPORTS =====
	import ContactForm from '$lib/components/forms/ContactForm.svelte';
</script>

<script lang="ts">
	// ===== IMPORTS =====
	import { createSectionObserver } from '$lib/utils/sectionVisibility';

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
	<div
		class='hero-contact scroll-animate'
		style='--scroll-animate-delay: 120ms; --scroll-animate-offset: 36px; --scroll-animate-duration: 520ms;'
	>
		<h1>PROYECTO AIRES DE RÍO</h1>
		<p>Comunicate con nosotros</p>
		<ContactForm />
	</div>
</section>

<style>
	.hero {
		display: grid;
		position: relative;
		grid-template-columns: 1fr;
		gap: var(--gap);
		padding: 1.5rem;
		align-items: center;
		justify-items: end;
	}

	.hero-img {
		position: absolute;
		width: 100%;
		height: 100%;
		background: url('https://placehold.co/800x600/6B4423/FFF?text=FOTO+ROTATIVA') center/cover;
		border-radius: 0.5rem;
	}

	.hero-contact {
		padding: 1rem;
		border: 1px solid var(--color-border-default);
		border-radius: 0.5rem;
		background-color: color-mix(in oklch, var(--color-bg-contrast) 30%, transparent);
	}

	.hero-contact h1 {
		font-size: 1.1em;
		font-weight: 600;
		letter-spacing: 0.1em;
		color: var(--color-accent-primary);
	}

	.hero-contact p {
		margin: 0 0 1rem;
		font-size: 0.9em;
	}

	@media (max-width: 850px) {
		.hero {
			grid-template-columns: 1fr;
		}

		.hero-img {
			height: 18.75rem; /* Shorter hero image on mobile */
		}
	}
</style>
