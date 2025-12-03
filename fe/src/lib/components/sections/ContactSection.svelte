<script module lang="ts">
	// ===== IMPORTS =====
	import AiresDeRioLogo from '$lib/components/ui/AiresDeRioLogo.svelte';
	import ContactForm from '$lib/components/forms/ContactForm.svelte';
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
	import { theme } from '$lib/stores/theme';
</script>

<script lang="ts">
	// ===== IMPORTS =====
	import {
		ANIMATION,
		animationDelay,
		animationDuration,
		animationOffset
	} from '$lib/constants/animation';

	// ===== INSTANCE CONSTANTS =====
	const { action: contactObserver, visible: contactVisible } = createSectionObserver('contact', {
		threshold: ANIMATION.threshold.section
	});
</script>

<section
	id="contacto"
	class="section"
	aria-labelledby="contact-heading"
	use:contactObserver
	data-section-active={$contactVisible}
>
	<div class="container">
		<div
			class="form scroll-animate"
			style={`--scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
		>
			<h2 id="contact-heading">Contacto</h2>
			<p>Comunicate con nosotros</p>
			<ContactForm />
		</div>
		<div class="right-column">
			<img
				src="/exteriores/exterior_03.png"
				alt="Aires de Río exterior"
				loading="lazy"
				decoding="async"
				class="exterior-image scroll-animate"
				style={`--scroll-animate-delay: ${animationDelay(1)}; --scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration()};`}
			/>
			<div class="logo-wrapper">
				<AiresDeRioLogo class="logo" theme={$theme} />
			</div>
		</div>
	</div>
</section>

<style>
	#contacto {
		/* Layout */
		max-width: var(--max);
		margin: 0 auto;
		font-size: 1.2rem;
	}

	.section {
		/* Layout */
		margin: 2rem 0;
		padding: 2rem 0;

		/* Box/Visual */
		border-top: 1px solid var(--color-border-subtle);
	}

	.container {
		/* Layout */
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: min-content;
		gap: 2rem;
	}

	.right-column {
		/* Layout */
		display: grid;
		grid-template-rows: 1fr min-content;
		height: 100%;
		gap: 1rem;
		max-height: 36em;
		justify-items: center;
	}

	.form h2 {
		/* Layout */
		margin: 0 0 0.5rem;

		/* Typography */
		font-size: 1.5em;
		font-weight: 600;
		letter-spacing: 0.1em;
		color: var(--color-accent-primary);
	}

	.form p {
		/* Layout */
		margin: 0 0 1.5rem;

		/* Typography */
		font-size: 0.95em;
		color: var(--color-text-secondary);
	}

	.exterior-image {
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1 1 auto;
		max-width: 100vw;
		min-height: 200px;
		height: 100%;
	}

	.logo-wrapper {
		/* Layout */
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		flex: 0 0 auto;
	}

	@media (max-width: 850px) {
		.container {
			/* Layout */
			grid-template-columns: 1fr;
		}

		.right-column {
			/* Layout */
			margin-top: 1rem;
		}

		.exterior-image {
			/* Layout */
			min-height: 150px;
		}
	}
</style>
