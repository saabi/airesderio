<script lang="ts">
	import type { Snippet } from 'svelte';

	import '../app.css';

	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<Header />

{@render children()}

<Footer />
