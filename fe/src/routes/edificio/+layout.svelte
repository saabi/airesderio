<script lang="ts">
    import Carousel from '$lib/ClientOnlyCarousel.svelte';
	import type { Snippet } from 'svelte';

    let { children } = $props();

	// We define some snippet blocks for each slide
	// and collect them into an array.
	let slides: Snippet[] = [slideOne, slideTwo, slideThree];
</script>

{#snippet slideOne()}
    <img src="/foto1.png" alt="Aires de Río" />
{/snippet}

{#snippet slideTwo()}
	<div style="background: lightcoral; padding: 1rem;">
		Slide B content
	</div>
{/snippet}

{#snippet slideThree()}
	<div style="background: lightgreen; padding: 1rem;">
		Slide C content
	</div>
{/snippet}

<article>
    <Carousel {slides} height="400px" />
	{@render children()}
</article>

<style>
    img {
        width: 100%;
        height: auto;
    }
</style>
