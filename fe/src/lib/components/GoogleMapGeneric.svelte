<script lang="ts">
	import { browser } from '$app/environment';
	import { untrack } from 'svelte';
	import type { Snippet } from 'svelte';

	// Generic marker interface - minimal required data
	interface GenericMarker {
		id: string;
		position: { lat: number; lng: number };
		title: string;
		isMainMarker?: boolean;
		customElement?: HTMLElement;
		// Allow additional properties for snippet data
		[key: string]: any;
	}

	interface Props {
		// Core Configuration
		apiKey: string;
		mapId?: string;
		center: { lat: number; lng: number };
		zoom?: number;
		mapTypeId?: string;
		
		// Generic markers data
		markers: GenericMarker[];
		
		// Display Options
		showMarkers?: boolean;
		
		// Snippets for marker content
		markerInfoWindow?: Snippet<[GenericMarker]>;
		
		// Event Callbacks
		onMarkerClick?: (marker: GenericMarker) => void;
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
		markerInfoWindow,
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
	let openInfoWindows = $state<Set<string>>(new Set());
	let infoWindows = $state<Map<string, any>>(new Map());
	let isInitialLoad = $state(true);

	// Store snippet-rendered elements
	let snippetContainers = $state<Record<string, HTMLElement>>({});

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

			if (mapId) {
				mapConfig.mapId = mapId;
			}

			map = new (window as any).google.maps.Map(mapElement, mapConfig);

			if (onMapReady) {
				onMapReady(map);
			}
		}
	});

	// Create default marker element
	function createDefaultMarkerElement(marker: GenericMarker): HTMLElement {
		const size = marker.isMainMarker ? 28 : 16;
		const strokeWidth = marker.isMainMarker ? 4 : 2;

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
			background-color: #6B4423;
			border: ${strokeWidth}px solid #ffffff;
			border-radius: 50%;
			box-shadow: ${marker.isMainMarker ? '0 4px 8px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0,0,0,0.3)'};
			cursor: pointer;
			transition: transform 0.2s ease;
			${marker.isMainMarker ? 'animation: pulse 2s infinite;' : ''}
		`;

		// Add pulsing animation for main marker
		if (marker.isMainMarker) {
			const style = document.createElement('style');
			style.textContent = `
				@keyframes pulse {
					0% { box-shadow: 0 4px 8px rgba(0,0,0,0.4), 0 0 0 0 #6B4423; }
					50% { box-shadow: 0 4px 8px rgba(0,0,0,0.4), 0 0 0 8px rgba(107, 68, 35, 0.3); }
					100% { box-shadow: 0 4px 8px rgba(0,0,0,0.4), 0 0 0 0 #6B4423; }
				}
			`;
			document.head.appendChild(style);
		}

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
				marker.setMap(null);
			}
		});
		mapMarkers = [];
		
		// Clean up snippet containers that are no longer needed
		const currentMarkerIds = new Set(markers.map(m => m.id));
		Object.keys(snippetContainers).forEach(id => {
			if (!currentMarkerIds.has(id)) {
				delete snippetContainers[id];
				infoWindows.delete(id);
				openInfoWindows.delete(id);
			}
		});
	}

	// Create markers on the map
	function createMapMarkers() {
		if (!map || !markers.length) return;

		clearMarkers();

		console.log('Creating markers for GoogleMapGeneric:', markers.length);

		markers.forEach(markerData => {
			if (!showMarkers && !markerData.isMainMarker) return;

			let marker;

			try {
				// Use custom element if provided, otherwise create default
				const markerElement = markerData.customElement || createDefaultMarkerElement(markerData);
				
				if ((window as any).google.maps.marker && (window as any).google.maps.marker.AdvancedMarkerElement) {
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
				marker = new (window as any).google.maps.Marker({
					position: markerData.position,
					map: map,
					title: markerData.title,
					icon: {
						path: (window as any).google.maps.SymbolPath.CIRCLE,
						fillColor: '#6B4423',
						fillOpacity: 0.8,
						strokeColor: '#ffffff',
						strokeWeight: markerData.isMainMarker ? 3 : 2,
						scale: markerData.isMainMarker ? 12 : 8
					}
				});
			}

			// Create info window if snippet is provided
			if (markerInfoWindow) {
				// Use the snippet container that was bound in the template
				const infoElement = snippetContainers[markerData.id];
				
				if (infoElement) {
					const infoWindow = new (window as any).google.maps.InfoWindow({
						content: infoElement
					});

					infoWindows.set(markerData.id, infoWindow);

					// Event listeners for info window state
					infoWindow.addListener('closeclick', () => {
						openInfoWindows.delete(markerData.id);
						setTimeout(() => fitBoundsToMarkers(), 100);
					});

					const openInfoWindow = () => {
						if (marker instanceof (window as any).google.maps.marker.AdvancedMarkerElement) {
							infoWindow.open({
								anchor: marker,
								map: map
							});
						} else {
							infoWindow.open(map, marker);
						}
						
						openInfoWindows.add(markerData.id);
						setTimeout(() => fitBoundsToMarkers(), 100);
					};

					marker.addListener('click', () => {
						openInfoWindow();
						if (onMarkerClick) {
							onMarkerClick(markerData);
						}
					});

					// Auto-open for main marker (only on initial load or if previously open)
					if (markerData.isMainMarker && (isInitialLoad || openInfoWindows.has(markerData.id))) {
						setTimeout(openInfoWindow, 500);
					}
					// Reopen previously open windows
					else if (!markerData.isMainMarker && openInfoWindows.has(markerData.id)) {
						setTimeout(openInfoWindow, 100);
					}
				}
			} else {
				// No info window, just handle click
				marker.addListener('click', () => {
					if (onMarkerClick) {
						onMarkerClick(markerData);
					}
				});
			}

			mapMarkers.push(marker);
		});

		console.log(`Total markers created: ${mapMarkers.length}`);
		
		if (isInitialLoad) {
			isInitialLoad = false;
		}
	}

	// Fit map bounds to show all visible markers
	function fitBoundsToMarkers() {
		if (!map || mapMarkers.length === 0) return;

		const bounds = new (window as any).google.maps.LatLngBounds();
		let hasVisibleMarkers = false;

		mapMarkers.forEach(marker => {
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
			const hasOpenInfoWindows = openInfoWindows.size > 0;
			const padding = {
				top: hasOpenInfoWindows ? 80 : 50,
				right: hasOpenInfoWindows ? 80 : 50,
				bottom: hasOpenInfoWindows ? 120 : 50,
				left: hasOpenInfoWindows ? 80 : 50
			};

			map.fitBounds(bounds, padding);

			const listener = (window as any).google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
				if (map.getZoom() > 17) {
					map.setZoom(17);
				}
				
				if (onBoundsChanged) {
					onBoundsChanged();
				}
			});
		}
	}

	// Update markers when data or filters change
	$effect(() => {
		const currentMarkers = markers;
		const currentShowMarkers = showMarkers;
		const currentMap = map;
		
		if (currentMap && currentMarkers.length > 0) {
			untrack(() => {
				createMapMarkers();
				setTimeout(() => fitBoundsToMarkers(), 100);
			});
		}
	});

	// Expose functions to parent
	export function fitToMarkers() {
		fitBoundsToMarkers();
	}

	export function getMap() {
		return map;
	}

	export function getMarkers() {
		return mapMarkers;
	}

	export function closeAllInfoWindows() {
		infoWindows.forEach((infoWindow) => {
			infoWindow.close();
		});
		openInfoWindows.clear();
	}

	// Cleanup on component destroy
	$effect(() => {
		return () => {
			snippetContainers = {};
			infoWindows.clear();
			openInfoWindows.clear();
		};
	});
</script>

<!-- Hidden containers for snippet rendering -->
<div style="display: none;">
	{#if markerInfoWindow}
		{#each markers as marker (marker.id)}
			<div bind:this={snippetContainers[marker.id]}>
				{@render markerInfoWindow(marker)}
			</div>
		{/each}
	{/if}
</div>

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
