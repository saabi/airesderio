# Ticket #025: Interactive floor plan component (zones, hover, click zoom/high-res, mobile rotation)

## Status
**Complete**

## Priority
**Medium**

## Type
Feature, UX

## Description

New component for the floor plan carousel that displays plan images and, when configured, interactive apartment zones (SVG paths). Hover highlights the zone under the cursor; click either zooms into that zone (viewBox) or loads a higher-resolution image of that apartment. Per-image flag and aspect ratio drive optional mobile rotation when the plan is expanded on small viewports.

## Current State

Floor plan carousel in [FloorPlans.svelte](fe/src/lib/components/sections/FloorPlans.svelte) shows static images only (Slide type="image"). No apartment zones or interactivity.

## Proposed Solution

**Approach A (SVG overlay over image):**

1. New component (e.g. `InteractiveFloorPlan.svelte`) that renders the floor plan image with an optional absolutely positioned SVG overlay. SVG viewBox matches image dimensions; zones are `<path>` (or rect/circle) elements with normalized coordinates (reuse or mirror [SvgShape](../specs/architecture.md) from map types).
2. When `interactive` is true and `zones` are defined: bind mouse/touch and keyboard to zone elements; highlight zone on hover (fill/stroke); on click either zoom (animate viewBox to zone bbox via getBBox) or load a high-res image (swap src, optional zoom to zone).
3. When `rotateOnMobile` is true and viewport is narrow: use per-image aspect ratio (measured from image or from props) to apply CSS transform (e.g. rotate -90deg) so the elongated plan fits the display; flag enables/disables this per plan.
4. Extend floor plan data with optional: `interactive`, `zones`, `zoomMode` ('zoom' | 'highRes'), `highResImage`, `rotateOnMobile`, `aspectRatio`.
5. In FloorPlans.svelte use `Slide type="component"` with this component and extended plan data per slide; keep plain image behavior for plans without `interactive` or without zones.

## Acceptance Criteria

- [x] New component renders inside a Slide in the floor plan carousel.
- [x] Non-interactive plans display the image only (no overlay).
- [x] Interactive plans with zones: hover highlights the apartment zone; click zooms (viewBox) or loads high-res image per config.
- [x] Mobile rotation works when `rotateOnMobile` is true and aspect ratio indicates elongated plan on narrow viewport.
- [x] Svelte 5 only ($props, snippets, no slot/export let).
- [x] Accessibility: focusable zones, aria-label per zone, keyboard support where appropriate.

## Implementation Steps

1. Create ticket #025 and update docs/README.md.
2. Define extended floor plan type and zone type (reuse or mirror SvgShape; normalized coords).
3. Implement InteractiveFloorPlan.svelte (image + optional SVG overlay, hover, click zoom/high-res, mobile rotation).
4. Integrate in FloorPlans.svelte: Slide type="component" with new component; fallback to plain image for non-interactive plans.
5. Add zone data for at least one plan (optional); document zone data format if needed.
6. Test, run check/lint, set ticket Complete, commit with Closes #025.

## Related Files

- `fe/src/lib/components/sections/FloorPlans.svelte`
- `fe/src/lib/components/features/InteractiveFloorPlan.svelte` (new)
- `fe/src/lib/components/ui/Slide.svelte`
- `fe/src/lib/types/index.ts` (or new types for floor plan zones)

## Technical Details

**Implementation Notes:**

- Use **Svelte 5 semantics only** per [Svelte Guidelines](../specs/svelte-guidelines.md).
- Zone geometry: normalized coordinates (0–1 on smaller dimension), same idea as map data; denormalize at runtime using image dimensions.
- Zoom: SVG getBBox() for zone, then set viewBox to bbox with margin; optional "back" control to reset.
- Reference: [Map.svelte](fe/src/lib/components/features/Map.svelte) for path/rect/circle rendering and zoom-to-bbox pattern.

## Testing Requirements

- [ ] Manual: non-interactive plan shows image only.
- [ ] Manual: interactive plan shows zones, hover highlight, click zoom or high-res.
- [ ] Manual: mobile view with rotateOnMobile and elongated aspect ratio shows rotated plan when expanded.
- [ ] `npm run check` passes; lint clean.

## Estimated Effort
Large

## Dependencies
None (#024 carousel Slide/ImageCarousel in place)

## Related Documents

- [Svelte Guidelines](../specs/svelte-guidelines.md)
- [Architecture Documentation](../specs/architecture.md)
- [TICKETS.md](../process/TICKETS.md)
