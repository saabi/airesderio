# Circular Button Component Proposal

**Date:** 2025-12-03  
**Status:** Proposal  
**Related:** Component Architecture, UI Components

---

## Executive Summary

This proposal outlines a plan to create a reusable `CircularButton` component that consolidates all circular arrow button implementations across the landing page. The component will support flexible styling through props and CSS variables, and accept SVG icons as children snippets for maximum flexibility.

---

## Current State Analysis

### Instances Found

Four distinct implementations of circular arrow buttons exist across the codebase:

#### 1. **Carousel Component** (`ui/Carousel.svelte`)
- **Location:** Lines 106-132
- **Icon:** Text characters (`‹` and `›`) - **Legacy, will be replaced with SVG**
- **Size:** 3rem × 3rem
- **Styling:**
  - Background: `color-mix(in oklch, var(--overlay-black-60) 80%, transparent)`
  - Color: `var(--color-text-inverse)`
  - Font size: 2rem
  - Hover: Darker background, scale 1.1
  - Active: Scale 0.95
- **Context:** Bottom-center navigation with dots

#### 2. **PhotoCarousel Component** (`features/PhotoCarousel.svelte`)
- **Location:** Lines 120-129
- **Icon:** Text characters (`‹` and `›`) - **Legacy, will be replaced with SVG**
- **Size:** 40px × 40px (35px mobile)
- **Styling:**
  - Background: `var(--overlay-black-60)`
  - Color: `var(--color-text-inverse)`
  - Font size: 1.25rem (1rem mobile)
  - Hover: `var(--overlay-black-80)`
  - Position: Absolute left/right sides
- **Context:** Modal overlay carousel

#### 3. **FloorPlans Component** (`sections/FloorPlans.svelte`)
- **Location:** Lines 135-161
- **Icon:** Text characters (`‹` and `›`) - **Legacy, will be replaced with SVG**
- **Size:** 3rem × 3rem (2.5rem mobile)
- **Styling:**
  - Background: `color-mix(in oklch, var(--color-bg-canvas) 80%, transparent)`
  - Border: `1px solid var(--color-border-default)`
  - Color: `var(--color-text-primary)`
  - Font size: 2rem (1.5rem mobile)
  - Hover: Accent background, scale 1.1
  - Active: Scale 0.95
- **Context:** Floor plan carousel with border

#### 4. **Location Component** (`sections/Location.svelte`)
- **Location:** Lines 197-366
- **Icon:** SVG icons (standard - will be extracted for reuse)
- **Size:** 2.5rem × 2.5rem
- **Styling:**
  - Background: `var(--color-bg-contrast)`
  - Border: `1px solid var(--color-border-strong)`
  - Color: `var(--color-accent-primary)`
  - SVG size: 1.25rem × 1.25rem
  - Hover: Accent background, scale 1.05
  - Active: Scale 0.95
  - **Special:** Can be disabled
- **Context:** Map navigation (prev/next/up/gallery buttons)

### Common Patterns

1. **All are circular** (`border-radius: 50%`)
2. **All have hover/active states** with scale transforms
3. **All use flexbox** for centering content
4. **All have transitions** for smooth interactions
5. **All support accessibility** (aria-label, type="button")

### Variations

1. **Icon type:** 
   - **Legacy:** Text characters (`‹` and `›`) in Carousel, PhotoCarousel, FloorPlans
   - **Standard:** SVG icons in Location component (will become standard for all)
2. **Size:** 2.5rem, 3rem, 40px (with mobile variants)
3. **Background:** Overlay vs solid vs transparent mix
4. **Border:** None vs 1px solid
5. **Color scheme:** Inverse text vs primary text vs accent
6. **Hover behavior:** Background change vs scale vs both
7. **Disabled state:** Only Location component supports this

**Migration Goal:** Replace all text icons with standardized SVG icons from Location component's map navigator.

---

## Proposed Solution

### Component Design

Create a flexible `CircularButton` component that:

1. **Accepts children snippets** for SVG icons or text content
2. **Supports multiple size variants** via props
3. **Allows style customization** through CSS variables and props
4. **Handles disabled state** consistently
5. **Maintains accessibility** standards
6. **Provides consistent interaction patterns**

### Component API

```typescript
interface CircularButtonProps {
  // Required
  onClick: () => void;
  ariaLabel: string;
  
  // Optional styling
  size?: 'sm' | 'md' | 'lg' | 'xl' | number; // 'sm' = 2.5rem, 'md' = 3rem, 'lg' = 40px, 'xl' = custom
  variant?: 'overlay' | 'solid' | 'bordered' | 'accent';
  disabled?: boolean;
  
  // Optional customization
  class?: string;
  style?: string;
  
  // Optional behavior
  type?: 'button' | 'submit' | 'reset';
}
```

### Style Variants

#### Variant: `overlay`
- Background: `color-mix(in oklch, var(--overlay-black-60) 80%, transparent)`
- Color: `var(--color-text-inverse)`
- Border: none
- Use case: Carousel, PhotoCarousel

#### Variant: `solid`
- Background: `var(--color-bg-contrast)`
- Color: `var(--color-accent-primary)`
- Border: `1px solid var(--color-border-strong)`
- Use case: Location navigation

#### Variant: `bordered`
- Background: `color-mix(in oklch, var(--color-bg-canvas) 80%, transparent)`
- Color: `var(--color-text-primary)`
- Border: `1px solid var(--color-border-default)`
- Use case: FloorPlans

#### Variant: `accent`
- Background: `var(--color-accent-primary)`
- Color: `var(--color-text-on-accent)`
- Border: `1px solid var(--color-accent-primary)`
- Use case: Custom accent buttons

### Size Variants

- `sm`: 2.5rem × 2.5rem (Location buttons)
- `md`: 3rem × 3rem (Carousel, FloorPlans)
- `lg`: 40px × 40px (PhotoCarousel)
- `xl`: Custom size via number prop
- Mobile: Automatically scales down on mobile breakpoints

### Icon Support

**Important:** All circular buttons will use **SVG icon components** (extracted from the Location component's map navigator). Text characters (`‹` and `›`) are legacy and will be replaced during migration.

The component accepts children snippets for icon components:

```svelte
<script lang="ts">
  import CircularButton from '$lib/components/ui/CircularButton.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
</script>

<!-- Icon component (standard) -->
<CircularButton variant="overlay" size="md" ariaLabel="Previous">
  <ArrowLeft />
</CircularButton>
```

**Icon Standardization:** 
- SVG icons from the Location component's map navigator will be extracted into reusable icon components
- All icon components use `SvgViewport` for consistent structure
- Icons are placed in `fe/src/lib/components/icons/` directory
- Icons use `currentColor` for theme compatibility
- Icons are used across all circular buttons for consistency

---

## Implementation Plan

### Phase 1: Create Base Component

**File:** `fe/src/lib/components/ui/CircularButton.svelte`

**Features:**
- Basic circular button structure
- Size variants (sm, md, lg, xl)
- Style variants (overlay, solid, bordered, accent)
- Disabled state
- Accessibility (aria-label, type, focus-visible)
- Hover/active states with transitions
- Mobile responsive sizing

**Estimated Effort:** 2-3 hours

### Phase 2: Create Icon Components (Required)

**Directory:** `fe/src/lib/components/icons/`

**Files to Create:**
- `fe/src/lib/components/icons/ArrowLeft.svelte` - Extract from Location component
- `fe/src/lib/components/icons/ArrowRight.svelte` - Extract from Location component
- `fe/src/lib/components/icons/Building.svelte` - Extract from Location component (home/reset icon)
- `fe/src/lib/components/icons/Gallery.svelte` - Extract from Location component

**Note:** Icons will be placed alongside existing icon components in the `icons/` directory (e.g., `EnergiaElectrica.svelte`, `GasNatural.svelte`, etc.)

**Purpose:** 
- Extract SVG icons from Location component's map navigator
- Standardize SVG icons for reuse across all circular buttons
- Replace text characters (`‹` and `›`) with consistent SVG icons
- Use `SvgViewport` component for consistent SVG structure

**Icon Component Pattern:**
All icon components will use `SvgViewport` wrapper and contain only the SVG path/content:

```svelte
<script lang="ts">
  import SvgViewport from '$lib/components/ui/SvgViewport.svelte';
</script>

<SvgViewport width="20" height="20" viewBox="0 0 20 20">
  <!-- SVG content here -->
</SvgViewport>
```

**Icon Specifications:**
- All icons use `viewBox="0 0 20 20"` via SvgViewport
- Use `stroke="currentColor"` for stroke-based icons
- Include `stroke-linecap="round"` and `stroke-linejoin="round"` for consistency
- SvgViewport handles `aria-hidden="true"` and `focusable="false"` automatically

**Icon Content (to extract):**

1. **ArrowLeft** - Left-pointing chevron
   - Path: `M12.5 15L7.5 10L12.5 5`
   - Stroke width: 2

2. **ArrowRight** - Right-pointing chevron
   - Path: `M7.5 5L12.5 10L7.5 15`
   - Stroke width: 2

3. **Building** - Building/home icon (for reset navigation)
   - Multiple elements: rect, path, lines
   - Stroke width: 1.5

4. **Gallery** - Grid of 4 rounded squares
   - 4 rect elements with rx="1"
   - Stroke width: 2

**Estimated Effort:** 1-2 hours

### Phase 3: Migrate Existing Components

**Migration Order:**

1. **Carousel.svelte** (Lowest risk)
   - Replace text button with CircularButton
   - Use variant="overlay", size="md"
   - **Replace text icon (`‹` `›`) with ArrowLeft/ArrowRight SVG icons**

2. **PhotoCarousel.svelte** (Low risk)
   - Replace text button with CircularButton
   - Use variant="overlay", size="lg"
   - **Replace text icon (`‹` `›`) with ArrowLeft/ArrowRight SVG icons**
   - Update positioning classes

3. **FloorPlans.svelte** (Medium risk)
   - Replace text button with CircularButton
   - Use variant="bordered", size="md"
   - **Replace text icon (`‹` `›`) with ArrowLeft/ArrowRight SVG icons**

4. **Location.svelte** (Higher risk - has disabled state)
   - Replace inline SVG buttons with CircularButton
   - Use variant="solid", size="sm"
   - Replace inline SVG with icon components (ArrowLeft, ArrowRight, Building, Gallery)
   - Test disabled state functionality
   - Update to import icon components instead of using inline SVG

**Estimated Effort:** 3-4 hours

### Phase 4: Testing & Refinement

**Tasks:**
- Test all variants in different contexts
- Verify accessibility (keyboard navigation, screen readers)
- Test disabled states
- Verify mobile responsiveness
- Check theme compatibility (light/dark)
- Performance testing

**Estimated Effort:** 2 hours

**Total Estimated Effort:** 8-10 hours

---

## Component Structure

### File: `CircularButton.svelte`

```svelte
<script lang="ts">
  interface Props {
    onClick: () => void;
    ariaLabel: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | number;
    variant?: 'overlay' | 'solid' | 'bordered' | 'accent';
    disabled?: boolean;
    class?: string;
    style?: string;
    type?: 'button' | 'submit' | 'reset';
  }

  let {
    onClick,
    ariaLabel,
    size = 'md',
    variant = 'overlay',
    disabled = false,
    class: className = '',
    style: inlineStyle = '',
    type = 'button',
    children
  }: Props = $props();

  // Calculate size
  const sizeValue = $derived.by(() => {
    if (typeof size === 'number') return `${size}px`;
    const sizeMap = {
      sm: '2.5rem',
      md: '3rem',
      lg: '40px',
      xl: '3.5rem'
    };
    return sizeMap[size];
  });

  // Mobile size (smaller)
  const mobileSizeValue = $derived.by(() => {
    if (typeof size === 'number') return `${size * 0.875}px`;
    const sizeMap = {
      sm: '2.25rem',
      md: '2.5rem',
      lg: '35px',
      xl: '3rem'
    };
    return sizeMap[size];
  });
</script>

<button
  type={type}
  class="circular-button {variant} {className}"
  class:disabled={disabled}
  onclick={onClick}
  aria-label={ariaLabel}
  disabled={disabled}
  style="--button-size: {sizeValue}; --button-size-mobile: {mobileSizeValue}; {inlineStyle}"
>
  <span class="button-content">
    {@render children()}
  </span>
</button>

<style>
  .circular-button {
    /* Layout */
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--button-size);
    height: var(--button-size);
    padding: 0;
    flex-shrink: 0;

    /* Box/Visual */
    border: none;
    border-radius: 50%;

    /* Typography */
    font-size: inherit;
    line-height: 1;
    color: inherit;

    /* Misc/Overrides */
    cursor: pointer;

    /* Effects & Motion */
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease,
      transform 0.2s ease,
      opacity 0.2s ease;
  }

  .button-content {
    /* Layout */
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  /* Variant: overlay */
  .circular-button.overlay {
    background: color-mix(in oklch, var(--overlay-black-60) 80%, transparent);
    color: var(--color-text-inverse);
  }

  .circular-button.overlay:hover:not(:disabled) {
    background: color-mix(in oklch, var(--overlay-black-80) 90%, transparent);
    transform: scale(1.1);
  }

  /* Variant: solid */
  .circular-button.solid {
    background: var(--color-bg-contrast);
    border: 1px solid var(--color-border-strong);
    color: var(--color-accent-primary);
  }

  .circular-button.solid:hover:not(:disabled) {
    background: var(--color-accent-hover);
    border-color: var(--color-accent-strong);
    color: var(--color-text-on-accent);
    transform: scale(1.05);
  }

  /* Variant: bordered */
  .circular-button.bordered {
    background: color-mix(in oklch, var(--color-bg-canvas) 80%, transparent);
    border: 1px solid var(--color-border-default);
    color: var(--color-text-primary);
  }

  .circular-button.bordered:hover:not(:disabled) {
    background: var(--color-accent-primary);
    border-color: var(--color-accent-primary);
    color: var(--color-text-on-accent);
    transform: scale(1.1);
  }

  /* Variant: accent */
  .circular-button.accent {
    background: var(--color-accent-primary);
    border: 1px solid var(--color-accent-primary);
    color: var(--color-text-on-accent);
  }

  .circular-button.accent:hover:not(:disabled) {
    background: var(--color-accent-strong);
    border-color: var(--color-accent-strong);
    transform: scale(1.1);
  }

  /* Active state (all variants) */
  .circular-button:active:not(:disabled) {
    transform: scale(0.95);
  }

  /* Disabled state */
  .circular-button.disabled,
  .circular-button:disabled {
    opacity: 0.5;
    background: var(--color-bg-muted);
    border-color: var(--color-border-subtle);
    color: var(--color-text-secondary);
    cursor: not-allowed;
    pointer-events: none;
  }

  .circular-button.disabled:hover,
  .circular-button:disabled:hover {
    transform: none;
  }

  /* Focus visible */
  .circular-button:focus-visible {
    outline: 2px solid var(--color-accent-primary);
    outline-offset: 2px;
  }

  /* Mobile responsiveness */
  @media (max-width: 640px) {
    .circular-button {
      width: var(--button-size-mobile);
      height: var(--button-size-mobile);
    }
  }

  /* SVG icon sizing (SvgViewport components) */
  .circular-button :global(svg) {
    width: 1.25rem;
    height: 1.25rem;
  }

  /* Size-specific SVG icon adjustments */
  .circular-button.size-sm :global(svg) {
    width: 1rem;
    height: 1rem;
  }

  .circular-button.size-md :global(svg) {
    width: 1.25rem;
    height: 1.25rem;
  }

  .circular-button.size-lg :global(svg) {
    width: 1.25rem;
    height: 1.25rem;
  }

  @media (max-width: 640px) {
    .circular-button.size-lg :global(svg) {
      width: 1rem;
      height: 1rem;
    }
  }
</style>
```

---

## Migration Examples

### Example 1: Carousel Component

**Before:**
```svelte
<button
  class='carousel-button prev'
  onclick={previousImage}
  aria-label='Imagen anterior'
  type='button'
>
  ‹
</button>
```

**After:**
```svelte
<script lang="ts">
  import CircularButton from '$lib/components/ui/CircularButton.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
</script>

<CircularButton
  variant="overlay"
  size="md"
  ariaLabel="Imagen anterior"
  onClick={previousImage}
>
  <ArrowLeft />
</CircularButton>
```

**Note:** `ArrowLeft` is a reusable icon component using `SvgViewport`, extracted from the Location component's map navigator.

### Example 2: Location Component (with SVG)

**Before:**
```svelte
<button
  class='nav-button nav-button--prev'
  onclick={() => mapComponent?.prev()}
  aria-label='Anterior ubicación'
  type='button'
>
  <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
    <path d='M12.5 15L7.5 10L12.5 5' stroke='currentColor' stroke-width='2'/>
  </svg>
</button>
```

**After:**
```svelte
<script lang="ts">
  import CircularButton from '$lib/components/ui/CircularButton.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
</script>

<CircularButton
  variant="solid"
  size="sm"
  ariaLabel="Anterior ubicación"
  onClick={() => mapComponent?.prev()}
>
  <ArrowLeft />
</CircularButton>
```

**Note:** The Location component will be updated to use the extracted icon components instead of inline SVG.

### Example 3: Location Component (with disabled state)

**Before:**
```svelte
<button
  class='nav-button nav-button--up'
  class:disabled={!hasPlaceSelected}
  onclick={() => mapComponent?.reset()}
  aria-label='Volver al estado inicial'
  type='button'
  disabled={!hasPlaceSelected}
>
  <svg>...</svg>
</button>
```

**After:**
```svelte
<script lang="ts">
  import CircularButton from '$lib/components/ui/CircularButton.svelte';
  import Building from '$lib/components/icons/Building.svelte';
</script>

<CircularButton
  variant="solid"
  size="sm"
  ariaLabel="Volver al estado inicial"
  onClick={() => mapComponent?.reset()}
  disabled={!hasPlaceSelected}
>
  <Building />
</CircularButton>
```

---

## Benefits

### 1. Consistency
- Unified button behavior across all carousels
- Consistent hover/active states
- Standardized accessibility

### 2. Maintainability
- Single source of truth for circular buttons
- Easier to update styles globally
- Reduced code duplication

### 3. Flexibility
- Standardized SVG icons for visual consistency
- Multiple size and style variants
- Easy to extend with new variants
- Icon components can be reused elsewhere

### 4. Accessibility
- Consistent aria-label handling
- Proper focus states
- Disabled state support

### 5. Performance
- Smaller bundle size (shared component)
- Consistent CSS (better browser optimization)

---

## Considerations

### 1. Breaking Changes
- **Risk:** Low - Component will be drop-in replacement
- **Mitigation:** Test each migration individually

### 2. Styling Flexibility
- **Risk:** Medium - Some components may need custom styling
- **Mitigation:** Support `class` and `style` props for overrides

### 3. Icon Consistency
- **Risk:** Low - All buttons will use standardized SVG icons from map navigator
- **Mitigation:** Extract icons into reusable components in Phase 2, use consistently across all migrations

### 4. Mobile Responsiveness
- **Risk:** Low - Component handles mobile sizing
- **Mitigation:** Test on multiple screen sizes

### 5. Theme Compatibility
- **Risk:** Low - Uses CSS variables
- **Mitigation:** Test in light and dark themes

---

## Testing Checklist

- [ ] All size variants render correctly
- [ ] All style variants render correctly
- [ ] SVG icons display properly (all buttons use SVG, no text icons)
- [ ] Icon sizing is consistent across all variants
- [ ] Hover states work correctly
- [ ] Active states work correctly
- [ ] Disabled state works correctly
- [ ] Focus-visible state works correctly
- [ ] Mobile responsive sizing works
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Light theme displays correctly
- [ ] Dark theme displays correctly
- [ ] All migrated components work as before
- [ ] No visual regressions

---

## Icon Standardization

### Icon Component Structure

All icon components will be placed in `fe/src/lib/components/icons/` and use the `SvgViewport` component for consistent structure.

### Extracted Icons from Location Component

The following SVG icons will be extracted from `Location.svelte` and created as reusable components:

#### 1. **ArrowLeft.svelte** - Left-pointing chevron (prev navigation)
```svelte
<script lang="ts">
  import SvgViewport from '$lib/components/ui/SvgViewport.svelte';
</script>

<SvgViewport width="20" height="20" viewBox="0 0 20 20">
  <path
    d="M12.5 15L7.5 10L12.5 5"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</SvgViewport>
```

#### 2. **ArrowRight.svelte** - Right-pointing chevron (next navigation)
```svelte
<script lang="ts">
  import SvgViewport from '$lib/components/ui/SvgViewport.svelte';
</script>

<SvgViewport width="20" height="20" viewBox="0 0 20 20">
  <path
    d="M7.5 5L12.5 10L7.5 15"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</SvgViewport>
```

#### 3. **Building.svelte** - Building/home icon (reset navigation)
```svelte
<script lang="ts">
  import SvgViewport from '$lib/components/ui/SvgViewport.svelte';
</script>

<SvgViewport width="20" height="20" viewBox="0 0 20 20">
  <!-- Building base -->
  <rect
    x="4"
    y="7"
    width="12"
    height="10"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <!-- Roof -->
  <path
    d="M4 7L10 3L16 7"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <!-- Windows -->
  <line x1="7" y1="10" x2="7" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="13" y1="10" x2="13" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <!-- Door -->
  <rect
    x="8.5"
    y="12"
    width="3"
    height="3"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</SvgViewport>
```

#### 4. **Gallery.svelte** - Grid of 4 rounded squares (gallery navigation)
```svelte
<script lang="ts">
  import SvgViewport from '$lib/components/ui/SvgViewport.svelte';
</script>

<SvgViewport width="20" height="20" viewBox="0 0 20 20">
  <rect x="3" y="3" width="5" height="5" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>
  <rect x="12" y="3" width="5" height="5" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>
  <rect x="3" y="12" width="5" height="5" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>
  <rect x="12" y="12" width="5" height="5" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>
</SvgViewport>
```

### Icon Component Benefits

- **Consistency:** All icons use SvgViewport for uniform structure
- **Accessibility:** SvgViewport handles `aria-hidden` and `focusable` attributes
- **Maintainability:** Icons are centralized in `icons/` directory
- **Reusability:** Icons can be used in other components beyond CircularButton
- **Styling:** Icons inherit color via `currentColor` for theme compatibility

## Future Enhancements

1. **Animation Variants:** Add different hover animations
2. **Loading State:** Support loading spinner state
3. **Tooltip Support:** Add optional tooltip prop
4. **Keyboard Shortcuts:** Support keyboard navigation hints
5. **More Icons:** Expand icon library as needed

---

## Related Documentation

- [Component Architecture](../specs/architecture.md)
- [Svelte Guidelines](../specs/svelte-guidelines.md)
- [Development Setup](../specs/development-setup.md)

---

## Approval

**Status:** Pending Review  
**Next Steps:** Review proposal, approve implementation plan, create ticket

---

**Last Updated:** 2025-12-03

