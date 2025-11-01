<script lang="ts">
	import Title from '$lib/components/Title.svelte';

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
	<Title eyebrow="Cómo están" big="EQUIPADOS" />
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
	.equip {
		margin: 1.625rem 0;
	}

	.equip-list {
		list-style: none;
		padding: 0;
		margin:2rem 0;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem 3rem;
		align-items: start;
	}

	.equip-list li {
		display: grid;
		grid-template-columns: 3rem 1fr;
		gap: 3rem;
		align-items: center;
		padding: 1rem 0;
	}

	.equip-list li img {
		width: 4.5rem;
		height: 4.5rem;
		object-fit: contain;
	}

	.equip-list li span {
		position: relative;
		padding: 0.75rem 0;
		font-size: 1.75rem;
		line-height: 1.4;
		color: #333;
	}

	.equip-list li span::before,
	.equip-list li span::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		height: 0.25rem;
		background-color: var(--line);
	}

	.equip-list li span::before {
		top: 0;
	}

	.equip-list li span::after {
		bottom: 0;
	}

	@media (max-width: 850px) {
		.equip-list {
			grid-template-columns: 1fr;
		}
	}
</style>
