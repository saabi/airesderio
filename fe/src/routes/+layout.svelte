<script module lang='ts'>
	// ===== IMPORTS =====
	import '../app.css';

	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import SkipLink from '$lib/components/ui/SkipLink.svelte';
	import PdfRequestModal from '$lib/components/forms/PdfRequestModal.svelte';
</script>

<script lang='ts'>
	// ===== IMPORTS =====
	import type { Snippet } from 'svelte';
	import { onDestroy } from 'svelte';
	// Import stores to initialize systems (initializes on import)
	import { theme } from '$lib/stores/theme';
	import { menuStore } from '$lib/stores/menu';
	import { pdfRequestModalStore } from '$lib/stores/pdfRequestModal';

	// ===== PROPS =====
	let { data, children }: { data: { adminEmail?: string | null }; children: Snippet } = $props();

	// ===== LIFECYCLE =====
	// Store initializes theme automatically on import
	// Theme is already applied and observers are set up

	onDestroy(() => {
		// Cleanup observers when layout is destroyed
		theme.cleanup();
		menuStore.cleanup();
	});
</script>

<!-- Skip to main content link for keyboard navigation -->
<SkipLink />

<Header adminEmail={data?.adminEmail ?? null} />

{@render children()}

<Footer />

{#if $pdfRequestModalStore}
	<PdfRequestModal intent={$pdfRequestModalStore.intent} />
{/if}
