<script module lang="ts">
	// ===== IMPORTS =====
	import { browser } from '$app/environment';

	import Title from '$lib/components/ui/Title.svelte';
	import IconTextRow from '$lib/components/ui/IconTextRow.svelte';
	import SvgViewport from '$lib/components/ui/SvgViewport.svelte';
	import Banos from '$lib/components/icons/Banos.svelte';
	import Carpinteria from '$lib/components/icons/Carpinteria.svelte';
	import Cocina from '$lib/components/icons/Cocina.svelte';
	import Lavasecarropas from '$lib/components/icons/Lavasecarropas.svelte';
	import Piso from '$lib/components/icons/Piso.svelte';
	import Vestidor from '$lib/components/icons/Vestidor.svelte';
	import TechosAltos from '$lib/components/icons/TechosAltos.svelte';
	import TomasCorriente from '$lib/components/icons/TomasCorriente.svelte';
	import UnidadesAire from '$lib/components/icons/UnidadesAire.svelte';

	import { createSectionObserver } from '$lib/utils/sectionVisibility';
	import {
		ANIMATION,
		animationDelay,
		animationDuration,
		animationOffset
	} from '$lib/constants/animation';

	// ===== TYPES =====
	type EquipmentItem = {
		icon: string;
		component: any; // eslint-disable-line @typescript-eslint/no-explicit-any
		text: string;
	};

	// ===== STATIC CONSTANTS =====
	const lineaHarmony: EquipmentItem[] = [
		{
			icon: '⬆️',
			component: TechosAltos,
			text: 'Ambientes con techos altos y cielorrasos diseñados con espacios integrados para iluminación, instalaciones y cortinas, que además contribuyen al confort térmico y acústico.'
		},
		{
			icon: '🖼️',
			component: Carpinteria,
			text: 'Carpintería de aluminio Aluar Línea A30 NEW de alta prestación. Grandes puertas corredizas de doble hoja que conectan el dormitorio y el living con el balcón.'
		},
		{
			icon: '🍽️',
			component: Cocina,
			text: 'Cocinas totalmente equipadas, con mobiliario moderno bajo y sobre mesada. Incluyen horno con hornallas integradas y campana purificadora. Mesadas y desayunador en granito natural, pileta de acero inoxidable marca Johnson y grifería monocomando FV.'
		},
		{
			icon: '👔',
			component: Vestidor,
			text: 'Dormitorios con vestidor con tres metros lineales de placares, equipados con cajones, estantes, espacio para perchas y pantalonera.'
		},
		{
			icon: '🛁',
			component: Banos,
			text: 'Baños de diseño contemporáneo, equipados con grifería de primera calidad, vanitory, espejo, mampara de vidrio y sistema de extracción.'
		},
		{
			icon: '🌀',
			component: UnidadesAire,
			text: 'Preinstalación de aire acondicionado en living y dormitorios, con soporte, desagües, cañerías y toma eléctrica. Incluye bandejas de hierro para las unidades exteriores en patios internos. Equipos no incluidos.'
		},
		{
			icon: '🧺',
			component: Lavasecarropas,
			text: 'Preinstalación para lavarropas y secarropas en espacio dedicado.'
		},
		{
			icon: '🔌',
			component: TomasCorriente,
			text: 'Amplia cantidad de tomacorrientes y bocas de conexión en todos los ambientes. Incluye caja octogonal en cielorraso para la instalación de ventilador de techo en dormitorios y living.'
		},
		{
			icon: '⬜',
			component: Piso,
			text: 'Pisos de porcelanato de gran formato en los ambientes principales, con zócalos de EPS resistentes a la humedad.'
		}
	];
</script>

<script lang="ts">
	const { action: sectionObserver, visible: sectionVisible } = createSectionObserver('equipados', {
		threshold: ANIMATION.threshold.section
	});

	let visibleItems = $state<Set<number>>(new Set());
	let titleVisible = $state(false);

	function createTitleObserver(element: HTMLElement) {
		if (!browser) return;
		let observer: IntersectionObserver | null = null;
		requestAnimationFrame(() => {
			observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							titleVisible = true;
							observer?.unobserve(entry.target);
						}
					}
				},
				{ threshold: 0.1, rootMargin: '0px' }
			);
			observer.observe(element);
		});
		return {
			destroy() {
				observer?.disconnect();
			}
		};
	}

	function createItemObserver(index: number) {
		return (element: HTMLElement) => {
			if (!browser) return;
			let observer: IntersectionObserver | null = null;
			requestAnimationFrame(() => {
				observer = new IntersectionObserver(
					(entries) => {
						for (const entry of entries) {
							if (entry.isIntersecting) {
								visibleItems = new Set([...visibleItems, index]);
								observer?.unobserve(entry.target);
							}
						}
					},
					{ threshold: 0.1, rootMargin: '0px' }
				);
				observer.observe(element);
			});
			return {
				destroy() {
					observer?.disconnect();
				}
			};
		};
	}
</script>

<section
	id="equipados"
	class="equip-section equip-section--harmony"
	aria-labelledby="equipados-heading"
	use:sectionObserver
	data-section-active={$sectionVisible}
>
	<div
		id="equipados-heading"
		use:createTitleObserver
		class="scroll-animate"
		data-item-active={titleVisible || undefined}
		style={`--scroll-animate-delay: ${animationDelay(0)}; --scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<Title eyebrow="" big="EQUIPAMIENTO" below="e interiores" />
	</div>

	<div class="equip-column">
		<div class="equip-outline">
			<ul
				class="equip-list"
				role="list"
				style="--equip-rows: {Math.ceil(lineaHarmony.length / 2)}"
			>
				{#each lineaHarmony as item, index (index)}
					{@const itemAction = createItemObserver(index)}
					<li
						use:itemAction
						class="scroll-animate"
						data-item-active={visibleItems.has(index) || undefined}
						style={`--scroll-animate-delay: ${animationDelay(index + 1)}; --scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration()};`}
					>
						<IconTextRow text={item.text}>
							{#snippet icon()}
								<SvgViewport viewBox="0 0 48 48" width="3rem" height="3rem" fit={true}>
									{@const Component = item.component}
									<Component />
								</SvgViewport>
							{/snippet}
						</IconTextRow>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	.equip-section {
		max-width: var(--max);
		margin: 0 auto;
	}

	.equip-section--harmony {
		margin: 1.625rem 0;
	}

	.equip-column {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.equip-outline {
		position: relative;
		padding: 1.5rem 1.25rem 1.25rem;
		background: var(--color-bg-canvas);
	}

	.equip-list {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: repeat(var(--equip-rows, 10), auto);
		grid-auto-flow: column;
		gap: 0 2.5rem;
		align-items: start;
		list-style: none;
		padding: 0;
		margin: 0 0 1.25rem;
	}

	@media (max-width: 900px) {
		.equip-list {
			grid-template-columns: 1fr;
			grid-template-rows: unset;
			grid-auto-flow: row;
		}
	}

	@media (max-width: 640px) {
		.equip-outline {
			padding: 1.25rem 1rem 1rem;
		}
	}
</style>
