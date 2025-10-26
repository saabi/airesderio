<script lang="ts">
	import { browser } from '$app/environment';

	const GOOGLE_MAPS_API_KEY = 'AIzaSyAEjLiUxzFltYqAYYiIapqw9yt6O0ge2QY';

	// Component props
	interface Props {
		jsonUrl?: string;
		showPlaceMarkers?: boolean;
		enableClustering?: boolean;
		categoryFilter?: string[];
	}

	let { 
		jsonUrl = '/static/lugares/lugares-direcciones.json',
		showPlaceMarkers = true,
		enableClustering = false,
		categoryFilter = []
	}: Props = $props();

	let mapElement: HTMLDivElement;
	let scriptLoaded = $state(false);
	let placesData = $state<any>(null);
	let map: any;
	let markers = $state<any[]>([]);

	// Category colors for different types of places
	const categoryColors: Record<string, string> = {
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

	// Create custom marker icon
	function createMarkerIcon(category: string): any {
		const color = categoryColors[category] || '#6B4423';
		return {
			path: (window as any).google.maps.SymbolPath.CIRCLE,
			fillColor: color,
			fillOpacity: 0.8,
			strokeColor: '#ffffff',
			strokeWeight: 2,
			scale: 8
		};
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
		markers.forEach(marker => marker.setMap(null));
		markers = [];
	}

	// Create markers for places
	function createPlaceMarkers() {
		if (!placesData || !map || !showPlaceMarkers) return;

		clearMarkers();

		Object.entries(placesData.lugares).forEach(([category, places]: [string, any]) => {
			// Skip category if filter is active and category not included
			if (categoryFilter.length > 0 && !categoryFilter.includes(category)) return;

			Object.entries(places).forEach(([placeId, place]: [string, any]) => {
				if (!place.coordenadas_aproximadas) return;

				const marker = new (window as any).google.maps.Marker({
					position: {
						lat: place.coordenadas_aproximadas.lat,
						lng: place.coordenadas_aproximadas.lng
					},
					map: map,
					title: place.nombre,
					icon: createMarkerIcon(category)
				});

				const infoWindow = new (window as any).google.maps.InfoWindow({
					content: createInfoWindowContent(place, category)
				});

				marker.addListener('click', () => {
					infoWindow.open(map, marker);
				});

				markers.push(marker);
			});
		});
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
		script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
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
		if (scriptLoaded && mapElement) {
			const location = { lat: -27.779686, lng: -64.258992 };

			map = new (window as any).google.maps.Map(mapElement, {
				zoom: 15,
				center: location,
				mapTypeId: 'roadmap',
				styles: [
					{
						featureType: 'poi',
						elementType: 'labels',
						stylers: [{ visibility: 'off' }]
					}
				]
			});

			// Create main building marker
			const buildingMarker = new (window as any).google.maps.Marker({
				position: location,
				map: map,
				title: 'Aires de Río',
				icon: {
					path: (window as any).google.maps.SymbolPath.CIRCLE,
					fillColor: '#6B4423',
					fillOpacity: 1,
					strokeColor: '#ffffff',
					strokeWeight: 3,
					scale: 12
				}
			});

			const buildingInfoWindow = new (window as any).google.maps.InfoWindow({
				content: `
					<div style="padding: 0.75rem; text-align: center; font-family: system-ui, sans-serif;">
						<h3 style="margin: 0 0 0.5rem 0; color: #6B4423; font-size: 1.1rem; font-weight: 600;">Aires de Río</h3>
						<p style="margin: 0; font-size: 0.875rem; color: #666; line-height: 1.4;">
							🏢 Edificio residencial<br>
							📍 Avenida Rivadavia<br>
							Santiago del Estero, Argentina
						</p>
					</div>
				`
			});

			buildingMarker.addListener('click', function () {
				buildingInfoWindow.open(map, buildingMarker);
			});

			// Open building info window by default
			buildingInfoWindow.open(map, buildingMarker);
		}
	});

	// Create place markers when data is loaded and map is ready
	$effect(() => {
		if (placesData && map) {
			createPlaceMarkers();
		}
	});

	// Update markers when filters change
	$effect(() => {
		if (placesData && map) {
			createPlaceMarkers();
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
			
			{#if showPlaceMarkers && placesData}
				<div class="map-legend">
					<h4>Lugares de Interés</h4>
					<div class="legend-items">
						{#each Object.entries(categoryColors) as [category, color]}
							{#if placesData.lugares[category]}
								<div class="legend-item">
									<div class="legend-color" style="background-color: {color}"></div>
									<span class="legend-label">
										{category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
									</span>
								</div>
							{/if}
						{/each}
					</div>
					<div class="legend-stats">
						<small>
							{placesData.metadata.total_places} lugares • 
							{markers.length} marcadores
						</small>
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>

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
		position: relative;
		min-height: 25rem;
		width: 100%;
	}

	.map {
		min-height: 25rem;
		width: 100%;
		background-color: #e9e9e9;
	}

	.map-legend {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border-radius: 0.5rem;
		padding: 0.75rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		max-width: 200px;
		z-index: 1000;
	}

	.map-legend h4 {
		margin: 0 0 0.5rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
	}

	.legend-items {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 0.5rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.legend-color {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.legend-label {
		font-size: 0.75rem;
		color: #6b7280;
		text-transform: capitalize;
	}

	.legend-stats {
		border-top: 1px solid #e5e7eb;
		padding-top: 0.5rem;
		text-align: center;
	}

	.legend-stats small {
		color: #9ca3af;
		font-size: 0.7rem;
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

		.map-legend {
			position: absolute;
			top: 0.5rem;
			right: 0.5rem;
			max-width: 160px;
			padding: 0.5rem;
		}

		.map-legend h4 {
			font-size: 0.8rem;
		}

		.legend-label {
			font-size: 0.7rem;
		}

		.legend-color {
			width: 10px;
			height: 10px;
		}
	}
</style>
