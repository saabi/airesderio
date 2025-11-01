<script lang="ts">
	interface Props {
		placesData: any;
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

	// Category data is now passed as props from Location component

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

const toCategoryClass = (category: string) =>
	`category-${category.replace(/[^a-z0-9]+/gi, '-')}`;

	// Calculate total places count (excluding categories with isAlwaysVisible: true)
	let totalPlacesCount = $derived.by(() => {
		if (!placesData) return 0;

		return Object.entries(placesData.lugares)
			.filter(([category]) => {
				const categoryData = placesData.metadata?.categories?.[category];
				return !categoryData?.isAlwaysVisible;
			})
			.reduce((total: number, [, places]: [string, any]) => total + Object.keys(places).length, 0);
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
			{#each filteredCategories as category}
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
		background: var(--color-white);
		border-radius: 0.5rem;
		padding: 1rem;
		box-shadow: 0 4px 6px -1px var(--shadow-soft);
		border-left: 4px solid var(--brand);
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
		border-bottom: 1px solid var(--color-neutral-300);
	}

	.legend-header h4 {
		margin: 0;
		color: var(--color-neutral-800);
		font-size: 1rem;
		font-weight: 600;
	}

	.header-buttons {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.toggle-markers-btn,
	.fit-view-btn,
	.select-all-btn {
		background: none;
		border: 1px solid var(--color-neutral-400);
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
	.fit-view-btn:hover,
	.select-all-btn:hover {
		background: var(--color-neutral-200);
		border-color: var(--color-neutral-500);
	}

	.fit-view-btn {
		background: var(--color-cool-100);
		border-color: var(--color-sky-500);
		color: var(--color-sky-500);
	}

	.fit-view-btn:hover {
		background: var(--color-cool-200);
		border-color: var(--color-sky-600);
		color: var(--color-sky-600);
	}

	.select-all-btn {
		position: relative;
	}

	.select-all-btn .checkbox-box {
		width: 16px;
		height: 16px;
		border: 2px solid var(--color-neutral-500);
		border-radius: 0.25rem;
		position: relative;
		background: var(--color-white);
	}

	.select-all-btn.all-selected .checkbox-box {
		background: var(--color-green-400);
		border-color: var(--color-green-500);
	}

	.select-all-btn.partial-selected .checkbox-box {
		background: linear-gradient(180deg, var(--color-neutral-150) 0%, var(--color-cool-400) 100%);
		border-color: var(--color-neutral-600);
	}

	.select-all-btn.all-selected .checkbox-box::after,
	.select-all-btn.partial-selected .checkbox-box::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 8px;
		height: 2px;
		background: var(--color-neutral-900);
		border-radius: 1px;
	}

	.select-all-btn.all-selected .checkbox-box::after {
		width: 4px;
		height: 8px;
		border: 2px solid var(--color-neutral-900);
		border-top: none;
		border-left: none;
		transform: translate(-50%, -55%) rotate(45deg);
		background: none;
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
		background: var(--color-neutral-125);
	}

	.legend-item.active {
		background: var(--color-cool-100);
		border: 1px solid var(--color-cool-200);
	}

	.legend-item.inactive {
		opacity: 0.5;
		background: var(--color-neutral-125);
	}

	.legend-item.inactive:hover {
		opacity: 0.7;
		background: var(--color-neutral-200);
	}

	.legend-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.legend-color {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		flex-shrink: 0;
		border: 2px solid var(--overlay-white-soft);
		box-shadow: 0 1px 3px var(--shadow-medium);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		background-color: var(--category-color, var(--brand));
	}

	.legend-icon {
		font-size: 10px;
		line-height: 1;
		text-shadow: 0 0 2px var(--overlay-black-30);
	}

	.legend-text {
		font-size: 0.875rem;
		color: var(--color-neutral-800);
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.legend-text small {
		color: var(--color-muted);
		font-size: 0.75rem;
		font-weight: 500;
	}

	.legend-stats {
		border-top: 1px solid var(--color-neutral-300);
		padding-top: 0.5rem;
		text-align: center;
	}

	.legend-stats small {
		color: var(--color-neutral-500);
		font-size: 0.7rem;
	}

	/* Mobile responsiveness */
	@media (max-width: 850px) {
		.map-legend {
			min-width: unset;
			max-width: unset;
			width: 100%;
			border-left: none;
			border-top: 4px solid var(--brand);
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
