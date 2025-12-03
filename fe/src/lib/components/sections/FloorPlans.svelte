<script module lang="ts">
	// ===== IMPORTS =====
	import Title from '$lib/components/ui/Title.svelte';
	import VisuallyHidden from '$lib/components/ui/VisuallyHidden.svelte';
</script>

<script lang="ts">
	// ===== IMPORTS =====
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
	import {
		ANIMATION,
		animationDelay,
		animationDuration,
		animationOffset
	} from '$lib/constants/animation';

	// ===== INSTANCE CONSTANTS =====
	const { action: floorPlansObserver, visible: floorPlansVisible } = createSectionObserver(
		'floor-plans',
		{
			threshold: ANIMATION.threshold.section
		}
	);
</script>

<section
	id="planos"
	aria-labelledby="planos-heading"
	use:floorPlansObserver
	data-section-active={$floorPlansVisible}
>
	<VisuallyHidden id="planos-heading" tag="h2">Planos</VisuallyHidden>
	<div
		class="scroll-animate"
		style={`--scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<Title eyebrow="Distribución y" big="PLANOS" />
	</div>
	<figure
		class="scroll-animate"
		style={`--scroll-animate-delay: ${animationDelay(1)}; --scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<div
			class="plan-ph"
			role="img"
			aria-label="Plano de distribución de los departamentos del proyecto Aires de Río"
		></div>
		<figcaption>Plano de distribución y layout de las unidades</figcaption>
	</figure>
</section>

<style>
	#planos {
		max-width: var(--max);
		margin: 0 auto;
	}

	.plan-ph {
		/* Layout */
		height: 27.5rem;

		/* Box/Visual */
		background: var(--color-neutral-250);
		border: 1px solid var(--color-border-default);
		border-radius: 0.5rem;
	}
</style>
