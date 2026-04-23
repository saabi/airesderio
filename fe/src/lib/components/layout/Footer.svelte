<script module lang='ts'>
	// ===== IMPORTS =====
	import HabitatPrimeLogo from '$lib/components/ui/HabitatPrimeLogo.svelte';
	import AiresDeRioLogo from '$lib/components/ui/AiresDeRioLogo.svelte';
	import { siteNavLinks } from '$lib/data/site-nav-links';
	import { pdfRequestModalStore } from '$lib/stores/pdfRequestModal';
</script>

<script lang='ts'>
	// ===== DATA =====
	const year = new Date().getFullYear();

	const navigationLinks = siteNavLinks;

	type ContactItem = {
		label: string;
		value: string;
		href?: string;
		id?: string;
		/** Open in new tab (e.g. WhatsApp web/app) */
		external?: boolean;
	};

	const contactInfo: ContactItem[] = [
/* 		{ label: 'Oficina Habitat Prime', value: 'Av. Rivadavia 1520 · Santiago del Estero' },
		{ label: 'Teléfono', value: '+54 385 421 1111' },
 */		{
			label: 'Email comercial',
			value: 'info@airesderio.com',
			href: 'mailto:info@airesderio.com',
			id: 'cta-email-footer'
		},
		{
			label: 'Whatsapp mensajes',
			value: '+54 9 385 6222266',
			href: 'https://wa.me/5493856222266',
			id: 'cta-whatsapp-footer',
			external: true,
		},
	];

	const projectHighlights = [
		{ label: 'Unidades disponibles', value: '2 y 4 ambientes' },
		{ label: 'Entrega estimada', value: '2028' },
		{ label: 'Amenities', value: 'Piscina - Solarium - Cafetería' }
	];
</script>

<footer class='site-footer'>
	<div class='footer-wrap'>
		<div class='footer-grid'>
			<section class='footer-column footer-brand' aria-label='Resumen corporativo'>
				<ul class='project-highlights'>
					{#each projectHighlights as item (item.label)}
						<li>
							<span class='highlight-label'>{item.label}</span>
							<strong class='highlight-value'>{item.value}</strong>
						</li>
					{/each}
				</ul>
				<div class='footer-logo'>
					<HabitatPrimeLogo theme='dark' width='12rem' />
				</div>
			</section>

			<section class='footer-column' aria-label='Navegación de secciones'>
				<h3>Navegación</h3>
				<ul class='footer-links'>
					{#each navigationLinks as link (link.id)}
						<li>
							<a href={link.href} rel={undefined} target={undefined}>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</section>

			<section class='footer-column' aria-label='Información de contacto'>
				<h3>Ventas</h3>
				<ul class='footer-contact'>
					{#each contactInfo as item (item.label)}
						<li>
							<span>{item.label}</span>
							{#if item.href}
								<a
									id={item.id}
									class='footer-contact-link'
									class:cta-email={!!item.href?.startsWith('mailto:')}
									class:cta-whatsapp={!!item.href?.includes('wa.me')}
									href={item.href}
									rel={item.external ? 'noopener noreferrer' : undefined}
									target={item.external ? '_blank' : undefined}
								>
									{item.value}
								</a>
							{:else}
								<strong>{item.value}</strong>
							{/if}
						</li>
					{/each}
					<li class='footer-contact-btn-wrap'>
						<button
							id='cta-ficha-footer'
							type='button'
							class='footer-contact-btn btn-cta-primary'
							onclick={() => pdfRequestModalStore.open('departamentos', 'footer')}
							aria-label='Solicitar ficha técnica'
						>
							SOLICITAR FICHA TÉCNICA
						</button>
					</li>
				</ul>
			</section>
		</div>

		<div class='footer-bottom'>
			<p class='footer-copyright'>
				© {year} Habitat Prime SAS · <AiresDeRioLogo class='logo-inline' height='1em' theme='dark' showIsotype={false} fitViewBox={true} showDepartamentos={false} /> es una marca registrada.
			</p>
			<p class='footer-credits'>
				Sitio web —
				<a
					class='footer-credits-link'
					href='https://ferreyrapons.com'
					rel='noopener noreferrer'
					target='_blank'
				>
					Sebastian Ferreyra Pons
				</a>
			</p>
		</div>
	</div>
</footer>

<style>
	.footer-wrap {
		/* Layout */
		max-width: var(--max);
		margin: auto;
		padding: 0 clamp(0.875rem, 3vw, 1.5rem);

		/* Typography */
		font-family: var(--font-body);
	}

	.site-footer {
		/* Layout */
		padding: 3rem 0 2rem;

		/* Box/Visual */
		border-top: 1px solid color-mix(in oklch, var(--ref-brand-deep) 40%, var(--ref-neutral-900) 60%);
		background-color: #022b3a;
		box-shadow: 0 -12px 32px var(--shadow-soft);

		/* Typography */
		color: var(--color-text-inverse);
	}

	.footer-grid {
		/* Layout */
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 2rem;
	}

	.footer-column h3 {
		/* Typography */
		font-family: var(--font-body);
		font-weight: var(--font-weight-semibold);
		margin: 0 0 0.75rem;
		font-size: 1rem;
		letter-spacing: 0.08em;
		color: #b0e3ce;
		text-transform: uppercase;
	}

	.footer-brand {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 1.25rem 1rem;
		padding-top: 0;
		border-radius: 0.5rem;
		background: #0a2a35;
	}

	.footer-logo {
		display: inline-flex;
		align-items: center;
		justify-content: flex-start;
		align-self: flex-start;
		width: fit-content;
		max-width: 100%;
		box-sizing: border-box;
		padding: 0.65rem 1rem;
		border-radius: 0.5rem;
		background: #b84c44;
	}

	.footer-logo :global(svg) {
		display: block;
		height: auto;
		max-width: 100%;
	}

	.project-highlights {
		display: flex;
		flex-direction: column;
		gap: 1.15rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.project-highlights li {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.highlight-label {
		font-size: clamp(1rem, 1.1vw, 0.9rem);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.08em;
		line-height: 1.25;
		text-transform: uppercase;
		color: #f06c5e;
	}

	.highlight-value {
		font-size: 1.05rem;
		font-weight: var(--font-weight-bold);
		color: #ffffff;
	}

	.footer-links,
	.footer-contact {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.footer-links a {
		/* Typography */
		font-family: var(--font-body);
		font-weight: var(--font-weight-medium);
		text-decoration: none;
		color: color-mix(in oklch, var(--ref-cream) 90%, var(--ref-gold-dark) 10%);
	}

	.footer-links a:hover {
		color: var(--color-accent-primary);
	}

	.footer-contact span {
		display: block;
		font-size: 0.75rem;
		font-weight: var(--font-weight-semibold);
		color: #f06c5e;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.footer-contact strong,
	.footer-contact-link {
		display: block;
		font-size: 1rem;
		color: var(--color-text-inverse);
	}

	.footer-contact-link {
		font-family: var(--font-body);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
	}

	.footer-contact-link:hover {
		color: var(--color-accent-primary);
	}

	.footer-contact-link:focus-visible {
		outline: 2px solid var(--color-accent-primary);
		outline-offset: 2px;
		border-radius: 2px;
	}

	.footer-contact-btn-wrap {
		margin-top: 1rem;
		list-style: none;
	}

	.footer-contact-btn {
		display: block;
		padding: 0.75rem 1.25rem;
		font-size: 0.85rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		text-align: center;
		border-radius: 4px;
		cursor: pointer;
		font-family: inherit;
	}

	.footer-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 2.5rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--color-border-subtle);
		font-size: 0.9rem;
		color: var(--color-text-tertiary);
		gap: 1rem;
		flex-wrap: wrap;
	}

	.footer-bottom .footer-copyright,
	.footer-bottom .footer-credits {
		margin: 0;
	}

	.footer-credits {
		font-size: 0.85rem;
		color: color-mix(in oklch, var(--color-text-tertiary) 88%, var(--ref-cream) 12%);
	}

	.footer-credits-link {
		color: inherit;
		font-weight: var(--font-weight-semibold);
		text-decoration: underline;
		text-decoration-color: color-mix(in oklch, var(--color-text-tertiary) 55%, transparent);
		text-underline-offset: 0.15em;
	}

	.footer-credits-link:hover {
		color: var(--color-accent-primary);
		text-decoration-color: var(--color-accent-primary);
	}

	.footer-credits-link:focus-visible {
		outline: 2px solid var(--color-accent-primary);
		outline-offset: 2px;
		border-radius: 2px;
	}

	@media (max-width: 1000px) {
		.footer-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 640px) {
		.footer-grid {
			grid-template-columns: 1fr;
		}

		.footer-bottom {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
