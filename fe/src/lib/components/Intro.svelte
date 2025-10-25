<section class="intro" id="proyecto" aria-labelledby="proyecto-heading">
	<h2 id="proyecto-heading" class="vh">Sobre el Proyecto</h2>
	<div>
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
	<aside class="intro__kpis" aria-labelledby="kpis-heading">
		<h3 id="kpis-heading" class="vh">Características principales del proyecto</h3>
		<dl>
			<dt class="kpi"><strong>2.500</strong><small>metros cuadrados</small></dt>
			<dd class="vh">Superficie total del proyecto</dd>
			<dt class="kpi"><strong>1/2 + 1</strong><small>dorms · estudio</small></dt>
			<dd class="vh">Tipos de unidades disponibles</dd>
			<dt class="kpi"><strong>CAFETERÍA</strong><small>&nbsp;</small></dt>
			<dd class="vh">Servicio de cafetería incluido</dd>
			<dt class="kpi"><strong>TERRAZA CON</strong><small>PISCINA Y SOLARIUM HÚMEDO</small></dt>
			<dd class="vh">Amenities en terraza con piscina y solarium húmedo</dd>
		</dl>
	</aside>
</section>

<style>
	.intro {
		display: grid;
		grid-template-columns: 1.08fr 0.92fr;
		gap: 1.5rem;
		align-items: start;
		padding: 1.5rem 0;
	}

	.intro__kpis {
		padding-left: 0;
		display: grid;
		gap: 0.625rem;
		color: #111;
	}

	.intro__kpis dl {
		display: contents;
	}

	.intro__kpis dt {
		display: contents;
	}

	.intro__kpis dd {
		display: none;
	}

	.kpi strong {
		display: block;
		font-size: 5rem;
		font-weight: 900;
		line-height: 1;
		letter-spacing: 0.02em;
	}

	.kpi small {
		display: block;
		color: #111;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		margin-top: 0.25rem;
	}

	@media (max-width: 850px) {
		.intro {
			grid-template-columns: 1fr;
		}
		.kpi strong {
			font-size: 3.75rem; /* smaller KPI numbers */
		}
	}
</style>
