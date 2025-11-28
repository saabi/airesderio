<script module lang="ts">
	// ===== IMPORTS =====
	import Title from '$lib/components/ui/Title.svelte';
	import SvgViewport from '$lib/components/ui/SvgViewport.svelte';
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

	// ===== TYPES =====
	// Note: Using 'any' for component type is acceptable here as Svelte components
	// don't have a perfect TypeScript representation that works with svelte:component
	type EquipmentItem = {
		icon: string;
		component: any; // eslint-disable-line @typescript-eslint/no-explicit-any
		text: string;
	};

	// ===== STATIC CONSTANTS =====
	const equipmentItems: EquipmentItem[] = [
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
</script>

<script lang="ts">
	// ===== IMPORTS =====
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
	import { browser } from '$app/environment';
	import { ANIMATION, animationDelay, animationDuration, animationOffset } from '$lib/constants/animation';

	// ===== INSTANCE CONSTANTS =====
	const { action: equipmentObserver, visible: equipmentVisible } = createSectionObserver('equipment', {
		threshold: ANIMATION.threshold.section
	});

	// ===== STATE =====
	let visibleItems = $state<Set<number>>(new Set());
	let titleVisible = $state(false);

	// ===== FUNCTIONS =====
	function createTitleObserver(element: HTMLElement) {
		if (!browser) return;

		let observer: IntersectionObserver | null = null;

		requestAnimationFrame(() => {
			observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							titleVisible = true;
							if (observer) {
								observer.unobserve(entry.target);
							}
						}
					}
				},
				{
					threshold: 0.1,
					rootMargin: '0px'
				}
			);

			observer.observe(element);
		});

		return {
			destroy() {
				if (observer) {
					observer.disconnect();
				}
			}
		};
	}

	function createItemObserver(index: number) {
		return (element: HTMLElement) => {
			if (!browser) return;

			let observer: IntersectionObserver | null = null;

			// Use requestAnimationFrame to ensure element is fully rendered
			requestAnimationFrame(() => {
				observer = new IntersectionObserver(
					(entries) => {
						for (const entry of entries) {
							if (entry.isIntersecting) {
								// Create new Set to trigger reactivity
								visibleItems = new Set([...visibleItems, index]);
								// Unobserve after first intersection for "once" behavior
								if (observer) {
									observer.unobserve(entry.target);
								}
							}
						}
					},
					{
						threshold: 0.1, // Trigger when 10% of item is visible
						rootMargin: '0px' // No margin - trigger when item enters viewport
					}
				);

				observer.observe(element);
			});

			return {
				destroy() {
					if (observer) {
						observer.disconnect();
					}
				}
			};
		};
	}
</script>

<section
    id='equipados'
    class='equip'
    aria-labelledby='equipados-heading'
    use:equipmentObserver
    data-section-active={$equipmentVisible}
>
    <div 
        use:createTitleObserver
        class='scroll-animate' 
        data-item-active={titleVisible || undefined}
        style={`--scroll-animate-delay: ${animationDelay(0)}; --scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
    >
        <Title eyebrow='Cómo están' big='EQUIPADOS' />
    </div>
    <ul class='equip-list' role='list'>
        {#each equipmentItems as item, index (index)}
            <li
                use:createItemObserver(index)
                class='scroll-animate'
                data-item-active={visibleItems.has(index) || undefined}
                style={`--scroll-animate-delay: ${animationDelay(index + 1)}; --scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration()};`}
            >
                <SvgViewport viewBox="0 0 48 48" width="4.5rem" height="4.5rem">
                    {@const Component = item.component}
                    <Component />
                </SvgViewport>
                <span>{item.text}</span>
            </li>
        {/each}
    </ul>
</section>

<style>
	.equip {
		/* Layout */
		margin: 1.625rem 0;
	}

	.equip-list {
		/* Layout */
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem 3rem;
		align-items: start;
		list-style: none;
		padding: 0;
		margin: 2rem 0;
	}

	.equip-list li {
		/* Layout */
		display: grid;
		grid-template-columns: 3rem 1fr;
		gap: 3rem;
		align-items: center;
		padding: 1rem 0;
	}

	.equip-list li span {
		/* Positioning */
		position: relative;
		
		/* Layout */
		padding: 0.75rem 0;
		
		/* Typography */
		font-size: 1.75rem;
		line-height: 1.4;
		color: var(--color-contrast-low);
	}

	.equip-list li span::before,
	.equip-list li span::after {
		/* Positioning */
		position: absolute;
		left: 0;
		right: 0;
		
		/* Layout */
		height: 0.25rem;
		
		/* Box/Visual */
		background-color: var(--color-border-default);
		
		/* Misc/Overrides */
		content: '';
	}

	.equip-list li span::before {
		/* Positioning */
		top: 0;
	}

	.equip-list li span::after {
		/* Positioning */
		bottom: 0;
	}

	@media (max-width: 850px) {
		.equip-list {
			/* Layout */
			grid-template-columns: 1fr;
		}
	}
</style>
