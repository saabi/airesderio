<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

	import '../app.css';

	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import { applyTheme, resolveInitialTheme, startThemeObserver } from '$lib/utils/theme';

	let { children }: { children: Snippet } = $props();

	onMount(() => {
		applyTheme(resolveInitialTheme());
		const stop = startThemeObserver();
		return () => stop();
	});
</script>

<!-- Skip to main content link for keyboard navigation -->
<a href="#main-content" class="skip-link">Saltar al contenido principal</a>

<Header />

<main id="main-content">
	{@render children()}
</main>

<Footer />
