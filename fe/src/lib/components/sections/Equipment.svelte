<script lang="ts">
	import Title from '$lib/components/ui/Title.svelte';
	import SvgViewport from '$lib/components/ui/SvgViewport.svelte';
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
	import Ascensores from '$lib/components/icons/Ascensores.svelte';
	import Banos from '$lib/components/icons/Banos.svelte';
	import CerraduraDigital from '$lib/components/icons/CerraduraDigital.svelte';
	import Cocina from '$lib/components/icons/Cocina.svelte';
	import EnergiaElectrica from '$lib/components/icons/EnergiaElectrica.svelte';
	import GasNatural from '$lib/components/icons/GasNatural.svelte';
	import Horno from '$lib/components/icons/Horno.svelte';
	import Lavasecarropas from '$lib/components/icons/Lavasecarropas.svelte';
	import Puerta from '$lib/components/icons/Puerta.svelte';
	import Termotanque from '$lib/components/icons/Termotanque.svelte';
	import Vestidor from '$lib/components/icons/Vestidor.svelte';

	// Note: Using 'any' for component type is acceptable here as Svelte components
	// don't have a perfect TypeScript representation that works with svelte:component
	const equipmentItems: Array<{
		icon: string;
		component: any; // eslint-disable-line @typescript-eslint/no-explicit-any
		text: string;
	}> = [
		{ icon: '🖼️', component: Ascensores, text: 'Carpintería de Aluminio Línea A30 NEW de Aluar.' },
		{ icon: '🍳', component: Horno, text: 'Unidades separadas de anafe y horno a gas empotrados.' },
		{ icon: '🚪', component: Puerta, text: 'Puertas de madera de diseño exclusivo y elegante.' },
		{ icon: '🌡️', component: Termotanque, text: 'Termotanques a gas instalados en cada departamento.' },
		{
			icon: '🔐',
			component: CerraduraDigital,
			text: 'Departamentos con cerradura Digital Inteligente Biométrica Electrónica con Huella Tarjeta Wifi.'
		},
		{
			icon: '🛁',
			component: Banos,
			text: 'Baños equipados con artefactos sanitarios, vanitory y grifería de 1° calidad, mampara de vidrio color ámbar y espejo.'
		},
		{ icon: '🔥', component: GasNatural, text: 'Gas natural para calefón, hornallas y horno.' },
		{
			icon: '👔',
			component: Vestidor,
			text: 'Elegante vestidor con cajonera, zapatero, estantes e iluminación led interior.'
		},
		{ icon: '⚡', component: EnergiaElectrica, text: 'Energía eléctrica con transformador en el edificio.' },
		{ icon: '⬜', component: Lavasecarropas, text: 'Pisos de porcelanato en todos los ambientes.' },
		{ icon: '🍽️', component: Cocina, text: 'Cocina equipada con muebles altos y bajos.' }
	];

    const { action: equipmentObserver, visible: equipmentVisible } = createSectionObserver('equipment', {
        threshold: 0.3
    });
</script>

<section
    id='equipados'
    class='equip'
    aria-labelledby='equipados-heading'
    use:equipmentObserver
    data-section-active={$equipmentVisible}
>
    <div class='scroll-animate' style='--scroll-animate-offset: 36px;'>
        <Title eyebrow='Cómo están' big='EQUIPADOS' />
    </div>
    <ul class='equip-list' role='list'>
        {#each equipmentItems as item, index (index)}
            <li
                class='scroll-animate'
                style={`--scroll-animate-delay: ${140 + index * 60}ms; --scroll-animate-offset: 48px;`}
            >
                <SvgViewport viewBox="0 0 48 48" width="4.5rem" height="4.5rem">
                    <svelte:component this={item.component} />
                </SvgViewport>
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


	.equip-list li span {
		position: relative;
		padding: 0.75rem 0;
		font-size: 1.75rem;
		line-height: 1.4;
		color: var(--color-contrast-low);
	}

	.equip-list li span::before,
	.equip-list li span::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		height: 0.25rem;
		background-color: var(--color-border-default);
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
