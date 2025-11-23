<script lang="ts">
    import Title from '$lib/components/ui/Title.svelte';
    import { createSectionObserver } from '$lib/utils/sectionVisibility';

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
    <div class='scroll-animate' style='--scroll-animate-offset: 40px;'>
        <Title eyebrow='Distribución y' big='PLANOS' />
    </div>
    <figure class='scroll-animate' style='--scroll-animate-delay: 120ms; --scroll-animate-offset: 52px;'>
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
		background: var(--color-neutral-250);
		height: 27.5rem;
		border-radius: 0.5rem;
		border: 1px solid var(--color-border-default);
	}
</style>
