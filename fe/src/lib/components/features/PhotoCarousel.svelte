<script module lang='ts'>
	// ===== IMPORTS =====
	import type { PlaceMetadata } from '$lib/types';
	import { PLACE_PHOTOS_MAP } from '$lib/assets/places/index';

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
	// Map photo filenames to enhanced images
	const enhancedPhotos = $derived.by(() => {
		if (!placeId || !photos || photos.length === 0) {
			return [];
		}

		const placeMap = PLACE_PHOTOS_MAP[placeId];
		if (!placeMap) {
			if (import.meta.env.DEV) {
				console.warn(`Place "${placeId}" not found in PLACE_PHOTOS_MAP. Using fallback paths.`);
			}
			// Fallback to original paths if place not in map
			return photos.map((filename) => ({
				src: `/places/${placeId}/${filename}`,
				enhanced: false,
				filename
			}));
		}

		return photos.map((filename) => {
			const enhanced = placeMap[filename];
			if (!enhanced && import.meta.env.DEV) {
				console.warn(`Photo "${filename}" not found in PLACE_PHOTOS_MAP for place "${placeId}". Using fallback.`);
			}
			return enhanced
				? { src: enhanced, enhanced: true, filename }
				: { src: `/places/${placeId}/${filename}`, enhanced: false, filename };
		});
	});

	// ===== FUNCTIONS =====
	// Navigate carousel
	function navigateCarousel(direction: number) {
		const newIndex = currentIndex + direction;
		if (newIndex >= photos.length) {
			currentIndex = 0;
		} else if (newIndex < 0) {
			currentIndex = photos.length - 1;
		} else {
			currentIndex = newIndex;
		}
	}

	// Go to specific photo
	function goToPhoto(index: number) {
		currentIndex = index;
	}

	// Handle keyboard navigation
	function handleKeydown(e: KeyboardEvent) {
		if (!visible) return;

		switch (e.key) {
			case 'Escape':
				onClose();
				break;
			case 'ArrowLeft':
				e.preventDefault();
				navigateCarousel(-1);
				break;
			case 'ArrowRight':
				e.preventDefault();
				navigateCarousel(1);
				break;
		}
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
					{#if enhancedPhotos.length > 0 && enhancedPhotos[currentIndex]}
						{#if enhancedPhotos[currentIndex].enhanced}
							<enhanced:img
								src={enhancedPhotos[currentIndex].src}
								alt={`${place.nombre} - Foto ${currentIndex + 1}`}
								sizes='(min-width: 1024px) 90vw, 100vw'
								loading='lazy'
								class='carousel-image'
							/>
						{:else}
							<img
								src={enhancedPhotos[currentIndex].src}
								alt={`${place.nombre} - Foto ${currentIndex + 1}`}
								loading='lazy'
								class='carousel-image'
							/>
						{/if}
					{:else}
						<!-- Fallback if enhancedPhotos is empty or invalid -->
						<img
							src={photos[currentIndex] || ''}
							alt={`${place.nombre} - Foto ${currentIndex + 1}`}
							loading='lazy'
							class='carousel-image'
						/>
					{/if}

					{#if photos.length > 1}
						<button
							class='nav-button prev'
							onclick={() => navigateCarousel(-1)}
							aria-label='Foto anterior'>‹</button
						>
						<button
							class='nav-button next'
							onclick={() => navigateCarousel(1)}
							aria-label='Siguiente foto'>›</button
						>
					{/if}
				</div>

				{#if photos.length > 1}
					<div class='photo-dots'>
						{#each photos as _, index (index)}
							<button
								class="dot {index === currentIndex ? 'active' : ''}"
								onclick={() => goToPhoto(index)}
								aria-label={`Ver foto ${index + 1}`}
							></button>
						{/each}
					</div>
				{/if}

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

	.carousel-image {
		/* Layout */
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.nav-button {
		/* Positioning */
		position: absolute;
		top: 50%;
		z-index: 10;

		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;

		/* Box/Visual */
		background: var(--overlay-black-60);
		border: none;
		border-radius: 50%;

		/* Typography */
		font-size: 1.25rem;
		color: var(--color-text-inverse);

		/* Misc/Overrides */
		cursor: pointer;

		/* Effects & Motion */
		transform: translateY(-50%);
		transition: background-color 0.2s;
	}

	.nav-button:hover {
		/* Box/Visual */
		background: var(--overlay-black-80);
	}

	.nav-button.prev {
		/* Positioning */
		left: 1rem;
	}

	.nav-button.next {
		/* Positioning */
		right: 1rem;
	}

	.photo-dots {
		/* Layout */
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.dot {
		/* Layout */
		width: 12px;
		height: 12px;

		/* Box/Visual */
		border: none;
		border-radius: 50%;
		background: var(--color-neutral-400);

		/* Misc/Overrides */
		cursor: pointer;

		/* Effects & Motion */
		transition: background-color 0.2s;
	}

	.dot.active {
		/* Box/Visual */
		background: var(--color-accent-primary);
	}

	.dot:hover {
		/* Box/Visual */
		background: var(--color-neutral-500);
	}

	.dot.active:hover {
		/* Box/Visual */
		background: var(--color-accent-strong);
	}

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

		.nav-button {
			/* Layout */
			width: 35px;
			height: 35px;

			/* Typography */
			font-size: 1rem;
		}

		.nav-button.prev {
			/* Positioning */
			left: 0.5rem;
		}

		.nav-button.next {
			/* Positioning */
			right: 0.5rem;
		}
	}
</style>
