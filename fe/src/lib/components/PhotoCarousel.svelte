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
	<div 
		class='photo-carousel-overlay' 
		role='dialog' 
		aria-modal='true'
	>
		<button 
			type='button'
			class='photo-carousel-overlay-backdrop'
			aria-label='Cerrar galería'
			onclick={onClose}
		></button>
		<div 
			class='photo-carousel-modal' 
			role='document'
		>
			<div class='photo-carousel-header'>
				<h3>{place.nombre}</h3>
				<button class='close-button' onclick={onClose} aria-label='Cerrar galería de fotos'>×</button>
			</div>
			
			<div class='photo-carousel-content'>
				<div class='photo-container'>
					<img 
						src={photos[currentIndex]} 
						alt={`${place.nombre} - Foto ${currentIndex + 1}`}
						class='carousel-image'
					/>
					
					{#if photos.length > 1}
						<button class='nav-button prev' onclick={() => navigateCarousel(-1)} aria-label='Foto anterior'>‹</button>
						<button class='nav-button next' onclick={() => navigateCarousel(1)} aria-label='Siguiente foto'>›</button>
					{/if}
				</div>
				
				{#if photos.length > 1}
					<div class='photo-dots'>
						{#each photos as _, index}
							<button 
								class='dot {index === currentIndex ? 'active' : ''}'
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
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		backdrop-filter: blur(4px);
	}

	.photo-carousel-overlay-backdrop {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		background: var(--overlay-black-80);
		border: none;
		padding: 0;
		cursor: pointer;
		z-index: 1;
	}

	.photo-carousel-modal {
		background: var(--color-bg-contrast);
		border-radius: 0.75rem;
		max-width: 90vw;
		max-height: 90vh;
		width: 600px;
		box-shadow: 0 20px 25px -5px var(--shadow-soft);
		overflow: hidden;
		position: relative;
		z-index: 2;
	}

	.photo-carousel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--color-neutral-300);
		background: var(--color-neutral-125);
	}

	.photo-carousel-header h3 {
		margin: 0;
		color: var(--color-neutral-800);
		font-size: 1.125rem;
		font-weight: 600;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: var(--color-muted);
		padding: 0.25rem;
		border-radius: 0.25rem;
		transition: background-color 0.2s;
	}

	.close-button:hover {
		background: var(--color-neutral-300);
		color: var(--color-neutral-800);
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
		background: var(--color-neutral-200);
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
		background: var(--overlay-black-60);
		color: var(--color-text-inverse);
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
		background: var(--overlay-black-80);
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
		background: var(--color-neutral-400);
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.dot.active {
		background: var(--color-accent-primary);
	}

	.dot:hover {
		background: var(--color-neutral-500);
	}

	.dot.active:hover {
		background: var(--color-accent-strong);
	}

	.photo-info {
		text-align: center;
	}

	.photo-info p {
		margin: 0.25rem 0;
		color: var(--color-muted);
		font-size: 0.875rem;
	}

	.photo-description {
		font-style: italic;
		color: var(--color-neutral-500) !important;
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
