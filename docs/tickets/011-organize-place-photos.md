# Ticket #011: Organize Place Photo Carousel Files

## Priority
**Medium** - Content Organization

## Type
Content Management, File Organization

## Description
There are unorganized photo files in `fe/static/16 Noviembre 2025_FOTOS LUGARES DE CRCANIA-20251119T024600Z-1-001/` that need to be properly organized into the existing places directory structure. These photos belong to the photo carousel feature for each place on the map.

## Current State

### Unorganized Files Location
- `fe/static/16 Noviembre 2025_FOTOS LUGARES DE CRCANIA-20251119T024600Z-1-001/`
  - Contains nested directory: `16 Noviembre 2025_FOTOS LUGARES DE CRCANIA/`
  - Photos are organized by place name (e.g., `CASA DE GOBIERNO/`, `PLAZA LIBERTAD/`, `PARQUE AGUIRRE/`)
  - File naming includes place names and sources (e.g., `CASA DE GOBIERNO_03 de Tripadvisor.jpg`)

### Expected Structure
Photos should be organized in:
```
fe/static/lugares/
├── {category}/
│   └── {placeId}/
│       ├── photo1.jpg
│       ├── photo2.jpg
│       └── ...
```

Where:
- `{category}` matches the category key in `lugares-direcciones.json` (e.g., `lugares_historicos`, `parques_recreacion`)
- `{placeId}` matches the place ID in the JSON (e.g., `casa_gobierno`, `plaza_libertad`, `parque_aguirre`)

### Photo Path in Code
Photos are loaded from: `/lugares/${category}/${placeId}/${filename}` (see `Location.svelte` line 194)

## Issues
1. Photos are in a temporary/unorganized directory structure
2. Place names in directory structure don't match place IDs in JSON
3. Files need to be mapped to correct category/placeId combinations
4. File names may need normalization (remove spaces, special characters, etc.)
5. Need to verify which places in JSON these photos belong to
6. Need to run `sync:photos` script after organization to update JSON

## Proposed Solution

### Step 1: Analyze and Map Photos
1. List all photos in the unorganized directory
2. Map place names to place IDs in `lugares-direcciones.json`
3. Identify which category each place belongs to
4. Create a mapping document/script

### Step 2: Organize Files
1. Create necessary category/placeId directories if they don't exist
2. Move photos to correct locations: `lugares/{category}/{placeId}/`
3. Normalize file names (lowercase, replace spaces with underscores, remove special characters)
4. Ensure file names are unique within each place directory

### Step 3: Update JSON References
1. Run `npm run sync:photos` to update `lugares-direcciones.json` with photo filenames
2. Verify all photos are properly referenced in JSON
3. Test photo carousel functionality

### Step 4: Cleanup
1. Remove empty source directories
2. Remove zip files if no longer needed
3. Update documentation if needed

## Acceptance Criteria
- [x] All photos moved to correct structure (organized in `fe/static/places/` by place ID)
- [x] File names follow naming conventions
- [x] Photos properly organized and accessible
- [x] Photo carousel works correctly for all places with photos (verified in ticket #018 and #019)
- [x] Photos organized manually into flat structure matching Map component path IDs
- [x] No broken image references
- [x] Structure documented in ticket #019 (places.json structure)

## Status
**Complete** ✅ - Place photos have been manually organized into the `fe/static/places/` directory structure. Photos are now organized by place ID (terminal, forum, casagob, plazavea, parqueaguirre, avroca) matching the Map component's path IDs. This organization enables ticket #007 (Image Optimization) to proceed.

## Implementation Steps

### 1. Create Analysis Script
```javascript
// scripts/analyze-photos.js
// - Scan unorganized directory
// - Map place names to place IDs
// - Generate mapping report
```

### 2. Create Organization Script
```javascript
// scripts/organize-photos.js
// - Read mapping from analysis
// - Create directories as needed
// - Move and rename files
// - Generate report of changes
```

### 3. Manual Review
- Review mapping before moving files
- Verify place name → place ID mappings are correct
- Check for duplicate photos

### 4. Execute Organization
- Run organization script
- Verify files are in correct locations
- Run `npm run sync:photos`

### 5. Testing
- Test photo carousel for each place
- Verify all images load correctly
- Check for broken image references

### 6. Cleanup
- Remove source directories
- Remove zip files
- Update README if needed

## File Naming Conventions

### Current Examples
- `CASA DE GOBIERNO_03 de Tripadvisor.jpg`
- `LA PLAZA_02 de Tripadvisor.jpg`
- `1_ESTA VA_PARQUE-Juegos cpn chicos_03.jpg`

### Proposed Format
- `casa_gobierno_03.jpg`
- `plaza_libertad_02.jpg`
- `parque_aguirre_juegos_03.jpg`

**Guidelines:**
- Lowercase
- Underscores instead of spaces
- Remove source attributions (can be tracked separately if needed)
- Sequential numbering for multiple photos
- Keep descriptive parts if helpful

## Related Files
- `fe/static/16 Noviembre 2025_FOTOS LUGARES DE CRCANIA-20251119T024600Z-1-001/` (source)
- `fe/static/lugares/` (destination)
- `fe/static/lugares/lugares-direcciones.json` (needs updating)
- `fe/scripts/updatePlacePhotos.js` (sync script)
- `fe/src/lib/components/Location.svelte` (uses photos)
- `fe/src/lib/components/PhotoCarousel.svelte` (displays photos)
- `fe/static/lugares/README.md` (documentation)

## Estimated Effort
4-6 hours
- Analysis and mapping: 1-2 hours
- Script creation: 1-2 hours
- Organization and testing: 1-2 hours
- Cleanup: 30 minutes

## Dependencies
- Access to `lugares-direcciones.json` to understand place structure
- Understanding of category/placeId naming conventions
- Photo carousel functionality working

## Notes
- Consider creating a backup before moving files
- May need to handle special characters in file names
- Some photos may need to be manually reviewed if place names are ambiguous
- Consider keeping a log of file renames for reference
- May want to preserve original file names in a mapping file for reference

## Place Name → Place ID Mapping (To Be Completed)

Based on directory structure, initial mappings to verify:

| Directory Name | Expected Place ID | Expected Category |
|---------------|-------------------|-------------------|
| CASA DE GOBIERNO | `casa_gobierno` | `lugares_historicos` |
| PLAZA LIBERTAD | `plaza_libertad` | `lugares_historicos` |
| PARQUE AGUIRRE | `parque_aguirre` | `parques_recreacion` |
| ... | ... | ... |

*Note: This mapping needs to be verified against `lugares-direcciones.json`*

