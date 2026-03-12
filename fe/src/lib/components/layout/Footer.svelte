<script module lang='ts'>
	// ===== IMPORTS =====
	import HabitatPrimeLogo from '$lib/components/ui/HabitatPrimeLogo.svelte';
	import AiresDeRioLogo from '$lib/components/ui/AiresDeRioLogo.svelte';
	import { theme } from '$lib/stores/theme';
	import { pdfRequestModalStore } from '$lib/stores/pdfRequestModal';
</script>

<script lang='ts'>
	// ===== DATA =====
	const year = new Date().getFullYear();

	const navigationLinks = [
		{ label: 'Home', href: '/' },
		{ label: 'Proyecto', href: '/#proyecto' },
		{ label: 'Ubicación', href: '/#ubicacion' },
		{ label: 'Interiores', href: '/#interior' },
		{ label: 'Equipamiento', href: '/#equipados' },
		{ label: 'Planos', href: '/#planos' },
		{ label: 'Contacto', href: '/#contacto' },
	];

	const contactInfo = [
/* 		{ label: 'Oficina Habitat Prime', value: 'Av. Rivadavia 1520 · Santiago del Estero' },
		{ label: 'Teléfono', value: '+54 385 421 1111' },
 */		{ label: 'Email comercial', value: 'info@airesderio.com' },
		{ label: 'Whatsapp ventas', value: '+54 9 385 555 0000' }
	];

	const projectHighlights = [
		{ label: 'Entrega estimada', value: '2027' },
		{ label: 'Unidades disponibles', value: '2 y 4 ambientes' },
		{ label: 'Amenities', value: 'Piscina · Terraza · Cafetería' }
	];
</script>

<footer class='site-footer'>
	<div class='footer-wrap'>
		<div class='footer-grid'>
			<section class='footer-column footer-brand' aria-label='Resumen corporativo'>
				<div class='footer-logo'>
					<HabitatPrimeLogo theme={$theme} width='8rem' />
				</div>
				<ul class='project-highlights'>
					{#each projectHighlights as item (item.label)}
						<li>
							<strong>{item.value}</strong>
							<small>{item.label}</small>
						</li>
					{/each}
				</ul>
			</section>

			<section class='footer-column' aria-label='Navegación de secciones'>
				<h3>Navegación</h3>
				<ul class='footer-links'>
					{#each navigationLinks as link (link.href)}
						<li>
							<a
								href={link.href}
								rel={undefined}
								target={undefined}
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</section>

			<section class='footer-column' aria-label='Información de contacto'>
				<h3>Contacto</h3>
				<ul class='footer-contact'>
					{#each contactInfo as item (item.label)}
						<li>
							<span>{item.label}</span>
							<strong>{item.value}</strong>
						</li>
					{/each}
					<li class='footer-contact-btn-wrap'>
						<button
							type='button'
							class='footer-contact-btn btn-cta-primary'
							onclick={() => pdfRequestModalStore.open('ficha-tecnica')}
							aria-label='Solicitar ficha técnica'
						>
							SOLICITAR FICHA TÉCNICA
						</button>
					</li>
				</ul>
			</section>
		</div>

		<div class='footer-bottom'>
			<p>© {year} Habitat Prime SAS · <AiresDeRioLogo class='logo-inline' height='1em' theme={$theme} showIsotype={false} fitViewBox={true} showDepartamentos={false} /> es una marca registrada.</p>
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
		margin-top: 4rem;

		/* Box/Visual */
		border-top: 1px solid color-mix(in oklch, var(--ref-brand-deep) 40%, var(--ref-neutral-900) 60%);
		background: linear-gradient(0, #8b5431 0%, #3f2215 100%);
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
		color: var(--color-text-primary);
		text-transform: uppercase;
	}

	.footer-brand {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.footer-logo {
		width: fit-content;
		padding: 0.5rem 0.875rem;
		border-radius: 0.5rem;
		background: var(--color-bg-interactive);
		box-shadow: 0 6px 16px color-mix(in oklch, var(--color-bg-interactive) 45%, transparent);
	}

	.project-highlights {
		display: grid;
		gap: 1rem;
		margin: 0;
		padding: 0;
		list-style: none;
		flex-wrap: wrap;
	}

	.project-highlights li {
		display: flex;
		flex-direction: column;
		background: color-mix(in oklch, var(--ref-cream) 85%, var(--ref-brand-deep) 15%);
		border: 1px solid color-mix(in oklch, var(--ref-gold) 40%, transparent);
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		min-width: 10rem;
		width: 50%;
	}

	.project-highlights strong {
		font-size: 1.05rem;
		color: var(--color-text-primary);
	}

	.project-highlights small {
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.08em;
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
		font-size: 0.85rem;
		color: color-mix(in oklch, var(--ref-cream) 80%, var(--ref-gold-dark) 20%);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.footer-contact strong {
		display: block;
		font-size: 1rem;
		color: var(--color-text-inverse);
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
		color: var(--color-text-on-accent);
		background: var(--ref-cta-teal);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-family: inherit;
		transition: opacity 0.2s;
	}

	.footer-contact-btn:hover {
		opacity: 0.92;
	}

	.footer-contact-btn:focus-visible {
		outline: 2px solid var(--ref-cta-teal);
		outline-offset: 2px;
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
