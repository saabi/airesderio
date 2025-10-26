# Enhanced Location Component

The `Location.svelte` component has been enhanced to support loading markers from a JSON file and displaying them on a Google Maps instance.

## Features

✅ **JSON Data Loading**: Load places data from any JSON URL  
✅ **Custom Markers**: Color-coded markers for different categories  
✅ **Interactive Info Windows**: Rich info windows with place details  
✅ **Category Filtering**: Filter markers by place categories  
✅ **Responsive Legend**: Shows categories and marker counts  
✅ **Distance Information**: Displays distance categories and walking times  

## Props

```typescript
interface Props {
  jsonUrl?: string;           // URL to JSON file (default: '/static/lugares/lugares-direcciones.json')
  showPlaceMarkers?: boolean; // Show/hide place markers (default: true)
  enableClustering?: boolean; // Enable marker clustering (default: false)
  categoryFilter?: string[];  // Filter by categories (default: [] = show all)
}
```

## Usage Examples

### Basic Usage (Default)
```svelte
<script>
  import Location from '$lib/components/Location.svelte';
</script>

<Location />
```

### Custom JSON URL
```svelte
<Location jsonUrl="/api/places.json" />
```

### With Category Filtering
```svelte
<script>
  let selectedCategories = ['gastronomia', 'cultura_entretenimiento'];
</script>

<Location 
  categoryFilter={selectedCategories}
  showPlaceMarkers={true}
/>
```

### Hide Place Markers (Original Behavior)
```svelte
<Location showPlaceMarkers={false} />
```

## JSON Data Format

The component expects JSON data in the following format:

```json
{
  "metadata": {
    "title": "Places of Interest",
    "total_places": 28
  },
  "lugares": {
    "category_name": {
      "place_id": {
        "nombre": "Place Name",
        "direccion": "Address",
        "tipo": "Type",
        "descripcion": "Description",
        "coordenadas_aproximadas": {
          "lat": -27.7833,
          "lng": -64.2667
        },
        "distancia_categoria": "MUY CERCA|CERCANO|MODERADAMENTE DISTANTE",
        "distancia_cuadras": "1-3 cuadras",
        "distancia_metros": 500
      }
    }
  }
}
```

## Supported Categories

The component includes predefined colors for these categories:

- `transporte` - Blue (#2563eb)
- `cultura_entretenimiento` - Purple (#7c3aed)
- `infraestructura` - Green (#059669)
- `lugares_historicos` - Red (#dc2626)
- `parques_recreacion` - Green (#16a34a)
- `museos` - Purple (#9333ea)
- `gastronomia` - Orange (#ea580c)
- `supermercados` - Cyan (#0891b2)
- `servicios` - Indigo (#4338ca)
- `vida_nocturna` - Pink (#be185d)

## Marker Features

### Building Marker (Aires de Río)
- Large brown circle marker
- Always visible
- Info window opens by default
- Shows building information

### Place Markers
- Small colored circles based on category
- Click to open info window with:
  - Place name with category color indicator
  - Full address
  - Distance category badge (color-coded)
  - Walking distance/blocks
  - Description

### Info Window Content
Each place marker shows:
- **Name**: With category color dot
- **Address**: With location pin emoji
- **Distance badges**: Color-coded by proximity
- **Description**: Brief description of the place

## Legend

When `showPlaceMarkers` is true, a legend appears showing:
- All active categories with their colors
- Category names (formatted)
- Total places and visible markers count

## Responsive Design

- **Desktop**: Legend positioned top-right
- **Mobile**: Smaller legend with adjusted positioning
- **Map order**: Map appears first on mobile, text second

## Example Implementation

See `/routes/mapa-ejemplo/+page.svelte` for a complete example with:
- Category filtering controls
- Toggle for showing/hiding markers
- Interactive filter buttons
- Usage instructions
- Statistics display

## Technical Notes

- Uses Google Maps JavaScript API with Advanced Markers (v=weekly)
- Requires valid API key in component
- Uses `google.maps.marker.AdvancedMarkerElement` (replaces deprecated `google.maps.Marker`)
- HTML-based custom marker elements with hover effects
- Markers are recreated when filters change
- Supports any number of categories
- Handles missing coordinate data gracefully
- TypeScript compatible with proper type definitions
- Future-proof implementation with latest Google Maps API
