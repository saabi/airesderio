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
	.equip {
		margin: 26px 0;
	}
	.boxed {
		display: inline-block;
		border: 3px solid var(--line);
		border-radius: 4px;
		padding: 8px 14px;
		margin: 12px 0;
	}

	.boxed .eyebrow {
		font-size: 0.9rem;
		letter-spacing: 0.18em;
		color: #111;
		display: block;
	}

	.boxed .big {
		display: block;
		font-size: 28px;
		font-weight: 800;
		letter-spacing: 0.06em;
	}

	.equip-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px 24px;
		align-items: start;
	}

	.equip-list li {
		display: grid;
		grid-template-columns: 36px 1fr;
		gap: 12px;
		align-items: start;
	}

	.ico {
		width: 36px;
		height: 36px;
		border: 1px solid var(--line);
		border-radius: 8px;
		display: grid;
		place-items: center;
		color: #666;
		background: #fff;
		font-size: 1.2em;
	}

	@media (max-width: 850px) {
		.equip-list {
			grid-template-columns: 1fr;
		}
	}
</style>
