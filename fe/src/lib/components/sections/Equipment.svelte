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
	import CerraduraDigital from '$lib/components/icons/CerraduraDigital.svelte';
	import Cocina from '$lib/components/icons/Cocina.svelte';
	import Horno from '$lib/components/icons/Horno.svelte';
	import Piso from '$lib/components/icons/Piso.svelte';
	import Puerta from '$lib/components/icons/Puerta.svelte';
	import Termotanque from '$lib/components/icons/Termotanque.svelte';
	import Vestidor from '$lib/components/icons/Vestidor.svelte';
	import TechosAltos from '$lib/components/icons/TechosAltos.svelte';

	// Local utilities
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
			icon: '🚪',
			component: Puerta,
			text: 'Puertas de madera con diseño exclusivo que aportan calidez y moderna elegancia.'
		},
		{
			icon: '🖼️',
			component: Carpinteria,
			text: 'Carpintería de aluminio Aluar Línea A30 NEW de alta prestación.'
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
			text: 'Cocinas completamente equipadas con modernos muebles bajo y sobre mesada de granito natural.'
		},
		{
			icon: '🍽️',
			component: Cocina,
			text: 'Mesada y desayunador de granito natural'
		},
		{
			icon: '⬆️',
			component: TechosAltos,
			text: 'Techos altos'
		}
	];

	const lineaLuxury: EquipmentItem[] = [
		{
			icon: '🍳',
			component: Horno,
			text: 'Anafe y horno a gas empotrados de diseño moderno y alta funcionalidad.'
		},
		{
			icon: '🌡️',
			component: Termotanque,
			text: 'Agua caliente asegurada mediante termotanques eléctricos individuales de alta recuperación.'
		},
		{
			icon: '🔐',
			component: CerraduraDigital,
			text: 'Acceso smart con cerradura biométrica y WiFi para máxima seguridad y confort.'
		}
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
		class="scroll-animate equip-title-wrap"
		data-item-active={titleVisible || undefined}
		style={`--scroll-animate-delay: ${animationDelay(0)}; --scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<Title eyebrow="Cómo vienen" big="EQUIPADOS" />
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
				<ul class="equip-list" role="list">
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
				<hr class="equip-rule" />
			</div>
		</div>

		<p class="equip-terminaciones-intro">
			Además, se podrá elegir entre distintas opciones de terminaciones y niveles de equipamiento, para
			adaptar la calidad de cada ambiente a tus necesidades, como se detalla a continuación.
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
				<ul class="equip-list" role="list">
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
					<button type="button" class="equip-ficha" data-ficha-tecnica>FICHA TECNICA</button>
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
		text-align: center;
		font-size: 1.4rem;
	}

	.equip-ficha-wrap {
		text-align: center;
		margin-top: 0.5rem;
	}

	.equip-list {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0 2.5rem;
		align-items: start;
		list-style: none;
		padding: 0;
		margin: 0 0 1.25rem;
	}

	@media (max-width: 900px) {
		.equip-list {
			grid-template-columns: 1fr;
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
		color: var(--color-bg-canvas, #fff);
		background: var(--color-contrast-low, #444);
		border: 1px solid var(--color-border-default, var(--ref-neutral-500));
		border-radius: 4px;
		text-decoration: none;
		cursor: pointer;
		font-family: inherit;
		transition: background 0.2s, color 0.2s, opacity 0.2s;
	}

	.equip-ficha:hover {
		opacity: 0.9;
		background: var(--color-contrast-low, #444);
		color: var(--color-bg-canvas, #fff);
	}
</style>
