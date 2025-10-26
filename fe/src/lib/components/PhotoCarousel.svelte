<script lang="ts">
	interface Props {
		visible: boolean;
		place: any;
		category: string;
		placeId: string;
		photos: string[];
		currentIndex?: number;
		onClose: () => void;
	}

	let {
		visible = false,
		place,
		category,
		placeId,
		photos = [],
		currentIndex = $bindable(0),
		onClose
	}: Props = $props();

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
	<div class="photo-carousel-overlay" role="dialog" aria-modal="true" onclick={onClose} onkeydown={(e) => e.key === 'Escape' && onClose()}>
		<div class="photo-carousel-modal" role="document" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
			<div class="photo-carousel-header">
				<h3>{place.nombre}</h3>
				<button class="close-button" onclick={onClose} aria-label="Cerrar galería de fotos">×</button>
			</div>
			
			<div class="photo-carousel-content">
				<div class="photo-container">
					<img 
						src={photos[currentIndex]} 
						alt={`${place.nombre} - Foto ${currentIndex + 1}`}
						class="carousel-image"
					/>
					
					{#if photos.length > 1}
						<button class="nav-button prev" onclick={() => navigateCarousel(-1)} aria-label="Foto anterior">‹</button>
						<button class="nav-button next" onclick={() => navigateCarousel(1)} aria-label="Siguiente foto">›</button>
					{/if}
				</div>
				
				{#if photos.length > 1}
					<div class="photo-dots">
						{#each photos as _, index}
							<button 
								class="dot {index === currentIndex ? 'active' : ''}"
								onclick={() => goToPhoto(index)}
								aria-label={`Ver foto ${index + 1}`}
							></button>
						{/each}
					</div>
				{/if}
				
				<div class="photo-info">
					<p>{currentIndex + 1} de {photos.length} fotos</p>
					{#if place.descripcion}
						<p class="photo-description">{place.descripcion}</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Photo Carousel Styles */
	.photo-carousel-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		backdrop-filter: blur(4px);
	}

	.photo-carousel-modal {
		background: white;
		border-radius: 0.75rem;
		max-width: 90vw;
		max-height: 90vh;
		width: 600px;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.photo-carousel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		background: #f9fafb;
	}

	.photo-carousel-header h3 {
		margin: 0;
		color: #374151;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #6b7280;
		padding: 0.25rem;
		border-radius: 0.25rem;
		transition: background-color 0.2s;
	}

	.close-button:hover {
		background: #e5e7eb;
		color: #374151;
	}

	.photo-carousel-content {
		padding: 1.5rem;
	}

	.photo-container {
		position: relative;
		width: 100%;
		height: 400px;
		border-radius: 0.5rem;
		overflow: hidden;
		background: #f3f4f6;
		margin-bottom: 1rem;
	}

	.carousel-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.nav-button {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(0, 0, 0, 0.6);
		color: white;
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		transition: background-color 0.2s;
		z-index: 10;
	}

	.nav-button:hover {
		background: rgba(0, 0, 0, 0.8);
	}

	.nav-button.prev {
		left: 1rem;
	}

	.nav-button.next {
		right: 1rem;
	}

	.photo-dots {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: none;
		background: #d1d5db;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.dot.active {
		background: #6B4423;
	}

	.dot:hover {
		background: #9ca3af;
	}

	.dot.active:hover {
		background: #5a3a1e;
	}

	.photo-info {
		text-align: center;
	}

	.photo-info p {
		margin: 0.25rem 0;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.photo-description {
		font-style: italic;
		color: #9ca3af !important;
	}

	/* Mobile responsiveness */
	@media (max-width: 640px) {
		.photo-carousel-modal {
			width: 95vw;
			max-height: 95vh;
		}

		.photo-container {
			height: 300px;
		}

		.photo-carousel-header {
			padding: 0.75rem 1rem;
		}

		.photo-carousel-content {
			padding: 1rem;
		}

		.nav-button {
			width: 35px;
			height: 35px;
			font-size: 1rem;
		}

		.nav-button.prev {
			left: 0.5rem;
		}

		.nav-button.next {
			right: 0.5rem;
		}
	}
</style>
