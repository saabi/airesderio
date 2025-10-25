<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import Intro from '$lib/components/Intro.svelte';
	import Location from '$lib/components/Location.svelte';
	import Interior from '$lib/components/Interior.svelte';
	import Equipment from '$lib/components/Equipment.svelte';
	import FloorPlans from '$lib/components/FloorPlans.svelte';
</script>

<div class="wrap page">
	<main>
		<Hero />

		<p class="welcome">
			Santiago del Estero da la bienvenida a Aires de Río, un nuevo proyecto de departamentos con las
			mejores prestaciones y estratégica ubicación.
		</p>

		<Intro />
		<Location />
		<Interior />
		<Equipment />
		<FloorPlans />
	</main>
</div>
