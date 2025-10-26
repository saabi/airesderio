<script lang="ts">
	import { browser } from '$app/environment';
	import { untrack } from 'svelte';
	import type { Snippet } from 'svelte';

	// Generic marker interface - minimal required data
	interface GenericMarker {
		id: string;
		position: { lat: number; lng: number };
		title: string;
		customElement?: HTMLElement;
		// Allow additional properties for snippet data and styling
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
		
		// Snippets for marker content and appearance
		markerElement?: Snippet<[GenericMarker]>;
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
		markerElement,
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
	let markerSnippetContainers = $state<Record<string, HTMLElement>>({});

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

	// Create simple default marker element (generic fallback)
	function createDefaultMarkerElement(marker: GenericMarker): HTMLElement {
		const markerContainer = document.createElement('div');
		markerContainer.style.cssText = `
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
		`;

		const markerElement = document.createElement('div');
		markerElement.style.cssText = `
			width: 16px;
			height: 16px;
			background-color: #6B4423;
			border: 2px solid #ffffff;
			border-radius: 50%;
			box-shadow: 0 2px 4px rgba(0,0,0,0.3);
			cursor: pointer;
			transition: transform 0.2s ease;
		`;

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
		Object.keys(markerSnippetContainers).forEach(id => {
			if (!currentMarkerIds.has(id)) {
				delete markerSnippetContainers[id];
			}
		});
	}

	// Create markers on the map
	function createMapMarkers() {
		if (!map || !markers.length) return;

		clearMarkers();

		console.log('Creating markers for GoogleMap:', markers.length);

		markers.forEach(markerData => {
			console.log(`🗺️ Creating marker: ${markerData.title}`, {
				hasCustomElement: !!markerData.customElement,
				hasSnippetContainer: !!markerSnippetContainers[markerData.id],
				position: $state.snapshot(markerData.position)
			});

			let marker;

			try {
			// Use custom element if provided, otherwise use snippet, otherwise create default
			let markerElementDOM: HTMLElement;
			
			if (markerData.customElement) {
				markerElementDOM = markerData.customElement;
				console.log('✅ Using custom element for marker:', markerData.id);
			} else if (markerElement) {
				// Use the snippet container that was bound in the template
				markerElementDOM = markerSnippetContainers[markerData.id];
				console.log('🎨 Snippet container lookup for', markerData.id, ':', {
					found: !!markerElementDOM,
					element: markerElementDOM,
					innerHTML: markerElementDOM?.innerHTML,
					availableContainers: Object.keys(markerSnippetContainers)
				});
				
				if (!markerElementDOM) {
					console.warn('❌ Marker snippet container not found for:', markerData.id, 'Available:', Object.keys(markerSnippetContainers));
					markerElementDOM = createDefaultMarkerElement(markerData);
				} else {
					console.log('✅ Using snippet container for marker:', markerData.id, 'Content length:', markerElementDOM.innerHTML.length);
				}
			} else {
				markerElementDOM = createDefaultMarkerElement(markerData);
				console.log('⚪ Using default element for marker:', markerData.id);
			}
				
				if ((window as any).google.maps.marker && (window as any).google.maps.marker.AdvancedMarkerElement) {
					marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
						position: markerData.position,
						map: map,
						title: markerData.title,
						content: markerElementDOM
					});
					
				// Debug marker creation
				console.log('🎯 MARKER CREATED:', {
					title: markerData.title,
					position: $state.snapshot(markerData.position),
					markerElementDOM: markerElementDOM,
					elementHTML: markerElementDOM.outerHTML?.substring(0, 100) + '...',
					elementVisible: markerElementDOM.offsetWidth > 0 && markerElementDOM.offsetHeight > 0
				});
				} else {
					throw new Error('Advanced Markers not available');
				}
			} catch (error) {
				console.warn('Advanced Markers not available, falling back to regular markers for:', markerData.title, error);
				marker = new (window as any).google.maps.Marker({
					position: markerData.position,
					map: map,
					title: markerData.title,
					icon: {
						path: (window as any).google.maps.SymbolPath.CIRCLE,
						fillColor: '#6B4423',
						fillOpacity: 0.8,
						strokeColor: '#ffffff',
						strokeWeight: 2,
						scale: 8
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

					// Reopen previously open windows
					if (openInfoWindows.has(markerData.id)) {
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
			console.log(`✅ Marker successfully created and added to map: ${markerData.title}`, {
				markerType: marker instanceof (window as any).google.maps.marker?.AdvancedMarkerElement ? 'AdvancedMarker' : 'RegularMarker',
				totalMarkersOnMap: mapMarkers.length
			});
		});

		console.log(`Total markers created: ${mapMarkers.length}`);
		
		// For initial load, center map on first marker if available
		if (isInitialLoad && markers.length > 0) {
			const firstMarker = markers[0];
			if (firstMarker && map) {
				console.log('🎯 Centering map on first marker:', $state.snapshot(firstMarker.position));
				map.setCenter(firstMarker.position);
				map.setZoom(16); // Ensure good zoom level for visibility
			}
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

	// Track snippet container binding
	$effect(() => {
		console.log('📦 Snippet containers effect:', {
			markersLength: markers.length,
			markerIds: markers.map(m => m.id),
			snippetContainersCount: Object.keys(markerSnippetContainers).length,
			snippetContainerIds: Object.keys(markerSnippetContainers),
			hasMarkerElement: !!markerElement
		});
	});

	// Update markers when data changes
	$effect(() => {
		const currentMarkers = markers;
		const currentMap = map;
		
		console.log('🗺️ GoogleMap $effect triggered:', {
			hasMap: !!currentMap,
			markersLength: currentMarkers.length,
			markerIds: currentMarkers.map(m => m.id),
			snippetContainersCount: Object.keys(markerSnippetContainers).length,
			snippetContainerIds: Object.keys(markerSnippetContainers)
		});
		
		if (currentMap && currentMarkers.length > 0) {
			console.log('🚀 Creating markers in GoogleMap...');
			
			// Wait for snippet containers to be bound
			const checkSnippetsAndCreate = () => {
				const expectedContainers = currentMarkers.map(m => m.id);
				const actualContainers = Object.keys(markerSnippetContainers);
				const allBound = expectedContainers.every(id => markerSnippetContainers[id]);
				
				console.log('📦 Snippet container check:', {
					expected: expectedContainers,
					actual: actualContainers,
					allBound: allBound,
					containerElements: Object.entries(markerSnippetContainers).map(([id, el]) => ({
						id,
						exists: !!el,
						hasContent: el?.innerHTML?.length > 0,
						innerHTML: el?.innerHTML?.substring(0, 100) + '...'
					}))
				});
				
				if (allBound || !markerElement) {
					untrack(() => {
						createMapMarkers();
						setTimeout(() => fitBoundsToMarkers(), 100);
					});
				} else {
					console.log('⏳ Waiting for snippet containers to bind...');
					setTimeout(checkSnippetsAndCreate, 25);
				}
			};
			
			// Start checking after a small delay
			setTimeout(checkSnippetsAndCreate, 10);
		} else {
			console.log('⏳ Not creating markers:', {
				noMap: !currentMap,
				noMarkers: currentMarkers.length === 0
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

	export function openInfoWindow(markerId: string) {
		const infoWindow = infoWindows.get(markerId);
		if (infoWindow) {
			infoWindow.open(map);
			openInfoWindows.add(markerId);
			console.log('📍 Opened info window for marker:', markerId);
			
			// Refit bounds after opening info window
			setTimeout(() => fitBoundsToMarkers(), 100);
		} else {
			console.warn('Info window not found for marker:', markerId);
		}
	}

	// Cleanup on component destroy
	$effect(() => {
		return () => {
			snippetContainers = {};
			markerSnippetContainers = {};
			infoWindows.clear();
			openInfoWindows.clear();
		};
	});
</script>

<!-- Hidden containers for snippet rendering -->
<div style="display: none;">
	{#if markerElement}
		{#each markers as marker (marker.id)}
			<div bind:this={markerSnippetContainers[marker.id]}>
				{@render markerElement(marker)}
			</div>
		{/each}
	{/if}
	
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
