<script lang='ts'>
	// ===== IMPORTS =====
	import { theme } from '$lib/stores/theme';
	import AiresDeRioLogo from '$lib/components/ui/AiresDeRioLogo.svelte';
	import { animationDuration, animationOffset } from '$lib/constants/animation';
	import VisuallyHidden from '$lib/components/ui/VisuallyHidden.svelte';
	import { scrollReveal } from '$lib/utils/scrollReveal';
</script>

<section class='intro' id='proyecto' aria-labelledby='proyecto-heading'>
	<VisuallyHidden id='proyecto-heading' tag='h2'>Sobre el Proyecto</VisuallyHidden>
	<div class='intro-copy'>
		<div
			class='scroll-animate'
			use:scrollReveal
			style={`--scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
		>
			<section id='welcome' class='welcome-section'>
				<p class='welcome'>
					Santiago del Estero da la bienvenida a <AiresDeRioLogo class='logo-inline' height='2em' theme={$theme} showIsotype={false} fitViewBox={true} showDepartamentos={false} /> un nuevo proyecto de departamentos con
					las mejores prestaciones y estratégica ubicación.
				</p>
			</section>
			<p>
				Quienes vivan en <AiresDeRioLogo class='logo-inline' height='1em' theme={$theme} showIsotype={false} fitViewBox={true} showDepartamentos={false} /> gozarán de una multi-oferta de entretenimiento, shopping, áreas
				verdes, deportes, confiterías y eventos culturales.
			</p>
			<p>
				El edificio ofrece departamentos de 2 y 4 ambientes amplios y luminosos, donde el diseño y las
				comodidades han sido pensadas para satisfacer a quienes quieran una vida cómoda y a un paso de
				todo.
			</p>
		</div>
	</div>
	<aside
		class='kpis scroll-animate'
		use:scrollReveal
		style={`--scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration()};`}
		aria-labelledby='kpis-heading'
	>
		<VisuallyHidden id='kpis-heading' tag='h3'
			>Características principales del proyecto</VisuallyHidden
		>
		<dl>
			<dt class='kpi'><strong>2 Y 4 AMBIENTES</strong><small>1 dormitorio<br>2 dormitorios + estudio</small></dt>
			<VisuallyHidden tag='dd'>Tipos de unidades disponibles</VisuallyHidden>
			<dt class='kpi'><strong>PISCINA</strong><small>Con solarium húmedo en terraza</small></dt>
			<VisuallyHidden tag='dd'>Amenities en terraza con piscina y solarium húmedo</VisuallyHidden>
			<dt class='kpi'><strong>CAFETERÍA</strong><small>En planta baja</small></dt>
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
		width: 100%;
		max-width: 80rem;
		padding: 0;
		font-size: 1.4rem;
		margin: 0 auto;
	}

	.intro-copy {
		/* Layout */
		min-width: 0;
	}

	.welcome {
		/* Layout */
		display: block;
		max-width: 34em;
		padding: 1.5rem 1.5rem;
		margin: 2rem auto;

		/* Box/Visual */
		border-radius: 0.625rem;
		/* Minimalistic, elegant + fun: thin copper accent with soft inner highlight */
		border: 1px solid #4497b9;
		box-shadow:
			inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
			0 0 0 1px color-mix(in oklch, var(--ref-brand-primary) 25%, transparent 75%);

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
		padding-left: 1rem;
		border-left: 7px solid black;

		/* Typography */
		color: var(--color-ink);
	}

	.kpis dl {
		/* Layout */
		display: contents;
	}

	.kpis dt {
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
		color: #4497b9;
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
			gap: 2rem;
		}
		.kpi strong {
			/* Typography */
			font-size: 3rem; /* smaller KPI numbers for mobile */
		}
		.kpis {
			/* Layout */
			padding-left: 0;
			border-left: none;
		}
	}
</style>
