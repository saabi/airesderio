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
		/* On screen: margin equal to header height so content doesn't sit under the header */
		margin-top: var(--header-height);
		padding-bottom: 3rem;
	}

	@media print {
		.ficha-tecnica-route {
			margin-top: 0;
			/* No padding here: FichaTecnicaPreview's article has print padding so list items
			   that break to a new page keep correct margins in every fragment. */
		}
	}
</style>
