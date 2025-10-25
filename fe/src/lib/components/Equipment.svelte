<script lang="ts">
	const equipmentItems = [
		{ icon: '🖼️', svg: '/iconos-servicios/ascensores.svg', text: 'Carpintería de Aluminio Línea A30 NEW de Aluar.' },
		{ icon: '🍳', svg: '/iconos-servicios/horno.svg', text: 'Unidades separadas de anafe y horno a gas empotrados.' },
		{ icon: '🚪', svg: '/iconos-servicios/puerta.svg', text: 'Puertas de madera de diseño exclusivo y elegante.' },
		{ icon: '🌡️', svg: '/iconos-servicios/termotanque.svg', text: 'Termotanques a gas instalados en cada departamento.' },
		{
			icon: '🔐',
			svg: '/iconos-servicios/cerradura-digital.svg',
			text: 'Departamentos con cerradura Digital Inteligente Biométrica Electrónica con Huella Tarjeta Wifi.'
		},
		{
			icon: '🛁',
			svg: '/iconos-servicios/baños.svg',
			text: 'Baños equipados con artefactos sanitarios, vanitory y grifería de 1° calidad, mampara de vidrio color ámbar y espejo.'
		},
		{ icon: '🔥', svg: '/iconos-servicios/gas-natural.svg', text: 'Gas natural para calefón, hornallas y horno.' },
		{
			icon: '👔',
			svg: '/iconos-servicios/vestidor.svg',
			text: 'Elegante vestidor con cajonera, zapatero, estantes e iluminación led interior.'
		},
		{ icon: '⚡', svg: '/iconos-servicios/energia-electrica.svg', text: 'Energía eléctrica con transformador en el edificio.' },
		{ icon: '⬜', svg: '/iconos-servicios/lavasecarropas.svg', text: 'Pisos de porcelanato en todos los ambientes.' },
		{ icon: '🍽️', svg: '/iconos-servicios/cocina.svg', text: 'Cocina equipada con muebles altos y bajos.' }
	];
</script>

<section id="equipados" class="equip" aria-labelledby="equipados-heading">
	<div class="boxed">
		<span class="eyebrow">Cómo están</span>
		<span class="big">EQUIPADOS</span>
	</div>
	<ul class="equip-list" role="list">
		{#each equipmentItems as item}
			<li>
				<img src={item.svg} alt="" aria-hidden="true" />
				<span>{item.text}</span>
			</li>
		{/each}
	</ul>
</section>

<style>

	img {
		padding: 1em;
	}
</style>