<script lang="ts">
    import Title from '$lib/components/ui/Title.svelte';
    import { createSectionObserver } from '$lib/utils/sectionVisibility';

    const { action: interiorObserver, visible: interiorVisible } = createSectionObserver('interior', {
        threshold: 0.35
    });
</script>

<section
    id='interior'
    aria-labelledby='interior-heading'
    use:interiorObserver
    data-section-active={$interiorVisible}
>
    <h2 id='interior-heading' class='vh'>Diseño Interior</h2>
    <div class='scroll-animate' style='--scroll-animate-offset: 40px;'>
        <Title eyebrow='Diseño' big='INTERIOR' />
    </div>
    <p class='scroll-animate' style='--scroll-animate-offset: 48px; --scroll-animate-delay: 80ms;'>
        Ambientes generosos para unidades de un dormitorio que integran estética y funcionalidad
        explorando tendencias contemporáneas, incorporando las nuevas tecnologías y los recursos más
        elegantes en interiorismo.
    </p>
    <p class='scroll-animate' style='--scroll-animate-offset: 52px; --scroll-animate-delay: 120ms;'>
        El proyecto incorporó materiales ecológicos y formas curvas, buscando conectar los espacios
        interiores con los colores que ofrece la naturaleza a través de la inclusión de vegetación, luz
        natural y materiales orgánicos como la madera.
    </p>
    <div class='interior-gallery scroll-animate' style='--scroll-animate-delay: 180ms; --scroll-animate-offset: 60px;'>
		<figure>
		<div class='ph' role='img' aria-label='Imagen del diseño interior - galería automática'>
			<span class='arrow'></span>
		</div>
		<figcaption class='vh'>Galería de imágenes del diseño interior</figcaption>
	</figure>
	<figure>
		<div class='ph' role='img' aria-label='Imagen del diseño interior - galería automática'></div>
		<figcaption class='vh'>Galería de imágenes del diseño interior</figcaption>
		</figure>
	</div>
</section>

<style>
	.interior-gallery {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.125rem;
		margin-top: 0.75rem;
	}

	.interior-gallery figure {
		display: contents;
	}

	.ph {
		background: var(--color-neutral-275);
		height: 16.25rem;
		border-radius: 0.5rem;
		position: relative;
	}

	.ph::after {
		content: 'FOTOS 4-9 VAN DESPLAZANDOSE HORIZONTALMENTE';
		position: absolute;
		left: 0.5rem;
		bottom: 0.5rem;
		font-size: 0.78rem;
		background: var(--color-bg-contrast);
		padding: 0.25rem 0.375rem;
		border-radius: 0.375rem;
		border: 1px solid var(--color-neutral-350);
		color: var(--color-ink);
	}

	.ph .arrow {
		position: absolute;
		right: -2.75rem;
		top: 50%;
		transform: translateY(-50%);
		width: 0;
		height: 0;
		border-top: 1.625rem solid transparent;
		border-bottom: 1.625rem solid transparent;
		border-left: 2.75rem solid var(--color-red-accent);
	}
	@media (max-width: 850px) {
		.interior-gallery {
			grid-template-columns: 1fr;
		}
	}
</style>
