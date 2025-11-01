<script lang="ts">
	import { browser } from '$app/environment';

	import CategorySelector from '$lib/components/CategorySelector.svelte';
	import GoogleMap from '$lib/components/GoogleMap.svelte';
	import PhotoCarousel from '$lib/components/PhotoCarousel.svelte';

	const GOOGLE_MAPS_API_KEY = 'AIzaSyAEjLiUxzFltYqAYYiIapqw9yt6O0ge2QY';

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
	
	// Derived category data for backward compatibility and easy access
	let categoryColors = $derived.by(() => {
		const colors: Record<string, string> = {};
		Object.entries(categories).forEach(([key, category]: [string, any]) => {
			colors[key] = category.color || '#6B4423';
		});
		return colors;
	});
	
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
	
	// Helper function to get category data
	function getCategoryData(category: string) {
		return categories[category] || {
			name: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
			color: '#6B4423',
			icon: ''
		};
	}

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

<section id="ubicacion" class="ubi" aria-labelledby="ubicacion-heading">
	<div class="location-block">
		<div class="location-text">
			<span style="text-transform: uppercase; letter-spacing: .1em; font-size: .9em;">Ubicación</span>
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
		<div class="map-container">
			{#if placesData && visibleMarkers.length > 0}
				<GoogleMap
					bind:this={googleMapRef}
					apiKey={GOOGLE_MAPS_API_KEY}
					mapId="AIRES_DE_RIO_MAP"
					center={mapCenter}
					zoom={15}
					markers={visibleMarkers}
					activeMarkerId={activeMarkerId}
					onMarkerClick={handleMarkerClick}
					onMapReady={handleMapReady}
					onInfoWindowClose={handleInfoWindowClose}
					onMarkerPhotoClick={handleMarkerPhotoClick}
					containerClass="location-map"
				>
				{#snippet markerElement(marker)}
					{@const isMainMarker = marker.isMainMarker || marker.place?.es_edificio_principal}
					{@const size = isMainMarker ? 28 : 16}
					{@const strokeWidth = isMainMarker ? 4 : 2}
					{@const color = categoryColors[marker.category] || '#6B4423'}
					{@const icon = categoryIcons[marker.category]}
					{#if isMainMarker}
						{console.log('🎨 RENDERING MAIN MARKER SNIPPET:', {
							title: marker.title,
							category: marker.category,
							color: color,
							icon: icon,
							size: size,
							categoryData: $state.snapshot(categories[marker.category]),
							isAlwaysVisible: categories[marker.category]?.isAlwaysVisible
						})}
					{/if}
					
					<div style="position: relative; display: flex; align-items: center; justify-content: center; z-index: 1000;">
						<div 
							class="marker-dot"
							role="button"
							tabindex="0"
							aria-label="Map marker for {marker.title}"
							style="
								width: {size}px;
								height: {size}px;
								background-color: {color};
								border: {strokeWidth}px solid #ffffff;
								border-radius: 50%;
								box-shadow: {isMainMarker ? '0 4px 8px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0,0,0,0.3)'};
								cursor: pointer;
								transition: transform 0.2s ease;
								display: flex;
								align-items: center;
								justify-content: center;
								font-size: {isMainMarker ? '14px' : '10px'};
								line-height: 1;
								font-family: Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif;
								z-index: 1001;
								opacity: 1;
								visibility: visible;
								{isMainMarker ? 'animation: pulse 2s infinite;' : ''}
							"
						>
							{#if icon}
								<span style="
									font-size: {isMainMarker ? '16px' : '12px'};
									line-height: 1;
									font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'Segoe UI Symbol', 'Android Emoji', 'EmojiSymbols', sans-serif;
									font-weight: normal;
									font-style: normal;
									text-rendering: optimizeLegibility;
									-webkit-font-smoothing: antialiased;
									-moz-osx-font-smoothing: grayscale;
									display: inline-block;
									vertical-align: middle;
									color: white;
									text-shadow: 0 0 2px rgba(0,0,0,0.5);
								">{icon}</span>
								{console.log('🎨 EMOJI ICON RENDERED:', {
									title: marker.title,
									category: marker.category,
									icon: icon,
									isMainMarker: isMainMarker
								})}
							{:else}
								<!-- Simple fallback dot for missing icon -->
								<span style="
									font-size: {isMainMarker ? '12px' : '8px'};
									line-height: 1;
									font-family: system-ui, sans-serif;
									font-weight: bold;
									color: white;
									text-shadow: 0 0 2px rgba(0,0,0,0.5);
								">●</span>
								{console.log('❌ NO ICON, using dot fallback:', {
									title: marker.title,
									category: marker.category
								})}
							{/if}
						</div>
						
						{#if marker.place?.photos && marker.place.photos.length > 0}
							<button 
								data-photo-trigger
								type="button"
								aria-label="View {marker.place.photos.length} photo{marker.place.photos.length > 1 ? 's' : ''} for {marker.title}"
								style="
									position: absolute;
									top: -8px;
									right: -8px;
									width: 16px;
									height: 16px;
									background: #ffffff;
									border: 1px solid #e5e7eb;
									border-radius: 50%;
									display: flex;
									align-items: center;
									justify-content: center;
									font-size: 8px;
									cursor: pointer;
									box-shadow: 0 1px 3px rgba(0,0,0,0.2);
									z-index: 10;
									padding: 0;
								"
							>
								📷
							</button>
						{/if}
					</div>
				{/snippet}

				{#snippet markerInfoWindow(marker)}
					<div class="info-window">
						<div class="info-header">
							<div class="category-indicator" style="background-color: {categoryColors[marker.category] || '#6B4423'}">
								{#if categoryIcons[marker.category]}
									<span class="category-icon">{categoryIcons[marker.category]}</span>
								{/if}
							</div>
							<h3 class="place-name">{marker.place.nombre}</h3>
							{#if categoryNames[marker.category]}
								<span class="category-name">({categoryNames[marker.category]})</span>
							{/if}
						</div>
						
						<div class="info-content">
							<p class="address">
								📍 {marker.place.direccion}
							</p>
							
							<div class="badges">
								<span class="distance-badge" style="background-color: {marker.place.distancia_categoria === 'MUY CERCA' ? '#16a34a' : marker.place.distancia_categoria === 'CERCANO' ? '#ea580c' : '#dc2626'}">
									{marker.place.distancia_categoria}
								</span>
								<span class="distance-detail">
									{marker.place.distancia_cuadras || marker.place.distancia_aproximada}
								</span>
							</div>
							
							{#if marker.place.descripcion}
								<p class="description">{marker.place.descripcion}</p>
							{/if}
							
							{#if marker.place.photos && marker.place.photos.length > 0}
								<button class="photo-button" onclick={() => openPhotoCarousel(marker.place, marker.category, marker.placeId)}>
									📷 Ver {marker.place.photos.length} foto{marker.place.photos.length > 1 ? 's' : ''}
								</button>
							{/if}
						</div>
					</div>
				{/snippet}
			</GoogleMap>
			{:else}
				<div class="location-map" style="height: 25rem; display: flex; align-items: center; justify-content: center; background: #f3f4f6; border-radius: 0.5rem;">
					<p style="color: #6b7280;">Cargando mapa...</p>
				</div>
			{/if}
			
				<CategorySelector 
					{placesData}
					{showPlaceMarkers}
					{categoryFilter}
					{categoryColors}
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
		background: var(--brand);
		border-radius: 0.625rem;
		overflow: hidden;
		border: 1px solid var(--line);
	}

	.location-text {
		max-width: 40ch;
		padding: 1.75rem;
		color: #fff;
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
		border: 1px solid rgba(255, 255, 255, 0.8);
	}

	:global(.category-icon) {
		font-size: 8px;
		line-height: 1;
	}

	:global(.category-name) {
		font-size: 0.75rem;
		color: #6b7280;
		font-weight: 400;
		margin-left: 0.5rem;
	}

	:global(.place-name) {
		margin: 0;
		color: #1f2937;
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
		color: #6b7280;
		line-height: 1.4;
	}

	:global(.badges) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	:global(.distance-badge) {
		color: white;
		padding: 0.125rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
	}

	:global(.distance-detail) {
		background-color: #f3f4f6;
		color: #374151;
		padding: 0.125rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
	}

	:global(.description) {
		margin: 0;
		font-size: 0.8rem;
		color: #9ca3af;
		font-style: italic;
		line-height: 1.3;
	}

	:global(.photo-button) {
		background: #3b82f6;
		color: white;
		border: none;
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		cursor: pointer;
		transition: background-color 0.2s;
		align-self: flex-start;
	}

	:global(.photo-button:hover) {
		background: #2563eb;
	}

	:global(.photo-button:active) {
		background: #1d4ed8;
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
	@keyframes -global-pulse {
		0% { 
			box-shadow: 0 4px 8px rgba(0,0,0,0.4), 0 0 0 0 rgba(107, 68, 35, 0.7); 
		}
		50% { 
			box-shadow: 0 4px 8px rgba(0,0,0,0.4), 0 0 0 8px rgba(107, 68, 35, 0.3); 
		}
		100% { 
			box-shadow: 0 4px 8px rgba(0,0,0,0.4), 0 0 0 0 rgba(107, 68, 35, 0.7); 
		}
	}
</style>
