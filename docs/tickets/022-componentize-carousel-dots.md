# Ticket #022: Componentize Carousel Dots

## Status
**Pending**

## Priority
**Medium**

## Description
Currently, carousel navigation dots are implemented in three different places with similar but not identical code and styling:
1. `Carousel.svelte` (UI component)
2. `PhotoCarousel.svelte` (Feature component)
3. `FloorPlans.svelte` (Section component)

This creates code duplication and makes it difficult to maintain consistent styling and behavior across all carousels.

## Current State

### Implementation Locations

#### 1. `Carousel.svelte` (UI Component)
- **Container**: `.carousel-dots`
- **Dot Size**: `0.75rem × 0.75rem`
- **Active State**: `var(--color-text-inverse)`, `scale(1.2)`
- **Inactive State**: `color-mix(in oklch, var(--color-text-primary) 50%, transparent)`
- **Hover**: `color-mix(in oklch, var(--color-text-inverse) 75%, transparent)`
- **Gap**: `0.5rem`
- **Layout**: Flex with `align-items: center`

#### 2. `PhotoCarousel.svelte` (Feature Component)
- **Container**: `.photo-dots`
- **Dot Size**: `12px × 12px` (equivalent to `0.75rem`)
- **Active State**: `var(--color-accent-primary)`
- **Inactive State**: `var(--color-neutral-400)`
- **Hover**: `var(--color-neutral-500)`
- **Active Hover**: `var(--color-accent-strong)`
- **Gap**: `0.5rem`
- **Margin-bottom**: `1rem`
- **Layout**: Flex with `justify-content: center`

#### 3. `FloorPlans.svelte` (Section Component)
- **Container**: `.carousel-dots`
- **Dot Size**: `0.75rem × 0.75rem`
- **Active State**: `var(--color-accent-primary)`, `scale(1.2)`
- **Inactive State**: `color-mix(in oklch, var(--color-text-primary) 40%, transparent)`
- **Hover**: `color-mix(in oklch, var(--color-accent-primary) 75%, transparent)`
- **Gap**: `0.5rem`
- **Layout**: Flex with `align-items: center`

### Common Patterns
- All use flexbox layout
- All have `gap: 0.5rem`
- All use `border-radius: 50%` for circular dots
- All have active/inactive states
- All have hover states
- All use `transition` for smooth animations
- All have `cursor: pointer`
- All have `aria-label` for accessibility

### Differences
- **Color schemes**: Different color variables used for active/inactive states
- **Size**: All use `0.75rem` or `12px` (same), but PhotoCarousel uses explicit `12px`
- **Transform**: Carousel and FloorPlans use `scale(1.2)` on active, PhotoCarousel doesn't
- **Container styling**: PhotoCarousel has `margin-bottom: 1rem` and `justify-content: center`
- **Active hover**: Only PhotoCarousel has a distinct active hover state

## Proposed Solution

### Create `CarouselDots.svelte` Component

**Location**: `fe/src/lib/components/ui/CarouselDots.svelte`

**Props**:
```typescript
interface Props {
  total: number;              // Total number of items
  currentIndex: number;       // Currently active index
  onDotClick: (index: number) => void;  // Callback when dot is clicked
  ariaLabel?: string | ((index: number) => string);  // Accessibility label
  variant?: 'default' | 'accent' | 'inverse';  // Color variant
  size?: 'small' | 'medium' | 'large';  // Size variant
  showTransform?: boolean;    // Whether to scale active dot
  containerClass?: string;     // Additional container classes
}
```

**Features**:
- Unified styling with configurable variants
- Consistent accessibility (aria-labels)
- Flexible sizing options
- Optional transform animation
- Support for custom container classes

### Variants

#### `default` (for Carousel.svelte)
- Active: `var(--color-text-inverse)`
- Inactive: `color-mix(in oklch, var(--color-text-primary) 50%, transparent)`
- Hover: `color-mix(in oklch, var(--color-text-inverse) 75%, transparent)`
- Transform: `scale(1.2)` on active

#### `accent` (for PhotoCarousel.svelte and FloorPlans.svelte)
- Active: `var(--color-accent-primary)`
- Inactive: `var(--color-neutral-400)` (PhotoCarousel) or `color-mix(in oklch, var(--color-text-primary) 40%, transparent)` (FloorPlans)
- Hover: `var(--color-neutral-500)` (PhotoCarousel) or `color-mix(in oklch, var(--color-accent-primary) 75%, transparent)` (FloorPlans)
- Active Hover: `var(--color-accent-strong)` (PhotoCarousel only)
- Transform: Optional `scale(1.2)` on active

#### `inverse` (future use)
- For dark backgrounds or special cases

### Sizes
- `small`: `0.5rem` (8px)
- `medium`: `0.75rem` (12px) - default
- `large`: `1rem` (16px)

## Implementation Plan

### Phase 1: Create Component
1. Create `fe/src/lib/components/ui/CarouselDots.svelte`
2. Implement props interface
3. Implement all three variants
4. Add size options
5. Add accessibility features
6. Add CSS with proper scoping

### Phase 2: Refactor Carousel.svelte
1. Import `CarouselDots` component
2. Replace inline dots implementation
3. Use `variant="inverse"` (or create new variant)
4. Remove old CSS
5. Test functionality

### Phase 3: Refactor PhotoCarousel.svelte
1. Import `CarouselDots` component
2. Replace inline dots implementation
3. Use `variant="accent"`
4. Add `containerClass` for `margin-bottom: 1rem` and `justify-content: center`
5. Remove old CSS
6. Test functionality

### Phase 4: Refactor FloorPlans.svelte
1. Import `CarouselDots` component
2. Replace inline dots implementation
3. Use `variant="accent"` with `showTransform={true}`
4. Remove old CSS
5. Test functionality

### Phase 5: Testing & Documentation
1. Test all carousels work correctly
2. Test accessibility (keyboard navigation, screen readers)
3. Test responsive behavior
4. Update component documentation
5. Verify visual consistency

## Acceptance Criteria
- [ ] `CarouselDots.svelte` component created with all variants
- [ ] All three carousel implementations use the new component
- [ ] Visual appearance matches current design (no breaking changes)
- [ ] All carousels function correctly (navigation, active states)
- [ ] Accessibility maintained (aria-labels, keyboard navigation)
- [ ] No duplicate CSS for dots
- [ ] Component is reusable for future carousels
- [ ] Code follows Svelte 5 guidelines

## Related Files
- `fe/src/lib/components/ui/Carousel.svelte`
- `fe/src/lib/components/features/PhotoCarousel.svelte`
- `fe/src/lib/components/sections/FloorPlans.svelte`

## Notes
- Consider if we need separate variants or if we can unify the color schemes
- The `PhotoCarousel` variant might need special handling for the active hover state
- Consider making the component even more flexible with CSS custom properties for colors
- Future: Could also componentize the navigation buttons (prev/next) in a similar way

