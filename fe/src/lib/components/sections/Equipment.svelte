<script module lang="ts">
	// ===== IMPORTS =====
	// SvelteKit
	import { browser } from '$app/environment';

	// Local components
	import Title from '$lib/components/ui/Title.svelte';
	import Highlight from '$lib/components/ui/Highlight.svelte';
	import IconTextRow from '$lib/components/ui/IconTextRow.svelte';
	import SvgViewport from '$lib/components/ui/SvgViewport.svelte';
	import Banos from '$lib/components/icons/Banos.svelte';
	import Carpinteria from '$lib/components/icons/Carpinteria.svelte';
	import Cocina from '$lib/components/icons/Cocina.svelte';
	import MesadaGranito from '$lib/components/icons/MesadaGranito.svelte';
	import Piso from '$lib/components/icons/Piso.svelte';
	import Puerta from '$lib/components/icons/Puerta.svelte';
	import Vestidor from '$lib/components/icons/Vestidor.svelte';
	import TechosAltos from '$lib/components/icons/TechosAltos.svelte';
	import Tilde from '$lib/components/icons/Tilde.svelte';

	// Local utilities
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
	import { pdfRequestModalStore } from '$lib/stores/pdfRequestModal';
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
			icon: '🚪',
			component: Puerta,
			text: 'Puertas de madera con diseño exclusivo que aportan calidez y moderna elegancia'
		},
		{
			icon: '🖼️',
			component: Carpinteria,
			text: 'Carpintería de aluminio Aluar Línea A30 NEW de alta prestación'
		},
		{
			icon: '🛁',
			component: Banos,
			text: 'Baños de diseño con grifería de primera calidad, vanitory, espejo y mampara de vidrio'
		},
		{
			icon: '👔',
			component: Vestidor,
			text: 'Vestidores completos con interiores diseñados a medida'
		},
		{
			icon: '⬜',
			component: Piso,
			text: 'Pisos de porcelanato de gran formato en los ambientes principales'
		},
		{
			icon: '🍽️',
			component: Cocina,
			text: 'Cocinas completamente equipadas con modernos muebles bajo y sobre mesada de granito natural con unidad de 4 hornallas y horno a gas.'
		},
		{
			icon: '🪵',
			component: MesadaGranito,
			text: 'Mesada y desayunador de granito natural'
		},
		{
			icon: '⬆️',
			component: TechosAltos,
			text: 'Techos altos'
		}
	];

	// Adicionales Línea Luxury (desde ficha técnica) — un solo icono tilde
	const lineaLuxury: EquipmentItem[] = [
		// PUERTAS
		{ icon: '∼', component: Tilde, text: 'Puerta de ingreso con cerradura inteligente digital biométrica con wifi.' },

		// COCINA
		{ icon: '∼', component: Tilde, text: 'Cocina integrada con bajo mesada y alacena de Melamina base MDF en gris grafito o madera. Opción de incluir dos puertas de vidrio con marco de aluminio e iluminación interna en alacena.' },
		{ icon: '∼', component: Tilde, text: 'Encimera de cocina con zócalo y desayunador de Pure Stone blanco (cuarzo natural color uniforme) más duradero que el granito natural.' },
		{ icon: '∼', component: Tilde, text: 'Iluminación led en zona de trabajo sobre mesada de la cocina.' },
		{ icon: '∼', component: Tilde, text: 'Revestimiento cerámico blanco en paredes de mesada.' },

		// LIVING
		{ icon: '∼', component: Tilde, text: 'Gargantas y cenefas de los cielorrasos provistas con instalación de luces leds en living comedor, cocina y dormitorios.' },
		{ icon: '∼', component: Tilde, text: 'Revestimiento con panel de WPC en color madera en pared curvada del living.' },

		// DORMITORIO Y VESTIDOR
		{ icon: '∼', component: Tilde, text: 'Vestidor con puertas de vidrio ahumado de dos paños fijos y uno corredizo con marco de aluminio color bronce.' },
		{ icon: '∼', component: Tilde, text: 'Puertas del vestidor corredizas de aluminio con vidrios ahumados de tres paños.' },
		{ icon: '∼', component: Tilde, text: 'Dormitorios amplios con vestidor con doble placard, con cuatro cajones y pantalonera con rieles, correderas metálicas y estantes.' },
		{ icon: '∼', component: Tilde, text: 'Iluminación led en el interior de los placares con encendido/apagado táctil.' },

		// BAÑO
		{ icon: '∼', component: Tilde, text: 'Antebaño con mueble vanitory con un cajón en melamina base MDF color nogal, y cajón interno para maquillaje.' },
		{ icon: '∼', component: Tilde, text: 'Encimera de vanitory en silestone tabaco, nébula o marmol a elección.' },
		{ icon: '∼', component: Tilde, text: 'Espejo de vanitory en antebaño con luces led encendido/apagado táctil.' },
		{ icon: '∼', component: Tilde, text: 'Artefacto lumínico suspendido sobre vanitory con bulbo led.' },
		{ icon: '∼', component: Tilde, text: 'Bacha Ferrum modelo Tori Cilíndrica en sobremesada de vanitory.' },
		{ icon: '∼', component: Tilde, text: 'Cabina de ducha con mampara de vidrio de un paño fijo y otro corredizo de cristal color ámbar 5+5 laminado.' },
		{ icon: '∼', component: Tilde, text: 'Aplique led bidireccional en balcón con bulbo led.' }
	];

	const LUXURY_INTRO =
		'y aún puedes agregar más tecnología y estilo a tu nuevo departamento. Sumá a tu vivienda la experiencia LUXURY!';
</script>

<script lang="ts">
	// ===== INSTANCE CONSTANTS =====
	const { action: equipmentObserver, visible: equipmentVisible } = createSectionObserver(
		'equipment',
		{
			threshold: ANIMATION.threshold.section
		}
	);

	// ===== STATE =====
	let visibleHarmony = $state<Set<number>>(new Set());
	let visibleLuxury = $state<Set<number>>(new Set());
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

	function createItemObserver(opts: { column: 'harmony' | 'luxury'; index: number }) {
		return (element: HTMLElement) => {
			if (!browser) return;

			let observer: IntersectionObserver | null = null;
			const { column, index } = opts;

			requestAnimationFrame(() => {
				observer = new IntersectionObserver(
					(entries) => {
						for (const entry of entries) {
							if (entry.isIntersecting) {
								if (column === 'harmony') {
									visibleHarmony = new Set([...visibleHarmony, index]);
								} else {
									visibleLuxury = new Set([...visibleLuxury, index]);
								}
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
		};
	}

</script>

<section
	id="equipados"
	class="equip"
	aria-labelledby="equipados-heading"
	use:equipmentObserver
	data-section-active={$equipmentVisible}
>
	<div
		id="equipados-heading"
		use:createTitleObserver
		class="scroll-animate"
		data-item-active={titleVisible || undefined}
		style={`--scroll-animate-delay: ${animationDelay(0)}; --scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<Title eyebrow="" big="EQUIPAMIENTO" isSubtitle={true} />
	</div>

	<div class="equip-columns">
		<!-- LINEA HARMONY -->
		<div
			class="equip-column"
			role="tabpanel"
			id="panel-harmony"
			aria-labelledby="tab-harmony"
			data-series="harmony"
		>
			<div class="equip-outline">
				<ul
					class="equip-list"
					role="list"
					style="--equip-rows: {Math.ceil(lineaHarmony.length / 2)}"
				>
					{#each lineaHarmony as item, index (index)}
						{@const harmonyAction = createItemObserver({ column: 'harmony', index })}
						<li
							use:harmonyAction
							class="scroll-animate"
							data-item-active={visibleHarmony.has(index) || undefined}
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

		<p
			class="equip-terminaciones-intro"
			style="margin-bottom: 0; padding-bottom: 0;"
		>
			<strong>
				Además, podrás elegir entre otras opciones de terminaciones y equipamiento, para
				que tu departamento se adapte por completo a tu estilo de vida y necesidades.
			</strong>
		</p>
		<p
			class="equip-terminaciones-intro"
			style="margin-top: 0; padding-top: 0; text-transform: uppercase;"
		>
			Adicionales aplicables a cualquiera de los planos.
		</p>

		<!-- LINEA LUXURY -->
		<div
			class="equip-column"
			role="tabpanel"
			id="panel-luxury"
			aria-labelledby="tab-luxury"
			data-series="luxury"
		>
			<div class="equip-outline">
				<ul
					class="equip-list"
					role="list"
					style="--equip-rows: {Math.ceil(lineaLuxury.length / 2)}"
				>
					{#each lineaLuxury as item, index (index)}
						{@const luxuryAction = createItemObserver({ column: 'luxury', index })}
						<li
							use:luxuryAction
							class="scroll-animate"
							data-item-active={visibleLuxury.has(index) || undefined}
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
				<div class="equip-ficha-wrap">
					<button
						type="button"
						class="equip-ficha btn-cta-primary"
						onclick={() => pdfRequestModalStore.open('ficha-tecnica')}
						aria-label="Descargar ficha técnica"
					>SOLICITAR FICHA TÉCNICA</button>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	#equipados {
		max-width: var(--max);
		margin: 0 auto;
	}

	.equip {
		margin: 1.625rem 0;
	}

	.equip-title-wrap {
		text-align: center;
		margin-bottom: 2rem;
	}

	.equip-title-wrap :global(.title) {
		display: block;
	}

	/* Mobile: hide title; show both columns stacked */
	@media (max-width: 1080px) {
		.equip-title-wrap {
			display: none;
		}
	}

	.equip-columns {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		align-items: start;
	}

	.equip-column {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	/* House-shaped outline (chevron peak at top) */
	.equip-outline {
		position: relative;
		padding: 1.5rem 1.25rem 1.25rem;
		background: var(--color-bg-canvas);
	}

	.equip-rule {
		margin: 1.25rem auto 1rem;
		width: 50%;
		min-width: 8rem;
		border: none;
		border-top: 2px solid var(--color-accent-primary, var(--ref-brand-primary));
		opacity: 0.4;
	}

	.equip-terminaciones-intro {
		margin: 1rem 0;
		font-size: 1.6rem;
	}

	.equip-ficha-wrap {
		text-align: center;
		margin-top: 0.5rem;
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

	.equip-ficha {
		display: inline-block;
		padding: 0.6rem 1.25rem;
		font-size: 1rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--color-text-on-accent);
		background: var(--ref-cta-teal);
		border: 1px solid var(--ref-cta-teal-hover);
		border-radius: 4px;
		text-decoration: none;
		cursor: pointer;
		font-family: inherit;
		transition: background 0.2s, color 0.2s, opacity 0.2s;
	}

	.equip-ficha:hover {
		opacity: 0.9;
		background: var(--ref-cta-teal-hover);
		color: var(--color-text-on-accent);
	}
</style>
