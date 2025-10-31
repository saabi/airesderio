<script lang="ts">
	import Location from '$lib/components/Location.svelte';
	
	let selectedCategories: string[] = [];
	let showMarkers = true;
	
	const categories = [
		{ id: 'transporte', name: 'Transporte', color: '#2563eb' },
		{ id: 'cultura_entretenimiento', name: 'Cultura y Entretenimiento', color: '#7c3aed' },
		{ id: 'infraestructura', name: 'Infraestructura', color: '#059669' },
		{ id: 'lugares_historicos', name: 'Lugares Históricos', color: '#dc2626' },
		{ id: 'parques_recreacion', name: 'Parques y Recreación', color: '#16a34a' },
		{ id: 'museos', name: 'Museos', color: '#9333ea' },
		{ id: 'gastronomia', name: 'Gastronomía', color: '#ea580c' },
		{ id: 'supermercados', name: 'Supermercados', color: '#0891b2' },
		{ id: 'servicios', name: 'Servicios', color: '#4338ca' },
		{ id: 'vida_nocturna', name: 'Vida Nocturna', color: '#be185d' }
	];
	
	function toggleCategory(categoryId: string) {
		if (selectedCategories.includes(categoryId)) {
			selectedCategories = selectedCategories.filter(id => id !== categoryId);
		} else {
			selectedCategories = [...selectedCategories, categoryId];
		}
	}
	
	function selectAll() {
		selectedCategories = categories.map(c => c.id);
	}
	
	function clearAll() {
		selectedCategories = [];
	}
</script>

<svelte:head>
	<title>Mapa con Lugares de Interés - Aires de Río</title>
	<meta name="description" content="Mapa interactivo mostrando todos los lugares de interés cerca del edificio Aires de Río en Santiago del Estero" />
</svelte:head>

<main class="container">
	<header class="header">
		<h1>🗺️ Mapa Interactivo de Aires de Río</h1>
		<p>Explora todos los lugares de interés cerca del edificio</p>
	</header>

	<div class="controls">
		<div class="control-group">
			<label class="toggle">
				<input type="checkbox" bind:checked={showMarkers} />
				<span>Mostrar marcadores de lugares</span>
			</label>
		</div>
		
		<div class="control-group">
			<h3>Filtrar por categoría:</h3>
			<div class="filter-buttons">
				<button class="btn btn-small" on:click={selectAll}>Seleccionar todo</button>
				<button class="btn btn-small btn-outline" on:click={clearAll}>Limpiar</button>
			</div>
			
			<div class="category-filters">
				{#each categories as category}
					<label class="category-filter">
						<input 
							type="checkbox" 
							value={category.id}
							checked={selectedCategories.length === 0 || selectedCategories.includes(category.id)}
							on:change={() => toggleCategory(category.id)}
						/>
						<span class="category-color" style="background-color: {category.color}"></span>
						<span class="category-name">{category.name}</span>
					</label>
				{/each}
			</div>
		</div>
	</div>

	<div class="map-section">
		<Location 
			jsonUrl="/static/lugares/lugares-direcciones.json"
			showPlaceMarkers={showMarkers}
			categoryFilter={selectedCategories}
		/>
	</div>
	
	<div class="info-section">
		<h2>Cómo usar el mapa</h2>
		<ul>
			<li>🏢 El <strong>marcador grande</strong> muestra la ubicación del edificio Aires de Río</li>
			<li>🎯 Los <strong>marcadores pequeños</strong> muestran lugares de interés cercanos</li>
			<li>🎨 Cada <strong>color</strong> representa una categoría diferente de lugar</li>
			<li>📍 Haz <strong>clic en cualquier marcador</strong> para ver más información</li>
			<li>🔍 Usa los <strong>filtros</strong> para mostrar solo las categorías que te interesan</li>
		</ul>
		
		<div class="stats">
			<p><strong>Total de lugares:</strong> 28 establecimientos</p>
			<p><strong>Categorías:</strong> {categories.length} tipos diferentes</p>
			<p><strong>Filtros activos:</strong> {selectedCategories.length === 0 ? 'Todos' : selectedCategories.length}</p>
		</div>
	</div>
</main>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family: system-ui, sans-serif;
	}
	
	.header {
		text-align: center;
		margin-bottom: 2rem;
	}
	
	.header h1 {
		color: #6B4423;
		margin-bottom: 0.5rem;
	}
	
	.header p {
		color: #666;
		font-size: 1.1rem;
	}
	
	.controls {
		background: #f8f9fa;
		border-radius: 0.5rem;
		padding: 1.5rem;
		margin-bottom: 2rem;
		border: 1px solid #e9ecef;
	}
	
	.control-group {
		margin-bottom: 1.5rem;
	}
	
	.control-group:last-child {
		margin-bottom: 0;
	}
	
	.control-group h3 {
		margin: 0 0 1rem 0;
		color: #374151;
		font-size: 1rem;
	}
	
	.toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-weight: 500;
	}
	
	.filter-buttons {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}
	
	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s;
	}
	
	.btn-small {
		padding: 0.375rem 0.75rem;
		font-size: 0.8rem;
	}
	
	.btn {
		background: #6B4423;
		color: white;
	}
	
	.btn:hover {
		background: #5a3a1e;
	}
	
	.btn-outline {
		background: transparent;
		color: #6B4423;
		border: 1px solid #6B4423;
	}
	
	.btn-outline:hover {
		background: #6B4423;
		color: white;
	}
	
	.category-filters {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 0.5rem;
	}
	
	.category-filter {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.25rem;
		transition: background-color 0.2s;
	}
	
	.category-filter:hover {
		background: rgba(107, 68, 35, 0.05);
	}
	
	.category-color {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	
	.category-name {
		font-size: 0.875rem;
		color: #374151;
	}
	
	.map-section {
		margin-bottom: 2rem;
	}
	
	.info-section {
		background: #f8f9fa;
		border-radius: 0.5rem;
		padding: 1.5rem;
		border: 1px solid #e9ecef;
	}
	
	.info-section h2 {
		color: #6B4423;
		margin-bottom: 1rem;
	}
	
	.info-section ul {
		margin-bottom: 1.5rem;
	}
	
	.info-section li {
		margin-bottom: 0.5rem;
		line-height: 1.5;
	}
	
	.stats {
		background: white;
		border-radius: 0.25rem;
		padding: 1rem;
		border: 1px solid #e9ecef;
	}
	
	.stats p {
		margin: 0.25rem 0;
		color: #374151;
	}
	
	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}
		
		.category-filters {
			grid-template-columns: 1fr;
		}
		
		.filter-buttons {
			flex-direction: column;
		}
	}
</style>
