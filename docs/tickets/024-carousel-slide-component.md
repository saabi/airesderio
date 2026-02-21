# Ticket #024: Carousel Slide component and ImageCarousel slot-based API

## Status
**Complete**

## Priority
**Medium**

## Type
Refactoring, Component Architecture

## Description

Replace ImageCarousel's `images` prop with a slot-based API. Introduce a Slide component (coupled to ImageCarousel) that accepts image, video, or other components. ImageCarousel handles transitions; Slide handles slide content only. Direct breaking change; migrate all four call sites (Hero, Interior, FloorPlans, PhotoCarousel).

## Current State

ImageCarousel accepts `images: ImageInput[]` and renders images (and enhanced images) internally. No support for video or arbitrary components. All call sites pass an array of image data.

## Proposed Solution

1. New **Slide** component with type `image` | `video` | `component` | custom slot (default snippet). Renders inside the carousel's slide wrapper.
2. **ImageCarousel** takes required `slideCount` and `slide(index)` snippet; removes `images`; provides context for `imageFit` / `imageSizes` so Slide can use them for image type.
3. Migrate Hero, Interior, FloorPlans, PhotoCarousel to use Slide inside the snippet.

## Acceptance Criteria

- [ ] ImageCarousel has no `images` prop; accepts required `slideCount` and `slide` snippet
- [ ] Slide component supports image, video, component, and default slot (custom content)
- [ ] Hero, Interior, FloorPlans, PhotoCarousel use the new API with Slide inside snippet
- [ ] Transitions (opacity/transform, active state) unchanged; handled by ImageCarousel
- [ ] `npm run check` passes; manual verification of Hero, Interior, FloorPlans, and Location photo gallery

## Implementation Steps

1. Create ticket #024 and update docs/README.md
2. Create Slide.svelte with $props() for type, src, alt (image); src, poster (video); component, props (component); default snippet for custom
3. Refactor ImageCarousel: remove images and image-related code; add slideCount, slide snippet, slideAriaLabel; setContext for imageFit/imageSizes; template uses {#each} and {@render slide(i)}
4. Migrate Hero to slideCount + snippet with Slide type="image"
5. Migrate Interior to slideCount + snippet with Slide type="image"
6. Migrate FloorPlans to slideCount + snippet with Slide type="image"; remove derived floorPlanImages
7. Migrate PhotoCarousel to slideCount + snippet with Slide type="image"
8. Cleanup: remove leftover references; run check and tests; manual verification

## Related Files

- `fe/src/lib/components/ui/ImageCarousel.svelte`
- `fe/src/lib/components/ui/Slide.svelte` (new)
- `fe/src/lib/components/sections/Hero.svelte`
- `fe/src/lib/components/sections/Interior.svelte`
- `fe/src/lib/components/sections/FloorPlans.svelte`
- `fe/src/lib/components/features/PhotoCarousel.svelte`

## Technical Details

**Implementation Notes:**

- Use **Svelte 5 semantics only** per [Svelte Guidelines](../specs/svelte-guidelines.md): `$props()`, `$state()`, `$derived`, snippets (`{@render ...}`), no `<slot>`, no `export let`.
- Optional setContext/getContext for imageFit/imageSizes so Slide (image type) can use carousel-level settings.
- Reference: [Architecture Documentation](../specs/architecture.md)

**Constraints:**

- Svelte 5 only; follow svelte-guidelines.md

## Testing Requirements

- [ ] `npm run check` passes
- [ ] Manual: Hero carousel displays and rotates
- [ ] Manual: Interior carousel displays and rotates
- [ ] Manual: FloorPlans carousel displays and navigates; caption updates
- [ ] Manual: Location section photo gallery opens and shows photos

## Estimated Effort
Medium

## Dependencies
None

## Related Documents

- [Svelte Guidelines](../specs/svelte-guidelines.md)
- [Architecture Documentation](../specs/architecture.md)
- [TICKETS.md](../process/TICKETS.md)
