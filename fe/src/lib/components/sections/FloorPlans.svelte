<script module lang='ts'>
	// ===== IMPORTS =====
	import Title from '$lib/components/ui/Title.svelte';
	import VisuallyHidden from '$lib/components/ui/VisuallyHidden.svelte';
	import CircularButton from '$lib/components/ui/CircularButton.svelte';
	import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
	import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
	import CarouselDots from '$lib/components/ui/CarouselDots.svelte';

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
		image: string | any; // Enhanced image type
		title: string;
		description: string;
	}

	// ===== STATIC CONSTANTS =====
	// Import images with ?enhanced for optimization
	import plan1 from '$lib/assets/floor-plans/1ra-planta-4-deptos.png?enhanced';
	import plan2 from '$lib/assets/floor-plans/1ra-planta-4-deptos-a.png?enhanced';
	import plan3 from '$lib/assets/floor-plans/2 OCTUBRE_MODELO 1ra PLANTA_4 DPTOS 1 DORM.jpg?enhanced';
	import plan4 from '$lib/assets/floor-plans/2da-planta-3-deptos.png?enhanced';
	import plan5 from '$lib/assets/floor-plans/2da-planta-3-deptos-a.png?enhanced';
	import plan6 from '$lib/assets/floor-plans/2 OCTUBRE_MODELO 2da PLANTA_2 DPTOS 1 DORM_1 DEPTO DOBLE.jpg?enhanced';

	const FLOOR_PLANS: FloorPlan[] = [
		{
			image: plan1,
			title: 'Primera Planta - 4 Departamentos',
			description: 'Plano de la primera planta con 4 departamentos de 1 dormitorio cada uno.'
		},
		{
			image: plan2,
			title: 'Primera Planta - 4 Departamentos (Alternativa)',
			description: 'Vista alternativa de la primera planta con distribución de los 4 departamentos.'
		},
		{
			image: plan3,
			title: 'Modelo Octubre - Primera Planta',
			description: 'Modelo de octubre: primera planta con 4 departamentos de 1 dormitorio.'
		},
		{
			image: plan4,
			title: 'Segunda Planta - 3 Departamentos',
			description: 'Plano de la segunda planta con 3 departamentos, incluyendo 2 departamentos de 1 dormitorio y 1 departamento doble.'
		},
		{
			image: plan5,
			title: 'Segunda Planta - 3 Departamentos (Alternativa)',
			description: 'Vista alternativa de la segunda planta con distribución de los 3 departamentos.'
		},
		{
			image: plan6,
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
				{@const isString = typeof plan.image === 'string'}
				<div
					class='carousel-image'
					class:active={index === currentPlanIndex}
					class:enhanced={!isString}
					style={isString ? "background-image: url('{plan.image}')" : undefined}
					role='img'
					aria-label={`Plano ${index + 1}: ${plan.title}`}
				>
					{#if !isString}
						<enhanced:img
							src={plan.image}
							alt={plan.title}
							sizes='(min-width: 1024px) 1024px, 100vw'
							loading='lazy'
							class='floor-plan-image'
						/>
					{/if}
				</div>
			{/each}
			{#if FLOOR_PLANS.length > 1}
				<div class='carousel-navigation'>
					<CircularButton
						variant="bordered"
						size="md"
						ariaLabel="Plano anterior"
						onClick={previousPlan}
					>
						<ArrowLeft />
					</CircularButton>
					<CarouselDots
						total={FLOOR_PLANS.length}
						currentIndex={currentPlanIndex}
						onDotClick={goToPlan}
						ariaLabel={(index) => `Ver plano ${index + 1}`}
						variant='inverse'
						showTransform={true}
					/>
					<CircularButton
						variant="bordered"
						size="md"
						ariaLabel="Siguiente plano"
						onClick={nextPlan}
					>
						<ArrowRight />
					</CircularButton>
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

	.carousel-image.enhanced {
		/* Layout */
		display: block;
		overflow: hidden;
	}

	.floor-plan-image {
		/* Positioning */
		position: absolute;
		top: 0;
		left: 0;

		/* Layout */
		width: 100%;
		height: 100%;

		/* Box/Visual */
		object-fit: contain;
		object-position: center;
		display: block;
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



	.floor-plan-info {
		/* Layout */
		margin: 0;
		padding: 0 1rem;

		/* Typography */
		text-align: center;
	}

	.floor-plan-title {
		/* Typography */
		font-family: var(--font-heading);
		font-size: 1.1rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-accent-primary);
		margin-bottom: 0.5rem;
	}

	.floor-plan-description {
		/* Typography */
		font-family: var(--font-body);
		font-size: 0.95rem;
		color: var(--color-text-secondary);
		line-height: var(--line-height-normal);
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


		.floor-plan-title {
			font-size: 1rem;
		}

		.floor-plan-description {
			font-size: 0.875rem;
		}
	}
</style>
