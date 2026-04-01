<script lang="ts">
	import AiresDeRioLogo from '$lib/components/ui/AiresDeRioLogo.svelte';
	import DocListIcon from '$lib/components/dev/DocListIcon.svelte';

	// Content converted from docs/proposals/PDFs/ficha-tecnica.MD for preview/PDF-style route.
	// List items: icon key (matches a component below) or null for placeholder.
	type DocListItem = { icon: string | null; html: string };

	const SECTION_1_ITEMS: DocListItem[] = [
		{ icon: 'ubicacion', html: 'Ubicado en el área donde todo ocurre: shopping, diversión, zonas verdes, deportes, eventos culturales, restaurantes y pubs.' },
		{ icon: 'estacionamiento', html: 'Con la conveniencia de estar sobre una avenida muy céntrica.' },
		{ icon: 'building', html: 'Aires de Rio ofrece veintiocho departamentos y un local comercial dedicado a cafetería para tu comodidad.' },
		{ icon: 'ascensores', html: 'La circulación vertical estará servida por dos ascensores desde el subsuelo hasta la terraza.' },
		{ icon: null, html: 'Construye la empresa <strong>HABITAT PRIME S.A.S.</strong> bajo la dirección técnica del Ing. Ricardo Mattera, de larga trayectoria en la provincia. El Estudio D+B de Antonella Doménico y Luciano Bertorello aportó diseño y belleza a su arquitectura en una elegante fusión de líneas curvas y rectas, confiriéndole un moderno estilo mediterráneo, ambientes serenos, ordenados y una sutil elegancia.' },
		{ icon: 'ladrillos', html: 'En las paredes exteriores y los tabiques divisores interiores se utilizaron ladrillos cerámicos huecos de reconocida marca del medio, cuidando la aislación térmica y sonora.' },
		{ icon: null, html: 'Las paredes interiores revocadas y pintadas con pintura látex premium interior de primera marca. La pared de ingreso a cada unidad estará tratada de forma especial para acordar con la paleta de colores y texturas del resto de los revestimientos.' },
		{ icon: 'agua-sanitarias', html: 'Para las conexiones sanitarias se usaron materiales de las marca <strong>AWADUCT</strong> y <strong>TIGRE</strong>, ambas por su alta resistencia y calidad.' },
		{ icon: 'energia', html: 'Un generador de última generación instalado por <strong>EDESE</strong> en el edificio asegura una provisión de electricidad estable.' },
		{ icon: 'gas', html: 'Servicio de gas natural para la cocina.' },
		{ icon: 'terraza-piscina', html: 'La terraza con piscina y deck húmedo es un espacio diseñado para el bienestar con zonas de encuentro que invitan al ocio. La iluminación toma un rol protagónico creando un ambiente íntimo y relajado, realzado por vistas inigualables hacia la ciudad y sus pulmones verdes.' }
	];

const MEMORIA_ITEMS: DocListItem[] = [
		{
			icon: 'techos-altos',
			html: 'Ambientes con techos altos y cielorrasos diseñados con espacios integrados para iluminación, instalaciones y cortinas, que además contribuyen al confort térmico y acústico.'
		},
		{
			icon: 'carpinteria',
			html: 'Carpintería de aluminio Aluar Línea A30 NEW de alta prestación. Grandes puertas corredizas de doble hoja que conectan el dormitorio y el living con el balcón.'
		},
		{
			icon: 'cocina',
			html: 'Cocinas totalmente equipadas, con mobiliario moderno bajo y sobre mesada. Incluyen horno con hornallas integradas y campana purificadora. Mesadas y desayunador en granito natural, pileta de acero inoxidable marca Johnson y grifería monocomando FV.'
		},
		{
			icon: 'vestidor',
			html: 'Dormitorios con vestidor con tres metros lineales de placares, equipados con cajones, estantes, espacio para perchas y pantalonera.'
		},
		{
			icon: 'banos',
			html: 'Baños de diseño contemporáneo, equipados con grifería de primera calidad, vanitory, espejo, mampara de vidrio y sistema de extracción.'
		},
		{
			icon: 'unidades-aire',
			html: 'Preinstalación de aire acondicionado en living y dormitorios, con soporte, desagües, cañerías y toma eléctrica. Incluye bandejas de hierro para las unidades exteriores en patios internos. Equipos no incluidos.'
		},
		{
			icon: 'lavasecarropas',
			html: 'Preinstalación para lavarropas y secarropas en espacio dedicado.'
		},
		{
			icon: 'tomas-corriente',
			html: 'Amplia cantidad de tomacorrientes y bocas de conexión en todos los ambientes. Incluye caja octogonal en cielorraso para la instalación de ventilador de techo en dormitorios y living.'
		},
		{
			icon: 'piso',
			html: 'Pisos de porcelanato de gran formato en los ambientes principales, con zócalos de EPS resistentes a la humedad.'
		}
	];

const LUXURY_ITEMS: DocListItem[] = [
		{ icon: 'tilde', html: 'Puerta de ingreso con cerradura inteligente digital biométrica con wifi.' },
		{ icon: 'tilde', html: 'Cocina integrada con bajo mesada y alacena de Melamina base MDF en gris grafito o madera. Opción de incluir dos puertas de vidrio con marco de aluminio e iluminación interna en alacena.' },
		{ icon: 'tilde', html: 'Encimera de cocina con zócalo y desayunador de Pure Stone blanco (cuarzo natural color uniforme) más duradero que el granito natural.' },
		{ icon: 'tilde', html: 'Anafe y horno a gas independientes empotrables.' },
		{ icon: 'tilde', html: 'Iluminación led en zona de trabajo sobre mesada de la cocina.' },
		{ icon: 'tilde', html: 'Revestimiento cerámico blanco en paredes de mesada.' },
		{ icon: 'tilde', html: 'Gargantas y cenefas de los cielorrasos provistas con instalación de luces leds en living comedor, cocina y dormitorios.' },
		{ icon: 'tilde', html: 'Revestimiento con panel de WPC en color madera en pared curvada del living.' },
		{ icon: 'tilde', html: 'Vestidor con puertas de vidrio ahumado de dos paños fijos y uno corredizo con marco de aluminio.' },
		{ icon: 'tilde', html: 'Dormitorios amplios con vestidor con doble placard, con cuatro cajones y pantalonera con rieles, correderas metálicas y estantes.' },
		{ icon: 'tilde', html: 'Iluminación led en el interior de los placares con encendido/apagado táctil.' },
		{ icon: 'tilde', html: 'Antebaño con mueble vanitory con un cajón en melamina base MDF color nogal, y cajón interno para maquillaje.' },
		{ icon: 'tilde', html: 'Encimera de vanitory en silestone tabaco, nébula o marmol a elección.' },
		{ icon: 'tilde', html: 'Espejo de vanitory en antebaño con luces led encendido/apagado táctil.' },
		{ icon: 'tilde', html: 'Artefacto lumínico suspendido sobre vanitory con bulbo led.' },
		{ icon: 'tilde', html: 'Bacha Ferrum modelo Tori Cilíndrica en sobremesada de vanitory.' },
		{ icon: 'tilde', html: 'Cabina de ducha con mampara de vidrio de un paño fijo y otro corredizo en cristal color ámbar 5+5 laminado.' },
		{ icon: 'tilde', html: 'Aplique led bidireccional en balcón con bulbo led.' }
	];
</script>

<article class="ficha-tecnica-doc">
	<h1>Si buscas</h1>
	<h2>un estilo de vida urbano y vibrante</h2>

	<p class="doc-logotype">
		<AiresDeRioLogo
			class="doc-logo"
			height="6rem"
			theme="light"
			showIsotype={true}
			showDepartamentos={true}
			loading="eager"
		/>
	</p>

	<h2>es para vos</h2>

	<ul class="doc-list" role="list">
		{#each SECTION_1_ITEMS as item (item.html)}
			<li class="doc-list-item">
				<span class="doc-list-icon" aria-hidden="true">
					<DocListIcon icon={item.icon} size="3em" />
				</span>
				<span class="doc-list-content">{@html item.html}</span>
			</li>
		{/each}
	</ul>

	<hr />

	<h2>HARMONY EXPERIENCE</h2>

	<p><strong>Línea</strong><br />Dos estilos para elegir</p>

	<h3>MEMORIA DESCRIPTIVA</h3>

	<ul class="doc-list" role="list">
		{#each MEMORIA_ITEMS as item (item.html)}
			<li class="doc-list-item">
				<span class="doc-list-icon" aria-hidden="true">
					<DocListIcon icon={item.icon} size="3em" />
				</span>
				<span class="doc-list-content">{@html item.html}</span>
			</li>
		{/each}
	</ul>

	<hr />

	<h1>DEPARTAMENTOS</h1>
	<h2>LUXURY SERIES</h2>

	<p><strong>Línea</strong></p>

	<h3>ADICIONALES DE ESTA LÍNEA</h3>

	<ul class="doc-list" role="list">
		{#each LUXURY_ITEMS as item (item.html)}
			<li class="doc-list-item">
				<span class="doc-list-icon" aria-hidden="true">
					<DocListIcon icon={item.icon} size="3em" />
				</span>
				<span class="doc-list-content">{@html item.html}</span>
			</li>
		{/each}
	</ul>

	<p><strong>TODO LO QUE OFRECE LA LÍNEA HARMONY STYLE Y AÚN MUCHO MÁS EN CUALQUIERA DE LAS TIPOLOGÍAS QUE ELIJAS</strong></p>
</article>

<style>
	.ficha-tecnica-doc {
		max-width: 42rem;
		margin: 0 auto;
		padding: 2rem 1.5rem;
		font-family: var(--font-body);
		font-size: 1rem;
		line-height: 1.6;
		color: var(--color-text-primary);
		/* Widow/orphan control for print: keep at least 2 lines together at page top/bottom */
		orphans: 2;
		widows: 2;
	}

	.ficha-tecnica-doc :global(h1) {
		font-family: var(--font-heading);
		font-size: 1.75rem;
		font-weight: var(--font-weight-bold);
		margin: 1.5rem 0 0.5rem;
		color: var(--color-text-primary);
		break-after: avoid;
		break-before: avoid;
	}

	.ficha-tecnica-doc :global(h1:first-child) {
		margin-top: 0;
	}

	.ficha-tecnica-doc :global(h2) {
		font-family: var(--font-heading);
		font-size: 1.35rem;
		font-weight: var(--font-weight-bold);
		margin: 1.25rem 0 0.5rem;
		color: var(--color-accent-primary);
		break-after: avoid;
		break-before: avoid;
	}

	.ficha-tecnica-doc :global(h3) {
		font-family: var(--font-heading);
		font-size: 1.1rem;
		font-weight: var(--font-weight-bold);
		margin: 1rem 0 0.5rem;
		color: var(--color-text-primary);
		break-after: avoid;
		break-before: avoid;
	}

	.doc-list {
		list-style: none;
		margin: 2.75rem 0 1rem;
		padding: 0;
		/* Keep list with preceding heading (avoid orphan heading at page top). */
		break-before: avoid;
	}

	.doc-list-item:first-child {
		margin-top: 0;
	}

	.doc-list-item {
		display: grid;
		grid-template-columns: 4rem 1fr;
		gap: 0.75rem;
		align-items: start;
		margin-top: 1rem;
		margin-bottom: 1rem;
		/* Keep each list item together when possible (avoid single line on next page) */
		break-inside: avoid;
	}

	.doc-list-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 4rem;
		min-height: 3em;
		color: var(--color-contrast-low);
	}

	.doc-list-content {
		min-width: 0;
	}

	.ficha-tecnica-doc :global(blockquote) {
		margin: 1rem 0;
		padding: 0.75rem 1rem;
		border-left: 4px solid var(--color-accent-primary);
		background: var(--color-bg-subtle);
		font-style: italic;
		break-inside: avoid;
	}

	.ficha-tecnica-doc :global(blockquote p) {
		margin: 0;
	}

	.ficha-tecnica-doc :global(hr) {
		border: none;
		border-top: 1px solid var(--color-border-default);
		margin: 2rem 0;
		break-after: avoid;
	}

	.ficha-tecnica-doc :global(p) {
		margin: 0.5rem 0 1rem;
		break-after: avoid;
		break-before: avoid;
	}

	.doc-logotype {
		margin: 1rem 0;
	}

	.doc-logotype :global(.doc-logo) {
		display: block;
	}

	@media print {
		/* Padding on the article (the fragmenting block) so list items that start or continue
		   on a new page stay inside the same padded box and margins are correct on every page. */
		.ficha-tecnica-doc {
			padding-left: 2cm;
			padding-right: 2cm;
			padding-top: 1cm;
			padding-bottom: 1cm;
			max-width: none;
		}
		/* Padding-top (not margin) on each list item so when one is first on a new page after a
		   break, there is visible space above it; padding doesn't collapse across fragment boundaries. */
		.doc-list-item {
			padding-top: 0.5cm;
			margin-top: 0;
			margin-bottom: 0.25cm;
		}

		.doc-list-item:first-child {
			padding-top: 0;
		}
	}

	h1, h2, h3 {
		margin-left: 1.8cm !important;
	}
	h1 {
		font-size: 1.5cm !important;
		font-weight: normal !important;
	}
	h2 {
		font-size: 0.9cm !important;
		font-weight: normal !important;
	}
	h3 {
		font-size: 1cm !important;
		font-weight: normal !important;
	}
</style>
