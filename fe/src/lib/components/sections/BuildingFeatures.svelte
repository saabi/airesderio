<script module lang="ts">
	// ===== IMPORTS =====
	import { browser } from '$app/environment';

	import Title from '$lib/components/ui/Title.svelte';
	import SvgViewport from '$lib/components/ui/SvgViewport.svelte';
	import Ascensores from '$lib/components/icons/Ascensores.svelte';
	import AguaSanitarias from '$lib/components/icons/AguaSanitarias.svelte';
	import EnergiaElectrica from '$lib/components/icons/EnergiaElectrica.svelte';
	import Estacionamiento from '$lib/components/icons/Estacionamiento.svelte';
	import GasNatural from '$lib/components/icons/GasNatural.svelte';
	import LadrillosCeramicos from '$lib/components/icons/LadrillosCeramicos.svelte';
	import TerrazaPiscina from '$lib/components/icons/TerrazaPiscina.svelte';
	import Ubicacion from '$lib/components/icons/Ubicacion.svelte';
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
	import {
		ANIMATION,
		animationDelay,
		animationDuration,
		animationOffset
	} from '$lib/constants/animation';

	type LeftBulletItem = {
		text: string;
		icon: 'location' | 'parking' | 'ascensores' | 'electric';
	};

	const leftBullets: LeftBulletItem[] = [
		{
			icon: 'location',
			text: 'Ubicado en el área donde todo ocurre, shopping, diversión, zonas verdes, deportes, eventos culturales, restaurantes y pubs.'
		},
		{
			icon: 'parking',
			text: 'Sobre una avenida con doble estacionamiento.'
		},
		{
			icon: 'ascensores',
			text: 'Dos ascensores desde el subsuelo hasta la terraza.'
		},
		{
			icon: 'electric',
			text: 'Instalación eléctrica con materiales de primera calidad siguiendo normativas AEA 90364 e IRAM.'
		},
		{
			icon: 'electric',
			text: 'Suministro eléctrico confiable garantizado por transformador propio en el edificio.'
		}
	];

	type ExtraInfraItem = {
		text: string;
		icon: 'gas' | 'water' | 'walls' | 'terrace';
	};

	const extraInfra: ExtraInfraItem[] = [
		{
			icon: 'gas',
			text: 'Conexión de gas natural.'
		},
		{
			icon: 'water',
			text: 'Conexiones de agua y sanitarias con materiales marca AWADUCT y TIGRE.'
		},
		{
			icon: 'walls',
			text: 'Muros con ladrillos cerámicos huecos de reconocida marca del medio.'
		},
		{
			icon: 'terrace',
			text: 'Terraza con piscina y deck húmedo.'
		}
	];
</script>

<script lang="ts">
	const { action: sectionObserver, visible: sectionVisible } = createSectionObserver(
		'building-features',
		{ threshold: ANIMATION.threshold.section }
	);

	let titleVisible = $state(false);

	function createTitleObserver(node: HTMLElement) {
		if (!browser) {
			titleVisible = true;
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						titleVisible = true;
						observer.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.1 }
		);
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			}
		};
	}
</script>

<section
	id="building-features"
	class="building-features"
	aria-labelledby="building-features-heading"
	use:sectionObserver
	data-section-active={$sectionVisible}
>
	<div
		use:createTitleObserver
		class="scroll-animate bf-title-wrap"
		data-item-active={titleVisible || undefined}
		style={`--scroll-animate-delay: ${animationDelay(0)}; --scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<Title eyebrow="Características del" big="EDIFICIO" />
	</div>
	<div class="bf-frame">
		<!-- Top row: intro left, CTA right (per mockup) -->
		<header class="bf-header">
			<div
				use:createTitleObserver
				class="scroll-animate bf-intro"
				data-item-active={titleVisible || undefined}
				style={`--scroll-animate-delay: ${animationDelay(0)}; --scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
			>
				<h2 id="building-features-heading" class="bf-heading">Si buscas</h2>
				<p class="bf-subheading">un estilo de vida urbano y vibrante</p>
				<p class="bf-brand-line">
					<span class="bf-brand">AIRES DE RÍO</span> es para vos.
				</p>
				<p class="bf-brand-departamentos">DEPARTAMENTOS</p>
			</div>
			<div class="bf-cta-wrap">
				<button
					type="button"
					class="bf-cta"
					data-ficha-tecnica
					aria-label="Ver más detalles técnicos del edificio"
				>
					Más detalles técnicos de tu edificio
				</button>
			</div>
		</header>
		<!-- Main content: left bullets | right gas + extras -->
		<div class="bf-columns">
			<!-- Left column -->
			<div class="bf-left">
				<ul class="bf-bullets" role="list">
					{#each leftBullets as item, i (i)}
						<li
							class="scroll-animate bf-bullet"
							data-item-active={titleVisible || undefined}
							style={`--scroll-animate-delay: ${animationDelay(i + 1)}; --scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration()};`}
						>
							<span class="bf-bullet-icon" aria-hidden="true">
								{#if item.icon === 'ascensores'}
									<SvgViewport viewBox="0 0 48 48" width="3rem" height="3rem">
										<Ascensores />
									</SvgViewport>
								{:else if item.icon === 'electric'}
									<SvgViewport viewBox="0 0 48 48" width="3rem" height="3rem">
										<EnergiaElectrica />
									</SvgViewport>
								{:else if item.icon === 'location'}
									<SvgViewport viewBox="0 0 48 48" width="3rem" height="3rem">
										<Ubicacion />
									</SvgViewport>
								{:else}
									<SvgViewport viewBox="0 0 48 48" width="3rem" height="3rem">
										<Estacionamiento />
									</SvgViewport>
								{/if}
							</span>
							<span class="bf-bullet-text">{item.text}</span>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Right column: extra infra list -->
			<div class="bf-right">
				<ul class="bf-extra" role="list">
					{#each extraInfra as item, i (item.text)}
						<li
							class="scroll-animate bf-extra-item"
							data-item-active={titleVisible || undefined}
							style={`--scroll-animate-delay: ${animationDelay(i + 1)}; --scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration()};`}
						>
							<span class="bf-extra-icon" aria-hidden="true">
								{#if item.icon === 'gas'}
									<SvgViewport viewBox="0 0 48 48" width="3rem" height="3rem">
										<GasNatural />
									</SvgViewport>
								{:else if item.icon === 'water'}
									<SvgViewport viewBox="0 0 48 48" width="3rem" height="3rem">
										<AguaSanitarias />
									</SvgViewport>
								{:else if item.icon === 'walls'}
									<SvgViewport viewBox="0 0 48 48" width="3rem" height="3rem">
										<LadrillosCeramicos />
									</SvgViewport>
								{:else}
									<SvgViewport viewBox="0 0 48 48" width="3rem" height="3rem">
										<TerrazaPiscina />
									</SvgViewport>
								{/if}
							</span>
							<span class="bf-extra-text">{item.text}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</section>

<style>
	.building-features {
		max-width: var(--max, 1200px);
		margin: 2rem auto;
	}

	.bf-frame {
		border: 2px solid var(--color-accent-primary, var(--ref-brand-primary));
		border-radius: 6px;
		padding: 2rem;
		background: var(--color-bg-canvas);
	}

	.bf-header {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1.5rem 2rem;
		align-items: start;
		margin-bottom: 2rem;
	}

	@media (max-width: 900px) {
		.bf-header {
			grid-template-columns: 1fr;
			margin-bottom: 1.5rem;
		}
	}

	.bf-cta-wrap {
		display: flex;
		justify-content: flex-end;
		align-items: flex-start;
	}

	@media (max-width: 900px) {
		.bf-cta-wrap {
			justify-content: stretch;
		}
	}

	@media (max-width: 640px) {
		.bf-frame {
			padding: 1.25rem;
		}
	}

	.bf-columns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2.5rem;
		align-items: start;
	}

	@media (max-width: 900px) {
		.bf-columns {
			grid-template-columns: 1fr;
		}
	}

	.bf-heading {
		margin: 0 0 0.25rem;
		font-size: clamp(1.75rem, 4vw, 2.25rem);
		font-weight: 700;
		color: var(--ref-ink, var(--color-contrast-low));
	}

	.bf-subheading {
		margin: 0 0 1rem;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--ref-ink, var(--color-contrast-low));
	}

	.bf-brand {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-contrast-low);
		letter-spacing: 0.02em;
	}

	.bf-brand-line {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--ref-ink, var(--color-contrast-low));
		letter-spacing: 0.02em;
	}

	.bf-brand-line .bf-brand {
		display: inline;
		color: var(--color-contrast-low);
	}

	.bf-brand-departamentos {
		margin: 0.25rem 0 1.5rem;
		font-size: 0.95rem;
		color: var(--color-contrast-low);
	}

	.bf-bullets {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.bf-bullet {
		display: grid;
		grid-template-columns: 3rem 1fr;
		gap: 1.25rem;
		align-items: center;
		padding: 0.85rem 0;
	}

	.bf-bullet-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-contrast-low);
	}

	.bf-bullet-text {
		font-size: 1.4rem;
		line-height: 1.4;
		color: var(--color-contrast-low);
	}

	.bf-right {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.bf-cta {
		display: block;
		white-space: normal;
		max-width: 18rem;
		padding: 0.75rem 1rem;
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		text-align: center;
		color: var(--color-bg-canvas);
		background: var(--color-accent-primary, var(--ref-brand-primary));
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-family: inherit;
		transition: opacity 0.2s, transform 0.15s;
	}

	@media (max-width: 900px) {
		.bf-cta {
			max-width: none;
		}
	}

	.bf-cta:hover {
		opacity: 0.92;
	}

	.bf-cta:focus-visible {
		outline: 2px solid var(--color-accent-primary);
		outline-offset: 2px;
	}

	.bf-extra {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.bf-extra-item {
		display: grid;
		grid-template-columns: 3rem 1fr;
		gap: 1.25rem;
		align-items: center;
		padding: 0.85rem 0;
	}

	.bf-extra-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-contrast-low);
	}

	.bf-extra-text {
		font-size: 1.4rem;
		line-height: 1.4;
		color: var(--color-contrast-low);
	}
</style>
