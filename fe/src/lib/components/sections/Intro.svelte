<script lang='ts'>
	// ===== IMPORTS =====
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
	import {
		ANIMATION,
		animationDelay,
		animationDuration,
		animationOffset
	} from '$lib/constants/animation';
	import VisuallyHidden from '$lib/components/ui/VisuallyHidden.svelte';

	// ===== INSTANCE CONSTANTS =====
	const { action: welcomeObserver, visible: welcomeVisible } = createSectionObserver('welcome', {
		threshold: ANIMATION.threshold.section
	});
	const { action: introObserver, visible: introVisible } = createSectionObserver('intro', {
		threshold: ANIMATION.threshold.section
	});
</script>

<section
	class='intro'
	id='proyecto'
	aria-labelledby='proyecto-heading'
	use:introObserver
	data-section-active={$introVisible}
>
	<VisuallyHidden id='proyecto-heading' tag='h2'>Sobre el Proyecto</VisuallyHidden>
	<div
		class='scroll-animate'
		style={`--scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<section
			id='welcome'
			class='welcome-section'
			use:welcomeObserver
			data-section-active={$welcomeVisible}
		>
			<p
				class='welcome scroll-animate'
				style={`--scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()}; --scroll-animate-delay: ${animationDelay(1)};`}
			>
				Santiago del Estero da la bienvenida a Aires de Río, un nuevo proyecto de departamentos con
				las mejores prestaciones y estratégica ubicación.
			</p>
		</section>
		<p>
			Quienes vivan en Aires de Río gozarán de una multi-oferta de entretenimiento, shopping, áreas
			verdes, deportes, confiterías y eventos culturales.
		</p>
		<p>
			El edificio ofrece departamentos de 2 y 4 ambientes amplios y luminosos, donde el diseño y las
			comodidades han sido pensadas para satisfacer a quienes quieran una vida cómoda y a un paso de
			todo.
		</p>
	</div>
	<aside
		class='kpis scroll-animate'
		style={`--scroll-animate-delay: ${animationDelay(1)}; --scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration()};`}
		aria-labelledby='kpis-heading'
	>
		<VisuallyHidden id='kpis-heading' tag='h3'
			>Características principales del proyecto</VisuallyHidden
		>
		<dl>
			<dt class='kpi'><strong>2.500</strong><small>metros cuadrados</small></dt>
			<VisuallyHidden tag='dd'>Superficie total del proyecto</VisuallyHidden>
			<dt class='kpi'><strong>1/2 + 1</strong><small>dorms · estudio</small></dt>
			<VisuallyHidden tag='dd'>Tipos de unidades disponibles</VisuallyHidden>
			<dt class='kpi'><strong>TERRAZA</strong><small>PISCINA Y SOLARIUM HÚMEDO</small></dt>
			<VisuallyHidden tag='dd'>Amenities en terraza con piscina y solarium húmedo</VisuallyHidden>
			<dt class='kpi'><strong>CAFETERÍA</strong><small>&nbsp;</small></dt>
			<VisuallyHidden tag='dd'>Servicio de cafetería incluido</VisuallyHidden>
		</dl>
	</aside>
</section>

<style>
	.intro {
		/* Layout */
		display: grid;
		grid-template-columns: 1fr min-content;
		gap: 4rem;
		align-items: start;
		padding: 0;
		font-size: 1.2rem;
		max-width: var(--max);
		margin: 0 auto;
	}
	.welcome {
		/* Layout */
		display: block;
		max-width: 34em;
		padding: 1.5rem 1.5rem;
		margin: 2rem auto;

		/* Box/Visual */
		background: var(--color-accent-secondary);
		border-radius: 0.625rem;

		/* Typography */
		font-size: 1.6rem;
		font-weight: 500;
		color: var(--color-text-primary);
		text-align: center;
		line-height: 1.6;
	}
	.intro p {
		/* Layout */
		margin-top: 0;
	}

	.kpis {
		/* Layout */
		display: grid;
		gap: 0.625rem;
		padding-left: 0;

		/* Typography */
		color: var(--color-ink);
	}

	.kpis dl {
		/* Layout */
		display: contents;
	}

	.kpis dt {
		/* Layout */
		display: contents;
	}

	.kpi strong {
		/* Layout */
		display: block;

		/* Typography */
		font-size: 4rem;
		font-weight: 700;
		line-height: 1;
		letter-spacing: 0.02em;
	}

	.kpi small {
		/* Layout */
		display: block;

		/* Typography */
		color: var(--color-ink);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-weight: 700;
	}

	@media (max-width: 850px) {
		.intro {
			/* Layout */
			grid-template-columns: 1fr;
		}
		.kpi strong {
			/* Typography */
			font-size: 3.75rem; /* smaller KPI numbers */
		}
	}
</style>
