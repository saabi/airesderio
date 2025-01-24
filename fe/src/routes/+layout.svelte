<script lang="ts">
	import Header from '$lib/Header.svelte';
	// import { i18n } from '$lib/i18n';
	// import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	let { children } = $props();
	const maxHeight = 150;
</script>


<Header {maxHeight} />
<!-- <ParaglideJS {i18n}> -->
<main style="--header-height: {maxHeight}px">
	{@render children()}
</main>
<!-- </ParaglideJS> -->

<style>
	main {
		padding: 1rem;
		margin-top: var(--header-height);
		background-color: #eee;
	}
</style>