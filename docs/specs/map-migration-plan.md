# Map Component Migration Plan

## Overview

This document outlines the step-by-step migration from the current map implementation to the new design specified in `map-design.md`.

## Current State Analysis

### Data Structure (`static/places/places.json`)

```json
{
  "places": {
    "<place-id>": {
      "nombre": "...",
      "descripcion": "...",
      "thingstodo": "...",
      "photos": ["..."],
      "svg": {
        "pin": { "cx": ..., "cy": ..., "r": ... },
        "elements": [
          { "type": "path", "d": "..." },
          { "type": "text", "x": ..., "y": ..., "content": "..." }
        ]
      }
    }
  },
  "mapConfig": {
    "fullViewBox": { "x": 0, "y": 0, "width": 374.12082, "height": 225.68958 },
    "nearViewBox": { "x": 81.364487, "y": 52.243599, "width": 69.217209, "height": 41.755505 },
    "airesderioCenter": { "cx": 203.69386, "cy": 413.82022 },
    "farImage": "/map/far.jpg",
    "nearImage": "/map/near.jpg"
  }
}
```

### Type Definitions (`src/lib/types/index.ts`)

- `MapConfig` - Configuration with viewBoxes and image paths
- `MapPlaceData` - Simplified place data for Map component
- `PlaceWithSvg` - Extended place metadata with SVG data
- `PlacesDataWithSvg` - Complete data structure
- `SvgElement` - Union type for SVG elements

### Components

- `Map.svelte` - Main map component with hardcoded airesderio shape
- `Location.svelte` - Parent section that loads data and manages carousel

### Issues with Current Implementation

1. **Hardcoded focal shape** - Airesderio path is hardcoded in `Map.svelte` (lines 601-614)
2. **Redundant viewBox config** - `fullViewBox` duplicates image dimensions
3. **Nested places object** - Places indexed by ID instead of array with ID field
4. **Mixed naming** - Spanish (`nombre`, `descripcion`) mixed with structure
5. **Separate mapConfig** - Configuration separated from related data
6. **No explicit default view logic** - Uses `nearViewBox` or computed from radius

---

## Target State

See `map-design.md` for full specification. Key changes:

1. Flat `places` array with `id` field
2. `focal` object with shapes and center
3. `baseImage` and `detailImage` replace separate config
4. `defaultView` or `defaultRadius` for initial view
5. Renamed fields for consistency (`name`, `description`, `details`)

---

## Migration Phases

### Phase 1: Data Structure Migration

**Goal**: Transform `places.json` to new schema without breaking existing components.

#### Task 1.1: Create Migration Script

Create a Node.js script to transform the current JSON to the new format.

**File**: `scripts/migrate-places-json.js`

```javascript
// Transform current places.json to new format
// - Convert places object to array
// - Flatten svg.elements to shape
// - Rename fields
// - Extract focal from hardcoded component
// - Restructure mapConfig to baseImage/detailImage
```

**Mapping**:
| Current Path | New Path |
|--------------|----------|
| `mapConfig.farImage` | `baseImage.src` |
| `mapConfig.fullViewBox.width` | `baseImage.width` |
| `mapConfig.fullViewBox.height` | `baseImage.height` |
| `mapConfig.nearImage` | `detailImage.src` |
| `mapConfig.nearViewBox.x` | `detailImage.x` |
| `mapConfig.nearViewBox.y` | `detailImage.y` |
| `mapConfig.nearViewBox.width` | `detailImage.width` |
| `mapConfig.nearViewBox.height` | `detailImage.height` |
| `mapConfig.airesderioCenter` | `focal.center` |
| (hardcoded in Map.svelte) | `focal.shapes` |
| `places[id].nombre` | `places[i].name` |
| `places[id].descripcion` | `places[i].description` |
| `places[id].thingstodo` | `places[i].details` |
| `places[id].photos` | `places[i].photos` |
| `places[id].svg.elements` | `places[i].shape` (single) or `places[i].shapes` (array) |
| `places[id].svg.pin` | `places[i].pin` |

**Handle text elements**: Text elements within `svg.elements` become `places[i].labels`.

#### Task 1.2: Update Type Definitions

**File**: `src/lib/types/index.ts`

Add new types alongside existing ones (for backwards compatibility during migration):

```typescript
// New types (add these)
export interface MapData {
  baseImage: BaseImage;
  detailImage?: DetailImage;
  focal: Focal;
  defaultView?: ViewBox;
  defaultRadius?: number;
  places: PlaceData[];
}

export interface BaseImage {
  src: string;
  width: number;
  height: number;
}

export interface DetailImage {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Focal {
  shapes?: SvgShape[];
  center: { cx: number; cy: number };
}

export interface PlaceData {
  id: string;
  name: string;
  description?: string;
  details?: string;
  photos?: string[];
  shape: SvgShape | SvgShape[];
  pin: { cx: number; cy: number; r: number };
  labels?: TextLabel[];
}

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type SvgShape =
  | { type: 'path'; d: string }
  | { type: 'rect'; x: number; y: number; width: number; height: number }
  | { type: 'circle'; cx: number; cy: number; r: number };

export interface TextLabel {
  type: 'text';
  x: number;
  y: number;
  content: string;
  xmlSpace?: 'preserve';
}
```

#### Task 1.3: Generate New JSON

Run migration script to create new `map.json`:

```bash
node scripts/migrate-places-json.js
```

**Output**: `static/places/map.json` (new format)

Keep `places.json` temporarily for backwards compatibility.

---

### Phase 2: Component Updates

**Goal**: Update Map component to use new data structure.

#### Task 2.1: Update Map.svelte Props

**File**: `src/lib/components/features/Map.svelte`

Change props from:
```typescript
interface Props {
  places: MapPlaceData[];
  mapConfig: MapConfig;
  // ...
}
```

To:
```typescript
interface Props {
  mapData: MapData;
  // ...
}
```

#### Task 2.2: Derive Values from New Structure

Replace hardcoded/config values:

```typescript
// Before
let FULL_VIEWBOX = $derived(mapConfig.fullViewBox);
let NEAR_VIEWBOX = $derived(mapConfig.nearViewBox);
let AIRESDERIO_CENTER = $derived(mapConfig.airesderioCenter);
let FAR_IMAGE = $derived(mapConfig.farImage);
let NEAR_IMAGE = $derived(mapConfig.nearImage);

// After
let FULL_VIEWBOX = $derived({
  x: 0,
  y: 0,
  width: mapData.baseImage.width,
  height: mapData.baseImage.height
});
let DETAIL_VIEWBOX = $derived(mapData.detailImage ? {
  x: mapData.detailImage.x,
  y: mapData.detailImage.y,
  width: mapData.detailImage.width,
  height: mapData.detailImage.height
} : null);
let FOCAL = $derived(mapData.focal);
let BASE_IMAGE = $derived(mapData.baseImage);
let DETAIL_IMAGE = $derived(mapData.detailImage);
```

#### Task 2.3: Implement Default View Logic

Add computed default view:

```typescript
let computedDefaultView = $derived.by(() => {
  if (mapData.defaultView) {
    return mapData.defaultView;
  }
  
  const radius = mapData.defaultRadius ?? Math.min(
    mapData.baseImage.width,
    mapData.baseImage.height
  ) * 0.2;
  
  const { cx, cy } = mapData.focal.center;
  
  return {
    x: Math.max(0, cx - radius),
    y: Math.max(0, cy - radius),
    width: radius * 2,
    height: radius * 2
  };
});
```

#### Task 2.4: Remove Hardcoded Focal Shape

Move airesderio shape from hardcoded template to data-driven:

```svelte
<!-- Before (hardcoded) -->
{#if includeAiresderio}
  <g id='building' class='building-group'>
    <g id='airesderio' class='airesderio-path'>
      <circle cx={AIRESDERIO_CENTER.cx} cy={AIRESDERIO_CENTER.cy} r='4.3814869' />
      <path d='m 202.97288,409.90271...' />
    </g>
  </g>
{/if}

<!-- After (data-driven) -->
{#if includeAiresderio && FOCAL.shapes}
  <g id='focal' class='focal-group'>
    {#each FOCAL.shapes as shape}
      {#if shape.type === 'path'}
        <path class='focal-path' d={shape.d} />
      {:else if shape.type === 'circle'}
        <circle class='focal-circle' cx={shape.cx} cy={shape.cy} r={shape.r} />
      {:else if shape.type === 'rect'}
        <rect class='focal-rect' x={shape.x} y={shape.y} width={shape.width} height={shape.height} />
      {/if}
    {/each}
  </g>
{/if}
```

#### Task 2.5: Update Place Rendering

Update place shape rendering to handle single shape or array:

```typescript
// Helper to normalize shape to array
function normalizeShapes(shape: SvgShape | SvgShape[]): SvgShape[] {
  return Array.isArray(shape) ? shape : [shape];
}
```

```svelte
{#each normalizeShapes(selectedPlace.shape) as shape}
  <!-- render shape -->
{/each}

{#if selectedPlace.labels}
  {#each selectedPlace.labels as label}
    <text x={label.x} y={label.y} xml:space={label.xmlSpace}>
      <tspan x={label.x} y={label.y}>{label.content}</tspan>
    </text>
  {/each}
{/if}
```

#### Task 2.6: Update Image References

```svelte
<!-- Before -->
<image href='/map/far.jpg' ... />
<image href='/map/near.jpg' ... />

<!-- After -->
<image href={BASE_IMAGE.src} width={BASE_IMAGE.width} height={BASE_IMAGE.height} ... />
{#if DETAIL_IMAGE && showDetailImage}
  <image 
    href={DETAIL_IMAGE.src} 
    x={DETAIL_IMAGE.x} 
    y={DETAIL_IMAGE.y}
    width={DETAIL_IMAGE.width} 
    height={DETAIL_IMAGE.height} 
    ... 
  />
{/if}
```

---

### Phase 3: Location Component Updates

**Goal**: Update Location.svelte to load and pass new data structure.

#### Task 3.1: Update Data Loading

**File**: `src/lib/components/sections/Location.svelte`

```typescript
// Before
const PLACES_JSON_URL = '/places/places.json';
let placesData = $state<PlacesDataWithSvg | null>(null);

// After
const MAP_JSON_URL = '/places/map.json';
let mapData = $state<MapData | null>(null);
```

#### Task 3.2: Update Data Transformation

Remove transformation logic that's no longer needed:

```typescript
// Before - complex transformation
placesMetadata = {
  places: Object.fromEntries(
    Object.entries(data.places).map(([id, place]) => [...])
  )
};
mapPlaces = Object.entries(data.places).map(([id, place]) => ({...}));
mapConfig = data.mapConfig || null;

// After - direct usage
mapData = data;
// For carousel, can derive from mapData.places directly
```

#### Task 3.3: Update Component Props

```svelte
<!-- Before -->
<Map
  places={mapPlaces}
  mapConfig={mapConfig}
  ...
/>

<!-- After -->
<Map
  mapData={mapData}
  ...
/>
```

---

### Phase 4: Cleanup

**Goal**: Remove deprecated code and files.

#### Task 4.1: Remove Old Types

Remove from `src/lib/types/index.ts`:
- `MapConfig` (replaced by `MapData` structure)
- `MapPlaceData` (replaced by `PlaceData`)
- `PlaceWithSvg` (replaced by `PlaceData`)
- `PlacesDataWithSvg` (replaced by `MapData`)

Keep for other uses:
- `PlaceMetadata` (still used by carousel)
- `PlacesCarouselData` (still used by carousel)

#### Task 4.2: Remove Old JSON

After confirming everything works:
```bash
rm static/places/places.json
# Rename map.json to places.json if preferred
# mv static/places/map.json static/places/places.json
```

#### Task 4.3: Update Documentation

- Update `docs/specs/architecture.md` with new data structure
- Update any references to old structure

---

## Migration Checklist

### Phase 1: Data Structure
- [ ] Create migration script (`scripts/migrate-places-json.js`)
- [ ] Add new type definitions to `src/lib/types/index.ts`
- [ ] Extract focal shapes from `Map.svelte` hardcoded values
- [ ] Run migration script to generate `static/places/map.json`
- [ ] Verify generated JSON is valid

### Phase 2: Map Component
- [ ] Update `Map.svelte` props interface
- [ ] Update derived values from new structure
- [ ] Implement computed default view logic
- [ ] Make focal shape data-driven (remove hardcoded path)
- [ ] Update place rendering for new shape structure
- [ ] Update image references to use data
- [ ] Test all zoom/navigation functionality

### Phase 3: Location Component
- [ ] Update data loading URL and type
- [ ] Simplify data transformation
- [ ] Update Map component props
- [ ] Test carousel integration
- [ ] Test photo gallery integration

### Phase 4: Cleanup
- [ ] Remove deprecated types
- [ ] Remove old JSON file
- [ ] Update documentation
- [ ] Final testing pass

---

## Risk Mitigation

### Backwards Compatibility

During migration, keep both data files:
- `places.json` (old format) - for rollback
- `map.json` (new format) - for new implementation

### Testing Strategy

1. **Unit tests**: Verify data transformation produces expected output
2. **Visual testing**: Compare rendered map before/after
3. **Interaction testing**: Verify zoom, navigation, labels work correctly
4. **Carousel testing**: Verify photo carousel still works with new data

### Rollback Plan

If issues arise:
1. Revert component changes
2. Point back to `places.json`
3. Remove `map.json`

---

## Estimated Effort

| Phase | Estimated Time |
|-------|---------------|
| Phase 1: Data Structure | 2-3 hours |
| Phase 2: Map Component | 3-4 hours |
| Phase 3: Location Component | 1-2 hours |
| Phase 4: Cleanup | 1 hour |
| Testing & Fixes | 2-3 hours |
| **Total** | **9-13 hours** |

---

## Dependencies

- No external dependencies required
- All changes are internal to the codebase
- No API changes (static JSON files)

---

**Created**: 2026-02-03  
**Status**: Plan  
**Related**: [map-design.md](./map-design.md)
