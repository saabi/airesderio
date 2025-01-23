<script lang="ts">
import { browser } from '$app/environment';

import CategorySelector from '$lib/components/CategorySelector.svelte';
import GoogleMap from '$lib/components/GoogleMap.svelte';
import PhotoCarousel from '$lib/components/PhotoCarousel.svelte';
import { createSectionObserver } from '$lib/utils/sectionVisibility';

	const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

	if (import.meta.env.DEV && !GOOGLE_MAPS_API_KEY) {
		console.error(
			'Missing VITE_GOOGLE_MAPS_API_KEY environment variable. Please create a .env file with your Google Maps API key.'
		);
	}

	// Component props
	interface Props {
		jsonUrl?: string;
		showPlaceMarkers?: boolean;
		enableClustering?: boolean;
		categoryFilter?: string[];
	}

	interface MarkerData {
		id: string;
		position: { lat: number; lng: number };
		title: string;
		category: string;
		placeId: string;
		place: any;
		isMainMarker: boolean;
	}

	let { 
		jsonUrl = '/lugares/lugares-direcciones.json',
		showPlaceMarkers = true,
		enableClustering = false,
		categoryFilter = []
	}: Props = $props();

	// --- COMPONENT STATE VARIABLES ---
	// @fold:start(state-vars)
	let placesData = $state<any>(null);
	let googleMapRef = $state<any>(null);
	let mapCenter = $state({ lat: -27.779686, lng: -64.258992 });
	let photoCarouselVisible = $state(false);
	let carouselPlace = $state<any>(null);
	let carouselCategory = $state<string>('');
	let carouselPlaceId = $state<string>('');
	let carouselPhotos = $state<string[]>([]);
	let carouselCurrentIndex = $state(0);
	// @fold:end

	let hasInitializedCategoryFilter = $state(false);
	let activeMarkerId = $state<string | null>(null);
	let mapInitialized = $state(false);
	let hasAutoOpenedMainMarker = $state(false);

	// All category data is now loaded from JSON metadata
	let categories = $derived(placesData?.metadata?.categories || {});
	
	let categoryIcons = $derived.by(() => {
		const icons: Record<string, string> = {};
		Object.entries(categories).forEach(([key, category]: [string, any]) => {
			icons[key] = category.icon || '';
		});
		return icons;
	});
	
	let categoryNames = $derived.by(() => {
		const names: Record<string, string> = {};
		Object.entries(categories).forEach(([key, category]: [string, any]) => {
			names[key] = category.name || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
		});
		return names;
	});
	
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

const { action: locationObserver, visible: locationVisible } = createSectionObserver('location', {
    threshold: 0.3
});

	let selectableCategories = $derived.by(() => {
		if (!placesData) return [];

		return Object.keys(placesData.lugares || {}).filter((category: string) => {
			const categoryMeta = placesData.metadata?.categories?.[category];
			return !categoryMeta?.isAlwaysVisible;
		});
	});

	let alwaysVisibleCategories = $derived.by(() => {
		if (!placesData) return [];

		const meta = placesData.metadata?.categories || {};
		return Object.entries(meta)
			.filter(([, category]: [string, any]) => category?.isAlwaysVisible)
			.map(([key]) => key);
	});

	let allMarkers = $derived.by<MarkerData[]>(() => {
		if (!placesData) return [];

		const markers: MarkerData[] = [];

		Object.entries(placesData.lugares || {}).forEach(([category, places]: [string, any]) => {
			Object.entries(places).forEach(([placeId, place]: [string, any]) => {
				if (!place?.coordenadas_aproximadas) return;

				markers.push({
					id: `${category}_${placeId}`,
					position: place.coordenadas_aproximadas,
					title: place.nombre,
					category,
					placeId,
					place: place as any,
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


	// Load places data from JSON
	async function loadPlacesData() {
		if (!browser || !jsonUrl) return;
		
		console.log('Loading places data from:', jsonUrl);
		try {
				const response = await fetch(jsonUrl);
				if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
				const data = await response.json();
				placesData = data;
				hasInitializedCategoryFilter = false;
				activeMarkerId = null;
				hasAutoOpenedMainMarker = false;
				console.log('Places data loaded successfully:', {
					totalCategories: Object.keys(data.lugares).length,
					hasMainBuilding: !!findMainBuilding(data),
					categoriesLoaded: Object.keys(data.metadata?.categories || {}).length,
					categories: $state.snapshot(data.metadata?.categories)
			});
		} catch (error) {
			console.error('Error loading places data:', error);
		}
	}

	// Open photo carousel
	function openPhotoCarousel(place: any, category: string, placeId: string) {
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
	function handleMarkerClick(marker: any) {
		activeMarkerId = marker.id;
	}

	function handleMarkerPhotoClick(marker: any) {
		if (marker?.place?.photos && marker.place.photos.length > 0) {
			openPhotoCarousel(marker.place, marker.category, marker.placeId);
		}
	}

	// Handle info window close from GoogleMap component
	function handleInfoWindowClose(markerId: string) {
		if (activeMarkerId === markerId) {
			activeMarkerId = null;
		}
	}

	// Handle map ready event
	function handleMapReady(mapInstance: any) {
		console.log('🗺️ Map is ready:', mapInstance);
		
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
	function findMainBuilding(data: any = placesData) {
		if (!data) return null;
		
		for (const [category, places] of Object.entries(data.lugares || {})) {
			for (const [placeId, place] of Object.entries(places as any)) {
				if ((place as any).es_edificio_principal) {
					return {
						category,
						placeId,
						place: place as any
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

	// Debug categories loading
	$effect(() => {
		if (Object.keys(categories).length > 0) {
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
					{@const isMainMarker = marker.isMainMarker || marker.place?.es_edificio_principal}
					{@const categoryClass = toCategoryClass(marker.category)}
					{@const icon = categoryIcons[marker.category]}
					{#if isMainMarker}
						{console.log('🎨 RENDERING MAIN MARKER SNIPPET:', {
							title: marker.title,
							category: marker.category,
							icon,
							size: isMainMarker ? 28 : 16,
							categoryData: $state.snapshot(categories[marker.category]),
							isAlwaysVisible: categories[marker.category]?.isAlwaysVisible
						})}
					{/if}
					
					<div class={`marker-wrapper ${isMainMarker ? 'marker-wrapper--main' : ''}`}>
						<div
							class={`marker-dot category-color ${categoryClass} ${isMainMarker ? 'marker-dot--main' : ''}`}
							role='button'
							tabindex='0'
							aria-label={icon ? `Location marker: ${icon} ${marker.title}` : `Location marker: ${marker.title}`}
						>
							{#if icon}
								<span class={`marker-icon ${isMainMarker ? 'marker-icon--main' : ''}`}>
									{icon}
								</span>
								{console.log('🎨 EMOJI ICON RENDERED:', {
									title: marker.title,
									category: marker.category,
									icon,
									isMainMarker
								})}
							{:else}
								<!-- Simple fallback dot for missing icon -->
								<span class={`marker-fallback ${isMainMarker ? 'marker-fallback--main' : ''}`}>●</span>
								{console.log('❌ NO ICON, using dot fallback:', {
									title: marker.title,
									category: marker.category
								})}
							{/if}
						</div>
						
						{#if marker.place?.photos && marker.place.photos.length > 0}
							<button 
								data-photo-trigger
								type='button'
								class='photo-trigger'
								aria-label={`View ${marker.place.photos.length} photo${marker.place.photos.length > 1 ? 's' : ''} for ${marker.title}`}
							>
								📷
							</button>
						{/if}
					</div>
				{/snippet}

				{#snippet markerInfoWindow(marker)}
					{@const categoryClass = toCategoryClass(marker.category)}
					{@const distanceClass = getDistanceBadgeClass(marker.place.distancia_categoria)}
					{@const placeNameId = `place-name-${marker.id}`}
					<div class='info-window' role='dialog' aria-labelledby={placeNameId} aria-label={`Information about ${marker.place.nombre}`}>
						<div class='info-header'>
							<div class={`category-indicator category-color ${categoryClass}`}>
								{#if categoryIcons[marker.category]}
									<span class='category-icon'>{categoryIcons[marker.category]}</span>
								{/if}
							</div>
							<h3 class='place-name' id={placeNameId}>{marker.place.nombre}</h3>
							{#if categoryNames[marker.category]}
								<span class='category-name'>({categoryNames[marker.category]})</span>
							{/if}
						</div>
						
						<div class='info-content'>
							<p class='address'>
								📍 {marker.place.direccion}
							</p>
							
							<div class='badges'>
								<span class={`distance-badge ${distanceClass}`}>
									{marker.place.distancia_categoria}
								</span>
								<span class='distance-detail'>
									{marker.place.distancia_cuadras || marker.place.distancia_aproximada}
								</span>
							</div>
							
							{#if marker.place.descripcion}
								<p class='description'>{marker.place.descripcion}</p>
							{/if}
							
							{#if marker.place.photos && marker.place.photos.length > 0}
								<button class='photo-button' onclick={() => openPhotoCarousel(marker.place, marker.category, marker.placeId)}>
									📷 Ver {marker.place.photos.length} foto{marker.place.photos.length > 1 ? 's' : ''}
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
			
				<CategorySelector 
					{placesData}
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
		</div>
	</div>
</section>

<!-- Photo Carousel Component -->
<PhotoCarousel 
	visible={photoCarouselVisible}
	place={carouselPlace}
	category={carouselCategory}
	placeId={carouselPlaceId}
	photos={carouselPhotos}
	bind:currentIndex={carouselCurrentIndex}
	onClose={closePhotoCarousel}
/>

<style>
	.ubi {
		margin: 1.625rem 0;
	}

	.location-block {
		display: grid;
		grid-template-columns: min-content 1fr;
		gap: 0;
		background: var(--color-accent-primary);
		border-radius: 0.625rem;
		overflow: hidden;
		border: 1px solid var(--color-border-strong);
	}

	.location-text {
		max-width: 40ch;
		padding: 1.75rem;
		color: var(--color-text-on-accent);
	}

	.location-eyebrow {
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: 0.9em;
		display: inline-block;
		margin-bottom: 0.5rem;
		color: var(--color-text-on-accent);
		opacity: 0.95;
	}

	.location-text h3 {
		font-size: 2.5em;
		line-height: 1.1;
		margin: 0 0 1rem;
	}

	.location-text p {
		font-size: 0.95em;
	}

	.map-container {
		display: grid;
		grid-template-columns: 1fr min-content;
		width: 100%;
		gap: 0;
	}

	.location-map {
		min-height: 25rem;
		border-radius: 0.5rem;
		overflow: hidden;
		background: var(--color-bg-contrast);
	}

	.location-map--placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-muted);
	}

	.location-map__message {
		color: var(--color-text-secondary);
		font-size: 0.95rem;
	}



	@media (max-width: 850px) {
		.location-block {
			grid-template-columns: 1fr;
			/* Invert order on mobile */
			grid-template-rows: auto auto;
		}
		.location-text {
			max-width: 100%;
		}
		.location-text h3 {
			font-size: 2em; /* smaller location title */
		}

		.map-container {
			grid-template-columns: 1fr;
			grid-template-rows: 50vh min-content;
		}
	}

	/* Info Window Snippet Styles */
	:global(.info-window) {
		max-width: 280px;
		font-family: system-ui, sans-serif;
		padding: 0;
		margin: 0;
	}

	:global(.info-header) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	:global(.category-indicator) {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--overlay-white-medium);
		background-color: var(--category-color, var(--color-accent-primary));
		box-shadow: 0 1px 2px var(--shadow-medium);
		color: var(--color-text-inverse);
	}

	:global(.category-icon) {
		font-size: 8px;
		line-height: 1;
		text-shadow: 0 0 2px var(--overlay-black-40);
	}

	:global(.category-name) {
		font-size: 0.75rem;
		color: var(--color-text-secondary-dark);
		font-weight: 400;
		margin-left: 0.5rem;
	}

	:global(.place-name) {
		margin: 0;
		color: var(--color-text-on-light);
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.2;
	}

	:global(.info-content) {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	:global(.address) {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-text-secondary-dark);
		line-height: 1.4;
	}

	:global(.badges) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	:global(.marker-wrapper) {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	:global(.marker-wrapper--main) {
		z-index: 1001;
	}

	:global(.marker-dot) {
		width: 16px;
		height: 16px;
		background-color: var(--category-color, var(--color-accent-primary));
		border: 2px solid var(--color-text-inverse);
		border-radius: 50%;
		box-shadow: 0 2px 4px var(--shadow-strong);
		cursor: pointer;
		transition: transform 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		line-height: 1;
		font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
	}

	:global(.marker-dot--main) {
		width: 28px;
		height: 28px;
		border-width: 4px;
		font-size: 14px;
		animation: marker-pulse 2s infinite;
	}

	:global(.marker-icon) {
		display: inline-block;
		font-size: 12px;
		line-height: 1;
		color: var(--color-text-inverse);
		text-shadow: 0 0 2px var(--overlay-black-40);
		font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", "EmojiSymbols", sans-serif;
		font-weight: normal;
		font-style: normal;
		text-rendering: optimizeLegibility;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(.marker-icon--main) {
		font-size: 16px;
	}

	:global(.marker-fallback) {
		display: inline-block;
		font-size: 8px;
		line-height: 1;
		font-family: system-ui, sans-serif;
		font-weight: 700;
		color: var(--color-text-inverse);
		text-shadow: 0 0 2px var(--overlay-black-40);
	}

	:global(.marker-fallback--main) {
		font-size: 12px;
	}

	:global(.photo-trigger) {
		position: absolute;
		top: -8px;
		right: -8px;
		width: 16px;
		height: 16px;
		background: var(--color-bg-contrast);
		border: 1px solid var(--color-border-subtle);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 8px;
		cursor: pointer;
		box-shadow: 0 1px 3px var(--shadow-medium);
		z-index: 10;
		padding: 0;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	:global(.photo-trigger:hover) {
		transform: scale(1.05);
		box-shadow: 0 2px 6px var(--shadow-strong);
	}

	:global(.distance-badge) {
		color: var(--color-text-inverse);
		padding: 0.125rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
	}

	:global(.distance-badge--very-near) {
		background: var(--color-success-strong);
	}

	:global(.distance-badge--near) {
		background: var(--color-warning);
	}

	:global(.distance-badge--far) {
		background: var(--color-danger);
	}

	:global(.distance-detail) {
		background-color: var(--color-bg-muted);
		color: var(--color-text-on-light);
		padding: 0.125rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
	}

	:global(.description) {
		margin: 0;
		font-size: 0.8rem;
		color: var(--color-text-tertiary);
		font-style: italic;
		line-height: 1.3;
	}

	:global(.photo-button) {
		background: var(--color-info);
		color: var(--color-text-inverse);
		border: none;
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		cursor: pointer;
		transition: background-color 0.2s;
		align-self: flex-start;
	}

	:global(.photo-button:hover) {
		background: var(--color-info);
		opacity: 0.9;
	}

	:global(.photo-button:active) {
		background: var(--color-info);
		opacity: 0.8;
	}

	:global(.custom-map-marker) {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.custom-map-marker .marker-dot) {
		transition: transform 0.2s ease;
		transform-origin: center;
	}

	:global(.custom-map-marker:hover .marker-dot) {
		transform: scale(1.08);
	}

	/* Pulse animation for main marker */
	@keyframes marker-pulse {
		0% {
			box-shadow: 0 4px 8px var(--overlay-black-40), 0 0 0 0 var(--brand-overlay-70);
		}
		50% {
			box-shadow: 0 4px 8px var(--overlay-black-40), 0 0 0 8px var(--brand-overlay-30);
		}
		100% {
			box-shadow: 0 4px 8px var(--overlay-black-40), 0 0 0 0 var(--brand-overlay-70);
		}
	}
</style>
