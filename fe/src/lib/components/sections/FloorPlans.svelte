<script module lang='ts'>
	// ===== IMPORTS =====
	import Title from '$lib/components/ui/Title.svelte';
	import VisuallyHidden from '$lib/components/ui/VisuallyHidden.svelte';

	// Local utilities
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
	import {
		ANIMATION,
		animationDelay,
		animationDuration,
		animationOffset
	} from '$lib/constants/animation';

	// ===== TYPES =====
	interface FloorPlan {
		image: string;
		title: string;
		description: string;
	}

	// ===== STATIC CONSTANTS =====
	const FLOOR_PLANS: FloorPlan[] = [
		{
			image: '/planos/1ra-planta-4-deptos.png',
			title: 'Primera Planta - 4 Departamentos',
			description: 'Plano de la primera planta con 4 departamentos de 1 dormitorio cada uno.'
		},
		{
			image: '/planos/1ra-planta-4-deptos-a.png',
			title: 'Primera Planta - 4 Departamentos (Alternativa)',
			description: 'Vista alternativa de la primera planta con distribución de los 4 departamentos.'
		},
		{
			image: '/planos/2 OCTUBRE_MODELO 1ra PLANTA_4 DPTOS 1 DORM.jpg',
			title: 'Modelo Octubre - Primera Planta',
			description: 'Modelo de octubre: primera planta con 4 departamentos de 1 dormitorio.'
		},
		{
			image: '/planos/2da-planta-3-deptos.png',
			title: 'Segunda Planta - 3 Departamentos',
			description: 'Plano de la segunda planta con 3 departamentos, incluyendo 2 departamentos de 1 dormitorio y 1 departamento doble.'
		},
		{
			image: '/planos/2da-planta-3-deptos-a.png',
			title: 'Segunda Planta - 3 Departamentos (Alternativa)',
			description: 'Vista alternativa de la segunda planta con distribución de los 3 departamentos.'
		},
		{
			image: '/planos/2 OCTUBRE_MODELO 2da PLANTA_2 DPTOS 1 DORM_1 DEPTO DOBLE.jpg',
			title: 'Modelo Octubre - Segunda Planta',
			description: 'Modelo de octubre: segunda planta con 2 departamentos de 1 dormitorio y 1 departamento doble.'
		}
	];
</script>

<script lang='ts'>
	// ===== STATE =====
	let currentPlanIndex = $state(0);

	// ===== DERIVED =====
	let currentPlan = $derived.by(() => FLOOR_PLANS[currentPlanIndex]);

	// ===== INSTANCE CONSTANTS =====
	const { action: floorPlansObserver, visible: floorPlansVisible } = createSectionObserver(
		'floor-plans',
		{
			threshold: ANIMATION.threshold.section
		}
	);

	// ===== FUNCTIONS =====
	function nextPlan() {
		currentPlanIndex = (currentPlanIndex + 1) % FLOOR_PLANS.length;
	}

	function previousPlan() {
		currentPlanIndex = (currentPlanIndex - 1 + FLOOR_PLANS.length) % FLOOR_PLANS.length;
	}

	function goToPlan(index: number) {
		currentPlanIndex = index;
	}
</script>

<section
	id='planos'
	aria-labelledby='planos-heading'
	use:floorPlansObserver
	data-section-active={$floorPlansVisible}
>
	<VisuallyHidden id='planos-heading' tag='h2'>Planos</VisuallyHidden>
	<div
		class='scroll-animate'
		style={`--scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<Title eyebrow='Distribución y' big='PLANOS' />
	</div>
	<div
		class='floor-plans-container scroll-animate'
		style={`--scroll-animate-delay: ${animationDelay(1)}; --scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<div class='carousel-wrapper' role='region' aria-label='Galería de planos de distribución'>
			{#each FLOOR_PLANS as plan, index}
				<div
					class='carousel-image'
					class:active={index === currentPlanIndex}
					style="background-image: url('{plan.image}')"
					role='img'
					aria-label={`Plano ${index + 1}: ${plan.title}`}
				></div>
			{/each}
			{#if FLOOR_PLANS.length > 1}
				<div class='carousel-navigation'>
					<button
						class='carousel-button prev'
						onclick={previousPlan}
						aria-label='Plano anterior'
						type='button'
					>
						‹
					</button>
					<div class='carousel-dots'>
						{#each FLOOR_PLANS as _, index}
							<button
								class='dot'
								class:active={index === currentPlanIndex}
								onclick={() => goToPlan(index)}
								aria-label='Ver plano {index + 1}'
								type='button'
							></button>
						{/each}
					</div>
					<button
						class='carousel-button next'
						onclick={nextPlan}
						aria-label='Siguiente plano'
						type='button'
					>
						›
					</button>
				</div>
			{/if}
		</div>
		<figure class='floor-plan-info'>
			<figcaption class='floor-plan-title'>{currentPlan.title}</figcaption>
			<p class='floor-plan-description'>{currentPlan.description}</p>
		</figure>
	</div>
</section>

<style>
	#planos {
		max-width: var(--max);
		margin: 0 auto;
	}

	.floor-plans-container {
		/* Layout */
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.carousel-wrapper {
		/* Positioning */
		position: relative;

		/* Layout */
		width: 100%;
		height: 27.5rem;
		overflow: hidden;

		/* Box/Visual */
		border: 1px solid var(--color-border-default);
		border-radius: 0.5rem;
		background: var(--color-bg-canvas);
	}

	.carousel-image {
		/* Positioning */
		position: absolute;
		top: 0;
		left: 0;

		/* Layout */
		width: 100%;
		height: 100%;

		/* Box/Visual */
		background-size: contain;
		background-position: center;
		background-repeat: no-repeat;
		opacity: 0;

		/* Effects & Motion */
		transition: opacity 0.6s ease-in-out;
	}

	.carousel-image.active {
		/* Box/Visual */
		opacity: 1;
	}

	.carousel-navigation {
		/* Positioning */
		position: absolute;
		bottom: 1rem;
		left: 50%;
		z-index: 10;

		/* Layout */
		display: flex;
		align-items: center;
		gap: 1rem;

		/* Effects & Motion */
		transform: translateX(-50%);
	}

	.carousel-button {
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		flex-shrink: 0;

		/* Box/Visual */
		background: color-mix(in oklch, var(--color-bg-canvas) 80%, transparent);
		border: 1px solid var(--color-border-default);
		border-radius: 50%;

		/* Typography */
		font-size: 2rem;
		line-height: 1;
		color: var(--color-text-primary);

		/* Misc/Overrides */
		cursor: pointer;

		/* Effects & Motion */
		transition:
			background-color 0.2s ease,
			transform 0.2s ease,
			border-color 0.2s ease;
	}

	.carousel-button:hover {
		/* Box/Visual */
		background: var(--color-accent-primary);
		border-color: var(--color-accent-primary);
		color: var(--color-text-on-accent);

		/* Effects & Motion */
		transform: scale(1.1);
	}

	.carousel-button:active {
		/* Effects & Motion */
		transform: scale(0.95);
	}

	.carousel-dots {
		/* Layout */
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.dot {
		/* Layout */
		width: 0.75rem;
		height: 0.75rem;

		/* Box/Visual */
		border: none;
		border-radius: 50%;
		background: color-mix(in oklch, var(--color-text-primary) 40%, transparent);

		/* Misc/Overrides */
		cursor: pointer;

		/* Effects & Motion */
		transition:
			background-color 0.2s ease,
			transform 0.2s ease;
	}

	.dot.active {
		/* Box/Visual */
		background: var(--color-accent-primary);

		/* Effects & Motion */
		transform: scale(1.2);
	}

	.dot:hover {
		/* Box/Visual */
		background: color-mix(in oklch, var(--color-accent-primary) 75%, transparent);
	}

	.floor-plan-info {
		/* Layout */
		margin: 0;
		padding: 0 1rem;

		/* Typography */
		text-align: center;
	}

	.floor-plan-title {
		/* Typography */
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-accent-primary);
		margin-bottom: 0.5rem;
	}

	.floor-plan-description {
		/* Typography */
		font-size: 0.95rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin: 0;
	}

	/* Mobile responsiveness */
	@media (max-width: 640px) {
		.floor-plans-container {
			gap: 1rem;
			margin-top: 1.5rem;
		}

		.carousel-wrapper {
			height: 20rem;
		}

		.carousel-button {
			width: 2.5rem;
			height: 2.5rem;
			font-size: 1.5rem;
		}

		.floor-plan-title {
			font-size: 1rem;
		}

		.floor-plan-description {
			font-size: 0.875rem;
		}
	}
</style>
