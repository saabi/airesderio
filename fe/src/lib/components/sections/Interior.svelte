<script module lang="ts">
	// ===== IMPORTS =====
	import Title from '$lib/components/ui/Title.svelte';
	import Carousel from '$lib/components/ui/Carousel.svelte';

	// ===== STATIC CONSTANTS =====
	const interiorImageFiles = [
		'4_DB_Lobby.jpg',
		'5_DB_EXTERIOR_01 (6).jpg',
		'6_DB_EXTERIOR_01 (5).jpg',
		'7_DB_EXTERIOR_01 (7).jpg',
		'8_Antebaño y Lavadero.jpg',
		'9_DB_INT_BLANCO (5).png'
	];
	
	const INTERIOR_IMAGES = interiorImageFiles.map(file => 
		`/carrousel-interior/${encodeURIComponent(file)}`
	);
</script>

<script lang="ts">
	// ===== IMPORTS =====
	import { createSectionObserver } from '$lib/utils/sectionVisibility';

	// ===== INSTANCE CONSTANTS =====
	const { action: interiorObserver, visible: interiorVisible } = createSectionObserver('interior', {
		threshold: 0.35
	});
</script>

<section
	id="interior"
	aria-labelledby="interior-heading"
	use:interiorObserver
	data-section-active={$interiorVisible}
>
	<h2 id="interior-heading" class="vh">Diseño Interior</h2>
	<div class="scroll-animate" style="--scroll-animate-offset: 40px; --scroll-animate-duration: 500ms;">
		<Title eyebrow="Diseño" big="INTERIOR" />
	</div>
	<p class="scroll-animate" style="--scroll-animate-offset: 40px; --scroll-animate-delay: 80ms; --scroll-animate-duration: 500ms;">
		Ambientes generosos para unidades de un dormitorio que integran estética y funcionalidad
		explorando tendencias contemporáneas, incorporando las nuevas tecnologías y los recursos más
		elegantes en interiorismo.
	</p>
	<p class="scroll-animate" style="--scroll-animate-offset: 40px; --scroll-animate-delay: 160ms; --scroll-animate-duration: 500ms;">
		El proyecto incorporó materiales ecológicos y formas curvas, buscando conectar los espacios
		interiores con los colores que ofrece la naturaleza a través de la inclusión de vegetación, luz
		natural y materiales orgánicos como la madera.
	</p>
	<div
		class="interior-gallery scroll-animate"
		style="--scroll-animate-delay: 240ms; --scroll-animate-offset: 48px; --scroll-animate-duration: 600ms; --scroll-animate-scale: 0.95;"
	>
		<Carousel
			images={INTERIOR_IMAGES}
			interval={2500}
			ariaLabel="Galería de imágenes del diseño interior"
			imageAriaLabel={(index) => `Imagen del diseño interior - ${index + 1}`}
		/>
	</div>
	<p class="scroll-animate" style="--scroll-animate-offset: 40px; --scroll-animate-delay: 320ms; --scroll-animate-duration: 500ms;">
		La luz juega un papel clave en la funcionalidad del diseño interior de las unidades y de los espacios comunes. Las grandes aberturas optimizan la luz y la ventilación natural, lo cual permite reducir la dependencia de la iluminación y ventilación artificiales, promoviendo la eficiencia energética y el confort en los espacios, incluso prolongando la iluminación natural hasta el anochecer.
	</p>
	<p class="scroll-animate" style="--scroll-animate-offset: 40px; --scroll-animate-delay: 400ms; --scroll-animate-duration: 500ms;">
		La iluminación artificial fue diseñada para realzar el elegante estilo en la arquitectura de los departamentos. La combinación de tonos de luces LEDs en gargantas semicolgantes, como fuente de luz indirecta y de acento, crea profundidad y logra ambientes armónicos y relajantes.
	</p>
	<p class="scroll-animate" style="--scroll-animate-offset: 40px; --scroll-animate-delay: 480ms; --scroll-animate-duration: 500ms;">
		Quien habite los departamentos solo tendrá que incorporar los artefactos de iluminación directa a su gusto, ya que toda la iluminación de efecto estará incorporada en cada unidad habitacional.
	</p>
</section>

<style>
	.interior-gallery {
		/* Layout */
		height: 16.25rem;
		margin-top: 0.75rem;
		
		/* Box/Visual */
		border-radius: 0.5rem;
		overflow: hidden;
		box-shadow: 0 0.25rem 0.75rem var(--shadow-soft);
		
		/* Misc/Overrides */
		will-change: transform, opacity;
	}
	
	@media (max-width: 850px) {
		.interior-gallery {
			/* Layout */
			height: 12rem;
		}
	}
</style>
