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
		{ icon: '∼', component: Tilde, text: 'Puerta de ingreso con cerradura inteligente digital biométrica con wifi.' },
		{ icon: '∼', component: Tilde, text: 'Cocina integrada con bajo mesada y alacena de Melamina base MDF en gris grafito o madera. Opción de incluir dos puertas de vidrio con marco de aluminio e iluminación interna en alacena.' },
		{ icon: '∼', component: Tilde, text: 'Encimera de cocina con zócalo y desayunador de Pure Stone blanco (cuarzo natural color uniforme) más duradero que el granito natural.' },
		{ icon: '∼', component: Tilde, text: 'Anafe y horno a gas independientes empotrables.' },
		{ icon: '∼', component: Tilde, text: 'Iluminación led en zona de trabajo sobre mesada de la cocina.' },
		{ icon: '∼', component: Tilde, text: 'Revestimiento cerámico blanco en paredes de mesada.' },
		{ icon: '∼', component: Tilde, text: 'Gargantas y cenefas de los cielorrasos provistas con instalación de luces leds en living comedor, cocina y dormitorios.' },
		{ icon: '∼', component: Tilde, text: 'Revestimiento con panel de WPC en color madera en pared curvada del living.' },
		{ icon: '∼', component: Tilde, text: 'Vestidor con puertas de vidrio ahumado de dos paños fijos y uno corredizo con marco de aluminio.' },
		{ icon: '∼', component: Tilde, text: 'Dormitorios amplios con vestidor con doble placard, con cuatro cajones y pantalonera con rieles, correderas metálicas y estantes.' },
		{ icon: '∼', component: Tilde, text: 'Iluminación led en el interior de los placares con encendido/apagado táctil.' },
		{ icon: '∼', component: Tilde, text: 'Antebaño con mueble vanitory con un cajón en melamina base MDF color nogal, y cajón interno para maquillaje.' },
		{ icon: '∼', component: Tilde, text: 'Encimera de vanitory en silestone tabaco, nébula o marmol a elección.' },
		{ icon: '∼', component: Tilde, text: 'Espejo de vanitory en antebaño con luces led encendido/apagado táctil.' },
		{ icon: '∼', component: Tilde, text: 'Artefacto lumínico suspendido sobre vanitory con bulbo led.' },
		{ icon: '∼', component: Tilde, text: 'Bacha Ferrum modelo Tori Cilíndrica en sobremesada de vanitory.' },
		{ icon: '∼', component: Tilde, text: 'Cabina de ducha con mampara de vidrio de un paño fijo y otro corredizo en cristal color ámbar 5+5 laminado.' },
		{ icon: '∼', component: Tilde, text: 'Aplique led bidireccional en balcón con bulbo led.' }
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
	<p class="equip-intro" style="margin-bottom: 0; padding-bottom: 0;">
		<strong>
			Ofrecemos además otras terminaciones y equipamientos, para
			que tu departamento se adapte por completo a tu estilo de vida y necesidades.
		</strong>
	</p>

	<div
		id="equipados-luxury-heading"
		use:createTitleObserver
		class="scroll-animate"
		data-item-active={titleVisible || undefined}
		style={`--scroll-animate-delay: ${animationDelay(0)}; --scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<Title eyebrow="" big="Equipamiento opcional" below="Luxury Style" />
	</div>

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
