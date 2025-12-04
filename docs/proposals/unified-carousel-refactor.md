# Unified Carousel Component Refactor Proposal

**Date:** 2025-12-03  
**Status:** Proposal  
**Related:** [Circular Button Componentization](./circular-button-component.md), [Ticket #022: Componentize Carousel Dots](../tickets/022-componentize-carousel-dots.md)

---

## Executive Summary

This proposal outlines a plan to unify all carousel implementations into a single, flexible `ImageCarousel` component that can handle all current use cases while maintaining visual consistency and reducing code duplication.

---

## Current State Analysis

### Carousel Implementations Found

#### 1. **Carousel.svelte** (UI Component)
- **Location:** `fe/src/lib/components/ui/Carousel.svelte`
- **Used by:** Hero.svelte, Interior.svelte
- **Features:**
  - Auto-rotating with configurable interval
  - Pause on hover
  - Navigation: CircularButton + CarouselDots at bottom center
  - Transition: Fade with scale effect
  - Supports: String URLs and enhanced images
  - Image fit: `object-fit: cover`
- **State Management:** Internal state with `$state`
- **Lifecycle:** Auto-start on mount, cleanup on destroy

#### 2. **PhotoCarousel.svelte** (Feature Component)
- **Location:** `fe/src/lib/components/features/PhotoCarousel.svelte`
- **Used by:** Location.svelte (modal overlay)
- **Features:**
  - Manual navigation only (no auto-rotate)
  - Navigation: CircularButton positioned absolutely (left/right sides)
  - Dots: CarouselDots below image
  - Transition: Instant (no fade)
  - Supports: Enhanced images with fallback
  - Image fit: `object-fit: cover`
  - Keyboard navigation: Arrow keys, Escape
  - Modal overlay structure
  - Additional content: Photo info (title, description, things to do)
- **State Management:** Bindable `currentIndex` prop
- **Special:** Modal dialog with backdrop, header, close button

#### 3. **FloorPlans.svelte** (Section Component - Inline Carousel)
- **Location:** `fe/src/lib/components/sections/FloorPlans.svelte`
- **Features:**
  - Manual navigation only (no auto-rotate)
  - Navigation: CircularButton + CarouselDots at bottom center
  - Transition: Fade (opacity only, no scale)
  - Supports: Enhanced images
  - Image fit: `object-fit: contain` (different!)
  - Additional content: Title and description below carousel
- **State Management:** Internal state with `$state`
- **Special:** Shows floor plan info below carousel

### Common Patterns

✅ **Already Unified:**
- Navigation buttons: All use `CircularButton` component
- Dots: All use `CarouselDots` component
- Enhanced image support: All handle enhanced images
- Accessibility: All have aria-labels

### Key Differences

| Feature | Carousel.svelte | PhotoCarousel.svelte | FloorPlans.svelte |
|---------|----------------|---------------------|-------------------|
| **Auto-rotate** | ✅ Yes | ❌ No | ❌ No |
| **Navigation Position** | Bottom center | Absolute left/right | Bottom center |
| **Transition Style** | Fade + scale | Instant | Fade only |
| **Image Fit** | `cover` | `cover` | `contain` |
| **Keyboard Nav** | ❌ No | ✅ Yes | ❌ No |
| **Modal Overlay** | ❌ No | ✅ Yes | ❌ No |
| **Additional Content** | ❌ No | ✅ Yes (info) | ✅ Yes (title/desc) |
| **State Control** | Internal | Bindable prop | Internal |

---

## Proposed Solution

### Unified Component: `ImageCarousel.svelte`

Create a flexible, configurable carousel component that can handle all current use cases through props and slots.

### Component API

```typescript
interface ImageCarouselProps {
  // Required
  images: ImageInput[];
  
  // Navigation
  autoRotate?: boolean;
  interval?: number;
  pauseOnHover?: boolean;
  keyboardNavigation?: boolean;
  
  // State
  currentIndex?: number; // If provided, makes it controlled
  onIndexChange?: (index: number) => void;
  
  // Navigation UI
  showNavigation?: boolean;
  navigationPosition?: 'bottom-center' | 'absolute-sides';
  buttonVariant?: 'overlay' | 'solid' | 'bordered' | 'accent';
  buttonSize?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Dots
  showDots?: boolean;
  dotsVariant?: 'default' | 'accent' | 'inverse';
  dotsPosition?: 'bottom-center' | 'below-image';
  
  // Transitions
  transitionType?: 'fade' | 'fade-scale' | 'instant';
  transitionDuration?: number;
  
  // Image
  imageFit?: 'cover' | 'contain';
  imageSizes?: string; // For enhanced images
  
  // Accessibility
  ariaLabel?: string;
  imageAriaLabel?: string | ((index: number) => string);
  
  // Styling
  class?: string;
  containerClass?: string;
  
  // Slots
  header?: Snippet; // For PhotoCarousel modal header
  footer?: Snippet; // For FloorPlans title/description
  additionalContent?: Snippet; // For PhotoCarousel info
}
```

### Component Structure

```svelte
<div class="image-carousel {containerClass}">
  <!-- Images -->
  <div class="carousel-images">
    {#each images as image, index}
      <!-- Image rendering logic -->
    {/each}
  </div>
  
  <!-- Navigation Buttons -->
  {#if showNavigation && images.length > 1}
    {#if navigationPosition === 'bottom-center'}
      <div class="carousel-navigation bottom-center">
        <CircularButton ... />
        <CarouselDots ... />
        <CircularButton ... />
      </div>
    {:else}
      <CircularButton class="nav-button prev" ... />
      <CircularButton class="nav-button next" ... />
    {/if}
  {/if}
  
  <!-- Dots (if separate from navigation) -->
  {#if showDots && dotsPosition === 'below-image' && images.length > 1}
    <CarouselDots ... />
  {/if}
  
  <!-- Slots -->
  {#if header}
    {@render header()}
  {/if}
  
  {#if footer}
    {@render footer()}
  {/if}
  
  {#if additionalContent}
    {@render additionalContent()}
  {/if}
</div>
```

---

## Migration Strategy

### Phase 1: Create Unified Component

**File:** `fe/src/lib/components/ui/ImageCarousel.svelte`

**Features:**
- Support all navigation patterns
- Support all transition types
- Support all image fit modes
- Keyboard navigation (optional)
- Auto-rotate (optional)
- Slots for additional content
- Bindable currentIndex for controlled usage

**Estimated Effort:** 4-6 hours

### Phase 2: Migrate Carousel.svelte Use Cases

**Targets:** Hero.svelte, Interior.svelte

**Configuration:**
```svelte
<ImageCarousel
  images={CAROUSEL_IMAGES}
  autoRotate={true}
  interval={5000}
  pauseOnHover={true}
  showNavigation={true}
  navigationPosition="bottom-center"
  buttonVariant="overlay"
  buttonSize="md"
  showDots={true}
  dotsVariant="default"
  transitionType="fade-scale"
  imageFit="cover"
  ariaLabel="Carrusel de imágenes"
/>
```

**Estimated Effort:** 1 hour

### Phase 3: Migrate PhotoCarousel.svelte

**Configuration:**
```svelte
<ImageCarousel
  images={enhancedPhotos}
  bind:currentIndex={currentIndex}
  autoRotate={false}
  keyboardNavigation={true}
  showNavigation={true}
  navigationPosition="absolute-sides"
  buttonVariant="overlay"
  buttonSize="lg"
  showDots={true}
  dotsVariant="inverse"
  dotsPosition="below-image"
  transitionType="instant"
  imageFit="cover"
  class="photo-carousel-modal"
>
  <svelte:fragment slot="header">
    <div class="header">...</div>
  </svelte:fragment>
  <svelte:fragment slot="additionalContent">
    <div class="photo-info">...</div>
  </svelte:fragment>
</ImageCarousel>
```

**Note:** Modal overlay structure (backdrop, close button) stays in PhotoCarousel wrapper

**Estimated Effort:** 2-3 hours

### Phase 4: Migrate FloorPlans.svelte

**Configuration:**
```svelte
<ImageCarousel
  images={FLOOR_PLANS.map(p => p.image)}
  autoRotate={false}
  showNavigation={true}
  navigationPosition="bottom-center"
  buttonVariant="bordered"
  buttonSize="md"
  showDots={true}
  dotsVariant="inverse"
  transitionType="fade"
  imageFit="contain"
  class="floor-plans-carousel"
>
  <svelte:fragment slot="footer">
    <figure class="floor-plan-info">
      <figcaption>{currentPlan.title}</figcaption>
      <p>{currentPlan.description}</p>
    </figure>
  </svelte:fragment>
</ImageCarousel>
```

**Estimated Effort:** 1-2 hours

### Phase 5: Deprecate Old Components

**Actions:**
- Mark `Carousel.svelte` as deprecated
- Update documentation
- Remove after migration complete

**Estimated Effort:** 1 hour

**Total Estimated Effort:** 9-13 hours

---

## Component Design Details

### Navigation Patterns

#### Pattern 1: Bottom Center (Carousel, FloorPlans)
```svelte
<div class="carousel-navigation bottom-center">
  <CircularButton variant={buttonVariant} size={buttonSize} ... />
  <CarouselDots ... />
  <CircularButton variant={buttonVariant} size={buttonSize} ... />
</div>
```

#### Pattern 2: Absolute Sides (PhotoCarousel)
```svelte
<CircularButton 
  class="nav-button prev" 
  variant={buttonVariant} 
  size={buttonSize} 
  ... 
/>
<CircularButton 
  class="nav-button next" 
  variant={buttonVariant} 
  size={buttonSize} 
  ... 
/>
```

### Transition Types

#### Type: `fade-scale` (Carousel.svelte)
```css
.carousel-image {
  opacity: 0;
  transform: scale(1.05);
  transition: opacity 0.8s, transform 0.8s;
}
.carousel-image.active {
  opacity: 1;
  transform: scale(1);
}
```

#### Type: `fade` (FloorPlans.svelte)
```css
.carousel-image {
  opacity: 0;
  transition: opacity 0.6s;
}
.carousel-image.active {
  opacity: 1;
}
```

#### Type: `instant` (PhotoCarousel.svelte)
```css
.carousel-image {
  display: none;
}
.carousel-image.active {
  display: block;
}
```

### Image Fit Modes

- **`cover`**: Fill container, may crop (Carousel, PhotoCarousel)
- **`contain`**: Fit entire image, may have empty space (FloorPlans)

### Keyboard Navigation

When `keyboardNavigation={true}`:
- ArrowLeft: Previous image
- ArrowRight: Next image
- Escape: Optional callback (for PhotoCarousel modal close)

---

## Benefits

### 1. Code Reduction
- **Before:** ~600 lines across 3 components
- **After:** ~400 lines in 1 component + usage sites
- **Savings:** ~200 lines + easier maintenance

### 2. Consistency
- Unified behavior across all carousels
- Consistent accessibility patterns
- Standardized keyboard navigation

### 3. Flexibility
- Easy to add new carousel variants
- Configurable without code duplication
- Slots for custom content

### 4. Maintainability
- Single source of truth for carousel logic
- Easier to fix bugs (fix once, works everywhere)
- Easier to add features (add once, available everywhere)

### 5. Testability
- Single component to test
- Clear prop interface
- Predictable behavior

---

## Implementation Considerations

### 1. Backward Compatibility
- **Risk:** Medium - Breaking changes for existing usage
- **Mitigation:** 
  - Keep old `Carousel.svelte` during migration
  - Migrate one use case at a time
  - Test thoroughly after each migration

### 2. Complexity
- **Risk:** Medium - More props = more complexity
- **Mitigation:**
  - Sensible defaults for all props
  - Clear prop documentation
  - TypeScript types for safety

### 3. Performance
- **Risk:** Low - Similar rendering patterns
- **Mitigation:**
  - Use Svelte 5 runes efficiently
  - Lazy load images
  - Optimize transitions

### 4. PhotoCarousel Modal Structure
- **Risk:** Low - Keep modal wrapper separate
- **Mitigation:**
  - ImageCarousel handles carousel logic only
  - PhotoCarousel wrapper handles modal UI
  - Clear separation of concerns

---

## Migration Examples

### Example 1: Hero Section (Auto-rotating)

**Before:**
```svelte
<Carousel
  images={CAROUSEL_IMAGES}
  interval={5000}
  ariaLabel="Carrusel de imágenes del edificio"
/>
```

**After:**
```svelte
<ImageCarousel
  images={CAROUSEL_IMAGES}
  autoRotate={true}
  interval={5000}
  pauseOnHover={true}
  showNavigation={true}
  navigationPosition="bottom-center"
  buttonVariant="overlay"
  buttonSize="md"
  showDots={true}
  dotsVariant="default"
  transitionType="fade-scale"
  imageFit="cover"
  ariaLabel="Carrusel de imágenes del edificio"
/>
```

### Example 2: PhotoCarousel (Modal)

**Before:**
```svelte
<!-- PhotoCarousel.svelte has full modal structure -->
<div class="overlay">
  <div class="modal">
    <div class="header">...</div>
    <div class="content">
      <div class="photo-container">
        <!-- Image rendering -->
        <!-- Navigation buttons -->
      </div>
      <CarouselDots ... />
      <div class="photo-info">...</div>
    </div>
  </div>
</div>
```

**After:**
```svelte
<!-- PhotoCarousel.svelte wrapper -->
<div class="overlay">
  <div class="modal">
    <svelte:fragment slot="header">
      <div class="header">...</div>
    </svelte:fragment>
    <ImageCarousel
      images={enhancedPhotos}
      bind:currentIndex={currentIndex}
      keyboardNavigation={true}
      showNavigation={true}
      navigationPosition="absolute-sides"
      buttonVariant="overlay"
      buttonSize="lg"
      showDots={true}
      dotsVariant="inverse"
      dotsPosition="below-image"
      transitionType="instant"
      imageFit="cover"
      class="photo-carousel"
    >
      <svelte:fragment slot="additionalContent">
        <div class="photo-info">...</div>
      </svelte:fragment>
    </ImageCarousel>
  </div>
</div>
```

### Example 3: FloorPlans (With Footer)

**Before:**
```svelte
<div class="carousel-wrapper">
  <!-- Images -->
  <!-- Navigation -->
</div>
<figure class="floor-plan-info">
  <figcaption>{currentPlan.title}</figcaption>
  <p>{currentPlan.description}</p>
</figure>
```

**After:**
```svelte
<ImageCarousel
  images={FLOOR_PLANS.map(p => p.image)}
  bind:currentIndex={currentPlanIndex}
  showNavigation={true}
  navigationPosition="bottom-center"
  buttonVariant="bordered"
  buttonSize="md"
  showDots={true}
  dotsVariant="inverse"
  transitionType="fade"
  imageFit="contain"
  class="floor-plans-carousel"
>
  <svelte:fragment slot="footer">
    <figure class="floor-plan-info">
      <figcaption>{currentPlan.title}</figcaption>
      <p>{currentPlan.description}</p>
    </figure>
  </svelte:fragment>
</ImageCarousel>
```

---

## Alternative Approach: Keep Specialized Components

### Option A: Unified Component (Recommended)
- **Pros:** Single source of truth, maximum reusability
- **Cons:** More complex API, potential over-engineering

### Option B: Keep Specialized Components
- **Pros:** Simpler APIs, clearer intent
- **Cons:** Code duplication, harder maintenance

### Option C: Hybrid Approach
- Keep `Carousel.svelte` for simple auto-rotating carousels
- Keep `PhotoCarousel.svelte` for modal use case
- Unify `FloorPlans.svelte` to use `Carousel.svelte`
- **Pros:** Balance between simplicity and reuse
- **Cons:** Still some duplication

**Recommendation:** Option A (Unified Component) for maximum maintainability and consistency.

---

## Testing Checklist

- [ ] Auto-rotate works correctly
- [ ] Pause on hover works
- [ ] Manual navigation works (buttons and dots)
- [ ] Keyboard navigation works (when enabled)
- [ ] All transition types work correctly
- [ ] All image fit modes work correctly
- [ ] Navigation positioning works (bottom-center and absolute-sides)
- [ ] Dots positioning works (bottom-center and below-image)
- [ ] Slots work correctly (header, footer, additionalContent)
- [ ] Controlled mode works (bindable currentIndex)
- [ ] Uncontrolled mode works (internal state)
- [ ] Enhanced images work correctly
- [ ] Fallback images work correctly
- [ ] Accessibility maintained (aria-labels, keyboard nav)
- [ ] Mobile responsive
- [ ] All migrated use cases work as before
- [ ] No visual regressions

---

## Future Enhancements

1. **Swipe Gestures:** Add touch/swipe support for mobile
2. **Lazy Loading:** Improve lazy loading strategy
3. **Preloading:** Preload next/previous images
4. **Animation Options:** More transition types (slide, zoom, etc.)
5. **Thumbnail Navigation:** Optional thumbnail strip
6. **Fullscreen Mode:** Optional fullscreen toggle
7. **Play/Pause Control:** Manual play/pause button

---

## Related Documentation

- [Circular Button Componentization](./circular-button-component.md)
- [Ticket #022: Componentize Carousel Dots](../tickets/022-componentize-carousel-dots.md)
- [Component Architecture](../specs/architecture.md)
- [Svelte Guidelines](../specs/svelte-guidelines.md)

---

## Approval

**Status:** Pending Review  
**Next Steps:** Review proposal, approve implementation plan, create ticket

---

**Last Updated:** 2025-12-03

