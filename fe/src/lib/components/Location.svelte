<script lang="ts">
	import { browser } from '$app/environment';
	import { untrack } from 'svelte';
	import PhotoCarousel from './PhotoCarousel.svelte';
	import CategorySelector from './CategorySelector.svelte';

	const GOOGLE_MAPS_API_KEY = 'AIzaSyAEjLiUxzFltYqAYYiIapqw9yt6O0ge2QY';

	// Component props
	interface Props {
		jsonUrl?: string;
		showPlaceMarkers?: boolean;
		enableClustering?: boolean;
		categoryFilter?: string[];
	}

	let { 
		jsonUrl = '/lugares/lugares-direcciones.json',
		showPlaceMarkers = true,
		enableClustering = false,
		categoryFilter = []
	}: Props = $props();

	// --- COMPONENT STATE VARIABLES ---
	// @fold:start(state-vars)
	let mapElement: HTMLDivElement;
	let scriptLoaded = $state(false);
	let placesData = $state<any>(null);
	let map: any;
	let markers = $state<any[]>([]);
	let photoCarouselVisible = $state(false);
	let carouselPlace = $state<any>(null);
	let carouselCategory = $state<string>('');
	let carouselPlaceId = $state<string>('');
	let carouselPhotos = $state<string[]>([]);
	let carouselCurrentIndex = $state(0);
	// @fold:end

	// Category colors for markers (still needed for marker creation)
	const categoryColors: Record<string, string> = {
		edificio_principal: '#6B4423', // brown (main building)
		transporte: '#2563eb', // blue
		cultura_entretenimiento: '#7c3aed', // purple
		infraestructura: '#059669', // green
		lugares_historicos: '#dc2626', // red
		parques_recreacion: '#16a34a', // green
		museos: '#9333ea', // purple
		gastronomia: '#ea580c', // orange
		supermercados: '#0891b2', // cyan
		servicios: '#4338ca', // indigo
		vida_nocturna: '#be185d' // pink
	};

	// Load places data from JSON
	async function loadPlacesData() {
		if (!browser || !jsonUrl) return;
		
		try {
			const response = await fetch(jsonUrl);
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
			placesData = await response.json();
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
			categoryFilter = categoryFilter.filter(c => c !== category);
		} else {
			categoryFilter = [...categoryFilter, category];
		}
	}

	// Fit map bounds to show all visible markers
	function fitMapToMarkers() {
		if (!map || markers.length === 0) return;

		const bounds = new (window as any).google.maps.LatLngBounds();
		let hasVisibleMarkers = false;

		markers.forEach(marker => {
			// Get marker position (works for both AdvancedMarkerElement and regular Marker)
			let position;
			if (marker instanceof (window as any).google.maps.marker?.AdvancedMarkerElement) {
				position = marker.position;
			} else {
				position = marker.getPosition();
			}

			if (position) {
				bounds.extend(position);
				hasVisibleMarkers = true;
			}
		});

		if (hasVisibleMarkers) {
			// Add some padding around the markers
			map.fitBounds(bounds, {
				top: 50,
				right: 50,
				bottom: 50,
				left: 50
			});

			// Ensure minimum zoom level (don't zoom in too much for single markers)
			const listener = (window as any).google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
				if (map.getZoom() > 17) {
					map.setZoom(17);
				}
			});
		}
	}

	// Find the main building from JSON data
	function findMainBuilding() {
		if (!placesData) return null;
		
		for (const [category, places] of Object.entries(placesData.lugares)) {
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

	// Create custom marker element for Advanced Markers
	function createMarkerElement(category: string, place: any, placeId: string, isMainBuilding: boolean = false): HTMLElement {
		const color = categoryColors[category] || '#6B4423';
		const size = isMainBuilding ? 24 : 16;
		const strokeWidth = isMainBuilding ? 3 : 2;
		const hasPhotos = place.photos && place.photos.length > 0;
		
		const markerContainer = document.createElement('div');
		markerContainer.style.cssText = `
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
		`;
		
		const markerElement = document.createElement('div');
		markerElement.style.cssText = `
			width: ${size}px;
			height: ${size}px;
			background-color: ${color};
			border: ${strokeWidth}px solid #ffffff;
			border-radius: 50%;
			box-shadow: 0 2px 4px rgba(0,0,0,0.3);
			cursor: pointer;
			transition: transform 0.2s ease;
		`;
		
		// Add photo button if photos are available
		if (hasPhotos) {
			const photoButton = document.createElement('div');
			photoButton.innerHTML = '📷';
			photoButton.style.cssText = `
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
			`;
			
			photoButton.addEventListener('click', (e) => {
				e.stopPropagation();
				openPhotoCarousel(place, category, placeId);
			});
			
			markerContainer.appendChild(photoButton);
		}
		
		// Add hover effect to main marker
		markerElement.addEventListener('mouseenter', () => {
			markerElement.style.transform = 'scale(1.1)';
		});
		
		markerElement.addEventListener('mouseleave', () => {
			markerElement.style.transform = 'scale(1)';
		});
		
		markerContainer.appendChild(markerElement);
		return markerContainer;
	}

	// Create info window content
	function createInfoWindowContent(place: any, category: string): string {
		const distanceColor = place.distancia_categoria === 'MUY CERCA' ? '#16a34a' : 
							 place.distancia_categoria === 'CERCANO' ? '#ea580c' : '#dc2626';
		
		return `
			<div style="padding: 0.75rem; max-width: 280px; font-family: system-ui, sans-serif;">
				<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
					<div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${categoryColors[category] || '#6B4423'};"></div>
					<h3 style="margin: 0; color: #1f2937; font-size: 1rem; font-weight: 600;">${place.nombre}</h3>
				</div>
				<p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #6b7280; line-height: 1.4;">
					📍 ${place.direccion}
				</p>
				<div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
					<span style="background-color: ${distanceColor}; color: white; padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 500;">
						${place.distancia_categoria}
					</span>
					<span style="background-color: #f3f4f6; color: #374151; padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
						${place.distancia_cuadras || place.distancia_aproximada}
					</span>
				</div>
				<p style="margin: 0; font-size: 0.8rem; color: #9ca3af; font-style: italic;">
					${place.descripcion}
				</p>
			</div>
		`;
	}

	// Clear all markers
	function clearMarkers() {
		markers.forEach(marker => {
			if (marker instanceof (window as any).google.maps.marker.AdvancedMarkerElement) {
				if (marker.map) {
					marker.map = null;
				}
			} else {
				// Regular marker
				marker.setMap(null);
			}
		});
		markers = [];
	}

	// Create markers for places
	function createPlaceMarkers() {
		if (!placesData || !map) return;

		clearMarkers();
		
		console.log('Creating markers for', Object.keys(placesData.lugares).length, 'categories');
		console.log('Advanced Markers available:', !!(window as any).google?.maps?.marker?.AdvancedMarkerElement);

		Object.entries(placesData.lugares).forEach(([category, places]: [string, any]) => {
			Object.entries(places).forEach(([placeId, place]: [string, any]) => {
				if (!place.coordenadas_aproximadas) return;

				const isMainBuilding = place.es_edificio_principal;
				
				// Always show main building, check filter for other places
				if (!isMainBuilding && !showPlaceMarkers) return;
				if (!isMainBuilding && categoryFilter.length > 0 && !categoryFilter.includes(category)) return;

				// Create marker with Advanced Marker Element or fallback to regular marker
				let marker;
				
				try {
					// Try to use Advanced Markers
					if ((window as any).google.maps.marker && (window as any).google.maps.marker.AdvancedMarkerElement) {
						const markerElement = createMarkerElement(category, place, placeId, isMainBuilding);
						
						marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
							position: {
								lat: place.coordenadas_aproximadas.lat,
								lng: place.coordenadas_aproximadas.lng
							},
							map: map,
							title: place.nombre,
							content: markerElement
						});
					} else {
						throw new Error('Advanced Markers not available');
					}
				} catch (error) {
					console.warn('Advanced Markers not available, falling back to regular markers:', error);
					// Fallback to regular markers
					marker = new (window as any).google.maps.Marker({
						position: {
							lat: place.coordenadas_aproximadas.lat,
							lng: place.coordenadas_aproximadas.lng
						},
						map: map,
						title: place.nombre,
						icon: {
							path: (window as any).google.maps.SymbolPath.CIRCLE,
							fillColor: categoryColors[category] || '#6B4423',
							fillOpacity: 0.8,
							strokeColor: '#ffffff',
							strokeWeight: isMainBuilding ? 3 : 2,
							scale: isMainBuilding ? 12 : 8
						}
					});
				}

				const infoWindow = new (window as any).google.maps.InfoWindow({
					content: createInfoWindowContent(place, category)
				});

				marker.addListener('click', () => {
					// Handle both Advanced Markers and regular markers
					if (marker instanceof (window as any).google.maps.marker.AdvancedMarkerElement) {
						infoWindow.open({
							anchor: marker,
							map: map
						});
					} else {
						infoWindow.open(map, marker);
					}
				});

				// Auto-open info window for main building
				if (isMainBuilding) {
					if (marker instanceof (window as any).google.maps.marker.AdvancedMarkerElement) {
						infoWindow.open({
							anchor: marker,
							map: map
						});
					} else {
						infoWindow.open(map, marker);
					}
				}

				markers.push(marker);
				console.log(`Created marker for ${place.nombre} at (${place.coordenadas_aproximadas.lat}, ${place.coordenadas_aproximadas.lng})`);
			});
		});
		
		console.log(`Total markers created: ${markers.length}`);
	}

	// Load Google Maps script
	$effect(() => {
		if (!browser) return;

		if (window.google && window.google.maps) {
			scriptLoaded = true;
			return;
		}

		const scriptId = 'google-maps-script';
		if (document.getElementById(scriptId)) {
			if (window.initMap) window.initMap();
			return;
		}

		window.initMap = () => {
			scriptLoaded = true;
		};

		const script = document.createElement('script');
		script.id = scriptId;
		script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap&libraries=marker&v=weekly`;
		script.async = true;
		script.defer = true;
		document.head.appendChild(script);

		return () => {
			// Clean up the global callback function
			if ((window as any).initMap) {
				delete (window as any).initMap;
			}
		};
	});

	// Load places data when component mounts
	$effect(() => {
		loadPlacesData();
	});

	// Initialize map when script loads and element is ready
	$effect(() => {
		if (scriptLoaded && mapElement && placesData) {
			const mainBuilding = findMainBuilding();
			const defaultLocation = { lat: -27.779686, lng: -64.258992 };

			// Use main building coordinates if available, otherwise use default
			const mapCenter = mainBuilding?.place.coordenadas_aproximadas || defaultLocation;

			map = new (window as any).google.maps.Map(mapElement, {
				zoom: 15,
				center: mapCenter,
				mapTypeId: 'roadmap',
				mapId: 'AIRES_DE_RIO_MAP' // Required for Advanced Markers (styles controlled via Cloud Console)
			});
		}
	});

	// Create place markers when data is loaded and map is ready
	$effect(() => {
		if (placesData && map) {
			//createPlaceMarkers();
		}
	});

	// Update markers when filters change (but not when markers array changes)
	$effect(() => {
		// Track only the dependencies we care about, not the markers array
		const shouldShowMarkers = showPlaceMarkers;
		const currentCategoryFilter = [...categoryFilter];
		const currentPlacesData = placesData;
		const currentMap = map;
		
		if (currentPlacesData && currentMap) {
			// Use untrack to prevent markers array changes from triggering this effect
			untrack(() => {
				createPlaceMarkers();
				// Fit map to show all visible markers after creation
				setTimeout(() => fitMapToMarkers(), 100);
			});
		}
	});
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
		<div
			bind:this={mapElement}
			id="map"
			class="map"
			role="img"
			aria-label="Mapa del entorno mostrando la ubicación estratégica de Aires de Río en Avenida Rivadavia, Santiago del Estero"
		></div>
			
			<CategorySelector 
				{placesData}
				{showPlaceMarkers}
				{categoryFilter}
				markersCount={markers.length}
				onToggleMarkers={toggleMarkers}
				onCategoryToggle={toggleCategory}
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
		grid-template-columns: 1fr 1fr;
		gap: 0;
		background: var(--brand);
		border-radius: 0.625rem;
		overflow: hidden;
		border: 1px solid var(--line);
	}

	.location-text {
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
		max-width: 65ch;
	}

	.map-container {
		display: flex;
		min-height: 25rem;
		width: 100%;
		gap: 0;
	}

	.map {
		flex: 1;
		min-height: 25rem;
		background-color: #e9e9e9;
	}


	@media (max-width: 850px) {
		.location-block {
			grid-template-columns: 1fr;
			/* Invert order on mobile */
			grid-template-rows: auto auto;
		}
		.location-text h3 {
			font-size: 2em; /* smaller location title */
		}

		.location-block .map-container {
			grid-row: 1;
		}

		.location-block .location-text {
			grid-row: 2;
		}

		.map-container {
			flex-direction: column;
			min-height: auto;
		}

		.map {
			min-height: 20rem;
			order: 1;
		}

	}
</style>
