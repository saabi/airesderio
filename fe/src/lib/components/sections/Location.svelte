<script module lang='ts'>
	// ===== IMPORTS =====
	import Map from '$lib/components/features/Map.svelte';
	import type { MapComponent } from '$lib/components/features/Map.svelte';
	import PhotoCarousel from '$lib/components/features/PhotoCarousel.svelte';
	import Title from '$lib/components/ui/Title.svelte';
	import CircularButton from '$lib/components/ui/CircularButton.svelte';
	import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
	import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
	import Building from '$lib/components/icons/Building.svelte';
	import Gallery from '$lib/components/icons/Gallery.svelte';
	import type { PlacesCarouselData, PlaceMetadata, PlacesDataWithSvg, MapPlaceData, MapConfig } from '$lib/types';

	// ===== TYPES =====
	interface Props {
		// No props needed for carousel functionality
	}

	// Local utilities
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
	import {
		ANIMATION,
		animationDelay,
		animationDuration,
		animationOffset
	} from '$lib/constants/animation';

	// ===== STATIC CONSTANTS =====
	const PLACES_JSON_URL = '/places/places.json';
</script>

<script lang='ts'>
	// ===== IMPORTS =====
	import { browser } from '$app/environment';

	// ===== PROPS =====
	let {}: Props = $props();

	// ===== STATE =====
	let placesMetadata = $state<PlacesCarouselData | null>(null);
	let placesData = $state<PlacesDataWithSvg | null>(null);
	let mapPlaces = $state<MapPlaceData[]>([]);
	let mapConfig = $state<MapConfig | null>(null);
	let photoCarouselVisible = $state(false);
	let carouselPlace = $state<PlaceMetadata | null>(null);
	let carouselPlaceId = $state<string>('');
	let carouselPhotos = $state<string[]>([]);
	let carouselCurrentIndex = $state(0);
	let mapComponent: MapComponent | null = $state(null);

	// ===== DERIVED =====
	// Get current place from map to determine button states
	let currentPlaceId = $derived.by(() => mapComponent?.currentPathId ?? null);
	let hasPlaceSelected = $derived.by(() => currentPlaceId !== null);

	// ===== INSTANCE CONSTANTS =====
	const { action: locationObserver, visible: locationVisible } = createSectionObserver('location', {
		threshold: ANIMATION.threshold.section
	});

	// ===== STATE =====
	let titleVisible = $state(false);

	// ===== FUNCTIONS =====
	function createTitleObserver(element: HTMLElement) {
		if (!browser) return;

		let observer: IntersectionObserver | null = null;

		requestAnimationFrame(() => {
			observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							titleVisible = true;
							if (observer) {
								observer.unobserve(entry.target);
							}
						}
					}
				},
				{
					threshold: 0.1,
					rootMargin: '0px'
				}
			);

			observer.observe(element);
		});

		return {
			destroy() {
				if (observer) {
					observer.disconnect();
				}
			}
		};
	}


	// ===== EFFECTS =====
	// (Effects will be added here if needed)

	// ===== ASYNC FUNCTIONS =====
	// Load places data from JSON (includes SVG data)
	async function loadPlacesMetadata() {
		if (!browser) return;

		if (import.meta.env.DEV) {
			console.log('Loading places data from:', PLACES_JSON_URL);
		}
		try {
			const response = await fetch(PLACES_JSON_URL);
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
			const data: PlacesDataWithSvg = await response.json();
			placesData = data;
			
			// Transform to PlacesCarouselData for carousel
			placesMetadata = {
				places: Object.fromEntries(
					Object.entries(data.places).map(([id, place]) => [
						id,
						{
							nombre: place.nombre,
							descripcion: place.descripcion,
							thingstodo: place.thingstodo,
							photos: place.photos
						}
					])
				)
			};
			
			// Transform to MapPlaceData array for Map component
			mapPlaces = Object.entries(data.places).map(([id, place]) => ({
				id,
				name: place.nombre,
				svg: place.svg
			}));
			
			// Extract mapConfig
			mapConfig = data.mapConfig || null;
			
			if (import.meta.env.DEV) {
				console.log('Places data loaded successfully:', {
					totalPlaces: Object.keys(data.places || {}).length,
					hasMapConfig: !!data.mapConfig
				});
			}
		} catch (error) {
			console.error('Error loading places data:', error);
		}
	}

	// ===== EVENT HANDLERS =====
	// Open photo carousel
	function openPhotoCarousel(place: PlaceMetadata, placeId: string) {
		if (!place.photos || place.photos.length === 0) return;

		carouselPlace = place;
		carouselPlaceId = placeId;
		// Pass just filenames, not full paths - PhotoCarousel will construct paths
		carouselPhotos = place.photos;
		carouselCurrentIndex = 0;
		photoCarouselVisible = true;
	}

	// Close photo carousel
	function closePhotoCarousel() {
		photoCarouselVisible = false;
		carouselPlace = null;
		carouselPlaceId = '';
		carouselPhotos = [];
		carouselCurrentIndex = 0;
	}

	// Open gallery for current place on map
	function openGalleryForCurrentPlace() {
		if (!mapComponent || !placesMetadata) return;

		const currentPathId = mapComponent.currentPathId;
		if (!currentPathId) return;

		const place = placesMetadata.places?.[currentPathId];
		if (!place || !place.photos || place.photos.length === 0) return;

		openPhotoCarousel(place, currentPathId);
	}

	// Load places metadata when component mounts
	$effect(() => {
		loadPlacesMetadata();
	});

	// OLD FUNCTIONS - REMOVED (now handled by GoogleMap component)
</script>

<section
	id='ubicacion'
	class='ubi'
	aria-labelledby='ubicacion-heading'
	use:locationObserver
	data-section-active={$locationVisible}
>
	<div
		use:createTitleObserver
		class='title-block scroll-animate'
		data-item-active={titleVisible || undefined}
		style={`--scroll-animate-delay: ${animationDelay(0)}; --scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<Title eyebrow='¿Dónde se encuentra?' big='UBICACIÓN' />
	</div>
	<div class='location-block'>
		<div
			class='location-text scroll-animate'
			style={`--scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
		>
			<p>
				Aires de Río ofrece una ubicación de privilegio. Se emplaza sobre Avenida Rivadavia, a un
				paso de todo lo que esta ciudad ofrece para brindarte una vida placentera y cómoda.
			</p>
			<p>
				Ubicado en un área de modernos y elegantes desarrollos edilicios, centro de convenciones, de
				parques y hermosas zonas verdes.
			</p>
			<p>
				Plaza Vea, único centro de compras dentro del área urbana, te ofrece supermercado y shopping
				de cercanía a solo una cuadra.
			</p>
			<div class='map-navigation'>
				<div class='navigation-row'>
					<CircularButton
						variant="solid"
						size="sm"
						ariaLabel="Anterior ubicación"
						onClick={() => mapComponent?.prev()}
					>
						<ArrowLeft />
					</CircularButton>
					<div class='navigation-center'>
						<CircularButton
							variant="solid"
							size="sm"
							ariaLabel="Volver al estado inicial"
							onClick={() => mapComponent?.reset()}
							disabled={!hasPlaceSelected}
						>
							<Building />
						</CircularButton>
						<CircularButton
							variant="solid"
							size="sm"
							ariaLabel="Abrir galería de fotos"
							onClick={openGalleryForCurrentPlace}
							disabled={!hasPlaceSelected}
						>
							<Gallery />
						</CircularButton>
					</div>
					<CircularButton
						variant="solid"
						size="sm"
						ariaLabel="Siguiente ubicación"
						onClick={() => mapComponent?.next()}
					>
						<ArrowRight />
					</CircularButton>
				</div>
			</div>
		</div>
		<div
			class='map-container scroll-animate'
			style={`--scroll-animate-delay: ${animationDelay(1)}; --scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration()};`}
		>
			{#if mapPlaces.length > 0 && mapConfig}
				<Map
					bind:this={mapComponent}
					class='location-map'
					ariaLabel='Mapa de ubicación del proyecto Aires de Río'
					places={mapPlaces}
					mapConfig={mapConfig}
				/>
			{:else}
				<div class='location-map-loading'>Cargando mapa...</div>
			{/if}
		</div>
	</div>
</section>

<!-- Photo Carousel Component -->
{#if carouselPlace}
	<PhotoCarousel
		visible={photoCarouselVisible}
		place={carouselPlace}
		placeId={carouselPlaceId}
		photos={carouselPhotos}
		bind:currentIndex={carouselCurrentIndex}
		onClose={closePhotoCarousel}
	/>
{/if}


<style>
	#ubicacion {
		max-width: var(--max);
		margin: 0 auto;
		font-size: 1.4rem;
	}

	.ubi {
		/* Layout */
		margin: 1.625rem 0;
	}

	.title-block {
		margin: 0 1.75rem;
	}

	.location-block {
		/* Layout */
		display: grid;
		grid-template-columns: 0.5fr 1fr;
		gap: 0;
		overflow: hidden;
		position: relative;
		height: calc(100vh - var(--header-height));

		/* Box/Visual */
		border: 1px solid var(--color-border-strong);
		border-radius: 0.625rem;
	}

	.location-text {
		/* Layout */
		padding: 1.75rem;

		/* Box/Visual */
		/* Light, semi-transparent cream overlay with dark text for light theme */
		background: color-mix(in oklch, var(--ref-cream) 90%, transparent);
		backdrop-filter: blur(8px);

		/* Typography */
		color: var(--color-text-on-light);
	}

	.location-text p {
		/* Typography */
		font-size: 0.95em;
	}

	.map-navigation {
		/* Layout */
		margin-top: 1.5rem;
	}

	.navigation-row {
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}

	.navigation-center {
		/* Layout */
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}


	.map-container {
		/* Positioning */
		position: relative;
		overflow: hidden;

		/* Layout */
		display: grid;
		grid-template-columns: 1fr min-content;
		width: 100%;
		gap: 0;
	}

	:global(.location-map) {
		/* Layout */
		min-height: 25rem;
		overflow: hidden;

		/* Box/Visual */
		background: var(--color-bg-contrast);
		border-radius: 0.5rem;
	}

	/* Dark mode styles for location overlay */
	:global([data-theme='dark']) .location-text {
		/* Box/Visual */
		/* Darker semi-transparent overlay for dark mode */
		background: color-mix(in oklch, oklch(0.2 0 0deg) 85%, transparent);
		backdrop-filter: blur(8px);

		/* Typography */
		color: var(--color-text-primary);
	}

	@media (max-width: 850px) {
		.location-block {
			/* Layout */
			grid-template-columns: 1fr;
			/* Invert order on mobile */
			grid-template-rows: auto auto;
		}
		.location-text {
			/* Layout */
			max-width: 100%;
		}

		.map-container {
			/* Layout */
			grid-template-columns: 1fr;
			grid-template-rows: 50vh min-content;
		}
	}

	/* Info Window Snippet Styles */
	:global(.info-window) {
		/* Layout */
		max-width: 280px;
		padding: 0;
		margin: 0;

		/* Typography */
		font-family: system-ui, sans-serif;
	}

	:global(.info-header) {
		/* Layout */
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	:global(.category-indicator) {
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		flex-shrink: 0;

		/* Box/Visual */
		border: 1px solid var(--overlay-white-medium);
		border-radius: 50%;
		background-color: var(--category-color, var(--color-accent-primary));
		box-shadow: 0 1px 2px var(--shadow-medium);

		/* Typography */
		color: var(--color-text-inverse);
	}

	:global(.category-icon) {
		/* Typography */
		font-size: 8px;
		line-height: 1;
		text-shadow: 0 0 2px var(--overlay-black-40);
	}

	:global(.category-name) {
		/* Layout */
		margin-left: 0.5rem;

		/* Typography */
		font-size: 0.75rem;
		font-weight: 400;
		color: var(--color-text-secondary-dark);
	}

	:global(.place-name) {
		/* Layout */
		margin: 0;

		/* Typography */
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.2;
		color: var(--color-text-on-light);
	}

	:global(.info-content) {
		/* Layout */
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	:global(.address) {
		/* Layout */
		margin: 0;

		/* Typography */
		font-size: 0.875rem;
		line-height: 1.4;
		color: var(--color-text-secondary-dark);
	}

	:global(.badges) {
		/* Layout */
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	:global(.marker-wrapper) {
		/* Positioning */
		position: relative;
		z-index: 1000;

		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.marker-wrapper--main) {
		/* Positioning */
		z-index: 1001;
	}

	:global(.marker-dot) {
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;

		/* Box/Visual */
		background-color: var(--category-color, var(--color-accent-primary));
		border: 2px solid var(--color-text-inverse);
		border-radius: 50%;
		box-shadow: 0 2px 4px var(--shadow-strong);

		/* Typography */
		font-size: 10px;
		line-height: 1;
		font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;

		/* Misc/Overrides */
		cursor: pointer;

		/* Effects & Motion */
		transition: transform 0.2s ease;
	}

	:global(.marker-dot--main) {
		/* Layout */
		width: 28px;
		height: 28px;

		/* Box/Visual */
		border-width: 4px;

		/* Typography */
		font-size: 14px;

		/* Effects & Motion */
		animation: marker-pulse 2s infinite;
	}

	:global(.marker-icon) {
		/* Layout */
		display: inline-block;

		/* Typography */
		font-size: 12px;
		line-height: 1;
		font-weight: normal;
		font-style: normal;
		font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'Segoe UI Symbol',
			'Android Emoji', 'EmojiSymbols', sans-serif;
		color: var(--color-text-inverse);
		text-shadow: 0 0 2px var(--overlay-black-40);
		text-rendering: optimizeLegibility;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(.marker-icon--main) {
		/* Typography */
		font-size: 16px;
	}

	:global(.marker-fallback) {
		/* Layout */
		display: inline-block;

		/* Typography */
		font-size: 8px;
		line-height: 1;
		font-family: system-ui, sans-serif;
		font-weight: 700;
		color: var(--color-text-inverse);
		text-shadow: 0 0 2px var(--overlay-black-40);
	}

	:global(.marker-fallback--main) {
		/* Typography */
		font-size: 12px;
	}

	:global(.photo-trigger) {
		/* Positioning */
		position: absolute;
		top: -8px;
		right: -8px;
		z-index: 10;

		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		padding: 0;

		/* Box/Visual */
		background: var(--color-bg-contrast);
		border: 1px solid var(--color-border-subtle);
		border-radius: 50%;
		box-shadow: 0 1px 3px var(--shadow-medium);

		/* Typography */
		font-size: 8px;

		/* Misc/Overrides */
		cursor: pointer;

		/* Effects & Motion */
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	:global(.photo-trigger:hover) {
		/* Box/Visual */
		box-shadow: 0 2px 6px var(--shadow-strong);

		/* Effects & Motion */
		transform: scale(1.05);
	}

	:global(.distance-badge) {
		/* Layout */
		padding: 0.125rem 0.5rem;

		/* Box/Visual */
		border-radius: 0.25rem;

		/* Typography */
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-inverse);
	}

	:global(.distance-badge--very-near) {
		/* Box/Visual */
		background: var(--color-success-strong);
	}

	:global(.distance-badge--near) {
		/* Box/Visual */
		background: var(--color-warning);
	}

	:global(.distance-badge--far) {
		/* Box/Visual */
		background: var(--color-danger);
	}

	:global(.distance-detail) {
		/* Layout */
		padding: 0.125rem 0.5rem;

		/* Box/Visual */
		background-color: var(--color-bg-muted);
		border-radius: 0.25rem;

		/* Typography */
		font-size: 0.75rem;
		color: var(--color-text-on-light);
	}

	:global(.description) {
		/* Layout */
		margin: 0;

		/* Typography */
		font-size: 0.8rem;
		line-height: 1.3;
		font-style: italic;
		color: var(--color-text-tertiary);
	}

	:global(.photo-button) {
		/* Layout */
		padding: 0.5rem 0.75rem;
		align-self: flex-start;

		/* Box/Visual */
		background: var(--color-info);
		border: none;
		border-radius: 0.375rem;

		/* Typography */
		font-size: 0.875rem;
		color: var(--color-text-inverse);

		/* Misc/Overrides */
		cursor: pointer;

		/* Effects & Motion */
		transition: background-color 0.2s;
	}

	:global(.photo-button:hover) {
		/* Box/Visual */
		background: var(--color-info);
		opacity: 0.9;
	}

	:global(.photo-button:active) {
		/* Box/Visual */
		background: var(--color-info);
		opacity: 0.8;
	}

	:global(.custom-map-marker) {
		/* Positioning */
		position: absolute;
		top: 0;
		left: 0;

		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.custom-map-marker .marker-dot) {
		/* Effects & Motion */
		transition: transform 0.2s ease;
		transform-origin: center;
	}

	:global(.custom-map-marker:hover .marker-dot) {
		/* Effects & Motion */
		transform: scale(1.08);
	}

	/* Pulse animation for main marker */
	@keyframes marker-pulse {
		0% {
			/* Box/Visual */
			box-shadow:
				0 4px 8px var(--overlay-black-40),
				0 0 0 0 var(--brand-overlay-70);
		}
		50% {
			/* Box/Visual */
			box-shadow:
				0 4px 8px var(--overlay-black-40),
				0 0 0 8px var(--brand-overlay-30);
		}
		100% {
			/* Box/Visual */
			box-shadow:
				0 4px 8px var(--overlay-black-40),
				0 0 0 0 var(--brand-overlay-70);
		}
	}
</style>
