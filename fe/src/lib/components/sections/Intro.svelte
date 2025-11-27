<script lang="ts">
	// ===== IMPORTS =====
	import { createSectionObserver } from '$lib/utils/sectionVisibility';

	// ===== INSTANCE CONSTANTS =====
	const { action: introObserver, visible: introVisible } = createSectionObserver('intro', {
		threshold: 0.35
	});
</script>

<section
	class='intro'
	id='proyecto'
	aria-labelledby='proyecto-heading'
	use:introObserver
	data-section-active={$introVisible}
>
	<h2 id='proyecto-heading' class='vh'>Sobre el Proyecto</h2>
	<div class='scroll-animate' style='--scroll-animate-offset: 40px; --scroll-animate-duration: 480ms;'>
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
		class='intro__kpis scroll-animate'
		style='--scroll-animate-delay: 120ms; --scroll-animate-offset: 52px; --scroll-animate-duration: 520ms;'
		aria-labelledby='kpis-heading'
	>
		<h3 id='kpis-heading' class='vh'>Características principales del proyecto</h3>
		<dl>
			<dt class='kpi'><strong>2.500</strong><small>metros cuadrados</small></dt>
			<dd class='vh'>Superficie total del proyecto</dd>
			<dt class='kpi'><strong>1/2 + 1</strong><small>dorms · estudio</small></dt>
			<dd class='vh'>Tipos de unidades disponibles</dd>
			<dt class='kpi'><strong>CAFETERÍA</strong><small>&nbsp;</small></dt>
			<dd class='vh'>Servicio de cafetería incluido</dd>
			<dt class='kpi'><strong>TERRAZA CON</strong><small>PISCINA Y SOLARIUM HÚMEDO</small></dt>
			<dd class='vh'>Amenities en terraza con piscina y solarium húmedo</dd>
		</dl>
	</aside>
</section>

<style>
	.intro {
		/* Layout */
		display: grid;
		grid-template-columns: 1.08fr 0.92fr;
		gap: 1.5rem;
		align-items: start;
		padding: 1.5rem 0;
	}

	.intro__kpis {
		/* Layout */
		display: grid;
		gap: 0.625rem;
		padding-left: 0;
		
		/* Typography */
		color: var(--color-ink);
	}

	.intro__kpis dl {
		/* Layout */
		display: contents;
	}

	.intro__kpis dt {
		/* Layout */
		display: contents;
	}

	.intro__kpis dd {
		/* Layout */
		display: none;
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
