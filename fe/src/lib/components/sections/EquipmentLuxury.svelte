<script module lang="ts">
	// ===== IMPORTS =====
	import { browser } from '$app/environment';

	import Title from '$lib/components/ui/Title.svelte';
	import IconTextRow from '$lib/components/ui/IconTextRow.svelte';
	import SvgViewport from '$lib/components/ui/SvgViewport.svelte';
	import Tilde from '$lib/components/icons/Tilde.svelte';

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
	const lineaLuxury: EquipmentItem[] = [
		{
			icon: '∼',
			component: Tilde,
			text: 'Preinstalación para lavarropas y secarropas en espacio dedicado.'
		},
		{
			icon: '∼',
			component: Tilde,
			text: 'Diseño lumínico led integral que brinda una experiencia envolvente en la cocina, comedor, living, dormitorios y prebaño. Provisión de iluminación dentro de los placares, en la zona de trabajo de la mesada de cocina y en vanitory con encendido táctil.'
		},
		{
			icon: '∼',
			component: Tilde,
			text: 'Puerta de ingreso con cerradura digital biométrica inteligente, que permite acceso remoto desde tu celular mediante conexión WiFi.'
		},
		{
			icon: '∼',
			component: Tilde,
			text: 'Encimera de cocina, zócalo y desayunador en Pure Stone blanco (cuarzo natural de color uniforme), más resistente y duradero que el granito natural.'
		},
		{
			icon: '∼',
			component: Tilde,
			text: 'Horno y anafe a gas empotrados de manera independiente.'
		},
		{
			icon: '∼',
			component: Tilde,
			text: 'Revestimiento en tecnología símil madera que aporta calidez y un toque exclusivo a las terminaciones del ambiente.'
		}
	];
</script>

<script lang="ts">
	const { action: sectionObserver, visible: sectionVisible } = createSectionObserver(
		'equipados-luxury',
		{ threshold: ANIMATION.threshold.section }
	);

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
	id="equipados-luxury"
	class="equip-section equip-section--luxury"
	aria-labelledby="equipados-luxury-heading"
	use:sectionObserver
	data-section-active={$sectionVisible}
>
	<div
		id="equipados-luxury-heading"
		use:createTitleObserver
		class="scroll-animate"
		data-item-active={titleVisible || undefined}
		style={`--scroll-animate-delay: ${animationDelay(0)}; --scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<Title eyebrow="" big="Equipamiento opcional" below="Luxury Style" />
	</div>

	<p class="equip-intro">
		<strong>
			Adicionalmente, ofrecemos terminaciones y equipamientos que permiten adaptar tu departamento completamente a tu estilo de vida y necesidades. Descubrí un espacio pensado para evolucionar con vos, donde podés personalizar tus ambientes con tecnología de vanguardia y un diseño interior sofisticado. Departamentos completamente equipados, listos para habitar y disfrutar.
		</strong>
	</p>

	<div class="equip-column">
		<div class="equip-outline">
			<ul
				class="equip-list"
				role="list"
				style="--equip-rows: {Math.ceil(lineaLuxury.length / 2)}"
			>
				{#each lineaLuxury as item, index (index)}
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
			<div class="equip-ficha-wrap">
				<button
					type="button"
					class="equip-ficha btn-cta-primary"
					onclick={() => pdfRequestModalStore.open('ficha-tecnica')}
					aria-label="Descargar ficha técnica"
				>
					SOLICITAR FICHA TÉCNICA
				</button>
			</div>
		</div>
	</div>
</section>

<style>
	.equip-section {
		max-width: var(--max);
		margin: 0 auto;
	}

	.equip-section--luxury {
		margin: 1.625rem 0;
	}

	.equip-intro {
		margin: 1rem 0;
		font-size: 1.6rem;
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

	.equip-ficha-wrap {
		text-align: center;
		margin-top: 0.5rem;
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
