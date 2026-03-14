<script lang="ts">
	import AiresDeRioLogo from '$lib/components/ui/AiresDeRioLogo.svelte';
	import DocListIcon from '$lib/components/dev/DocListIcon.svelte';

	// Content converted from docs/proposals/PDFs/ficha-tecnica.MD for preview/PDF-style route.
	// List items: icon key (matches a component below) or null for placeholder.
	type DocListItem = { icon: string | null; html: string };

	const SECTION_1_ITEMS: DocListItem[] = [
		{ icon: 'ubicacion', html: 'Ubicado en el área donde todo ocurre: shopping, diversión, zonas verdes, deportes, eventos culturales, restaurantes y pubs.' },
		{ icon: 'estacionamiento', html: 'Con la conveniencia de estar sobre una avenida céntrica y con doble estacionamiento.' },
		{ icon: 'building', html: 'Aires de Rio ofrece veintiocho departamentos y un local comercial dedicado a cafetería para tu comodidad.' },
		{ icon: 'ascensores', html: 'La circulación vertical estará servida por dos ascensores desde el subsuelo hasta la terraza.' },
		{ icon: null, html: 'Construye la empresa <strong>HABITAT PRIME S.A.S.</strong> bajo la dirección técnica del Ing. Ricardo Mattera, de larga trayectoria en la provincia. El Estudio D+B de Antonella Doménico y Luciano Bertorello aportó belleza a su arquitectura en una elegante fusión de líneas curvas y rectas, confiriéndole un moderno estilo mediterráneo, ambientes serenos, ordenados y una sutil elegancia.' },
		{ icon: 'ladrillos', html: 'En las paredes exteriores y los tabiques divisores interiores se utilizaron ladrillos cerámicos huecos de reconocida marca del medio, cuidando la aislación térmica y sonora.' },
		{ icon: null, html: 'Las paredes interiores revocadas y pintadas con pintura látex premium interior de primera marca. La pared de ingreso a cada unidad estará tratada de forma especial para acordar con la paleta de colores y texturas del resto de los revestimientos.' },
		{ icon: 'agua-sanitarias', html: 'Para las conexiones sanitarias se usaron materiales de las marca <strong>AWADUCT</strong> y <strong>TIGRE</strong>, ambas por su alta resistencia y calidad.' },
		{ icon: 'energia', html: 'Un generador de última generación instalado por <strong>EDESE</strong> en el edificio asegura una provisión de electricidad estable.' },
		{ icon: 'gas', html: 'Servicio de gas natural para la cocina.' },
		{ icon: 'terraza-piscina', html: 'La terraza con piscina y deck húmedo es un espacio diseñado para el bienestar con zonas de encuentro que invitan al ocio. La iluminación toma un rol protagónico creando un ambiente íntimo y relajado, realzado por vistas inigualables hacia la ciudad y sus pulmones verdes.' }
	];

	const MEMORIA_ITEMS: DocListItem[] = [
		{ icon: 'techos-altos', html: 'Techos altos, con una luz entre losas de 275 cm.' },
		{ icon: null, html: 'Cielorrasos con gargantas y cenefas para instalaciones de luces ambientales, alojar servicios, ocultar los barrales de cortinas y para mayor comodidad térmica y acústica.' },
		{ icon: 'energia', html: 'Gran cantidad de módulos tomacorriente y bocas en todos los ambientes.' },
		{ icon: null, html: 'Caja octogonal en cielorraso para ventilador de techo en dormitorio y living.' },
		{ icon: null, html: 'Dos unidades de preinstalación de A. Acondicionados en living y dormitorios con placa de sostén, drenajes, caños y enchufe.' },
		{ icon: null, html: 'Bandeja de hierro para las unidades externas de A. Acondicionados en los patios internos.' },
		{ icon: 'puerta', html: 'Puerta de ingreso de gran porte a cada departamento, de exquisito diseño, laminada en madera y con aplicaciones metálicas.' },
		{ icon: null, html: 'Cerradura de seguridad doble perno Prive o similar calidad.' },
		{ icon: 'carpinteria', html: 'Aberturas con carpintería de aluminio galvanizado <strong>ALUAR</strong> modelo A30New Anodizado Natural (Plata/Inox).' },
		{ icon: 'puerta', html: 'Grandes puertas corredizas de doble panel de dormitorio y living a balcón.' },
		{ icon: 'puerta', html: 'Los departamentos sobre contrafrente, que carecen de balcón, tienen también las mismas puertas corredizas de doble panel en dormitorio y living con baranda metálica de seguridad para apoyo.' },
		{ icon: 'vestidor', html: 'Dormitorios con vestidor con tres metros lineales de placares equipados con cajones, estantes y espacio para perchas.' },
		{ icon: 'cocina', html: 'Cocina integrada con mueble bajo mesada y alacenas en placa de Melamina base MDF blanca de primera marca.' },
		{ icon: 'cocina', html: 'Counter top de la mesada con zócalo en granito natural Negro Brasil o Gris Mara.' },
		{ icon: 'cocina', html: 'Desayunador en granito natural Negro Brasil o Gris Mara.' },
		{ icon: null, html: 'Revestimiento cerámico simil madera en paredes de mesada en juego con la paleta de colores.' },
		{ icon: 'cocina', html: 'Campana purificadora sobre las hornallas.' },
		{ icon: 'horno', html: 'Cocina con horno de primera marca.' },
		{ icon: null, html: 'Pileta de Acero inoxidable marca Johnson.' },
		{ icon: 'banos', html: 'Grifería monocomando FV.' },
		{ icon: 'banos', html: 'Antebaño con mueble vanitory de melamina base MDF en color roble natural con un cajón.' },
		{ icon: 'banos', html: 'Extractores en los baños.' },
		{ icon: 'banos', html: 'Counter top de vanitory en mármol o granito Negro Brasil.' },
		{ icon: 'banos', html: 'Espejo de vanitory en antebaño.' },
		{ icon: 'banos', html: 'Bacha Ferrum modelo Tori Cilíndrica en sobremesada de vanitory.' },
		{ icon: 'banos', html: 'Grifería marca FV para lavatorios, bidet y cabina de ducha.' },
		{ icon: 'banos', html: 'Inodoro y bidet modelo Bari de Ferrum.' },
		{ icon: 'banos', html: 'Cabina de ducha con mampara fija de vidrio 5+5 laminado de piso a techo color cristal.' },
		{ icon: 'lavasecarropas', html: 'Instalaciones para máquinas lavarropa y secarropa en cabina dedicada con puertas.' },
		{ icon: 'piso', html: 'Pisos de living comedor, cocina, pasillos y dormitorios en porcelanato de 120x21cm Cerro Negro color incienso o similar calidad y color.' },
		{ icon: null, html: 'Balcones con pisos de porcelanato.' },
		{ icon: null, html: 'Zócalos de EPS antihumedad.' },
		{ icon: 'piso', html: 'Pisos en los baños de porcelánico 60x60' },
		{ icon: 'banos', html: 'Paredes de los baños en cerámicos 50x60 de piso a techo.' }
	];

	const LUXURY_ITEMS: DocListItem[] = [
		{ icon: null, html: 'Aplicables a cualquiera de los planos que elijas.' },
		{ icon: null, html: 'Gargantas y cenefas de los cielorrasos provistas con instalación de luces leds en todo el contorno en living comedor, cocina y dormitorios.' },
		{ icon: 'cerradura-digital', html: 'Puerta de ingreso con cerradura inteligente digital biométrica con wifi.' },
		{ icon: 'vestidor', html: 'Vestidor con puertas de vidrio ahumado de dos paños fijos y uno corredizo con marco de aluminio color bronce.' },
		{ icon: null, html: 'Iluminación led en el interior de los placares con encendido/apagado táctil.' },
		{ icon: 'cocina', html: 'Cocina integrada con mueble bajo mesada y alacenas en placa de Melamina base MDF en color Gris grafito o color madera en bajo mesada y combinado con blanco la alacena. Opción de puertas de la alacena semitransparentes en vidrio con marco de aluminio e iluminación interna.' },
		{ icon: null, html: 'Iluminación led sobre mesada en zona de trabajo.' },
		{ icon: 'cocina', html: 'Mesada de cocina con zócalo y desayunador de Pure Stone blanco (cuarzo natural color uniforme) más duradero que el granito natural.' },
		{ icon: null, html: 'Revestimiento cerámico blanco en paredes de mesada.' },
		{ icon: 'vestidor', html: 'Dormitorios amplios con vestidor con doble placard, con cuatro cajones y pantalonera con rieles y correderas metálicas y estantes.' },
		{ icon: 'vestidor', html: 'Puertas del vestidor corredizas de aluminio con vidrios ahumados de tres paños.' },
		{ icon: null, html: 'Revestimiento con panel de WPC en color madera en muro con curva del living.' },
		{ icon: 'banos', html: 'Antebaño con mueble vanitory con un cajón en melamina base MDF color nogal, y cajón interno para maquillaje.' },
		{ icon: 'banos', html: 'Counter top de vanitory en silestone tabaco o nébula.' },
		{ icon: 'banos', html: 'Espejo de vanitory en antebaño con luces led encendido/apagado táctil.' },
		{ icon: null, html: 'Artefacto lumínico suspendido sobre vanitory con bulbo led.' },
		{ icon: 'banos', html: 'Bacha Ferrum modelo Tori Cilíndrica en sobremesada de vanitory.' },
		{ icon: 'banos', html: 'Grifería marca FV para lavatorios, bidet y cabina de ducha.' },
		{ icon: 'banos', html: 'Sanitarios Ferrum, modelo Bari.' },
		{ icon: 'banos', html: 'Cabina de ducha con mampara de vidrio de un paño fijo y otro corredizo de cristal color ámbar 5+5 laminado.' },
		{ icon: null, html: 'Artefactos de iluminación led insertos en cielorraso provistos funcionando con bulbos o tiras led en las cenefas.' },
		{ icon: null, html: 'Aplique led bidireccional en balcón con bulbo led.' }
	];
</script>

<article class="ficha-tecnica-doc">
	<h1>Si buscas</h1>
	<h2>un estilo de vida urbano y vibrante</h2>

	<p class="doc-logotype">
		<AiresDeRioLogo
			class="doc-logo"
			height="3rem"
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
					<DocListIcon icon={item.icon} />
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
					<DocListIcon icon={item.icon} />
				</span>
				<span class="doc-list-content">{@html item.html}</span>
			</li>
		{/each}
	</ul>

	<blockquote>
		<p>Un estilo de vida urbano y vibrante</p>
	</blockquote>

	<ul class="doc-list" role="list">
		{#each SECTION_1_ITEMS as item (item.html)}
			<li class="doc-list-item">
				<span class="doc-list-icon" aria-hidden="true">
					<DocListIcon icon={item.icon} />
				</span>
				<span class="doc-list-content">{@html item.html}</span>
			</li>
		{/each}
	</ul>

	<hr />

	<h2>Si buscas<br />es para vos.</h2>

	<h1>DEPARTAMENTOS</h1>
	<h2>LUXURY SERIES</h2>

	<p><strong>Línea</strong></p>

	<h3>ADICIONALES DE ESTA LÍNEA</h3>

	<ul class="doc-list" role="list">
		{#each LUXURY_ITEMS as item (item.html)}
			<li class="doc-list-item">
				<span class="doc-list-icon" aria-hidden="true">
					<DocListIcon icon={item.icon} />
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
	}

	.ficha-tecnica-doc :global(h1) {
		font-family: var(--font-heading);
		font-size: 1.75rem;
		font-weight: var(--font-weight-bold);
		margin: 1.5rem 0 0.5rem;
		color: var(--color-text-primary);
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
	}

	.ficha-tecnica-doc :global(h3) {
		font-family: var(--font-heading);
		font-size: 1.1rem;
		font-weight: var(--font-weight-bold);
		margin: 1rem 0 0.5rem;
		color: var(--color-text-primary);
	}

	.doc-list {
		list-style: none;
		margin: 0.75rem 0 1rem;
		padding: 0;
	}

	.doc-list-item {
		display: grid;
		grid-template-columns: 2rem 1fr;
		gap: 0.75rem;
		align-items: start;
		margin-bottom: 0.5rem;
	}

	.doc-list-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		min-height: 1.5em;
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
	}

	.ficha-tecnica-doc :global(blockquote p) {
		margin: 0;
	}

	.ficha-tecnica-doc :global(hr) {
		border: none;
		border-top: 1px solid var(--color-border-default);
		margin: 2rem 0;
	}

	.ficha-tecnica-doc :global(p) {
		margin: 0.5rem 0 1rem;
	}

	.doc-logotype {
		margin: 1rem 0;
	}

	.doc-logotype :global(.doc-logo) {
		display: block;
	}
</style>
