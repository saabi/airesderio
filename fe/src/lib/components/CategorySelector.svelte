<script lang="ts">
	interface Props {
		placesData: any;
		showPlaceMarkers: boolean;
		categoryFilter: string[];
		markersCount: number;
		onToggleMarkers: () => void;
		onCategoryToggle: (category: string) => void;
		onFitToView?: () => void;
	}

	let {
		placesData,
		showPlaceMarkers = true,
		categoryFilter = [],
		markersCount = 0,
		onToggleMarkers,
		onCategoryToggle,
		onFitToView
	}: Props = $props();

	// Category colors for different types of places (matching Location component)
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

	// Category display names
	const categoryNames: Record<string, string> = {
		transporte: 'Transporte',
		cultura_entretenimiento: 'Cultura y Entretenimiento',
		infraestructura: 'Infraestructura',
		lugares_historicos: 'Lugares Históricos',
		parques_recreacion: 'Parques y Recreación',
		museos: 'Museos',
		gastronomia: 'Gastronomía',
		supermercados: 'Supermercados',
		servicios: 'Servicios',
		vida_nocturna: 'Vida Nocturna'
	};

	// Get filtered categories (exclude edificio_principal)
	let filteredCategories = $derived(placesData ? 
		Object.keys(placesData.lugares).filter(cat => cat !== 'edificio_principal') : 
		[]);

	// Calculate total places count (excluding main building)
	let totalPlacesCount = $derived(placesData ? 
		Object.values(placesData.lugares)
			.filter((_, index) => Object.keys(placesData.lugares)[index] !== 'edificio_principal')
			.reduce((total: number, places: any) => total + Object.keys(places).length, 0) : 
		0);
</script>

{#if placesData && showPlaceMarkers}
	<div class="map-legend">
		<div class="legend-header">
			<h4>Lugares de Interés</h4>
			<div class="header-buttons">
				{#if onFitToView && markersCount > 0}
					<button 
						class="fit-view-btn"
						onclick={onFitToView}
						aria-label="Ajustar vista para mostrar todos los marcadores"
						title="Ajustar vista"
					>
						🔍
					</button>
				{/if}
				<button 
					class="toggle-markers-btn"
					onclick={onToggleMarkers}
					aria-label={showPlaceMarkers ? 'Ocultar marcadores' : 'Mostrar marcadores'}
				>
					{showPlaceMarkers ? '👁️' : '👁️‍🗨️'}
				</button>
			</div>
		</div>
		
		<div class="legend-categories">
			{#each filteredCategories as category}
				{@const categoryPlaces = placesData.lugares[category]}
				{@const placesCount = Object.keys(categoryPlaces).length}
				{@const isActive = categoryFilter.length === 0 || categoryFilter.includes(category)}
				
				<button
					class="legend-item {isActive ? 'active' : 'inactive'}"
					onclick={() => onCategoryToggle(category)}
					aria-pressed={isActive}
				>
					<span 
						class="legend-color" 
						style="background-color: {categoryColors[category] || '#6B4423'}"
					></span>
					<span class="legend-text">
						{categoryNames[category] || category}
						<small>({placesCount})</small>
					</span>
				</button>
			{/each}
		</div>
		
		<div class="legend-stats">
			<small>
				{markersCount} marcadores activos de {totalPlacesCount} lugares
			</small>
		</div>
	</div>
{/if}

<style>
	.map-legend {
		background: white;
		border-radius: 0.5rem;
		padding: 1rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		border-left: 4px solid #6B4423;
		min-width: 250px;
		max-width: 300px;
		height: fit-content;
	}

	.legend-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.legend-header h4 {
		margin: 0;
		color: #374151;
		font-size: 1rem;
		font-weight: 600;
	}

	.header-buttons {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.toggle-markers-btn,
	.fit-view-btn {
		background: none;
		border: 1px solid #d1d5db;
		border-radius: 0.25rem;
		padding: 0.25rem 0.5rem;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
		min-width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.toggle-markers-btn:hover,
	.fit-view-btn:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}

	.fit-view-btn {
		background: #f0f9ff;
		border-color: #0ea5e9;
		color: #0ea5e9;
	}

	.fit-view-btn:hover {
		background: #e0f2fe;
		border-color: #0284c7;
		color: #0284c7;
	}

	.legend-categories {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 0.75rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
		border: none;
		background: none;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		width: 100%;
	}

	.legend-item:hover {
		background: #f9fafb;
	}

	.legend-item.active {
		background: #f0f9ff;
		border: 1px solid #e0f2fe;
	}

	.legend-item.inactive {
		opacity: 0.5;
		background: #f9fafb;
	}

	.legend-item.inactive:hover {
		opacity: 0.7;
		background: #f3f4f6;
	}

	.legend-color {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
		border: 1px solid rgba(255, 255, 255, 0.8);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.legend-text {
		font-size: 0.875rem;
		color: #374151;
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.legend-text small {
		color: #6b7280;
		font-size: 0.75rem;
		font-weight: 500;
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

	/* Mobile responsiveness */
	@media (max-width: 850px) {
		.map-legend {
			min-width: unset;
			max-width: unset;
			width: 100%;
			border-left: none;
			border-top: 4px solid #6B4423;
			border-radius: 0.5rem 0.5rem 0 0;
		}

		.legend-categories {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
			gap: 0.5rem;
		}

		.legend-item {
			padding: 0.5rem;
		}
	}

	@media (max-width: 640px) {
		.legend-categories {
			grid-template-columns: 1fr;
		}
		
		.legend-item {
			padding: 0.625rem 0.75rem;
		}

		.legend-text {
			font-size: 0.9rem;
		}
	}
</style>
