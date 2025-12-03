<script module lang="ts">
	// ===== IMPORTS =====
	import Title from '$lib/components/ui/Title.svelte';
	import SvgViewport from '$lib/components/ui/SvgViewport.svelte';
	import Carpinteria from '$lib/components/icons/Carpinteria.svelte';
	import Banos from '$lib/components/icons/Banos.svelte';
	import CerraduraDigital from '$lib/components/icons/CerraduraDigital.svelte';
	import Cocina from '$lib/components/icons/Cocina.svelte';
	import EnergiaElectrica from '$lib/components/icons/EnergiaElectrica.svelte';
	import GasNatural from '$lib/components/icons/GasNatural.svelte';
	import Horno from '$lib/components/icons/Horno.svelte';
	import Piso from '$lib/components/icons/Piso.svelte';
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
		{ icon: '🖼️', component: Carpinteria, text: 'Carpintería de aluminio de alta prestación con aislación termoacústica superior.' },
		{ icon: '🍳', component: Horno, text: 'Anafe y horno a gas empotrados de diseño moderno y alta funcionalidad.' },
		{ icon: '🚪', component: Puerta, text: 'Puertas de madera con diseño exclusivo que aportan calidez y elegancia moderna.' },
		{ icon: '🌡️', component: Termotanque, text: 'Agua caliente asegurada mediante termotanques eléctricos individuales de alta recuperación.' },
		{
			icon: '🔐',
			component: CerraduraDigital,
			text: 'Acceso smart con cerradura biométrica y WiFi para máxima seguridad y confort.'
		},
		{
			icon: '🛁',
			component: Banos,
			text: 'Baños de diseño con grifería de primera calidad, vanitory, espejo y mampara de vidrio.'
		},
		{ icon: '🔥', component: GasNatural, text: 'Conexión de gas natural disponible específicamente para anafe y horno empotrado.' },
		{
			icon: '👔',
			component: Vestidor,
			text: 'Vestidores completos con interiores diseñados a medida e iluminación LED integrada.'
		},
		{ icon: '⚡', component: EnergiaElectrica, text: 'Suministro eléctrico confiable garantizado por transformador propio en el edificio.' },
		{ icon: '⬜', component: Piso, text: 'Pisos de porcelanato de gran formato en la totalidad de los ambientes.' },
		{ icon: '🍽️', component: Cocina, text: 'Cocinas completamente equipadas con modernos muebles de guardado bajo y sobre mesada.' }
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
        <Title eyebrow='Cómo vienen' big='EQUIPADOS' />
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
	#equipados {
		max-width: var(--max);
		margin: 0 auto;
	}
	
	.equip {
		/* Layout */
		margin: 1.625rem 0;
	}

	.equip-list {
		/* Layout */
		display: grid;
		grid-template-columns: 1fr;
		gap: 0 3rem;
		align-items: start;
		list-style: none;
		padding: 0;
		margin: 2rem 0;
	}

	/* This container query increases the .equip-list grid columns to 2
	   when the --max container variable is set to 1200px (triggered by the
	   breakpoint in app.css at min-width: 1300px). This makes the equipment
	   grid show two columns on wider (medium+) screens. */
	@container style(--max: 1200px) {
		.equip-list {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* 3 columns on large screens using --max */
	@container style(--max: 1750px) {
		.equip-list {
			/* Layout */
			grid-template-columns: repeat(3, 1fr);
		}
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

</style>
