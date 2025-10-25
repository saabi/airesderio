<!-- Carousel.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fly } from 'svelte/transition';

	/**
	 * "slides": array of snippet props.
	 * "height": CSS size, e.g. '25rem', '50vh', etc.
	 */
	let { slides = [], height = '25rem' }: { slides?: Snippet[]; height?: string } = $props();
	if (!Array.isArray(slides)) slides = [];

	let current = $state(0);
	let direction = $state(1); // +1 means transition from right->left, -1 means from left->right

	function prev() {
		direction = -1;
		current = (current - 1 + slides.length) % slides.length;
	}

	function next() {
		direction = 1;
		current = (current + 1) % slides.length;
	}
</script>

<!--
  We use `style="--carousel-height: {height}"` to publish the height to a CSS variable,
  and default to "25rem" if not set by the user.
-->
<div class="carousel" style="--carousel-height: {height}">
	<button class="prev-button" onclick={prev}>⬅</button>

	{#each slides as snippet, i}
		{#if i === current}
			<div
				class="slide"
				in:fly={{ x: direction > 0 ? 400 : -400 }}
				out:fly={{ x: direction > 0 ? -400 : 400 }}
			>
				{@render snippet()}
			</div>
		{/if}
	{/each}

	<button class="next-button" onclick={next}>➡</button>
</div>

<style>
	.carousel {
		/* 
		  The user sets --carousel-height via style="--carousel-height: {height}" 
		  or uses the fallback 25rem. 
		*/
		height: var(--carousel-height, 25rem);

		position: relative;
		width: 100%;
		overflow: hidden;
	}

	.prev-button,
	.next-button {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 10;
	}

	.prev-button {
		left: 1rem;
	}

	.next-button {
		right: 1rem;
	}

	.slide {
		/* We absolutely position each slide in the same place,
		   so they overlap each other for transitions */
		position: absolute;
		top: 0;
		left: 0;

		width: 100%;
		height: 100%;

		/* Center content if desired */
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
