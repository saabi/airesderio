<script module lang="ts">
	// ===== IMPORTS =====
	import type { Snippet } from 'svelte';
	import type { GenericMarker } from '$lib/types';

	// ===== TYPES =====
	interface Props {
		apiKey: string;
		mapId?: string;
		center: { lat: number; lng: number };
		zoom?: number;
		mapTypeId?: string;
		markers: GenericMarker[];
		activeMarkerId?: string | null;
		markerElement?: Snippet<[GenericMarker]>;
		markerInfoWindow?: Snippet<[GenericMarker]>;
		onMarkerClick?: (marker: GenericMarker) => void;
		onMapReady?: (map: google.maps.Map) => void;
		onBoundsChanged?: () => void;
		onInfoWindowClose?: (markerId: string) => void;
		onMarkerPhotoClick?: (marker: GenericMarker) => void;
		containerClass?: string;
		height?: string;
		width?: string;
	}

	// ===== STATIC CONSTANTS =====
	const DEFAULT_ZOOM = 15;
	const DEFAULT_MAP_TYPE = 'roadmap';
	const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-script';
</script>

<script lang="ts">
	// ===== IMPORTS =====
	import { browser } from '$app/environment';
	import { tick } from 'svelte';

	// ===== PROPS =====
	let {
		apiKey,
		mapId,
		center,
		zoom = DEFAULT_ZOOM,
		mapTypeId = DEFAULT_MAP_TYPE,
		markers = [],
		activeMarkerId = null,
		markerElement,
		markerInfoWindow,
		onMarkerClick,
		onMapReady,
		onBoundsChanged,
		onInfoWindowClose,
		onMarkerPhotoClick,
		containerClass = '',
		height = '100%',
		width = '100%'
	}: Props = $props();

	// ===== REFS =====
	let mapElement: HTMLDivElement;

	// ===== STATE =====
	let scriptLoaded = $state(false);
	let map: google.maps.Map | null = null;
	let mapReady = $state(false);
	const markerInstances = new Map<string, google.maps.Marker | google.maps.marker.AdvancedMarkerElement>();
	const infoWindowInstances = new Map<string, google.maps.InfoWindow>();
	let snippetContainers = $state<Record<string, HTMLElement>>({});
	let markerSnippetContainers = $state<Record<string, HTMLElement>>({});
	let currentActiveInfoWindow: string | null = null;
	let isInitialFitPending = $state(true);
	let syncGeneration = 0;
	let lastMarkerSignature = '';
	let lastMarkerCount = 0;
	let markerFillColor = $state(readCssColor('--color-accent-primary', 'var(--color-accent-primary)'));
	let markerStrokeColor = $state(readCssColor('--color-text-inverse', 'var(--color-text-inverse)'));

	// ===== UTILITY FUNCTIONS =====
	const readCssColor = (token: string, fallback: string) =>
		browser
			? getComputedStyle(document.documentElement).getPropertyValue(token)?.trim() || fallback
			: fallback;

	const ensureMarkerColors = () => {
		if (!browser) return;
		if (!markerFillColor || markerFillColor.startsWith('var(')) {
			markerFillColor = readCssColor('--color-accent-primary', markerFillColor || 'var(--color-accent-primary)');
		}
		if (!markerStrokeColor || markerStrokeColor.startsWith('var(')) {
			markerStrokeColor = readCssColor('--color-text-inverse', markerStrokeColor || 'var(--color-text-inverse)');
		}
	};

	// ===== EFFECTS =====
	$effect(() => {
		ensureMarkerColors();
	});

	$effect(() => {
		if (!browser || !apiKey) return;

		if (document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) {
			scriptLoaded = true;
			return;
		}

		(window as any).initMap = () => {
			scriptLoaded = true;
		};

		const script = document.createElement('script');
		script.id = GOOGLE_MAPS_SCRIPT_ID;
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

	$effect(() => {
		if (!scriptLoaded || !mapElement || map) return;

		const mapConfig: google.maps.MapOptions = {
			zoom,
			center,
			mapTypeId: mapTypeId as google.maps.MapTypeId
		};

		if (mapId) {
			mapConfig.mapId = mapId;
		}

		if (window.google?.maps) {
			map = new window.google.maps.Map(mapElement, mapConfig);
		}
		isInitialFitPending = true;
		mapReady = true;

		if (onMapReady && map) {
			onMapReady(map);
		}
	});

	function resolveMarkerContent(markerData: GenericMarker): HTMLElement | undefined {
		if (markerData.customElement) {
			return markerData.customElement;
		}

		if (markerElement) {
			const container = markerSnippetContainers[markerData.id];
			if (container) {
				return container;
			}
		}

		return createDefaultMarkerElement(markerData);
	}

	function resolveInfoWindowContent(markerData: GenericMarker): HTMLElement | undefined {
		if (!markerInfoWindow) return undefined;
		return snippetContainers[markerData.id];
	}

	function attachPhotoTrigger(content: HTMLElement | undefined, markerData: GenericMarker) {
		if (!content || !onMarkerPhotoClick) return;

		const trigger = content.querySelector('[data-photo-trigger]') as HTMLElement | null;
		if (trigger && trigger.dataset.photoBound !== '1') {
			trigger.addEventListener('click', (event) => {
				event.stopPropagation();
				onMarkerPhotoClick(markerData);
			});
			trigger.dataset.photoBound = '1';
		}
	}

	function createMarker(markerData: GenericMarker, content?: HTMLElement): google.maps.Marker | google.maps.marker.AdvancedMarkerElement {
		if (!map) throw new Error('Map not initialized');
		
		ensureMarkerColors();
		let marker: google.maps.Marker | google.maps.marker.AdvancedMarkerElement;

		const AdvancedMarker = window.google?.maps?.marker?.AdvancedMarkerElement;

		if (AdvancedMarker) {
			marker = new AdvancedMarker({
				position: markerData.position,
				map,
				title: markerData.title,
				content
			}) as google.maps.marker.AdvancedMarkerElement;
		} else {
			if (!window.google?.maps) throw new Error('Google Maps API not loaded');
			marker = new window.google.maps.Marker({
				position: markerData.position,
				map,
				title: markerData.title,
				icon: {
					path: window.google.maps.SymbolPath.CIRCLE,
					fillColor: markerFillColor,
					fillOpacity: 0.8,
					strokeColor: markerStrokeColor,
					strokeWeight: 2,
					scale: 8
				}
			}) as google.maps.Marker;
		}

		marker.addListener('click', () => {
			if (onMarkerClick) {
				onMarkerClick(markerData);
			}
		});

		return marker;
	}

	function updateMarker(marker: google.maps.Marker | google.maps.marker.AdvancedMarkerElement, markerData: GenericMarker, content?: HTMLElement) {
		const AdvancedMarker = window.google?.maps?.marker?.AdvancedMarkerElement;

		if (AdvancedMarker && marker instanceof AdvancedMarker) {
			const advancedMarker = marker as google.maps.marker.AdvancedMarkerElement;
			advancedMarker.position = markerData.position;
			advancedMarker.title = markerData.title;
			if (content && advancedMarker.content !== content) {
				advancedMarker.content = content;
			}
		} else if (marker instanceof window.google?.maps?.Marker) {
			const standardMarker = marker as google.maps.Marker;
			standardMarker.setPosition(markerData.position);
			standardMarker.setTitle(markerData.title);
		}
	}

	function createOrUpdateInfoWindow(markerData: GenericMarker) {
		if (!markerInfoWindow) return;

		const content = resolveInfoWindowContent(markerData);
		if (!content) return;

		let infoWindow = infoWindowInstances.get(markerData.id);

		if (!infoWindow) {
			if (!window.google?.maps) return;
			infoWindow = new window.google.maps.InfoWindow({
				content
			});
			infoWindow.addListener('closeclick', () => {
				if (currentActiveInfoWindow === markerData.id) {
					currentActiveInfoWindow = null;
				}
				if (onInfoWindowClose) {
					onInfoWindowClose(markerData.id);
				}
			});
			infoWindowInstances.set(markerData.id, infoWindow);
		} else {
			infoWindow.setContent(content);
		}
	}

	function removeMarker(markerId: string) {
		const marker = markerInstances.get(markerId);
		if (marker) {
			const AdvancedMarker = window.google?.maps?.marker?.AdvancedMarkerElement;
			if (AdvancedMarker && marker instanceof AdvancedMarker) {
				const advancedMarker = marker as google.maps.marker.AdvancedMarkerElement;
				advancedMarker.map = null;
				advancedMarker.content = null;
			} else if (marker instanceof window.google?.maps?.Marker) {
				const standardMarker = marker as google.maps.Marker;
				standardMarker.setMap(null);
			}
			markerInstances.delete(markerId);
		}

		const infoWindow = infoWindowInstances.get(markerId);
		if (infoWindow) {
			infoWindow.close();
			infoWindowInstances.delete(markerId);
		}

		if (currentActiveInfoWindow === markerId) {
			currentActiveInfoWindow = null;
		}
	}

	function upsertMarker(markerData: GenericMarker) {
		const markerId = markerData.id;
		const existingMarker = markerInstances.get(markerId);
		const content = resolveMarkerContent(markerData);

		attachPhotoTrigger(content, markerData);

		if (!existingMarker) {
			const marker = createMarker(markerData, content);
			markerInstances.set(markerId, marker);
			createOrUpdateInfoWindow(markerData);
		} else {
			updateMarker(existingMarker, markerData, content);
			createOrUpdateInfoWindow(markerData);
		}
	}

	function syncMarkers(markerList: GenericMarker[]) {
		const incomingIds = new Set(markerList.map((marker) => marker.id));

		for (const existingId of Array.from(markerInstances.keys())) {
			if (!incomingIds.has(existingId)) {
				removeMarker(existingId);
			}
		}

		for (const markerData of markerList) {
			upsertMarker(markerData);
		}
	}

	function openInfoWindowById(markerId: string) {
		const infoWindow = infoWindowInstances.get(markerId);
		const marker = markerInstances.get(markerId);

		if (!infoWindow || !marker) return;

		if (currentActiveInfoWindow && currentActiveInfoWindow !== markerId) {
			const previouslyOpen = infoWindowInstances.get(currentActiveInfoWindow);
			previouslyOpen?.close();
		}

		const AdvancedMarker = (window as any).google?.maps?.marker?.AdvancedMarkerElement;

		if (AdvancedMarker && marker instanceof AdvancedMarker) {
			infoWindow.open({ anchor: marker, map });
		} else {
			infoWindow.open(map, marker);
		}

		currentActiveInfoWindow = markerId;
	}

	function closeActiveInfoWindow() {
		if (!currentActiveInfoWindow) return;

		const infoWindow = infoWindowInstances.get(currentActiveInfoWindow);
		infoWindow?.close();
		currentActiveInfoWindow = null;
	}

	function fitBoundsToMarkers() {
		if (!mapReady || !map || markerInstances.size === 0 || !window.google?.maps) return;

		const bounds = new window.google.maps.LatLngBounds();
		let hasValidMarker = false;

		markerInstances.forEach((marker) => {
			let position: google.maps.LatLng | google.maps.LatLngLiteral | null = null;
			const AdvancedMarker = window.google.maps.marker?.AdvancedMarkerElement;

			if (AdvancedMarker && marker instanceof AdvancedMarker) {
				const advancedMarker = marker as google.maps.marker.AdvancedMarkerElement;
				position = advancedMarker.position || null;
			} else if (marker instanceof window.google.maps.Marker) {
				const standardMarker = marker as google.maps.Marker;
				position = standardMarker.getPosition()?.toJSON() || null;
			}

			if (position) {
				bounds.extend(position);
				hasValidMarker = true;
			}
		});

		if (!hasValidMarker || !map) return;

		map.fitBounds(bounds);

		if (onBoundsChanged && map) {
			window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
				if (map && map.getZoom() && map.getZoom()! > 17) {
					map.setZoom(17);
				}
				onBoundsChanged();
			});
		}
	}

	function createMarkerSignature(markerList: GenericMarker[]) {
		return markerList
			.map(
				(marker) =>
					`${marker.id}:${marker.position.lat.toFixed(6)},${marker.position.lng.toFixed(6)}`
			)
			.join('|');
	}

	function adjustViewForMarkers(markerList: GenericMarker[], markersChanged: boolean) {
		if (!mapReady || !map || markerList.length === 0) return;

		if (markerList.length === 1) {
			const targetMarker = markerList[0];
			map.panTo(targetMarker.position);

			const desiredZoom = zoom ?? 15;
			const currentZoom = typeof map.getZoom === 'function' ? map.getZoom() : undefined;

			if (
				typeof desiredZoom === 'number' &&
				(typeof currentZoom !== 'number' ||
					currentZoom < desiredZoom - 0.01 ||
					markersChanged ||
					lastMarkerCount !== 1)
			) {
				map.setZoom(desiredZoom);
			}
			return;
		}

		fitBoundsToMarkers();
	}

	$effect(() => {
		if (!mapReady) return;

		const markerData = markers;
		const markerSignature = createMarkerSignature(markerData);
		const markersChanged = markerSignature !== lastMarkerSignature;
		const generation = ++syncGeneration;

		const run = async () => {
			if (markerElement || markerInfoWindow) {
				await tick();
			}

			if (!mapReady) {
				return;
			}

			if (generation !== syncGeneration) {
				return;
			}

			syncMarkers(markerData);

			if (activeMarkerId && infoWindowInstances.has(activeMarkerId)) {
				openInfoWindowById(activeMarkerId);
			}

			if (markersChanged || isInitialFitPending) {
				adjustViewForMarkers(markerData, markersChanged);
				isInitialFitPending = false;
			}

			lastMarkerSignature = markerSignature;
			lastMarkerCount = markerData.length;
		};

		run();
	});

	$effect(() => {
		if (!mapReady) return;

		if (activeMarkerId && infoWindowInstances.has(activeMarkerId)) {
			openInfoWindowById(activeMarkerId);
		} else if (activeMarkerId === null) {
			closeActiveInfoWindow();
			adjustViewForMarkers(markers, false);
		}
	});

	$effect(() => {
		return () => {
			infoWindowInstances.forEach((infoWindow) => infoWindow.close());
			infoWindowInstances.clear();

			const AdvancedMarker = window.google?.maps?.marker?.AdvancedMarkerElement;

			markerInstances.forEach((marker) => {
				if (AdvancedMarker && marker instanceof AdvancedMarker) {
					const advancedMarker = marker as google.maps.marker.AdvancedMarkerElement;
					advancedMarker.map = null;
					advancedMarker.content = null;
				} else if (marker instanceof window.google?.maps?.Marker) {
					const standardMarker = marker as google.maps.Marker;
					standardMarker.setMap(null);
				}
			});

			markerInstances.clear();
			snippetContainers = {};
			markerSnippetContainers = {};
			currentActiveInfoWindow = null;
			mapReady = false;
			map = null;
		};
	});

	export function fitToMarkers() {
		fitBoundsToMarkers();
	}

	export function getMap() {
		return map;
	}

	export function getMarkers() {
		return Array.from(markerInstances.values());
	}

	export function closeAllInfoWindows() {
		infoWindowInstances.forEach((infoWindow) => infoWindow.close());
		currentActiveInfoWindow = null;
	}

	export function openInfoWindow(markerId: string) {
		openInfoWindowById(markerId);
	}

	function createDefaultMarkerElement(marker: GenericMarker): HTMLElement {
		const markerContainer = document.createElement('div');
		markerContainer.style.cssText = `
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
		`;

		const markerDot = document.createElement('div');
		markerDot.style.cssText = `
			width: 16px;
			height: 16px;
			background-color: var(--color-accent-primary);
			border: 2px solid var(--color-text-inverse);
			border-radius: 50%;
			box-shadow: 0 2px 4px var(--shadow-strong);
			cursor: pointer;
			transition: transform 0.2s ease;
		`;

		markerDot.addEventListener('mouseenter', () => {
			markerDot.style.transform = 'scale(1.1)';
		});

		markerDot.addEventListener('mouseleave', () => {
			markerDot.style.transform = 'scale(1)';
		});

		markerContainer.appendChild(markerDot);
		return markerContainer;
	}
</script>

<!-- Hidden containers for snippet rendering -->
<div style='display: none;'>
	{#if markerElement}
		{#each markers as marker (marker.id)}
			<div bind:this={markerSnippetContainers[marker.id]} id='marker-{marker.id}'>
				{@render markerElement(marker)}
			</div>
		{/each}
	{/if}

	{#if markerInfoWindow}
		{#each markers as marker (marker.id)}
			<div bind:this={snippetContainers[marker.id]} id='info-window-{marker.id}'>
				{@render markerInfoWindow(marker)}
			</div>
		{/each}
	{/if}
</div>

<div
	bind:this={mapElement}
	class='google-map {containerClass}'
	style='height: {height}; min-height: {height}; width: {width}; min-width: {width};'
	role='img'
	aria-label='Interactive map'
></div>

<style>
	.google-map {
		height: 100%;
		width: 100%;
		background-color: var(--color-neutral-275);
		border-radius: 0.5rem;
		overflow: hidden;
	}
</style>
