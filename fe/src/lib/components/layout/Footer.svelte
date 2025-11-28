<script lang="ts">
	// ===== DATA =====
	const year = new Date().getFullYear();

	const navigationLinks = [
		{ label: 'Home', href: '#top' },
		{ label: 'Proyecto', href: '#proyecto' },
		{ label: 'Ubicación', href: '#ubicacion' },
		{ label: 'Interior', href: '#interior' },
		{ label: 'Equipamiento', href: '#equipados' },
		{ label: 'Planos', href: '#planos' },
		{ label: 'Contacto', href: '#contacto' },
		{ label: 'Habitat Prime', href: 'https://habitatprime.com', external: true }
	];

	const contactInfo = [
		{ label: 'Oficina Habitat Prime', value: 'Av. Rivadavia 1520 · Santiago del Estero' },
		{ label: 'Whatsapp ventas', value: '+54 9 385 555 0000' },
		{ label: 'Teléfono', value: '+54 385 421 1111' },
		{ label: 'Email comercial', value: 'hola@habitatprime.com' }
	];

	const projectHighlights = [
		{ label: 'Entrega estimada', value: 'Q1 · 2026' },
		{ label: 'Unidades disponibles', value: '2 y 4 ambientes' },
		{ label: 'Amenities', value: 'Piscina · Cowork · Rooftop' }
	];

	const socialLinks = [
		{ label: 'Instagram', href: 'https://instagram.com/habitatprime' },
		{ label: 'LinkedIn', href: 'https://linkedin.com/company/habitatprime' },
		{ label: 'YouTube', href: 'https://youtube.com/@habitatprime' }
	];
</script>

<footer class="site-footer">
	<div class="wrap">
		<div class="footer-grid">
			<section class="footer-column footer-brand" aria-label="Resumen corporativo">
				<div class="footer-logo">
					<img src="/logos/habitat-prime.svg" alt="Habitat Prime SAS" loading="lazy" decoding="async" />
				</div>
				<p>
					Habitat Prime SAS desarrolla experiencias residenciales premium en Santiago del Estero. Aires de Río
					es uno de nuestros productos insignia, diseñado para vivir con vistas privilegiadas al río y acceso
					a amenities de alto nivel.
				</p>
				<ul class="project-highlights">
					{#each projectHighlights as item (item.label)}
						<li>
							<strong>{item.value}</strong>
							<small>{item.label}</small>
						</li>
					{/each}
				</ul>
			</section>

			<section class="footer-column" aria-label="Navegación de secciones">
				<h3>Navegación</h3>
				<ul class="footer-links">
					{#each navigationLinks as link (link.href)}
						<li>
							<a
								href={link.href}
								rel={link.external ? 'noreferrer' : undefined}
								target={link.external ? '_blank' : undefined}
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</section>

			<section class="footer-column" aria-label="Información de contacto">
				<h3>Contacto</h3>
				<ul class="footer-contact">
					{#each contactInfo as item (item.label)}
						<li>
							<span>{item.label}</span>
							<strong>{item.value}</strong>
						</li>
					{/each}
				</ul>
				<div class="footer-social">
					<span>Seguinos</span>
					<ul>
					{#each socialLinks as link (link.label)}
							<li>
								<a rel="noreferrer" target="_blank" href={link.href}>
									{link.label}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</section>
		</div>

		<div class="footer-bottom">
			<p>© {year} Habitat Prime SAS · Aires de Río es una marca registrada.</p>
		</div>
	</div>
</footer>

<style>
	.site-footer {
		/* Layout */
		padding: 3rem 0 2rem;
		margin-top: 4rem;

		/* Box/Visual */
		border-top: 1px solid var(--color-border-subtle);
		background: linear-gradient(
			180deg,
			color-mix(in oklch, var(--color-bg-muted) 85%, var(--color-bg-canvas) 15%) 0%,
			var(--color-bg-muted) 100%
		);
		box-shadow: 0 -12px 32px var(--shadow-soft);

		/* Typography */
		color: var(--color-text-secondary);
	}

	.footer-grid {
		/* Layout */
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 2rem;
	}

	.footer-column h3 {
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
		padding: 0.75rem 1.25rem;
		border-radius: 0.5rem;
		background: var(--color-bg-interactive);
		box-shadow: 0 6px 16px color-mix(in oklch, var(--color-bg-interactive) 45%, transparent);
	}

	.footer-logo img {
		width: 9.5rem;
		display: block;
		filter: drop-shadow(0 2px 4px var(--shadow-subtle));
	}

	.project-highlights {
		display: flex;
		gap: 1rem;
		margin: 0;
		padding: 0;
		list-style: none;
		flex-wrap: wrap;
	}

	.project-highlights li {
		display: flex;
		flex-direction: column;
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		min-width: 10rem;
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
		text-decoration: none;
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.footer-links a:hover {
		color: var(--color-accent-primary);
	}

	.footer-contact span {
		display: block;
		font-size: 0.85rem;
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.footer-contact strong {
		display: block;
		font-size: 1rem;
		color: var(--color-text-primary);
	}

	.footer-social {
		margin-top: 1.5rem;
	}

	.footer-social span {
		display: block;
		font-size: 0.85rem;
		text-transform: uppercase;
		color: var(--color-text-tertiary);
		margin-bottom: 0.5rem;
	}

	.footer-social ul {
		display: flex;
		gap: 0.75rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.footer-social a {
		text-decoration: none;
		color: var(--color-text-secondary);
		font-weight: 600;
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

	.footer-bottom ul {
		list-style: none;
		display: flex;
		gap: 1rem;
		margin: 0;
		padding: 0;
	}

	.footer-bottom a {
		text-decoration: none;
		color: inherit;
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
