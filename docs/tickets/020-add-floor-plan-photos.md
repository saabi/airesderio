# Ticket #020: Add Photos with Descriptions to Floor Plan Section

## Status
**Complete**

## Priority
**Medium**

## Description

The `FloorPlans.svelte` component currently displays a placeholder div with no actual floor plan images. We need to implement a photo gallery/carousel that displays the floor plan images from `fe/static/planos/` with descriptive captions.

There are currently 6 floor plan images available, and a third floorplan will be added later. The implementation should be flexible enough to accommodate the future addition.

## Current State

### FloorPlans Component
- **Location**: `fe/src/lib/components/sections/FloorPlans.svelte`
- **Status**: Placeholder only
- **Current Implementation**:
  - Single placeholder `<div class='plan-ph'>` with gray background
  - Static figcaption: "Plano de distribución y layout de las unidades"
  - No actual images displayed
  - No navigation or carousel functionality

### Available Images
Located in `fe/static/planos/`:
1. `1ra-planta-4-deptos-a.png` (5.5M)
2. `1ra-planta-4-deptos.png` (5.3M)
3. `2 OCTUBRE_MODELO 1ra PLANTA_4 DPTOS 1 DORM.jpg` (381K)
4. `2 OCTUBRE_MODELO 2da PLANTA_2 DPTOS 1 DORM_1 DEPTO DOBLE.jpg` (386K)
5. `2da-planta-3-deptos-a.png` (5.3M)
6. `2da-planta-3-deptos.png` (5.1M)

**Note**: A third floorplan will be added later. The implementation should accommodate this.

## Requirements

### Functional Requirements
1. **Display Floor Plan Images**
   - Show all available floor plan images from `fe/static/planos/`
   - Support both PNG and JPG formats
   - Images should be high quality and properly sized

2. **Descriptive Captions**
   - Each floor plan should have a descriptive caption
   - Captions should explain what the floor plan shows (e.g., "Primera planta - 4 departamentos de 1 dormitorio")
   - Captions should be accessible and visible

3. **Navigation**
   - Implement a carousel or gallery view for multiple floor plans
   - Users should be able to navigate between floor plans
   - Consider using the existing `PhotoCarousel` component or create a simpler inline carousel

4. **Responsive Design**
   - Floor plans should be viewable on mobile and desktop
   - Images should scale appropriately
   - Navigation should work on touch devices

5. **Future-Proof**
   - Implementation should easily accommodate a third floorplan when it's added
   - Consider using a data structure (JSON or array) to define floor plans and their descriptions

### Technical Requirements
1. **Component Structure**
   - Update `FloorPlans.svelte` to display actual images
   - Maintain existing scroll animation behavior
   - Keep accessibility features (ARIA labels, semantic HTML)

2. **Image Loading**
   - Use proper image optimization techniques
   - Consider lazy loading for better performance
   - Ensure images are properly sized to avoid layout shift

3. **Data Structure**
   - Create a data structure for floor plans (array or JSON)
   - Include image path, title, and description for each floor plan
   - Structure should be easy to extend when third floorplan is added

## Proposed Solution

### Option A: Simple Carousel (Recommended)
- Use a lightweight carousel component similar to `Interior.svelte` or create a simple one
- Display one floor plan at a time with navigation arrows
- Show caption below the image
- Simple, focused, and easy to maintain

### Option B: PhotoCarousel Component
- Reuse the existing `PhotoCarousel` component
- Open floor plans in a modal overlay
- More feature-rich (keyboard navigation, dot indicators)
- Consistent with place photos carousel

### Option C: Grid/Thumbnail View
- Display all floor plans as thumbnails in a grid
- Click to view full size
- Good for overview, but may be cluttered with many plans

**Recommendation**: Option A (Simple Carousel) - Floor plans benefit from focused viewing, and a simple carousel is sufficient for this use case.

## Implementation Steps

1. **Create Floor Plan Data Structure**
   - Create an array or JSON file with floor plan metadata
   - Include: image path, title, description
   - Structure for easy extension (third floorplan)

2. **Update FloorPlans Component**
   - Replace placeholder div with actual image display
   - Implement carousel navigation (prev/next buttons)
   - Add state management for current floor plan index

3. **Add Descriptions**
   - Create descriptive captions for each floor plan
   - Display caption below or alongside the image
   - Ensure captions are accessible

4. **Styling**
   - Style the carousel to match the design system
   - Ensure responsive behavior
   - Maintain scroll animation integration

5. **Testing**
   - Test on mobile and desktop
   - Verify image loading and navigation
   - Check accessibility (keyboard navigation, screen readers)

6. **Future Preparation**
   - Document how to add the third floorplan
   - Ensure data structure is easily extensible

## Acceptance Criteria

- [x] All 6 floor plan images are displayed in the Floor Plans section
- [x] Each floor plan has a descriptive caption
- [x] Users can navigate between floor plans (prev/next)
- [x] Floor plans are responsive and work on mobile and desktop
- [x] Images load properly and are appropriately sized
- [x] Accessibility features are maintained (ARIA labels, keyboard navigation)
- [x] Scroll animations continue to work
- [x] Implementation is ready for third floorplan addition (documented, extensible)

## Implementation Notes

- Implemented using Option A (Simple Carousel) as recommended
- Created inline carousel component in `FloorPlans.svelte` for better control over current index
- Floor plan data structure (`FLOOR_PLANS` array) is easily extensible for third floorplan
- All 6 images are properly referenced and displayed
- Carousel uses manual navigation (no auto-play) for focused viewing
- Responsive design implemented with mobile-specific height adjustments

## Related Files

- `fe/src/lib/components/sections/FloorPlans.svelte` - Main component to update
- `fe/static/planos/` - Directory containing floor plan images
- `fe/src/lib/components/features/PhotoCarousel.svelte` - Reference for carousel implementation (if using Option B)
- `fe/src/lib/components/sections/Interior.svelte` - Reference for simple carousel implementation (if using Option A)

## Notes

- The third floorplan will be added later, so the implementation should be flexible
- Consider image file sizes - some PNGs are quite large (5+ MB). May need optimization or lazy loading
- Floor plan descriptions should be clear and informative for potential buyers
- Consider if users need to zoom/pan floor plans (may require additional image viewer component)

