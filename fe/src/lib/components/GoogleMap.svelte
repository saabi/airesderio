<script lang="ts">
	import { browser } from '$app/environment';
	import { untrack } from 'svelte';

	// Component Props Interface
	interface MarkerData {
		id: string;
		position: { lat: number; lng: number };
		title: string;
		category: string;
		color?: string;
		isMainMarker?: boolean;
		photos?: string[];
		infoContent?: string;
		customElement?: HTMLElement;
	}

	interface Props {
		// Core Configuration
		apiKey: string;
		mapId?: string;
		center: { lat: number; lng: number };
		zoom?: number;
		mapTypeId?: string;
		
		// Markers Data
		markers: MarkerData[];
		
		// Display Options
		showMarkers?: boolean;
		categoryFilter?: string[];
		
		// Event Callbacks
		onMarkerClick?: (marker: MarkerData, markerId: string) => void;
		onMapReady?: (map: any) => void;
		onBoundsChanged?: () => void;
		
		// Styling
		containerClass?: string;
		height?: string;
	}

	let {
		apiKey,
		mapId,
		center,
		zoom = 15,
		mapTypeId = 'roadmap',
		markers = [],
		showMarkers = true,
		categoryFilter = [],
		onMarkerClick,
		onMapReady,
		onBoundsChanged,
		containerClass = '',
		height = '25rem'
	}: Props = $props();

	// --- COMPONENT STATE VARIABLES ---
	let mapElement: HTMLDivElement;
	let scriptLoaded = $state(false);
	let map: any;
	let mapMarkers = $state<any[]>([]);

	// Load Google Maps API
	$effect(() => {
		if (!browser || !apiKey) return;

		const scriptId = 'google-maps-script';
		if (document.getElementById(scriptId)) {
			scriptLoaded = true;
			return;
		}

		window.initMap = () => {
			scriptLoaded = true;
		};

		const script = document.createElement('script');
		script.id = scriptId;
		script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=marker&v=weekly`;
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

	// Initialize map when script loads and element is ready
	$effect(() => {
		if (scriptLoaded && mapElement) {
			const mapConfig: any = {
				zoom,
				center,
				mapTypeId
			};

			// Add mapId if provided (required for Advanced Markers)
			if (mapId) {
				mapConfig.mapId = mapId;
			}

			map = new (window as any).google.maps.Map(mapElement, mapConfig);

			// Notify parent that map is ready
			if (onMapReady) {
				onMapReady(map);
			}
		}
	});

	// Create custom marker element for Advanced Markers
	function createMarkerElement(marker: MarkerData): HTMLElement {
		// If custom element is provided, use it
		if (marker.customElement) {
			return marker.customElement;
		}

		// Create default marker element
		const color = marker.color || '#6B4423';
		const size = marker.isMainMarker ? 28 : 16; // Larger main building marker
		const strokeWidth = marker.isMainMarker ? 4 : 2; // Thicker border for main building

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
			box-shadow: ${marker.isMainMarker ? '0 4px 8px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0,0,0,0.3)'};
			cursor: pointer;
			transition: transform 0.2s ease;
			${marker.isMainMarker ? 'animation: pulse 2s infinite;' : ''}
		`;
		
		// Add pulsing animation for main building
		if (marker.isMainMarker) {
			const style = document.createElement('style');
			style.textContent = `
				@keyframes pulse {
					0% { box-shadow: 0 4px 8px rgba(0,0,0,0.4), 0 0 0 0 ${color}; }
					50% { box-shadow: 0 4px 8px rgba(0,0,0,0.4), 0 0 0 8px rgba(107, 68, 35, 0.3); }
					100% { box-shadow: 0 4px 8px rgba(0,0,0,0.4), 0 0 0 0 ${color}; }
				}
			`;
			document.head.appendChild(style);
		}

		// Add hover effect
		markerElement.addEventListener('mouseenter', () => {
			markerElement.style.transform = 'scale(1.1)';
		});

		markerElement.addEventListener('mouseleave', () => {
			markerElement.style.transform = 'scale(1)';
		});

		markerContainer.appendChild(markerElement);
		return markerContainer;
	}

	// Clear all markers from map
	function clearMarkers() {
		mapMarkers.forEach(marker => {
			if (marker instanceof (window as any).google.maps.marker?.AdvancedMarkerElement) {
				marker.map = null;
			} else {
				// Regular marker
				marker.setMap(null);
			}
		});
		mapMarkers = [];
	}

	// Create markers on the map
	function createMapMarkers() {
		if (!map || !markers.length) return;

		clearMarkers();

		console.log('Creating markers for GoogleMap component:', markers.length);
		console.log('Advanced Markers available:', !!(window as any).google?.maps?.marker?.AdvancedMarkerElement);

		markers.forEach(markerData => {
			// Check if marker should be visible based on filters
			const isMainMarker = markerData.isMainMarker;
			
			// Always show main marker, check filters for others
			if (!isMainMarker && !showMarkers) return;
			if (!isMainMarker && categoryFilter.length > 0 && !categoryFilter.includes(markerData.category)) return;

			let marker;

			try {
				// Try to use Advanced Markers
				if ((window as any).google.maps.marker && (window as any).google.maps.marker.AdvancedMarkerElement) {
					const markerElement = createMarkerElement(markerData);
					
					marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
						position: markerData.position,
						map: map,
						title: markerData.title,
						content: markerElement
					});
				} else {
					throw new Error('Advanced Markers not available');
				}
			} catch (error) {
				console.warn('Advanced Markers not available, falling back to regular markers:', error);
				// Fallback to regular markers
				marker = new (window as any).google.maps.Marker({
					position: markerData.position,
					map: map,
					title: markerData.title,
					icon: {
						path: (window as any).google.maps.SymbolPath.CIRCLE,
						fillColor: markerData.color || '#6B4423',
						fillOpacity: 0.8,
						strokeColor: '#ffffff',
						strokeWeight: isMainMarker ? 3 : 2,
						scale: isMainMarker ? 12 : 8
					}
				});
			}

			// Create info window if content is provided
			if (markerData.infoContent) {
				const infoWindow = new (window as any).google.maps.InfoWindow({
					content: markerData.infoContent
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

				// Auto-open info window for main marker
				if (isMainMarker) {
					setTimeout(() => {
						if (marker instanceof (window as any).google.maps.marker.AdvancedMarkerElement) {
							infoWindow.open({
								anchor: marker,
								map: map
							});
						} else {
							infoWindow.open(map, marker);
						}
					}, 500); // Small delay to ensure map is fully loaded
				}
			}

			// Handle marker click events
			if (onMarkerClick) {
				marker.addListener('click', () => {
					onMarkerClick(markerData, markerData.id);
				});
			}

			mapMarkers.push(marker);
			console.log(`Created marker for ${markerData.title} at (${markerData.position.lat}, ${markerData.position.lng})`);
		});

		console.log(`Total markers created: ${mapMarkers.length}`);
	}

	// Fit map bounds to show all visible markers
	function fitBoundsToMarkers() {
		if (!map || mapMarkers.length === 0) return;

		const bounds = new (window as any).google.maps.LatLngBounds();
		let hasVisibleMarkers = false;

		mapMarkers.forEach(marker => {
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
				
				// Notify parent of bounds change
				if (onBoundsChanged) {
					onBoundsChanged();
				}
			});
		}
	}

	// Update markers when data or filters change
	$effect(() => {
		// Track dependencies
		const currentMarkers = markers;
		const currentShowMarkers = showMarkers;
		const currentCategoryFilter = [...categoryFilter];
		const currentMap = map;
		
		if (currentMap && currentMarkers.length > 0) {
			// Use untrack to prevent markers array changes from triggering this effect
			untrack(() => {
				createMapMarkers();
				// Fit map to show all visible markers after creation
				setTimeout(() => fitBoundsToMarkers(), 100);
			});
		}
	});

	// Expose fitBoundsToMarkers function to parent
	export function fitToMarkers() {
		fitBoundsToMarkers();
	}

	// Expose map instance to parent
	export function getMap() {
		return map;
	}

	// Expose markers array to parent
	export function getMarkers() {
		return mapMarkers;
	}
</script>

<div
	bind:this={mapElement}
	class="google-map {containerClass}"
	style="height: {height}; min-height: {height};"
	role="img"
	aria-label="Interactive map"
></div>

<style>
	.google-map {
		width: 100%;
		background-color: #e9e9e9;
		border-radius: 0.5rem;
		overflow: hidden;
	}
</style>
