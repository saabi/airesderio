<script module lang="ts">
	// ===== IMPORTS =====
	import Title from '$lib/components/ui/Title.svelte';
</script>

<script lang="ts">
	// ===== IMPORTS =====
	import { createSectionObserver } from '$lib/utils/sectionVisibility';

	// ===== INSTANCE CONSTANTS =====
	const { action: floorPlansObserver, visible: floorPlansVisible } = createSectionObserver('floor-plans', {
		threshold: 0.35
	});
</script>

<section
    id='planos'
    aria-labelledby='planos-heading'
    use:floorPlansObserver
    data-section-active={$floorPlansVisible}
>
    <h2 id='planos-heading' class='vh'>Planos</h2>
    <div class='scroll-animate' style='--scroll-animate-offset: 40px; --scroll-animate-duration: 500ms;'>
        <Title eyebrow='Distribución y' big='PLANOS' />
    </div>
    <figure class='scroll-animate' style='--scroll-animate-delay: 80ms; --scroll-animate-offset: 48px; --scroll-animate-duration: 500ms;'>
        <div
            class='plan-ph'
            role='img'
            aria-label='Plano de distribución de los departamentos del proyecto Aires de Río'
        ></div>
		<figcaption>Plano de distribución y layout de las unidades</figcaption>
	</figure>
</section>

<style>
	.plan-ph {
		/* Layout */
		height: 27.5rem;
		
		/* Box/Visual */
		background: var(--color-neutral-250);
		border: 1px solid var(--color-border-default);
		border-radius: 0.5rem;
	}
</style>
