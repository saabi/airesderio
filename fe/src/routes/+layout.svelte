<script module lang="ts">
	// ===== IMPORTS =====
	import '../app.css';

	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import SkipLink from '$lib/components/ui/SkipLink.svelte';
</script>

<script lang="ts">
	// ===== IMPORTS =====
	import type { Snippet } from 'svelte';
	import { onDestroy } from 'svelte';
	// Import store to initialize theme system (initializes on import)
	import { theme } from '$lib/stores/theme';

	// ===== PROPS =====
	let { children }: { children: Snippet } = $props();

	// ===== LIFECYCLE =====
	// Store initializes theme automatically on import
	// Theme is already applied and observers are set up

	onDestroy(() => {
		// Cleanup observers when layout is destroyed
		theme.cleanup();
	});
</script>

<!-- Skip to main content link for keyboard navigation -->
<SkipLink />

<Header />

{@render children()}

<Footer />


