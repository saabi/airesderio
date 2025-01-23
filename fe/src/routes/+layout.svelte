<script lang="ts">
	import Header from '$lib/Header.svelte';
	// import { i18n } from '$lib/i18n';
	// import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	let { children } = $props();
</script>


<Header />
<!-- <ParaglideJS {i18n}> -->
<main>
	{@render children()}
</main>
<!-- </ParaglideJS> -->

<style>
	main {
		padding: 1rem;
	}
</style>
