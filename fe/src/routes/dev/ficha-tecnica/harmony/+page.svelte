<script lang="ts">
	import FichaTecnicaLineaPreview from '$lib/components/dev/FichaTecnicaLineaPreview.svelte';
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="ficha-tecnica-route">
	<FichaTecnicaLineaPreview variant="harmony" />
</main>

<style>
	.ficha-tecnica-route {
		margin-top: var(--header-height);
		padding-bottom: 3rem;
	}

	@media print {
		.ficha-tecnica-route {
			margin-top: 0;
		}
	}
</style>
