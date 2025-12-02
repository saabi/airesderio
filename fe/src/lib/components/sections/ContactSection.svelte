<script module lang="ts">
	// ===== IMPORTS =====
	import AiresDeRioLogo from '$lib/components/ui/AiresDeRioLogo.svelte';
	import ContactForm from '$lib/components/forms/ContactForm.svelte';
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
	import { theme } from '$lib/stores/theme';
</script>

<script lang="ts">
	// ===== IMPORTS =====
	import { ANIMATION, animationDelay, animationDuration, animationOffset } from '$lib/constants/animation';

	// ===== INSTANCE CONSTANTS =====
	const { action: contactObserver, visible: contactVisible } = createSectionObserver('contact', {
		threshold: ANIMATION.threshold.section
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
				style={`--scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
			>
				<h2 id='contact-heading'>Contacto</h2>
				<p>Comunicate con nosotros</p>
				<ContactForm />
			</div>
			<div 
				class='contact-section__logo scroll-animate'
				style={`--scroll-animate-delay: ${animationDelay(1)}; --scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration()};`}
			>
				<div class="contact-section__logo-wrapper">
					<img
						src="/exteriores/DB_EXTERIOR_01%20(0).png"
						alt="Aires de Río exterior"
						loading="lazy"
						decoding="async"
						class="contact-exterior"
					/>
					<AiresDeRioLogo class="contact-logo" theme={$theme}/>
				</div>
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
	}

	.contact-section__logo-wrapper {
		/* Layout */
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.contact-exterior {
		/* Layout */
		margin-top: 2rem;
		max-width: 90%;
		
		/* Box/Visual */
		border-radius: 0.5rem;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
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
