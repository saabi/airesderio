<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

	import '../app.css';

	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import { applyTheme, resolveInitialTheme, startThemeObserver } from '$lib/utils/theme';

	let { children }: { children: Snippet } = $props();

	onMount(() => {
		applyTheme(resolveInitialTheme());
		const stop = startThemeObserver();
		return () => stop();
	});
</script>

<Header />

{@render children()}

<Footer />
