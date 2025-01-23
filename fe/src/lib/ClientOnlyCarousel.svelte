<script lang="ts">
    import { browser } from '$app/environment';
    import Carousel from './Carousel2.svelte';
    import type { Snippet } from 'svelte';
    
    let { slides, height } = $props<{slides: Snippet[], height: string}>();
</script>

{#if browser}
    <Carousel {slides}  />
{:else}
    <!-- Server-side fallback -->
    <div style="height: {height}">
        {@render slides[0]()}
    </div>
{/if}
