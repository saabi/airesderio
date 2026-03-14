<script lang="ts">
	import FichaTecnicaPreview from '$lib/components/dev/FichaTecnicaPreview.svelte';
</script>

<svelte:head>
	<title>Ficha técnica (preview) | Aires de Río</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="ficha-tecnica-route">
	<FichaTecnicaPreview />
</main>

<style>
	.ficha-tecnica-route {
		padding-bottom: 3rem;
	}
</style>
