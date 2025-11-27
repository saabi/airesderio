<script module lang="ts">
	// ===== IMPORTS =====
	import CategorySelector from '$lib/components/features/CategorySelector.svelte';
	import GoogleMap from '$lib/components/features/GoogleMap.svelte';
	import PhotoCarousel from '$lib/components/features/PhotoCarousel.svelte';
	import type { PlacesData, MarkerData, Place, MainBuilding, Category } from '$lib/types';

	// ===== TYPES =====
	// Type for GoogleMap component instance
	interface GoogleMapInstance {
		fitToMarkers: () => void;
	}

	interface Props {
		jsonUrl?: string;
		showPlaceMarkers?: boolean;
		enableClustering?: boolean;
		categoryFilter?: string[];
	}

	// ===== STATIC CONSTANTS =====
	const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
	const DEFAULT_JSON_URL = '/lugares/lugares-direcciones.json';
	const DEFAULT_MAP_CENTER = { lat: -27.779686, lng: -64.258992 };

	if (import.meta.env.DEV && !GOOGLE_MAPS_API_KEY) {
		console.error(
			'Missing VITE_GOOGLE_MAPS_API_KEY environment variable. Please create a .env file with your Google Maps API key.'
		);
	}
</script>

<script lang="ts">
	// ===== IMPORTS =====
	import { browser } from '$app/environment';
	import { createSectionObserver } from '$lib/utils/sectionVisibility';

	// ===== PROPS =====
	let { 
		jsonUrl = DEFAULT_JSON_URL,
		showPlaceMarkers = true,
		enableClustering = false,
		categoryFilter = []
	}: Props = $props();

	// ===== STATE =====
	let placesData = $state<PlacesData | null>(null);
	let googleMapRef = $state<GoogleMapInstance | null>(null);
	let mapCenter = $state(DEFAULT_MAP_CENTER);
	let photoCarouselVisible = $state(false);
	let carouselPlace = $state<Place | null>(null);
	let carouselCategory = $state<string>('');
	let carouselPlaceId = $state<string>('');
	let carouselPhotos = $state<string[]>([]);
	let carouselCurrentIndex = $state(0);
	let hasInitializedCategoryFilter = $state(false);
	let activeMarkerId = $state<string | null>(null);
	let mapInitialized = $state(false);
	let hasAutoOpenedMainMarker = $state(false);

	// ===== DERIVED =====
	// All category data is now loaded from JSON metadata
	let categories = $derived<Record<string, Category>>(placesData?.metadata?.categories || {});
	
	let categoryIcons = $derived.by(() => {
		const icons: Record<string, string> = {};
		Object.entries(categories).forEach(([key, category]: [string, any]) => {
			icons[key] = category.icon || '';
		});
		return icons;
	});
	
	let categoryNames = $derived.by(() => {
		const names: Record<string, string> = {};
		Object.entries(categories).forEach(([key, category]: [string, Category]) => {
			names[key] = category.name || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
		});
		return names;
	});
	
	// ===== INSTANCE CONSTANTS =====
	const { action: locationObserver, visible: locationVisible } = createSectionObserver('location', {
		threshold: 0.3
	});

	// ===== UTILITY FUNCTIONS =====
	const toCategoryClass = (category: string) =>
		`category-${category.replace(/[^a-z0-9]+/gi, '-')}`;

	const getDistanceBadgeClass = (value: string | undefined) => {
		switch (value) {
			case 'MUY CERCA':
				return 'distance-badge--very-near';
			case 'CERCANO':
				return 'distance-badge--near';
			default:
				return 'distance-badge--far';
		}
	};

	let selectableCategories = $derived.by(() => {
		if (!placesData) return [];

		return Object.keys(placesData.lugares || {}).filter((category: string) => {
			const categoryMeta = placesData?.metadata?.categories?.[category];
			return !categoryMeta?.isAlwaysVisible;
		});
	});

	let alwaysVisibleCategories = $derived.by(() => {
		if (!placesData) return [];

		const meta = placesData.metadata?.categories || {};
		return Object.entries(meta)
			.filter(([, category]: [string, Category]) => category?.isAlwaysVisible)
			.map(([key]) => key);
	});

	let allMarkers = $derived.by<MarkerData[]>(() => {
		if (!placesData) return [];

		const markers: MarkerData[] = [];

		Object.entries(placesData.lugares || {}).forEach(([category, places]: [string, Record<string, Place>]) => {
			Object.entries(places).forEach(([placeId, place]: [string, Place]) => {
				if (!place?.coordenadas_aproximadas) return;

				markers.push({
					id: `${category}_${placeId}`,
					position: place.coordenadas_aproximadas,
					title: place.nombre,
					category,
					placeId,
					place,
					isMainMarker: !!place.es_edificio_principal
				});
			});
		});

		return markers;
	});

	let mainMarker = $derived.by<MarkerData | null>(() => allMarkers.find((marker) => marker.isMainMarker) || null);
	let mainMarkerId = $derived.by<string | null>(() => mainMarker?.id ?? null);

	let visibleMarkers = $derived.by<MarkerData[]>(() => {
		if (!allMarkers.length) return [];

		const alwaysVisibleSet = new Set(alwaysVisibleCategories);
		if (mainMarker?.category) {
			alwaysVisibleSet.add(mainMarker.category);
		}

		const selectedCategories = new Set(categoryFilter);
		alwaysVisibleSet.forEach((category) => selectedCategories.add(category));

		return allMarkers.filter((marker) => {
			if (!showPlaceMarkers && !alwaysVisibleSet.has(marker.category)) {
				return false;
			}

			return selectedCategories.has(marker.category);
		});
	});

	// ===== EFFECTS =====
	// (Effects will be added here if needed)

	// ===== ASYNC FUNCTIONS =====
	// Load places data from JSON
	async function loadPlacesData() {
		if (!browser || !jsonUrl) return;
		
		if (import.meta.env.DEV) {
			console.log('Loading places data from:', jsonUrl);
		}
		try {
				const response = await fetch(jsonUrl);
				if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
				const data = await response.json();
				placesData = data;
				hasInitializedCategoryFilter = false;
				activeMarkerId = null;
				hasAutoOpenedMainMarker = false;
				if (import.meta.env.DEV) {
					console.log('Places data loaded successfully:', {
						totalCategories: Object.keys(data.lugares).length,
						hasMainBuilding: !!findMainBuilding(data),
						categoriesLoaded: Object.keys(data.metadata?.categories || {}).length,
						categories: $state.snapshot(data.metadata?.categories)
					});
				}
		} catch (error) {
			console.error('Error loading places data:', error);
		}
	}

	// ===== EVENT HANDLERS =====
	// Open photo carousel
	function openPhotoCarousel(place: Place, category: string, placeId: string) {
		if (!place.photos || place.photos.length === 0) return;
		
		carouselPlace = place;
		carouselCategory = category;
		carouselPlaceId = placeId;
		carouselPhotos = place.photos.map((filename: string) => `/lugares/${category}/${placeId}/${filename}`);
		carouselCurrentIndex = 0;
		photoCarouselVisible = true;
	}

	// Close photo carousel
	function closePhotoCarousel() {
		photoCarouselVisible = false;
		carouselPlace = null;
		carouselCategory = '';
		carouselPlaceId = '';
		carouselPhotos = [];
		carouselCurrentIndex = 0;
	}

	// Toggle markers visibility
	function toggleMarkers() {
		showPlaceMarkers = !showPlaceMarkers;
	}

	// Toggle category filter
	function toggleCategory(category: string) {
		if (categoryFilter.includes(category)) {
			categoryFilter = categoryFilter.filter((c) => c !== category);
		} else {
			categoryFilter = [...categoryFilter, category];
		}
	}

	function setCategoryFilter(categories: string[]) {
		categoryFilter = categories;
	}

	// Marker creation is now handled by snippets in GoogleMap component

	// Handle marker click from GoogleMap component
	function handleMarkerClick(marker: MarkerData | { id: string; [key: string]: unknown }) {
		activeMarkerId = marker.id;
	}

	function handleMarkerPhotoClick(marker: MarkerData | { place?: Place; category?: string; placeId?: string; [key: string]: unknown }) {
		if ('place' in marker && marker.place && 'category' in marker && 'placeId' in marker) {
			const typedMarker = marker as MarkerData;
			if (typedMarker.place?.photos && typedMarker.place.photos.length > 0) {
				openPhotoCarousel(typedMarker.place, typedMarker.category, typedMarker.placeId);
			}
		}
	}

	// Handle info window close from GoogleMap component
	function handleInfoWindowClose(markerId: string) {
		if (activeMarkerId === markerId) {
			activeMarkerId = null;
		}
	}

	// Handle map ready event
	function handleMapReady(mapInstance: google.maps.Map) {
		if (import.meta.env.DEV) {
			console.log('🗺️ Map is ready:', mapInstance);
		}
		
		// Only clear user closed state and auto-open main marker on first initialization
		if (!mapInitialized) {
			mapInitialized = true;
			
			// Allow auto-open effect to run once data and markers are ready
			hasAutoOpenedMainMarker = false;
		}
	}

	// Fit map bounds using GoogleMap component
	function fitMapToMarkers() {
		if (googleMapRef) {
			googleMapRef.fitToMarkers();
		}
	}

	// Find the main building from JSON data
	function findMainBuilding(data: PlacesData | null = placesData): MainBuilding | null {
		if (!data) return null;
		
		for (const [category, places] of Object.entries(data.lugares || {})) {
			for (const [placeId, place] of Object.entries(places)) {
				const typedPlace = place as Place;
				if (typedPlace.es_edificio_principal) {
					return {
						category,
						placeId,
						place: typedPlace
					};
				}
			}
		}
		return null;
	}


	// Load places data when component mounts
	$effect(() => {
		loadPlacesData();
	});

	// Update map center when main marker is available
	$effect(() => {
		if (mainMarker?.place?.coordenadas_aproximadas) {
			const { lat, lng } = mainMarker.place.coordenadas_aproximadas;
			mapCenter = { lat, lng };
		}
	});

	// Ensure the main marker opens once when the map and data are ready
	$effect(() => {
		if (!mapInitialized || hasAutoOpenedMainMarker) return;
		if (!mainMarkerId) return;

		const visibleIds = new Set(visibleMarkers.map((marker) => marker.id));
		if (!visibleIds.has(mainMarkerId)) return;

		activeMarkerId = mainMarkerId;
		hasAutoOpenedMainMarker = true;
	});

	// Keep the active marker in sync with the currently visible markers
	$effect(() => {
		if (!activeMarkerId) return;

		const visibleIds = new Set(visibleMarkers.map((marker) => marker.id));
		if (!visibleIds.has(activeMarkerId)) {
			activeMarkerId = null;
		}
	});

	$effect(() => {
		if (import.meta.env.DEV && Object.keys(categories).length > 0) {
			console.log('🎨 Categories loaded:', {
				totalCategories: Object.keys(categories).length,
				mainBuildingCategory: $state.snapshot(categories.edificio_principal),
				allCategories: Object.keys(categories)
			});
		}
	});

	$effect(() => {
		if (!placesData || hasInitializedCategoryFilter) return;

		// Initialize category filter - set to empty array so all categories start unselected
		// To start with all categories selected, uncomment the line below:
		// if (selectableCategories.length > 0 && categoryFilter.length === 0) {
		// 	categoryFilter = [...selectableCategories];
		// }

		hasInitializedCategoryFilter = true;
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
    <div class='location-block'>
        <div
            class='location-text scroll-animate'
            style='--scroll-animate-offset: 48px; --scroll-animate-duration: 520ms;'
        >
            <span class='location-eyebrow'>Ubicación</span>
            <h3>¿DÓNDE SE ENCUENTRA?</h3>
            <p>
                Aires de Río ofrece una ubicación de privilegio. Se emplaza sobre Avenida Rivadavia, a un paso
                de todo lo que esta ciudad ofrece para brindarte una vida placentera y cómoda.
			</p>
			<p>
				Ubicado en un área de modernos y elegantes desarrollos edilicios, centro de convenciones, de
				parques y hermosas zonas verdes.
			</p>
			<p>
                Plaza Vea, único centro de compras dentro del área urbana, te ofrece supermercado y shopping
                de cercanía a solo una cuadra.
            </p>
        </div>
        <div
            class='map-container scroll-animate'
            style='--scroll-animate-delay: 140ms; --scroll-animate-offset: 60px; --scroll-animate-duration: 540ms;'
        >
			{#if placesData && visibleMarkers.length > 0}
				<GoogleMap
					bind:this={googleMapRef}
					apiKey={GOOGLE_MAPS_API_KEY}
					mapId='AIRES_DE_RIO_MAP'
					center={mapCenter}
					zoom={15}
					markers={visibleMarkers}
					activeMarkerId={activeMarkerId}
					onMarkerClick={handleMarkerClick}
					onMapReady={handleMapReady}
					onInfoWindowClose={handleInfoWindowClose}
					onMarkerPhotoClick={handleMarkerPhotoClick}
					containerClass='location-map'
				>
				{#snippet markerElement(marker)}
					{@const typedMarker = marker as MarkerData}
					{@const isMainMarker = typedMarker.isMainMarker || typedMarker.place?.es_edificio_principal}
					{@const categoryClass = toCategoryClass(typedMarker.category)}
					{@const icon = categoryIcons[typedMarker.category]}
					
					<div class={`marker-wrapper ${isMainMarker ? 'marker-wrapper--main' : ''}`}>
						<div
							class={`marker-dot category-color ${categoryClass} ${isMainMarker ? 'marker-dot--main' : ''}`}
							role='button'
							tabindex='0'
							aria-label={icon ? `Location marker: ${icon} ${typedMarker.title}` : `Location marker: ${typedMarker.title}`}
						>
							{#if icon}
								<span class={`marker-icon ${isMainMarker ? 'marker-icon--main' : ''}`}>
									{icon}
								</span>
							{:else}
								<!-- Simple fallback dot for missing icon -->
								<span class={`marker-fallback ${isMainMarker ? 'marker-fallback--main' : ''}`}>●</span>
							{/if}
						</div>
						
						{#if typedMarker.place?.photos && typedMarker.place.photos.length > 0}
							<button 
								data-photo-trigger
								type='button'
								class='photo-trigger'
								aria-label={`View ${typedMarker.place.photos.length} photo${typedMarker.place.photos.length > 1 ? 's' : ''} for ${typedMarker.title}`}
							>
								📷
							</button>
						{/if}
					</div>
				{/snippet}

				{#snippet markerInfoWindow(marker)}
					{@const typedMarker = marker as MarkerData}
					{@const categoryClass = toCategoryClass(typedMarker.category)}
					{@const distanceClass = getDistanceBadgeClass(typedMarker.place.distancia_categoria || '')}
					{@const placeNameId = `place-name-${typedMarker.id}`}
					<div class='info-window' role='dialog' aria-labelledby={placeNameId} aria-label={`Information about ${typedMarker.place.nombre}`}>
						<div class='info-header'>
							<div class={`category-indicator category-color ${categoryClass}`}>
								{#if categoryIcons[typedMarker.category]}
									<span class='category-icon'>{categoryIcons[typedMarker.category]}</span>
								{/if}
							</div>
							<h3 class='place-name' id={placeNameId}>{typedMarker.place.nombre}</h3>
							{#if categoryNames[typedMarker.category]}
								<span class='category-name'>({categoryNames[typedMarker.category]})</span>
							{/if}
						</div>
						
						<div class='info-content'>
							<p class='address'>
								📍 {typedMarker.place.direccion || typedMarker.place.direccion_aproximada || ''}
							</p>
							
							<div class='badges'>
								<span class={`distance-badge ${distanceClass}`}>
									{typedMarker.place.distancia_categoria || ''}
								</span>
								<span class='distance-detail'>
									{typedMarker.place.distancia_cuadras || typedMarker.place.distancia_aproximada || ''}
								</span>
							</div>
							
							{#if typedMarker.place.descripcion}
								<p class='description'>{typedMarker.place.descripcion}</p>
							{/if}
							
							{#if typedMarker.place.photos && typedMarker.place.photos.length > 0}
								<button 
									class='photo-button' 
									onclick={() => openPhotoCarousel(typedMarker.place, typedMarker.category, typedMarker.placeId)}
									aria-label={`Ver ${typedMarker.place.photos.length} foto${typedMarker.place.photos.length > 1 ? 's' : ''} de ${typedMarker.place.nombre}`}
								>
									📷 Ver {typedMarker.place.photos.length} foto{typedMarker.place.photos.length > 1 ? 's' : ''}
								</button>
							{/if}
						</div>
					</div>
				{/snippet}
			</GoogleMap>
			{:else}
				<div class='location-map location-map--placeholder'>
					<p class='location-map__message'>Cargando mapa...</p>
				</div>
			{/if}
			
				{#if placesData}
					<CategorySelector 
						placesData={placesData}
						{showPlaceMarkers}
						{categoryFilter}
						{categoryIcons}
						{categoryNames}
						markersCount={visibleMarkers.length}
						onToggleMarkers={toggleMarkers}
						onCategoryToggle={toggleCategory}
						onSetCategoryFilter={setCategoryFilter}
						onFitToView={fitMapToMarkers}
					/>
				{/if}
		</div>
	</div>
</section>

<!-- Photo Carousel Component -->
{#if carouselPlace}
	<PhotoCarousel 
		visible={photoCarouselVisible}
		place={carouselPlace}
		category={carouselCategory}
		placeId={carouselPlaceId}
		photos={carouselPhotos}
		bind:currentIndex={carouselCurrentIndex}
		onClose={closePhotoCarousel}
	/>
{/if}

<style>
	.ubi {
		/* Layout */
		margin: 1.625rem 0;
	}

	.location-block {
		/* Layout */
		display: grid;
		grid-template-columns: min-content 1fr;
		gap: 0;
		overflow: hidden;
		
		/* Box/Visual */
		background: var(--color-accent-primary);
		border: 1px solid var(--color-border-strong);
		border-radius: 0.625rem;
	}

	.location-text {
		/* Layout */
		max-width: 40ch;
		padding: 1.75rem;
		
		/* Typography */
		color: var(--color-text-on-accent);
	}

	.location-eyebrow {
		/* Layout */
		display: inline-block;
		margin-bottom: 0.5rem;
		
		/* Typography */
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: 0.9em;
		color: var(--color-text-on-accent);
		
		/* Box/Visual */
		opacity: 0.95;
	}

	.location-text h3 {
		/* Layout */
		margin: 0 0 1rem;
		
		/* Typography */
		font-size: 2.5em;
		line-height: 1.1;
	}

	.location-text p {
		/* Typography */
		font-size: 0.95em;
	}

	.map-container {
		/* Layout */
		display: grid;
		grid-template-columns: 1fr min-content;
		width: 100%;
		gap: 0;
	}

	.location-map {
		/* Layout */
		min-height: 25rem;
		overflow: hidden;
		
		/* Box/Visual */
		background: var(--color-bg-contrast);
		border-radius: 0.5rem;
	}

	.location-map--placeholder {
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		
		/* Box/Visual */
		background: var(--color-bg-muted);
	}

	.location-map__message {
		/* Typography */
		font-size: 0.95rem;
		color: var(--color-text-secondary);
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
		.location-text h3 {
			/* Typography */
			font-size: 2em; /* smaller location title */
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
		font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
		
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
		font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", "EmojiSymbols", sans-serif;
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
		transition: transform 0.2s ease, box-shadow 0.2s ease;
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
			box-shadow: 0 4px 8px var(--overlay-black-40), 0 0 0 0 var(--brand-overlay-70);
		}
		50% {
			/* Box/Visual */
			box-shadow: 0 4px 8px var(--overlay-black-40), 0 0 0 8px var(--brand-overlay-30);
		}
		100% {
			/* Box/Visual */
			box-shadow: 0 4px 8px var(--overlay-black-40), 0 0 0 0 var(--brand-overlay-70);
		}
	}
</style>
