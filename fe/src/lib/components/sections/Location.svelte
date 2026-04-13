<script module lang='ts'>
	// ===== IMPORTS =====
	import Map from '$lib/components/features/Map.svelte';
	import AiresDeRioLogo from '$lib/components/ui/AiresDeRioLogo.svelte';
	import { theme } from '$lib/stores/theme';
	import type { MapComponent } from '$lib/components/features/Map.svelte';
	import PhotoCarousel from '$lib/components/features/PhotoCarousel.svelte';
	import Title from '$lib/components/ui/Title.svelte';
	import CircularButton from '$lib/components/ui/CircularButton.svelte';
	import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
	import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
	import Isotype from '$lib/components/icons/Isotype.svelte';
	import type { MapData, PlaceData, PlaceMetadata } from '$lib/types';

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
	const MAP_JSON_URL = '/places/map.json';
</script>

<script lang='ts'>
	// ===== IMPORTS =====
	import { browser } from '$app/environment';

	// ===== PROPS =====
	let {}: Props = $props();

	// ===== STATE =====
	let mapData = $state<MapData | null>(null);
	let photoCarouselVisible = $state(false);
	let carouselPlace = $state<PlaceMetadata | null>(null);
	let carouselPlaceId = $state<string>('');
	let carouselPhotos = $state<string[]>([]);
	let carouselCurrentIndex = $state(0);
	let mapComponent: MapComponent | null = $state(null);
	let currentPlaceId = $state<string | null>(null);

	// ===== DERIVED =====
	let hasPlaceSelected = $derived.by(() => currentPlaceId !== null);

	// Get places record for quick lookup (id -> PlaceData)
	let placesById = $derived.by((): Record<string, PlaceData> => {
		if (!mapData) return {};
		return Object.fromEntries(mapData.places.map((p) => [p.id, p]));
	});

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
	// Load map data from JSON (new MapData format)
	async function loadMapData() {
		if (!browser) return;

		if (import.meta.env.DEV) {
			console.log('Loading map data from:', MAP_JSON_URL);
		}
		try {
			const response = await fetch(MAP_JSON_URL);
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
			const data: MapData = await response.json();
			mapData = data;

			if (import.meta.env.DEV) {
				console.log('Map data loaded successfully:', {
					totalPlaces: data.places.length,
					hasFocal: !!data.focal,
					hasDetailImage: !!data.detailImage
				});
			}
		} catch (error) {
			console.error('Error loading map data:', error);
		}
	}

	// ===== EVENT HANDLERS =====
	// Open photo carousel for a place
	function openPhotoCarousel(place: PlaceData) {
		if (!place.photos || place.photos.length === 0) return;

		// Convert PlaceData to PlaceMetadata for carousel
		carouselPlace = {
			nombre: place.name,
			descripcion: place.description,
			thingstodo: place.details,
			photos: place.photos,
			photosMobile: place.photosMobile
		};
		carouselPlaceId = place.id;
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
		if (!mapData) return;
		const currentPathId = currentPlaceId;
		if (!currentPathId) return;

		const place = placesById[currentPathId];
		if (!place || !place.photos || place.photos.length === 0) return;

		openPhotoCarousel(place);
	}

	// Load map data when component mounts
	$effect(() => {
		loadMapData();
	});
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
		<div class='location-text-column'>
			<div
				class='location-text scroll-animate'
				style={`--scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
			>
				<p>
					<AiresDeRioLogo class='logo-inline' height='1em' theme={$theme} showIsotype={false} fitViewBox={true} showDepartamentos={false} /> se encuentra en Avenida Rivadavia 25 Este, con fácil acceso tanto al centro de Santiago del
					Estero como a la Ciudad de la Banda a través del Puente Nuevo. Rodeado de modernos desarrollos como la nueva terminal de ómnibus y el fórum, está también a pasos de la Avenida Roca, eje gastronómico y de bares, y del Parque
					Aguirre, el principal pulmón verde de la ciudad. Además, Plaza Vea, con supermercado y shopping a sólo una cuadra, suma practicidad a tu día a día.
				</p>
				<p>
					Vivir en <AiresDeRioLogo class='logo-inline' height='1em' theme={$theme} showIsotype={false} fitViewBox={true} showDepartamentos={false} /> significa disfrutar de un punto estratégico pensado para combinar vida social,
					profesional, ocio y comodidad.
				</p>
			</div>
			<div class='map-navigation'>

			<div class='navigation-row'>
				<CircularButton
					variant="accent"
					size="xxl"
					ariaLabel="Anterior ubicación"
					onClick={() => mapComponent?.prev()}
				>
					<ArrowLeft />
				</CircularButton>
				<CircularButton
					variant="accent"
					size="xxl"
					ariaLabel="Volver al estado inicial"
					onClick={() => mapComponent?.reset()}
					disabled={!hasPlaceSelected}
				>
					<Isotype />
				</CircularButton>
				<CircularButton
					variant="accent"
					size="xxl"
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
		{#if mapData}
			<Map
				bind:this={mapComponent}
				class='location-map'
				ariaLabel='Mapa de ubicación del proyecto Aires de Río'
				{mapData}
				showDetailImage={false}
				pinRadius={70}
				zoomMargin={0.11}
				onOpenGallery={openGalleryForCurrentPlace}
				onSelectionChange={(id) => (currentPlaceId = id)}
				showZoneShapes={false}
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
		photosMobile={carouselPlace.photosMobile}
		bind:currentIndex={carouselCurrentIndex}
		onClose={closePhotoCarousel}
	/>
{/if}


<style>
	#ubicacion {
		max-width: var(--max);
		margin: 0 auto;
		font-size: 1.4rem;
		box-sizing: border-box;
		/* Title + map block fit below fixed header (full viewport minus header) */
		height: calc(100vh - var(--header-height));
		height: calc(100svh - var(--header-height));
		min-height: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.title-block {
		margin: 0 1.75rem;
		flex-shrink: 0;
		padding-top: 0.5rem;
		padding-bottom: 0.35rem;
	}

	.location-block {
		/* Layout */
		display: grid;
		grid-template-columns: 0.5fr 1fr;
		grid-template-rows: minmax(0, 1fr);
		grid-template-areas: "text map";
		gap: 0;
		overflow: hidden;
		position: relative;
		flex: 1;
		min-height: 0;

		/* Box/Visual */
		border: 1px solid var(--color-border-strong);
		border-radius: 0.625rem;
	}

	.location-text-column {
		/* Layout */
		grid-area: text;
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow: hidden;
	}

	.location-text {
		/* Layout */
		flex: 1;
		min-height: 0;
		padding: 1.75rem;
		overflow: auto;

		/* Box/Visual */
		/* Light, semi-transparent cream overlay with dark text for light theme */
		backdrop-filter: blur(8px);

		/* Typography */
		color: var(--color-text-on-light);
	}

	.location-text p {
		/* Typography */
		font-size: 0.95em;
	}

	.location-help {
		margin: 1rem 0 0.75rem;
		padding: 0.75rem 1rem;
		background: color-mix(in oklch, var(--color-accent-primary, var(--ref-brand-primary)) 12%, var(--ref-cream));
		border-radius: 0.375rem;
		border-left: 3px solid var(--color-accent-primary, var(--ref-brand-primary));
		font-size: 0.78em;
		line-height: 1.35;
		color: var(--color-text-on-light);
	}

	.location-help dt {
		display: inline-flex;
		align-items: center;
		vertical-align: middle;
	}

	.location-help-icon {
		display: inline-flex;
		align-items: center;
		margin-right: 0.35em;
	}

	.location-help-icon-arrows {
		gap: 0.15em;
	}

	.location-help dd {
		display: inline;
		margin: 0 0 0.25rem 0;
	}

	.location-help dd::after {
		content: '';
		display: block;
	}

	:global([data-theme='dark']) .location-help {
		background: color-mix(in oklch, var(--color-accent-primary) 25%, oklch(0.2 0 0deg));
		border-left-color: var(--color-accent-primary);
		color: var(--color-text-primary);
	}

	.map-navigation {
		/* Layout */
		flex-shrink: 0;
		margin-top: 0.75rem;
		padding: 0 1.75rem 1rem;

		/* Accent nav buttons — tokens shared with .btn-cta-primary (app.css) */
		--location-nav-accent: var(--nav-button-fill);
		--color-accent-primary: var(--location-nav-accent);
		--color-accent-strong: color-mix(in srgb, var(--location-nav-accent) 82%, #000);
	}

	.map-navigation :global(.circular-button.accent) {
		border: 2px solid var(--nav-button-border);
	}

	/* Override CircularButton disabled styles */
	.map-navigation :global(.circular-button.accent:disabled) {
		background: #fff !important;
		border: 2px solid var(--nav-button-border) !important;
		color: var(--nav-button-border) !important;
	}

	.map-navigation :global(.circular-button.accent:hover:not(:disabled)) {
		background: var(--nav-button-hover-fill);
		border: 2px solid var(--nav-button-border);
		color: var(--nav-button-border);
	}

	.navigation-row {
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}

	.map-container {
		/* Positioning */
		position: relative;
		overflow: hidden;

		/* Layout */
		grid-area: map;
		display: grid;
		grid-template-columns: 1fr min-content;
		width: 100%;
		height: 100%;
		gap: 0;
	}

	:global(.location-map) {
		/* Layout */
		min-height: 0;
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
			grid-template-columns: 1fr;
			grid-template-areas:
				"stack"
				"map";
			/* Text+nav stack and map share remaining height below title */
			grid-template-rows: minmax(0, 1fr) minmax(0, 1.1fr);
			flex: 1;
			min-height: 0;
			overflow: hidden;
		}

		.location-text-column {
			grid-area: stack;
			min-height: 0;
			overflow: hidden;
		}

		.location-text {
			max-width: 100%;
			padding: 1rem 1.5rem 0;
			flex: 1;
			min-height: 0;
			overflow: auto;
		}

		.map-navigation {
			align-self: stretch;
			padding: 0.75rem 1.5rem 1rem;
			margin-top: 0;
			background: color-mix(in oklch, var(--ref-cream) 90%, transparent);
			backdrop-filter: blur(8px);
		}

		:global([data-theme='dark']) .map-navigation {
			/* Box/Visual */
			background: color-mix(in oklch, oklch(0.2 0 0deg) 85%, transparent);
		}

		.map-container {
			grid-area: map;
			grid-template-columns: 1fr;
			height: 100%;
			min-height: 0;
		}

		:global(.location-map) {
			min-height: 0;
			height: 100%;
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
