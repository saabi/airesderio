<script lang="ts">
	import ContactForm from '$lib/components/ContactForm.svelte';
</script>

<section class='contact-section' aria-labelledby='contact-heading'>
	<div class='wrap'>
		<div class='contact-section__container'>
			<div class='contact-section__form'>
				<h2 id='contact-heading'>Contacto</h2>
				<p>Comunicate con nosotros</p>
				<ContactForm />
			</div>
			<div class='contact-section__logo'>
				<!-- Logo placeholder - replace with actual logo component or img tag -->
			</div>
		</div>
	</div>
</section>

<style>
	.contact-section {
		margin: 2rem 0;
		padding: 2rem 0;
		border-top: 1px solid var(--color-border-subtle);
	}

	.contact-section__container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		align-items: start;
	}

	.contact-section__form h2 {
		font-size: 1.5em;
		font-weight: 600;
		letter-spacing: 0.1em;
		color: var(--color-accent-primary);
		margin: 0 0 0.5rem;
	}

	.contact-section__form p {
		margin: 0 0 1.5rem;
		font-size: 0.95em;
		color: var(--color-text-secondary);
	}

	.contact-section__logo {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 200px;
		background: var(--color-neutral-100);
		border-radius: 0.5rem;
		border: 1px dashed var(--color-border-default);
	}

	@media (max-width: 850px) {
		.contact-section__container {
			grid-template-columns: 1fr;
		}

		.contact-section__logo {
			min-height: 150px;
			margin-top: 1rem;
		}
	}
</style>

