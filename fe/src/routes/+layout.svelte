<script module lang="ts">
	// ===== IMPORTS =====
	import '../app.css';

	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import { applyTheme, resolveInitialTheme, startThemeObserver } from '$lib/utils/theme';
</script>

<script lang="ts">
	// ===== IMPORTS =====
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

	// ===== PROPS =====
	let { children }: { children: Snippet } = $props();

	// ===== LIFECYCLE =====
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
