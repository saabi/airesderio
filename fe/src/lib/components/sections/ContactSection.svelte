<script module lang="ts">
	// ===== IMPORTS =====
	import ContactForm from '$lib/components/forms/ContactForm.svelte';
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
</script>

<script lang="ts">
	// ===== INSTANCE CONSTANTS =====
	const { action: contactObserver, visible: contactVisible } = createSectionObserver('contact', {
		threshold: 0.3
	});
</script>

<section 
	id='contacto' 
	class='contact-section' 
	aria-labelledby='contact-heading'
	use:contactObserver
	data-section-active={$contactVisible}
>
	<div class='wrap'>
		<div class='contact-section__container'>
			<div 
				class='contact-section__form scroll-animate'
				style='--scroll-animate-offset: 40px; --scroll-animate-duration: 500ms;'
			>
				<h2 id='contact-heading'>Contacto</h2>
				<p>Comunicate con nosotros</p>
				<ContactForm />
			</div>
			<div 
				class='contact-section__logo scroll-animate'
				style='--scroll-animate-delay: 80ms; --scroll-animate-offset: 48px; --scroll-animate-duration: 500ms;'
			>
				<!-- Logo placeholder - replace with actual logo component or img tag -->
			</div>
		</div>
	</div>
</section>

<style>
	.contact-section {
		/* Layout */
		margin: 2rem 0;
		padding: 2rem 0;
		
		/* Box/Visual */
		border-top: 1px solid var(--color-border-subtle);
	}

	.contact-section__container {
		/* Layout */
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		align-items: start;
	}

	.contact-section__form h2 {
		/* Layout */
		margin: 0 0 0.5rem;
		
		/* Typography */
		font-size: 1.5em;
		font-weight: 600;
		letter-spacing: 0.1em;
		color: var(--color-accent-primary);
	}

	.contact-section__form p {
		/* Layout */
		margin: 0 0 1.5rem;
		
		/* Typography */
		font-size: 0.95em;
		color: var(--color-text-secondary);
	}

	.contact-section__logo {
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 200px;
		
		/* Box/Visual */
		background: var(--color-neutral-100);
		border: 1px dashed var(--color-border-default);
		border-radius: 0.5rem;
	}

	@media (max-width: 850px) {
		.contact-section__container {
			/* Layout */
			grid-template-columns: 1fr;
		}

		.contact-section__logo {
			/* Layout */
			min-height: 150px;
			margin-top: 1rem;
		}
	}
</style>

