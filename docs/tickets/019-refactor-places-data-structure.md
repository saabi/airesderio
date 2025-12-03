# Ticket #019: Refactor Places Data Structure

## Status
**Pending**

## Priority
**High**

## Description

The current places data structure has fundamental mismatches:

1. **Directory Structure**: `fe/static/places/` has a flat structure with 6 directories matching Map path IDs:
   - `terminal/` (2 photos)
   - `forum/` (7 photos)
   - `casagob/` (7 photos)
   - `plazavea/` (4 photos)
   - `parqueaguirre/` (7 photos) - Note: Map uses `parque` but directory is `parqueaguirre`
   - `avroca/` (8 photos)

2. **JSON Structure**: `lugares-direcciones.json` has a complex category-based structure:
   - `lugares[category][placeId]` - nested structure
   - Contains many places that don't match the directories
   - Place IDs don't match directory names
   - Contains coordinates, distances, and other data not needed for photo carousel

3. **Code Issues**:
   - `Location.svelte` tries to map between Map path IDs and JSON place IDs
   - Mapping is fragile and incorrect (e.g., `avroca` mapped to `plaza_libertad`)
   - Code loads entire JSON just to get `nombre` and `descripcion` for 6 places
   - Photos are discovered from directories, but metadata comes from JSON

## Current Mismatches

### Map Path IDs vs Directory Names
- Map: `parque` → Directory: `parqueaguirre` ❌
- All others match ✅

### Directory Names vs JSON Place IDs
- `terminal` → JSON: `terminal_omnibus` (category: `transporte`)
- `forum` → JSON: `forum_santiago` (category: `cultura_entretenimiento`)
- `casagob` → JSON: `casa_gobierno` (category: `lugares_historicos`)
- `plazavea` → JSON: `vea_rivadavia` (category: `supermercados`)
- `parqueaguirre` → JSON: `parque_aguirre` (category: `parques_recreacion`)
- `avroca` → JSON: No clear match (currently mapped to `plaza_libertad` incorrectly)

## Requirements

### PhotoCarousel Needs
- `place.nombre` (required) - Display name
- `place.descripcion` (optional) - Description text
- `photos` array - Already handled by directory scanning

### Map Component Needs
- Path IDs: `['terminal', 'forum', 'casagob', 'plazavea', 'parque', 'avroca']`
- Place names for display (already in Map component)

## Proposed Solutions

### Option A: Simple Places JSON (Recommended)
Create a new `fe/static/places/places.json` that matches the directory structure:

```json
{
  "places": {
    "terminal": {
      "nombre": "Terminal de Ómnibus de Santiago del Estero",
      "descripcion": "Terminal principal de ómnibus de la ciudad"
    },
    "forum": {
      "nombre": "Fórum Santiago del Estero",
      "descripcion": "Centro de convenciones y eventos culturales"
    },
    "casagob": {
      "nombre": "Casa de Gobierno",
      "descripcion": "Sede del gobierno provincial, edificio histórico"
    },
    "plazavea": {
      "nombre": "Plaza Vea",
      "descripcion": "Centro comercial y supermercado"
    },
    "parqueaguirre": {
      "nombre": "Parque Aguirre",
      "descripcion": "Principal parque de la ciudad, ideal para recreación"
    },
    "avroca": {
      "nombre": "Avenida Roca",
      "descripcion": "Avenida principal con comercios y confiterías"
    }
  }
}
```

**Pros**:
- Simple, flat structure matching directories
- Only contains data needed for carousel
- Easy to maintain
- No category complexity

**Cons**:
- Duplicates some data from old JSON (but old JSON is no longer accurate anyway)

### Option B: Remove JSON, Use Hardcoded Metadata
Store metadata directly in `Location.svelte` as a constant:

```typescript
const PLACE_METADATA: Record<string, { nombre: string; descripcion?: string }> = {
  terminal: { nombre: "Terminal de Ómnibus...", descripcion: "..." },
  // ...
};
```

**Pros**:
- No JSON file to maintain
- Type-safe
- Fast (no fetch)

**Cons**:
- Hardcoded in component
- Less flexible for content updates

### Option C: Auto-discover Photos + Minimal Metadata
Scan directories at build time and generate metadata:

**Pros**:
- Fully automated
- Always in sync with directories

**Cons**:
- Requires build-time script
- More complex
- Still need metadata source for names/descriptions

## Recommendation

**Option A (Simple Places JSON)** is recommended because:
1. Separates data from code (content can be updated without code changes)
2. Simple structure that matches directory layout
3. Easy to extend if needed
4. Can be loaded on-demand (only when gallery is opened)
5. Clear and maintainable

## Implementation Steps

1. **Create `fe/static/places/places.json`**:
   - Match structure to directory names exactly
   - Include only `nombre` and `descripcion`
   - Use proper Spanish names and descriptions

2. **Update `Location.svelte`**:
   - Remove dependency on `lugares-direcciones.json`
   - Load `places.json` instead (or load on-demand)
   - Remove `PATH_ID_TO_PLACE_DATA` mapping
   - Simplify `openGalleryForCurrentPlace()` to use pathId directly

3. **Update `openPhotoCarousel()`**:
   - Auto-discover photos from directory (scan `/places/${placeId}/`)
   - Or load photo list from JSON if preferred
   - Use metadata from `places.json`

4. **Fix Map path ID mismatch**:
   - Either rename directory `parqueaguirre` → `parque`
   - Or update Map component to use `parqueaguirre`

5. **Remove unused code**:
   - Remove `loadPlacesData()` if no longer needed
   - Remove `placesData` state if only used for carousel
   - Remove category-related code if not needed

## Acceptance Criteria

- [ ] New `places.json` created with metadata for all 6 places
- [ ] PhotoCarousel works with new structure
- [ ] Gallery button opens carousel with correct photos and metadata
- [ ] No dependency on `lugares-direcciones.json` for carousel
- [ ] Map path ID mismatch resolved (`parque` vs `parqueaguirre`)
- [ ] Code simplified (removed unnecessary mapping logic)
- [ ] All 6 places have photos loading correctly

## Related Files

- `fe/static/places/` - Photo directories
- `fe/src/lib/components/sections/Location.svelte` - Main component
- `fe/src/lib/components/features/PhotoCarousel.svelte` - Carousel component
- `fe/src/lib/components/features/Map.svelte` - Map component with path IDs
- `fe/static/lugares/lugares-direcciones.json` - Old JSON (may still be used for Google Maps markers)

## Notes

- The old `lugares-direcciones.json` may still be needed for Google Maps markers if they're still used
- If Google Maps markers are also being refactored, this ticket should coordinate with that work
- Consider if photo filenames should be in JSON or auto-discovered from directory

