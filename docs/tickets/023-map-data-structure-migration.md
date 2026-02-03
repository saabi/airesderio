# Ticket #023: Map Data Structure Migration

## Status
**In Progress** 🔄

## Priority
**Medium**

## Description

The current Map component implementation has several issues:

1. **Hardcoded focal shape**: The airesderio building path is hardcoded directly in `Map.svelte` (lines 601-614)
2. **Redundant configuration**: `fullViewBox` duplicates image dimensions that could be derived
3. **Nested data structure**: Places indexed by ID object instead of array with ID field
4. **Mixed naming conventions**: Spanish (`nombre`, `descripcion`) mixed with structure terms
5. **Separated concerns**: `mapConfig` is separated from related place data unnecessarily
6. **No explicit default view logic**: Uses hardcoded `nearViewBox` or computed from radius prop

## Goals

Implement the map data structure defined in `docs/specs/map-design.md` to:

1. Make the focal shape data-driven (not hardcoded)
2. Derive viewBox from image dimensions
3. Flatten places to an array with ID field
4. Simplify configuration by removing redundant fields
5. Implement proper default view logic (radius around focal)

## Related Documentation

- **Design Spec**: `docs/specs/map-design.md`
- **Migration Plan**: `docs/specs/map-migration-plan.md`

## Implementation Phases

### Phase 1: Data Structure Migration

1. **Create migration script** (`scripts/migrate-map-data.js`):
   - Transform current `places.json` to new format
   - Extract focal shapes from hardcoded component
   - Restructure `mapConfig` to `baseImage`/`detailImage`/`focal`

2. **Add new type definitions** to `src/lib/types/index.ts`:
   - `MapData` - Root map data type
   - `BaseImage` - Base image configuration
   - `DetailImage` - Optional detail overlay
   - `Focal` - Main subject (shapes + center)
   - `PlaceData` - Place with geometry and content
   - `ViewBox` - Viewport rectangle

3. **Generate new JSON** (`static/places/map.json`)

### Phase 2: Map Component Updates

1. **Update props interface**: Change from `places` + `mapConfig` to single `mapData` prop
2. **Derive values from new structure**: Remove redundant computed values
3. **Implement default view logic**: Compute view centered on focal with radius
4. **Remove hardcoded focal**: Make airesderio shape data-driven
5. **Update place rendering**: Handle single or array of shapes
6. **Update image references**: Use data instead of hardcoded paths

### Phase 3: Location Component Updates

1. **Update data loading**: Load new `map.json` format
2. **Simplify transformations**: Remove unnecessary data manipulation
3. **Update Map props**: Pass `mapData` instead of separate props

### Phase 4: Cleanup

1. **Remove deprecated types**: Clean up old type definitions
2. **Remove old JSON**: Delete `places.json` after verification
3. **Update documentation**: Update architecture docs

## Current Structure → New Structure

### Data Mapping

| Current Path | New Path |
|--------------|----------|
| `mapConfig.farImage` | `baseImage.src` |
| `mapConfig.fullViewBox.width` | `baseImage.width` |
| `mapConfig.fullViewBox.height` | `baseImage.height` |
| `mapConfig.nearImage` | `detailImage.src` |
| `mapConfig.nearViewBox.*` | `detailImage.*` |
| `mapConfig.airesderioCenter` | `focal.center` |
| (hardcoded in Map.svelte) | `focal.shapes` |
| `places[id].nombre` | `places[i].name` |
| `places[id].descripcion` | `places[i].description` |
| `places[id].thingstodo` | `places[i].details` |
| `places[id].photos` | `places[i].photos` |
| `places[id].svg.elements` | `places[i].shape` |
| `places[id].svg.pin` | `places[i].pin` |

### Text Elements

Text elements within `svg.elements` become `places[i].labels`.

## Acceptance Criteria

- [ ] New `map.json` file created with correct structure
- [ ] `MapData` type and related types added to types file
- [ ] Map component accepts single `mapData` prop
- [ ] Focal shape rendered from data (not hardcoded)
- [ ] Default view computed from focal center + radius
- [ ] All places render correctly with new structure
- [ ] Detail image overlay works correctly
- [ ] Zoom to place includes focal when `includeAiresderio` is true
- [ ] Reset returns to computed default view
- [ ] Navigation (next/prev) cycles through places correctly
- [ ] Labels render for places that have them (e.g., Parque Aguirre balnearios)
- [ ] Photo carousel still works with new data structure
- [ ] No hardcoded paths in component (all from data)
- [ ] Old `places.json` can be removed after migration
- [ ] All existing functionality preserved

## Related Files

- `fe/src/lib/components/features/Map.svelte` - Main map component
- `fe/src/lib/components/sections/Location.svelte` - Parent section
- `fe/src/lib/types/index.ts` - Type definitions
- `fe/static/places/places.json` - Current data file
- `fe/static/map/far.jpg` - Base map image
- `fe/static/map/near.jpg` - Detail overlay image

## Estimated Effort

| Phase | Time |
|-------|------|
| Phase 1: Data Structure | 2-3 hours |
| Phase 2: Map Component | 3-4 hours |
| Phase 3: Location Component | 1-2 hours |
| Phase 4: Cleanup | 1 hour |
| Testing & Fixes | 2-3 hours |
| **Total** | **9-13 hours** |

## Dependencies

- None (internal refactoring)

## Notes

- Keep both JSON files during migration for rollback capability
- The coordinate system is pixel-based (not lat/lng) - origin at top-left
- ViewBox can be derived from image dimensions (no need for explicit `fullViewBox`)
- Default view should be radius-based around focal, not full image
- Focal can be multiple shapes forming a group

## Testing Strategy

1. **Visual comparison**: Rendered map should look identical before/after
2. **Interaction testing**: Zoom, pan, navigation, reset all work
3. **Label positioning**: Labels appear correctly at pin positions
4. **Carousel integration**: Photo carousel opens with correct data
5. **Responsive**: Map works at different viewport sizes
