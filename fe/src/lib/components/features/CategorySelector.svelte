<script module lang="ts">
	// ===== IMPORTS =====
	import type { PlacesData, Place } from '$lib/types';

	// ===== TYPES =====
	interface Props {
		placesData: PlacesData;
		showPlaceMarkers: boolean;
		categoryFilter: string[];
		categoryIcons: Record<string, string>;
		categoryNames: Record<string, string>;
		markersCount: number;
		onToggleMarkers: () => void;
		onCategoryToggle: (category: string) => void;
		onFitToView?: () => void;
		onSetCategoryFilter: (categories: string[]) => void;
	}

	// ===== STATIC CONSTANTS =====
	const toCategoryClass = (category: string) =>
		`category-${category.replace(/[^a-z0-9]+/gi, '-')}`;
</script>

<script lang="ts">
	// ===== PROPS =====
	let {
		placesData,
		showPlaceMarkers = true,
		categoryFilter = [],
	categoryIcons,
		categoryNames,
		markersCount = 0,
		onToggleMarkers,
		onCategoryToggle,
		onFitToView,
		onSetCategoryFilter
	}: Props = $props();

	// ===== DERIVED =====
	// Get filtered categories (exclude categories with isAlwaysVisible: true)
	let filteredCategories = $derived.by(() => {
		if (!placesData) return [];

		return Object.keys(placesData.lugares).filter((category) => {
			const categoryData = placesData.metadata?.categories?.[category];
			return !categoryData?.isAlwaysVisible;
		});
	});

	let selectedCount = $derived(categoryFilter.length);
	let allSelected = $derived(
		filteredCategories.length > 0 && selectedCount === filteredCategories.length
	);
	let noneSelected = $derived(selectedCount === 0);
	let someSelected = $derived(!noneSelected && !allSelected);

	// Calculate total places count (excluding categories with isAlwaysVisible: true)
	let totalPlacesCount = $derived.by(() => {
		if (!placesData) return 0;

		return Object.entries(placesData.lugares)
			.filter(([category]) => {
				const categoryData = placesData.metadata?.categories?.[category];
				return !categoryData?.isAlwaysVisible;
			})
			.reduce((total: number, [, places]: [string, Record<string, Place>]) => total + Object.keys(places).length, 0);
	});
</script>

{#if placesData && showPlaceMarkers}
	<div class='map-legend'>
		<div class='legend-header'>
			<h4>Lugares de Interés</h4>
			<div class='header-buttons'>
				<button
					class='select-all-btn {allSelected ? 'all-selected' : ''} {someSelected
						? 'partial-selected'
						: ''}'
					role='checkbox'
					aria-checked={allSelected ? 'true' : someSelected ? 'mixed' : 'false'}
					onclick={() => {
						if (filteredCategories.length === 0) return;
						if (allSelected) {
							onSetCategoryFilter([]);
						} else {
							onSetCategoryFilter(filteredCategories);
						}
					}}
					aria-label={allSelected
						? 'Deseleccionar todas las categorías'
						: noneSelected
							? 'Seleccionar todas las categorías'
							: 'Seleccionar todas las categorías'}
					title={allSelected
						? 'Deseleccionar todas'
						: noneSelected
							? 'Seleccionar todas'
							: 'Seleccionar todas'}
				>
					<span class='checkbox-box'></span>
				</button>
				{#if onFitToView && markersCount > 0}
					<button
						class='fit-view-btn'
						onclick={onFitToView}
						aria-label='Ajustar vista para mostrar todos los marcadores'
						title='Ajustar vista'
					>
						🔍
					</button>
				{/if}
				<button
					class='toggle-markers-btn'
					onclick={onToggleMarkers}
					aria-label={showPlaceMarkers ? 'Ocultar marcadores' : 'Mostrar marcadores'}
				>
					{showPlaceMarkers ? '👁️' : '👁️‍🗨️'}
				</button>
			</div>
		</div>

		<div class='legend-categories'>
			{#each filteredCategories as category (category)}
				{@const categoryPlaces = placesData.lugares[category]}
				{@const placesCount = Object.keys(categoryPlaces).length}
				{@const isActive = categoryFilter.includes(category)}

				<button
					class='legend-item {isActive ? 'active' : 'inactive'}'
					onclick={() => onCategoryToggle(category)}
					aria-pressed={isActive}
				>
					<div class='legend-indicator'>
						<span class={`legend-color category-color ${toCategoryClass(category)}`}>
							{#if categoryIcons[category]}
								<span class='legend-icon'>{categoryIcons[category]}</span>
							{/if}
						</span>
					</div>
					<span class='legend-text'>
						{categoryNames[category] || category}
						<small>({placesCount})</small>
					</span>
				</button>
			{/each}
		</div>

		<div class='legend-stats'>
			<small>
				{markersCount} marcadores activos · {selectedCount}/{filteredCategories.length} categorías seleccionadas
			</small>
		</div>
	</div>
{/if}

<style>
	.map-legend {
		/* Layout */
		min-width: 250px;
		max-width: 300px;
		height: fit-content;
		padding: 1rem;
		
		/* Box/Visual */
		background: var(--color-bg-contrast);
		border-left: 4px solid var(--color-accent-primary);
		border-radius: 0.5rem;
		box-shadow: 0 4px 6px -1px var(--shadow-soft);
	}

	.legend-header {
		/* Layout */
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
		padding-bottom: 0.5rem;
		
		/* Box/Visual */
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.legend-header h4 {
		/* Layout */
		margin: 0;
		
		/* Typography */
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-on-light);
	}

	.header-buttons {
		/* Layout */
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.toggle-markers-btn,
	.fit-view-btn,
	.select-all-btn {
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 32px;
		height: 32px;
		padding: 0.25rem 0.5rem;
		
		/* Box/Visual */
		background: none;
		border: 1px solid var(--color-border-default);
		border-radius: 0.25rem;
		
		/* Typography */
		font-size: 0.875rem;
		
		/* Misc/Overrides */
		cursor: pointer;
		
		/* Effects & Motion */
		transition: all 0.2s;
	}

	.toggle-markers-btn:hover,
	.fit-view-btn:hover,
	.select-all-btn:hover {
		/* Box/Visual */
		background: var(--color-bg-muted);
		border-color: var(--color-border-default);
	}

	.fit-view-btn {
		/* Box/Visual */
		background: var(--color-bg-surface);
		border-color: var(--color-info);
		
		/* Typography */
		color: var(--color-info);
	}

	.fit-view-btn:hover {
		/* Box/Visual */
		background: var(--color-bg-muted);
		border-color: var(--color-info);
		color: var(--color-info);
		opacity: 0.9;
	}

	.select-all-btn {
		/* Positioning */
		position: relative;
	}

	.select-all-btn .checkbox-box {
		/* Positioning */
		position: relative;
		
		/* Layout */
		width: 16px;
		height: 16px;
		
		/* Box/Visual */
		border: 2px solid var(--color-border-default);
		border-radius: 0.25rem;
		background: var(--color-bg-contrast);
	}

	.select-all-btn.all-selected .checkbox-box {
		/* Box/Visual */
		background: var(--color-success);
		border-color: var(--color-success-strong);
	}

	.select-all-btn.partial-selected .checkbox-box {
		/* Box/Visual */
		background: linear-gradient(180deg, var(--color-bg-surface) 0%, var(--color-bg-muted) 100%);
		border-color: var(--color-border-title);
	}

	.select-all-btn.all-selected .checkbox-box::after,
	.select-all-btn.partial-selected .checkbox-box::after {
		/* Positioning */
		position: absolute;
		top: 50%;
		left: 50%;
		
		/* Layout */
		width: 8px;
		height: 2px;
		
		/* Box/Visual */
		background: var(--color-text-on-light);
		border-radius: 1px;
		
		/* Misc/Overrides */
		content: '';
		
		/* Effects & Motion */
		transform: translate(-50%, -50%);
	}

	.select-all-btn.all-selected .checkbox-box::after {
		/* Layout */
		width: 4px;
		height: 8px;
		
		/* Box/Visual */
		border: 2px solid var(--color-text-on-light);
		border-top: none;
		border-left: none;
		background: none;
		
		/* Effects & Motion */
		transform: translate(-50%, -55%) rotate(45deg);
	}

	.legend-categories {
		/* Layout */
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 0.75rem;
	}

	.legend-item {
		/* Layout */
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
		width: 100%;
		
		/* Box/Visual */
		border: none;
		border-radius: 0.25rem;
		background: none;
		
		/* Typography */
		text-align: left;
		
		/* Misc/Overrides */
		cursor: pointer;
		
		/* Effects & Motion */
		transition: all 0.2s;
	}

	.legend-item:hover {
		/* Box/Visual */
		background: var(--color-bg-surface);
	}

	.legend-item.active {
		/* Box/Visual */
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border-subtle);
	}

	.legend-item.inactive {
		/* Box/Visual */
		opacity: 0.5;
		background: var(--color-bg-surface);
	}

	.legend-item.inactive:hover {
		/* Box/Visual */
		opacity: 0.7;
		background: var(--color-bg-muted);
	}

	.legend-indicator {
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.legend-color {
		/* Positioning */
		position: relative;
		
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		flex-shrink: 0;
		
		/* Box/Visual */
		border: 2px solid var(--overlay-white-soft);
		border-radius: 50%;
		background-color: var(--category-color, var(--color-accent-primary));
		box-shadow: 0 1px 3px var(--shadow-medium);
	}

	.legend-icon {
		/* Typography */
		font-size: 10px;
		line-height: 1;
		text-shadow: 0 0 2px var(--overlay-black-30);
	}

	.legend-text {
		/* Layout */
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex: 1;
		
		/* Typography */
		font-size: 0.875rem;
		color: var(--color-text-on-light);
	}

	.legend-text small {
		/* Typography */
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-secondary-dark);
	}

	.legend-stats {
		/* Layout */
		padding-top: 0.5rem;
		
		/* Box/Visual */
		border-top: 1px solid var(--color-border-subtle);
		
		/* Typography */
		text-align: center;
	}

	.legend-stats small {
		/* Typography */
		font-size: 0.7rem;
		color: var(--color-text-tertiary);
	}

	/* Mobile responsiveness */
	@media (max-width: 850px) {
		.map-legend {
			/* Layout */
			width: 100%;
			min-width: unset;
			max-width: unset;
			
			/* Box/Visual */
			border-left: none;
			border-top: 4px solid var(--color-accent-primary);
			border-radius: 0.5rem 0.5rem 0 0;
		}

		.legend-categories {
			/* Layout */
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
			gap: 0.5rem;
		}

		.legend-item {
			/* Layout */
			padding: 0.5rem;
		}
	}

	@media (max-width: 640px) {
		.legend-categories {
			/* Layout */
			grid-template-columns: 1fr;
		}

		.legend-item {
			/* Layout */
			padding: 0.625rem 0.75rem;
		}

		.legend-text {
			/* Typography */
			font-size: 0.9rem;
		}
	}
</style>
