<script module lang='ts'>
	// ===== IMPORTS =====
	import type { PlaceMetadata } from '$lib/types';
	import ImageCarousel from '$lib/components/ui/ImageCarousel.svelte';
	import Slide from '$lib/components/ui/Slide.svelte';

	// ===== TYPES =====
	interface Props {
		visible: boolean;
		place: PlaceMetadata;
		placeId: string;
		photos: string[];
		currentIndex?: number;
		onClose: () => void;
	}
</script>

<script lang='ts'>
	// ===== PROPS =====
	let {
		visible = false,
		place,
		placeId,
		photos = [],
		currentIndex = $bindable(0),
		onClose
	}: Props = $props();

	// ===== DERIVED =====
	// Map photo filenames to static URLs for ImageCarousel
	const enhancedPhotos = $derived.by(() => {
		if (!placeId || !photos || photos.length === 0) {
			return [];
		}
		return photos.map((filename) => ({
			src: `/places/${placeId}/${encodeURIComponent(filename)}`,
			alt: `${place.nombre} - ${filename}`
		}));
	});

	// ===== FUNCTIONS =====
	// Handle keyboard navigation (Escape key for closing modal)
	function handleKeydown(e: KeyboardEvent) {
		if (!visible) return;

		if (e.key === 'Escape') {
			onClose();
		}
	}

	// Handle index change from ImageCarousel
	function handleIndexChange(index: number) {
		currentIndex = index;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if visible && place && photos.length > 0}
	<div class='overlay' role='dialog' aria-modal='true'>
		<button type='button' class='backdrop' aria-label='Cerrar galería' onclick={onClose}></button>
		<div class='modal' role='document'>
			<div class='header'>
				<h3>{place.nombre}</h3>
				<button class='close-button' onclick={onClose} aria-label='Cerrar galería de fotos'
					>×</button
				>
			</div>

			<div class='content'>
				<div class='photo-container'>
					{#if enhancedPhotos.length > 0}
						<ImageCarousel
							slideCount={enhancedPhotos.length}
							slideAriaLabel={(index) => `${place.nombre} - Foto ${index + 1}`}
							bind:currentIndex={currentIndex}
							onIndexChange={handleIndexChange}
							autoRotate={false}
							keyboardNavigation={true}
							showNavigation={true}
							navigationPosition="absolute-sides"
							buttonVariant="overlay"
							buttonSize="lg"
							showDots={true}
							dotsVariant="inverse"
							dotsPosition="below-image"
							transitionType="instant"
							imageFit="cover"
							imageSizes="(min-width: 1024px) 90vw, 100vw"
							ariaLabel="Galería de fotos"
							class="photo-carousel"
						>
							{#snippet slide(index)}
								<Slide
									type="image"
									src={enhancedPhotos[index].src}
									alt={enhancedPhotos[index].alt}
								/>
							{/snippet}
						</ImageCarousel>
					{/if}
				</div>

				<div class='photo-info'>
					<p>{currentIndex + 1} de {photos.length} fotos</p>
					{#if place.descripcion}
						<p class='photo-description'>{place.descripcion}</p>
					{/if}
					{#if place.thingstodo}
						<p class='photo-thingstodo'>{place.thingstodo}</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Photo Carousel Styles */
	.overlay {
		/* Positioning */
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 10000;

		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;

		/* Box/Visual */
		backdrop-filter: blur(4px);
	}

	.backdrop {
		/* Positioning */
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1;

		/* Layout */
		width: 100%;
		height: 100%;
		padding: 0;

		/* Box/Visual */
		background: var(--overlay-black-80);
		border: none;

		/* Misc/Overrides */
		cursor: pointer;
	}

	.modal {
		/* Positioning */
		position: relative;
		z-index: 2;

		/* Layout */
		width: 600px;
		max-width: 90vw;
		max-height: 90vh;
		overflow: hidden;

		/* Box/Visual */
		background: var(--color-bg-contrast);
		border-radius: 0.75rem;
		box-shadow: 0 20px 25px -5px var(--shadow-soft);
	}

	.header {
		/* Layout */
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;

		/* Box/Visual */
		border-bottom: 1px solid var(--color-neutral-300);
		background: var(--color-neutral-125);
	}

	.header h3 {
		/* Layout */
		margin: 0;

		/* Typography */
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-neutral-800);
	}

	.close-button {
		/* Layout */
		padding: 0.25rem;

		/* Box/Visual */
		background: none;
		border: none;
		border-radius: 0.25rem;

		/* Typography */
		font-size: 1.5rem;
		color: var(--color-muted);

		/* Misc/Overrides */
		cursor: pointer;

		/* Effects & Motion */
		transition: background-color 0.2s;
	}

	.close-button:hover {
		/* Box/Visual */
		background: var(--color-neutral-300);
		color: var(--color-neutral-800);
	}

	.content {
		/* Layout */
		padding: 1.5rem;
	}

	.photo-container {
		/* Positioning */
		position: relative;

		/* Layout */
		width: 100%;
		height: 400px;
		margin-bottom: 1rem;
		overflow: hidden;

		/* Box/Visual */
		background: var(--color-neutral-200);
		border-radius: 0.5rem;
	}

	/* ImageCarousel handles image and navigation button styles */


	.photo-info {
		/* Typography */
		text-align: center;
	}

	.photo-info p {
		/* Layout */
		margin: 0.25rem 0;

		/* Typography */
		font-size: 0.875rem;
		color: var(--color-muted);
	}

	.photo-description {
		/* Typography */
		font-style: italic;
		color: var(--color-neutral-500) !important;
	}

	.photo-thingstodo {
		/* Layout */
		margin-top: 1rem;

		/* Typography */
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--color-text-on-light);
	}

	/* Mobile responsiveness */
	@media (max-width: 640px) {
		.modal {
			/* Layout */
			width: 95vw;
			max-height: 95vh;
		}

		.photo-container {
			/* Layout */
			height: 300px;
		}

		.header {
			/* Layout */
			padding: 0.75rem 1rem;
		}

		.content {
			/* Layout */
			padding: 1rem;
		}
	}
</style>
