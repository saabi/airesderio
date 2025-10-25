<script lang="ts">
	import Title from './Title.svelte';
</script>

<section id="planos" aria-labelledby="planos-heading">
	<h2 id="planos-heading" class="vh">Planos</h2>
	<Title eyebrow="Distribución y" big="PLANOS" />
	<figure>
		<div
			class="plan-ph"
			role="img"
			aria-label="Plano de distribución de los departamentos del proyecto Aires de Río"
		></div>
		<figcaption class="vh">Plano de distribución y layout de las unidades</figcaption>
	</figure>
</section>

<style>
	.plan-ph {
		background: #efefef;
		height: 440px;
		border-radius: 8px;
		border: 1px solid var(--line);
	}
</style>
