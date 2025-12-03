# Ticket #018: Complete Place Photos Carousel Implementation

## Status
**Pending**

## Priority
**Medium**

## Description

The `Location.svelte` component currently has two carousel implementations:

1. **PhotoCarousel** (`fe/src/lib/components/features/PhotoCarousel.svelte`) - Fully implemented modal carousel
2. **Gallery Carousel** (placeholder in `Location.svelte`) - Incomplete placeholder with no functionality

We need to determine which carousel to use for displaying place photos and complete the implementation. Photos are located in `fe/static/places/` in subdirectories matching place IDs (e.g., `fe/static/places/plazavea/`).

## Current State

### PhotoCarousel (Implemented)
- **Location**: `fe/src/lib/components/features/PhotoCarousel.svelte`
- **Status**: Fully functional
- **Usage**: Currently used when clicking on place markers
- **Features**:
  - Modal overlay with backdrop
  - Keyboard navigation (Arrow keys, Escape)
  - Place name and description display
  - Photo counter (e.g., "1 de 5 fotos")
  - Navigation buttons (prev/next)
  - Dot indicators for photo selection
  - Responsive design
  - Proper accessibility (ARIA labels, roles)
- **Photo Path**: Currently uses `/lugares/${category}/${placeId}/${filename}`

### Gallery Carousel (Placeholder)
- **Location**: Inline in `Location.svelte` (lines 519-569)
- **Status**: Placeholder only - shows "Galería de imágenes (placeholder)"
- **Usage**: Triggered by gallery button in map navigation
- **Features**: None - just a modal structure with close button
- **Intended Purpose**: Unclear - possibly for showing all places' photos in one view

## Analysis: PhotoCarousel vs Gallery Carousel

### PhotoCarousel - Pros
✅ **Fully implemented** - Ready to use immediately  
✅ **Modal UI** - Appropriate for focused photo viewing  
✅ **Place context** - Shows place name and description  
✅ **Keyboard navigation** - Arrow keys, Escape to close  
✅ **Accessibility** - Proper ARIA labels and roles  
✅ **Responsive** - Works on mobile and desktop  
✅ **Photo counter** - Shows current position (e.g., "1 de 5")  
✅ **Dot indicators** - Easy navigation between photos  
✅ **Professional UI** - Polished design with transitions  
✅ **Already integrated** - Working with place markers  

### PhotoCarousel - Cons
❌ **Path mismatch** - Uses `/lugares/` but photos are in `/places/`  
❌ **Single place focus** - Shows one place at a time  
❌ **No gallery overview** - Can't see all places' photos at once  

### Gallery Carousel - Pros
✅ **Potential for multi-place view** - Could show all places' photos  
✅ **Different UX pattern** - Could provide alternative navigation  

### Gallery Carousel - Cons
❌ **Not implemented** - Just a placeholder  
❌ **Unclear purpose** - Intent not documented  
❌ **No functionality** - Would require full implementation  
❌ **Duplicate effort** - Would duplicate PhotoCarousel features  
❌ **Maintenance burden** - Two carousels to maintain  

## Recommendation

**Use PhotoCarousel** for displaying place photos. Reasons:

1. **Already implemented and working** - No development time needed
2. **Better UX for photo viewing** - Modal provides focused experience
3. **Place context** - Shows relevant information (name, description)
4. **Accessibility** - Proper keyboard navigation and ARIA support
5. **Professional appearance** - Polished UI with smooth transitions
6. **Single source of truth** - One carousel to maintain

**Remove Gallery Carousel placeholder** - It serves no purpose and adds confusion.

## Issues to Fix

1. **Photo Path Mismatch**:
   - Current code: `/lugares/${category}/${placeId}/${filename}`
   - Actual location: `/places/${placeId}/` (subdirectories match place IDs)
   - Need to update path construction in `openPhotoCarousel()` function

2. **Photo Loading**:
   - Currently relies on `place.photos` array from JSON
   - Should dynamically load photos from `fe/static/places/${placeId}/` directory
   - Need to handle cases where photos don't exist

3. **Gallery Button**:
   - Currently opens placeholder gallery
   - Should either:
     - Remove the gallery button, OR
     - Implement a different feature (e.g., show all places with photos in a grid)

## Implementation Steps

1. **Update PhotoCarousel path**:
   - Change from `/lugares/${category}/${placeId}/${filename}` to `/places/${placeId}/${filename}`
   - Update `openPhotoCarousel()` function in `Location.svelte`

2. **Remove Gallery Carousel placeholder**:
   - Remove `galleryCarouselVisible` state
   - Remove gallery button from map navigation
   - Remove gallery carousel HTML and CSS (lines 519-569, 695-811)

3. **Photo Discovery** (Optional - if photos not in JSON):
   - Create utility to scan `fe/static/places/` directories
   - Auto-discover photos for each place
   - Fallback to JSON `photos` array if available

4. **Error Handling**:
   - Handle missing photos gracefully
   - Show placeholder or disable photo button if no photos exist

5. **Testing**:
   - Test with places that have photos (e.g., `plazavea`)
   - Test with places that have no photos
   - Test keyboard navigation
   - Test mobile responsiveness

## Acceptance Criteria

- [ ] PhotoCarousel uses correct path: `/places/${placeId}/${filename}`
- [ ] Gallery Carousel placeholder removed
- [ ] Gallery button removed or repurposed
- [ ] Photos load correctly from `fe/static/places/` subdirectories
- [ ] PhotoCarousel works for all places with photos
- [ ] Error handling for missing photos
- [ ] Keyboard navigation works (Arrow keys, Escape)
- [ ] Mobile responsive
- [ ] Accessibility maintained (ARIA labels, keyboard support)

## Related Files

- `fe/src/lib/components/sections/Location.svelte` - Main component
- `fe/src/lib/components/features/PhotoCarousel.svelte` - Carousel component
- `fe/static/places/` - Photo directories
- `fe/static/lugares/lugares-direcciones.json` - Places data

## Notes

- Photos are organized in `fe/static/places/` with subdirectories matching place IDs
- Example: `fe/static/places/plazavea/cinemas.png`
- Current JSON structure has `photos` array, but may need to auto-discover from filesystem
- Consider creating a build script to sync photos from `places/` to JSON if needed

