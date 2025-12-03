<script module lang="ts">
	// ===== IMPORTS =====
	import CategorySelector from '$lib/components/features/CategorySelector.svelte';
	import Map from '$lib/components/features/Map.svelte';
	import type { MapComponent } from '$lib/components/features/Map.svelte';
	import PhotoCarousel from '$lib/components/features/PhotoCarousel.svelte';
	import Title from '$lib/components/ui/Title.svelte';
	import type { PlacesData, MarkerData, Place, MainBuilding, Category } from '$lib/types';

	// ===== TYPES =====
	interface Props {
		jsonUrl?: string;
		showPlaceMarkers?: boolean;
		enableClustering?: boolean;
		categoryFilter?: string[];
	}

	// ===== STATIC CONSTANTS =====
	const DEFAULT_JSON_URL = '/lugares/lugares-direcciones.json';
</script>

<script lang="ts">
	// ===== IMPORTS =====
	import { browser } from '$app/environment';
	import { createSectionObserver } from '$lib/utils/sectionVisibility';
	import {
		ANIMATION,
		animationDelay,
		animationDuration,
		animationOffset
	} from '$lib/constants/animation';

	// ===== PROPS =====
	let {
		jsonUrl = DEFAULT_JSON_URL,
		showPlaceMarkers = true,
		enableClustering = false,
		categoryFilter = []
	}: Props = $props();

	// ===== STATE =====
	let placesData = $state<PlacesData | null>(null);
	let photoCarouselVisible = $state(false);
	let carouselPlace = $state<Place | null>(null);
	let carouselCategory = $state<string>('');
	let carouselPlaceId = $state<string>('');
	let carouselPhotos = $state<string[]>([]);
	let carouselCurrentIndex = $state(0);
	let hasInitializedCategoryFilter = $state(false);
	let mapComponent: MapComponent | null = $state(null);
	let galleryCarouselVisible = $state(false);

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
			names[key] = category.name || key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
		});
		return names;
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

	// ===== UTILITY FUNCTIONS =====
	const toCategoryClass = (category: string) => `category-${category.replace(/[^a-z0-9]+/gi, '-')}`;

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

		Object.entries(placesData.lugares || {}).forEach(
			([category, places]: [string, Record<string, Place>]) => {
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
			}
		);

		return markers;
	});

	let mainMarker = $derived.by<MarkerData | null>(
		() => allMarkers.find((marker) => marker.isMainMarker) || null
	);
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
		carouselPhotos = place.photos.map(
			(filename: string) => `/lugares/${category}/${placeId}/${filename}`
		);
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
	id="ubicacion"
	class="ubi"
	aria-labelledby="ubicacion-heading"
	use:locationObserver
	data-section-active={$locationVisible}
>
	<div
		use:createTitleObserver
		class="title-block scroll-animate"
		data-item-active={titleVisible || undefined}
		style={`--scroll-animate-delay: ${animationDelay(0)}; --scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
	>
		<Title eyebrow="¿Dónde se encuentra?" big="UBICACIÓN" />
	</div>
	<div class="location-block">
		<div
			class="location-text scroll-animate"
			style={`--scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
		>
			<p>
				Aires de Río ofrece una ubicación de privilegio. Se emplaza sobre Avenida Rivadavia, a un
				paso de todo lo que esta ciudad ofrece para brindarte una vida placentera y cómoda.
			</p>
			<p>
				Ubicado en un área de modernos y elegantes desarrollos edilicios, centro de convenciones, de
				parques y hermosas zonas verdes.
			</p>
			<p>
				Plaza Vea, único centro de compras dentro del área urbana, te ofrece supermercado y shopping
				de cercanía a solo una cuadra.
			</p>
			<div class="map-navigation">
				<div class="map-navigation__row">
					<button
						class="nav-button nav-button--prev"
						onclick={() => mapComponent?.prev()}
						aria-label="Anterior ubicación"
						type="button"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 20 20"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
						>
							<path
								d="M12.5 15L7.5 10L12.5 5"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
					<div class="map-navigation__center">
						<button
							class="nav-button nav-button--up"
							onclick={() => mapComponent?.reset()}
							aria-label="Volver al estado inicial"
							type="button"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<!-- Building icon -->
								<rect
									x="4"
									y="7"
									width="12"
									height="10"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M4 7L10 3L16 7"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<line
									x1="7"
									y1="10"
									x2="7"
									y2="17"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
								/>
								<line
									x1="13"
									y1="10"
									x2="13"
									y2="17"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
								/>
								<rect
									x="8.5"
									y="12"
									width="3"
									height="3"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</button>
						<button
							class="nav-button nav-button--gallery"
							onclick={() => (galleryCarouselVisible = true)}
							aria-label="Abrir galería"
							type="button"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<rect
									x="3"
									y="3"
									width="5"
									height="5"
									rx="1"
									stroke="currentColor"
									stroke-width="2"
									fill="none"
								/>
								<rect
									x="12"
									y="3"
									width="5"
									height="5"
									rx="1"
									stroke="currentColor"
									stroke-width="2"
									fill="none"
								/>
								<rect
									x="3"
									y="12"
									width="5"
									height="5"
									rx="1"
									stroke="currentColor"
									stroke-width="2"
									fill="none"
								/>
								<rect
									x="12"
									y="12"
									width="5"
									height="5"
									rx="1"
									stroke="currentColor"
									stroke-width="2"
									fill="none"
								/>
							</svg>
						</button>
					</div>
					<button
						class="nav-button nav-button--next"
						onclick={() => mapComponent?.next()}
						aria-label="Siguiente ubicación"
						type="button"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 20 20"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
						>
							<path
								d="M7.5 5L12.5 10L7.5 15"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
		<div
			class="map-container scroll-animate"
			style={`--scroll-animate-delay: ${animationDelay(1)}; --scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration()};`}
		>
			<Map
				bind:this={mapComponent}
				class="location-map"
				ariaLabel="Mapa de ubicación del proyecto Aires de Río"
			/>
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

<!-- Gallery Carousel Placeholder -->
{#if galleryCarouselVisible}
	<div
		class="gallery-carousel-overlay"
		role="button"
		tabindex="0"
		onclick={(e) => {
			if (e.target === e.currentTarget) {
				galleryCarouselVisible = false;
			}
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				galleryCarouselVisible = false;
			}
		}}
		aria-label="Cerrar galería"
	>
		<div class="gallery-carousel" role="dialog" aria-modal="true" aria-labelledby="gallery-title">
			<div class="gallery-carousel__header">
				<h3 id="gallery-title">Galería</h3>
				<button
					class="gallery-carousel__close"
					onclick={() => (galleryCarouselVisible = false)}
					aria-label="Cerrar galería"
					type="button"
				>
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M18 6L6 18M6 6L18 18"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
			</div>
			<div class="gallery-carousel__content">
				<p>Galería de imágenes (placeholder)</p>
			</div>
		</div>
	</div>
{/if}

<style>
	#ubicacion {
		max-width: var(--max);
		margin: 0 auto;
		font-size: 1.2rem;
	}

	.ubi {
		/* Layout */
		margin: 1.625rem 0;
	}

	.title-block {
		margin: 0 1.75rem;
	}

	.location-block {
		/* Layout */
		display: grid;
		grid-template-columns: 0.5fr 1fr;
		gap: 0;
		overflow: hidden;
		position: relative;
		height: calc(100vh - var(--header-height));

		/* Box/Visual */
		border: 1px solid var(--color-border-strong);
		border-radius: 0.625rem;
	}

	.location-text {
		/* Layout */
		padding: 1.75rem;

		/* Box/Visual */
		/* Light, semi-transparent cream overlay with dark text for light theme */
		background: color-mix(in oklch, var(--ref-cream) 90%, transparent);
		backdrop-filter: blur(8px);

		/* Typography */
		color: var(--color-text-on-light);
	}

	.location-eyebrow {
		/* Layout */
		display: inline-block;
		margin-bottom: 0.5rem;

		/* Typography */
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: 0.9em;
		color: var(--color-text-secondary-dark);

		/* Box/Visual */
		opacity: 0.95;
	}

	.location-text h3 {
		/* Layout */
		margin: 0 0 1rem;

		/* Typography */
		font-size: 2.5em;
		line-height: 1.1;
		color: var(--color-text-on-light);
	}

	.location-text p {
		/* Typography */
		font-size: 0.95em;
	}

	.map-navigation {
		/* Layout */
		margin-top: 1.5rem;
	}

	.map-navigation__row {
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}

	.map-navigation__center {
		/* Layout */
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.nav-button {
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		padding: 0;

		/* Box/Visual */
		background: var(--color-bg-contrast);
		border: 1px solid var(--color-border-strong);
		border-radius: 50%;
		color: var(--color-accent-primary);

		/* Misc/Overrides */
		cursor: pointer;

		/* Effects & Motion */
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease,
			transform 0.2s ease;
	}

	.nav-button:hover {
		/* Box/Visual */
		background: var(--color-accent-hover);
		border-color: var(--color-accent-strong);
		color: var(--color-text-on-accent);

		/* Effects & Motion */
		transform: scale(1.05);
	}

	.nav-button:active {
		/* Box/Visual */
		background: var(--color-accent-strong);

		/* Effects & Motion */
		transform: scale(0.95);
	}

	.nav-button:focus-visible {
		/* Box/Visual */
		outline: 2px solid var(--color-accent-primary);
		outline-offset: 2px;
	}

	.nav-button svg {
		/* Layout */
		width: 1.25rem;
		height: 1.25rem;
	}

	.gallery-carousel-overlay {
		/* Positioning */
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1000;

		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;

		/* Box/Visual */
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(4px);

		/* Effects & Motion */
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.gallery-carousel {
		/* Layout */
		display: flex;
		flex-direction: column;
		max-width: 90vw;
		max-height: 90vh;
		width: 100%;
		padding: 2rem;

		/* Box/Visual */
		background: var(--color-bg-contrast);
		border-radius: 0.625rem;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);

		/* Effects & Motion */
		animation: slideUp 0.3s ease;
	}

	@keyframes slideUp {
		from {
			transform: translateY(2rem);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.gallery-carousel__header {
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
	}

	.gallery-carousel__header h3 {
		/* Layout */
		margin: 0;

		/* Typography */
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text-on-light);
	}

	.gallery-carousel__close {
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0;

		/* Box/Visual */
		background: transparent;
		border: none;
		border-radius: 50%;
		color: var(--color-text-on-light);

		/* Misc/Overrides */
		cursor: pointer;

		/* Effects & Motion */
		transition: background-color 0.2s ease;
	}

	.gallery-carousel__close:hover {
		/* Box/Visual */
		background: var(--color-bg-muted);
	}

	.gallery-carousel__content {
		/* Layout */
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 20rem;

		/* Typography */
		color: var(--color-text-secondary);
	}

	.map-container {
		/* Positioning */
		position: relative;
		overflow: hidden;

		/* Layout */
		display: grid;
		grid-template-columns: 1fr min-content;
		width: 100%;
		gap: 0;
	}

	:global(.location-map) {
		/* Layout */
		min-height: 25rem;
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

	:global([data-theme='dark']) .location-eyebrow {
		/* Typography */
		color: var(--color-text-secondary);
	}

	:global([data-theme='dark']) .location-text h3 {
		/* Typography */
		color: var(--color-text-primary);
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
