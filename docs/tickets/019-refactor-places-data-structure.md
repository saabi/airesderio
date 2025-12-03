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
- `place.descripcion` (optional) - Short description text
- `place.thingstodo` (optional) - Longer description about the usefulness and activities available at the place
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
      "descripcion": "Terminal principal de ómnibus de la ciudad",
      "thingstodo": "La Terminal de Ómnibus es tu conexión con el resto del país. Desde aquí puedes viajar a destinos nacionales e internacionales con múltiples empresas de transporte. Ideal para residentes que necesitan desplazarse por trabajo, turismo o visitas familiares. La terminal cuenta con servicios básicos, boleterías, y está estratégicamente ubicada cerca del centro, facilitando el acceso desde Aires de Río."
    },
    "forum": {
      "nombre": "Fórum Santiago del Estero",
      "descripcion": "Centro de convenciones y eventos culturales",
      "thingstodo": "El Fórum Santiago del Estero es un espacio cultural y de convenciones que enriquece la vida de los residentes. Aquí se realizan eventos culturales, ferias, exposiciones, conciertos y conferencias. Es un lugar perfecto para disfrutar de la cultura local, asistir a eventos familiares, y participar en actividades comunitarias. Su ubicación céntrica lo convierte en un punto de encuentro cultural accesible desde Aires de Río."
    },
    "casagob": {
      "nombre": "Casa de Gobierno",
      "descripcion": "Sede del gobierno provincial, edificio histórico",
      "thingstodo": "La Casa de Gobierno es un símbolo histórico y arquitectónico de Santiago del Estero. Además de ser la sede del poder ejecutivo provincial, es un punto de interés turístico y cultural. Los residentes pueden realizar trámites gubernamentales, participar en eventos oficiales, y disfrutar de la arquitectura histórica del edificio. Su proximidad a Aires de Río facilita el acceso a servicios públicos y trámites administrativos."
    },
    "plazavea": {
      "nombre": "Plaza Vea",
      "descripcion": "Centro comercial y supermercado",
      "thingstodo": "Plaza Vea es el único centro comercial dentro del área urbana, ofreciendo supermercado y shopping de cercanía a solo una cuadra de Aires de Río. Aquí puedes realizar todas tus compras diarias, desde alimentos frescos hasta productos para el hogar. El centro comercial también incluye cines, restaurantes, y tiendas diversas, convirtiéndolo en un destino completo para compras, entretenimiento y gastronomía. Su ubicación estratégica lo hace perfecto para resolver todas tus necesidades sin alejarte del edificio."
    },
    "parqueaguirre": {
      "nombre": "Parque Aguirre",
      "descripcion": "Principal parque de la ciudad, ideal para recreación",
      "thingstodo": "El Parque Aguirre es el principal espacio verde y de recreación de Santiago del Estero. Es el lugar perfecto para actividades al aire libre, caminatas, ejercicios, y tiempo en familia. El parque cuenta con áreas de juegos infantiles, espacios para deportes, zonas de descanso, y acceso al río Dulce. Ideal para escapar del ritmo urbano, disfrutar de la naturaleza, hacer ejercicio, y organizar picnics familiares. Un oasis natural que complementa perfectamente la vida urbana en Aires de Río."
    },
    "avroca": {
      "nombre": "Avenida Roca",
      "descripcion": "Avenida principal con comercios y confiterías",
      "thingstodo": "La Avenida Roca es una de las arterias comerciales más importantes de la ciudad, llena de vida y actividad. A lo largo de la avenida encontrarás una gran variedad de comercios, confiterías tradicionales, restaurantes, cafeterías, y servicios. Es el lugar perfecto para pasear, hacer compras locales, disfrutar de la gastronomía santiagueña, y experimentar la vida comercial de la ciudad. La avenida combina tradición y modernidad, ofreciendo desde establecimientos históricos hasta opciones contemporáneas, todo a poca distancia de Aires de Río."
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
const PLACE_METADATA: Record<string, { nombre: string; descripcion?: string; thingstodo?: string }> = {
  terminal: { nombre: "Terminal de Ómnibus...", descripcion: "...", thingstodo: "..." },
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
   - Include `nombre`, `descripcion`, and `thingstodo` for each place
   - Use proper Spanish names and descriptions
   - `thingstodo` should provide longer, detailed descriptions about the usefulness and activities available at each place

2. **Update `Location.svelte`**:
   - Remove dependency on `lugares-direcciones.json`
   - Load `places.json` instead (or load on-demand)
   - Remove `PATH_ID_TO_PLACE_DATA` mapping
   - Simplify `openGalleryForCurrentPlace()` to use pathId directly and load place data from `places.json`
   - **Fix gallery button**: Ensure it uses the new JSON structure to show correct photos and metadata
   - **Disable buttons when no place selected**: Gallery button and home/reset button should be disabled when `currentPathId` is `null` (no place selected on map)

3. **Update `openPhotoCarousel()`**:
   - Auto-discover photos from directory (scan `/places/${placeId}/`)
   - Or load photo list from JSON if preferred
   - Use metadata from `places.json` (nombre, descripcion, thingstodo)
   - Ensure photos are correctly loaded from `/places/${pathId}/` directory

4. **Fix Map path ID mismatch**:
   - Either rename directory `parqueaguirre` → `parque`
   - Or update Map component to use `parqueaguirre`

5. **Update navigation buttons**:
   - Disable gallery button when `mapComponent.currentPathId` is `null`
   - Disable home/reset button when `mapComponent.currentPathId` is `null`
   - Add visual disabled state (opacity, cursor, etc.)
   - Buttons should only be enabled when a place is selected on the map

6. **Remove unused code**:
   - Remove `loadPlacesData()` if no longer needed
   - Remove `placesData` state if only used for carousel
   - Remove category-related code if not needed
   - Remove `PATH_ID_TO_PLACE_DATA` mapping constant

## Acceptance Criteria

- [ ] New `places.json` created with metadata for all 6 places
- [ ] Each place includes `nombre`, `descripcion`, and `thingstodo` properties
- [ ] `thingstodo` contains detailed descriptions about usefulness and activities
- [ ] PhotoCarousel works with new structure
- [ ] PhotoCarousel displays `thingstodo` content (may need UI update)
- [ ] **Gallery button uses new JSON structure to show correct photos and metadata**
- [ ] **Gallery button is disabled when no place is selected on map**
- [ ] **Home/reset button is disabled when no place is selected on map**
- [ ] Buttons show visual disabled state (opacity, cursor changes)
- [ ] Gallery button opens carousel with correct photos from `/places/${pathId}/` directory
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
- The `thingstodo` property should be displayed in the PhotoCarousel component (may require UI update to show longer text)
- Consider updating the `Place` type definition in `fe/src/lib/types/index.ts` to include `thingstodo?: string`
- **Button state**: When `mapComponent.currentPathId` is `null`, both gallery and reset buttons should be disabled
- **Gallery button fix**: The current implementation uses old JSON mapping which is incorrect. After this refactor, it should directly use `pathId` to load from `places.json` and photos from `/places/${pathId}/`

