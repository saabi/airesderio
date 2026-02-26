<script module lang="ts">
	// ===== IMPORTS =====
	// SvelteKit
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	// Local components
	import Title from '$lib/components/ui/Title.svelte';
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
	import SeriesHarmony from '$lib/components/icons/SeriesHarmony.svelte';
	import SeriesLuxury from '$lib/components/icons/SeriesLuxury.svelte';
	import HarmonyText from '$lib/components/icons/HarmonyText.svelte';
	import LuxuryText from '$lib/components/icons/LuxuryText.svelte';

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
			text: 'Cocinas completamente equipadas con modernos muebles de guardado bajo y sobre mesada.'
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
	/** Mobile tab selection (used when viewport < 900px) */
	let selectedSeries = $state<'harmony' | 'luxury'>('harmony');
	let isMobile = $state(false);

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

	// ===== LIFECYCLE =====
	const EQUIP_MOBILE_BREAKPOINT = 900;
	onMount(() => {
		if (!browser) return;
		const mq = window.matchMedia(`(max-width: ${EQUIP_MOBILE_BREAKPOINT}px)`);
		isMobile = mq.matches;
		const handler = () => {
			isMobile = mq.matches;
		};
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});
</script>

<section
	id="equipados"
	class="equip"
	aria-labelledby="equipados-heading"
	use:equipmentObserver
	data-section-active={$equipmentVisible}
>
	<div
		use:createTitleObserver
		class="scroll-animate equip-title-wrap"
		data-item-active={titleVisible || undefined}
		style={`--scroll-animate-delay: ${animationDelay(0)}; --scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<Title eyebrow="Cómo vienen" big="EQUIPADOS" />
	</div>

	<!-- Mobile-only tab bar (visible under 900px) -->
	<div class="equip-tabs" role="tablist" aria-label="Líneas de equipamiento">
		<button
			type="button"
			class="equip-tab"
			role="tab"
			id="tab-harmony"
			aria-selected={selectedSeries === 'harmony'}
			aria-controls="panel-harmony"
			onclick={() => (selectedSeries = 'harmony')}
		>
			<span class="equip-tab-inner">
				<SvgViewport viewBox="0 0 48 48" width="3rem" height="3rem" fit={true}>
					<SeriesHarmony />
				</SvgViewport>
				<span class="equip-tab-label">
					<span class="equip-title-line">LINEA</span>
					<SvgViewport viewBox="0 0 541 72" width="10rem" height="2rem" fit={true} align="left">
						<HarmonyText />
					</SvgViewport>
				</span>
			</span>
		</button>
		<button
			type="button"
			class="equip-tab"
			role="tab"
			id="tab-luxury"
			aria-selected={selectedSeries === 'luxury'}
			aria-controls="panel-luxury"
			onclick={() => (selectedSeries = 'luxury')}
		>
			<span class="equip-tab-inner">
				<SvgViewport viewBox="0 0 48 48" width="3rem" height="3rem" fit={true}>
					<SeriesLuxury />
				</SvgViewport>
				<span class="equip-tab-label">
					<span class="equip-title-line">LINEA</span>
					<SvgViewport viewBox="0 0 316.31 54.77" width="8rem" height="2rem" fit={true} align="left">
						<LuxuryText />
					</SvgViewport>
				</span>
			</span>
		</button>
	</div>

	<div class="equip-columns" data-selected={selectedSeries}>
		<!-- LINEA HARMONY -->
		<div
			class="equip-column"
			role="tabpanel"
			id="panel-harmony"
			aria-labelledby="tab-harmony"
			data-series="harmony"
			hidden={isMobile && selectedSeries !== 'harmony'}
		>
			<div class="equip-column-header">
				<div class="equip-column-icon-wrap">
					<!-- Lotus (stylized) -->
					<SvgViewport viewBox="0 0 48 48" width="10rem" height="10rem">
						<SeriesHarmony />
					</SvgViewport>
				</div>
				<h3 class="equip-column-title">
					<span class="equip-title-line">LINEA</span>
					<!-- Harmony wordmark: native viewBox 540.14×73.66 (rounded to 541×72) -->
					<SvgViewport viewBox="0 0 541 72" width="20rem" height="3rem" fit={true} align="left">
						<HarmonyText />
					</SvgViewport>
				</h3>
			</div>
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
							<SvgViewport viewBox="0 0 48 48" width="4.5rem" height="4.5rem" fit={true}>
								{@const Component = item.component}
								<Component />
							</SvgViewport>
							<span>{item.text}</span>
						</li>
					{/each}
				</ul>
				<div class="equip-ficha-wrap">
					<button type="button" class="equip-ficha" data-ficha-tecnica>FICHA TECNICA</button>
				</div>
			</div>
		</div>

		<!-- LINEA LUXURY -->
		<div
			class="equip-column"
			role="tabpanel"
			id="panel-luxury"
			aria-labelledby="tab-luxury"
			data-series="luxury"
			hidden={isMobile && selectedSeries !== 'luxury'}
		>
			<div class="equip-column-header">
				<div class="equip-column-icon-wrap">
					<!-- Diamond -->
					<SvgViewport viewBox="0 0 48 48" width="10rem" height="10rem">
						<SeriesLuxury />
					</SvgViewport>
				</div>
				<h3 class="equip-column-title">
					<!-- Luxury wordmark: native viewBox 316.31×54.77 (must match path bounds or graphic appears shorter) -->
					<span class="equip-title-line">LINEA</span>
					<SvgViewport viewBox="0 0 316.31 54.77" width="16rem" height="3rem" fit={true} align="left">
						<LuxuryText />
					</SvgViewport>
				</h3>
			</div>
			<p class="equip-luxury-intro">{LUXURY_INTRO}</p>
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
							<SvgViewport viewBox="0 0 48 48" width="4.5rem" height="4.5rem">
								{@const Component = item.component}
								<Component />
							</SvgViewport>
							<span>{item.text}</span>
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
		margin-bottom: 2rem;
	}

	/* Mobile-only tab bar: hidden on desktop */
	.equip-tabs {
		display: none;
	}

	@media (max-width: 900px) {
		.equip-tabs {
			display: flex;
			flex-direction: row;
			gap: 0;
			margin-bottom: 1.25rem;
			border-bottom: 2px solid var(--color-border-default, var(--ref-neutral-400));
		}

		/* Show only the panel matching the selected tab */
		.equip-columns[data-selected='harmony'] .equip-column[data-series='luxury'] {
			display: none;
		}
		.equip-columns[data-selected='luxury'] .equip-column[data-series='harmony'] {
			display: none;
		}

		.equip-tab {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0.75rem 0.5rem;
			font: inherit;
			color: var(--color-contrast-low);
			background: transparent;
			border: none;
			border-bottom: 3px solid transparent;
			margin-bottom: -2px;
			cursor: pointer;
			transition: border-color 0.2s, background 0.2s;
		}

		.equip-tab:hover {
			background: var(--color-bg-muted, var(--ref-neutral-200));
		}

		.equip-tab[aria-selected='true'] {
			border-bottom-color: var(--color-accent-primary, var(--ref-brand-primary));
			background: var(--color-bg-muted, var(--ref-neutral-200));
		}

		.equip-tab:focus-visible {
			outline: 2px solid var(--color-accent-primary, var(--ref-brand-primary));
			outline-offset: 2px;
		}

		.equip-tab-inner {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 0.5rem;
		}

		.equip-tab-label {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			text-align: left;
			font-size: 0.875rem;
			font-weight: 600;
			letter-spacing: 0.02em;
			text-transform: uppercase;
		}

		/* On mobile, hide per-panel headers; tab bar is the header */
		.equip-column-header {
			display: none;
		}
	}

	.equip-columns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem 3rem;
		align-items: start;
	}

	@media (max-width: 900px) {
		.equip-columns {
			grid-template-columns: 1fr;
		}
	}

	.equip-column {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.equip-column-header {
		display: grid;
		grid-auto-flow: column;
		align-items: end;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	.equip-column-title {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--color-contrast-low);
		line-height: 1.2;
		text-transform: uppercase;
		justify-content: center;
	}

	.equip-title-line {
		display: block;
	}

	.equip-column-icon-wrap {
		justify-content: center;
		width: 100%;
	}

	.equip-column-icon {
		width: 4.5rem;
		height: 4.5rem;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-muted, var(--ref-neutral-200));
		border: 1px solid var(--color-border-default, var(--ref-neutral-400));
		border-radius: 2px;
		color: var(--color-contrast-low);
	}

	.equip-luxury-intro {
		margin: 0 0 1.25rem;
		font-size: 1rem;
		line-height: 1.45;
		color: var(--color-contrast-low);
		text-align: right;
	}

	@media (max-width: 900px) {
		.equip-luxury-intro {
			text-align: left;
		}
	}

	.equip-adicionales-title {
		margin: 0 0 1rem;
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--ref-ink, var(--color-contrast-low));
		text-align: center;
	}

	/* Orange house-shaped outline (chevron peak at top) */
	.equip-outline {
		position: relative;
		padding: 1.5rem 1.25rem 1.25rem;
		border: 2px solid var(--color-accent-primary, var(--ref-brand-primary));
		/* House shape: top edge with V peak in the center */
		clip-path: polygon(
			0 0,
			42% 0,
			50% 6%,
			58% 0,
			100% 0,
			100% 100%,
			0 100%,
			0 0
		);
		background: var(--color-bg-canvas);
	}

	.equip-outline .equip-adicionales-title {
		margin-top: 0;
	}

	.equip-ficha-wrap {
		text-align: center;
		margin-top: 0.5rem;
	}

	.equip-list {
		display: flex;
		flex-direction: column;
		gap: 0;
		list-style: none;
		padding: 0;
		margin: 0 0 1.25rem;
	}

	.equip-list li {
		display: grid;
		grid-template-columns: 3rem 1fr;
		gap: 1.5rem;
		align-items: center;
		padding: 1rem 0;
	}

	@media (max-width: 640px) {
		.equip-list li {
			gap: 1rem;
			padding: 0.75rem 0;
		}
		.equip-outline {
			padding: 1.25rem 1rem 1rem;
		}
	}

	.equip-list li span {
		position: relative;
		padding: 0.75rem 0;
		font-size: 1.4rem;
		line-height: 1.4;
		color: var(--color-contrast-low);
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
