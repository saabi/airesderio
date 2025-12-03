# Ticket #016: Refactor scroll-animate Utility Class

## Priority
**Medium** - Code Quality, Component Architecture

## Type
Refactoring, CSS Architecture, Animation System

## Description
The `.scroll-animate` utility class is used extensively across 7 section components (36 instances total) for scroll-triggered animations. This ticket evaluates whether to componentize it as a reusable component or keep it as a utility class with improved documentation.

## Current State

### `.scroll-animate` Class
**Location:** `fe/src/app.css:244-272`

```css
.scroll-animate {
    transition:
        transform var(--scroll-animate-duration, 500ms) var(--scroll-animate-easing, cubic-bezier(0.22, 1, 0.36, 1)),
        opacity var(--scroll-animate-duration, 500ms) ease;
    transition-delay: var(--scroll-animate-delay, 0ms);
}

.scroll-animate:not([data-item-active]) {
    opacity: 0;
    transform: translate3d(0, var(--scroll-animate-offset, 40px), 0)
        scale(var(--scroll-animate-scale, 0.98));
}

[data-section-active='true'] .scroll-animate:not([data-item-active]) {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
}

.scroll-animate[data-item-active] {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
}

@media (prefers-reduced-motion: reduce) {
    [data-section-active] .scroll-animate {
        transform: none;
        transition-duration: 0ms;
    }
}
```

### Usage Analysis

**Components using scroll-animate:**
- `Location.svelte` - 6 instances
- `Intro.svelte` - 6 instances
- `ContactSection.svelte` - 4 instances
- `Equipment.svelte` - 4 instances
- `Interior.svelte` - 10 instances
- `Hero.svelte` - 2 instances
- `FloorPlans.svelte` - 4 instances

**Total:** 36 instances across 7 components

### Current Pattern

Each usage follows this pattern:
```svelte
<div
    class="scroll-animate"
    style={`--scroll-animate-delay: ${animationDelay(0)}; --scroll-animate-offset: ${animationOffset('text')}; --scroll-animate-duration: ${animationDuration()};`}
>
    <!-- content -->
</div>
```

### Integration with Section Observers

The animation system integrates with:
- **Section observers** (`createSectionObserver`) - Sets `data-section-active='true'` on parent sections
- **Title observers** (`createTitleObserver`) - Sets `data-item-active` on individual elements
- **CSS variables** - Control animation parameters (delay, offset, duration, scale, easing)

### Animation Flow

1. Elements with `.scroll-animate` start hidden (opacity: 0, transformed)
2. When parent section has `data-section-active='true'`, children become visible
3. When element has `data-item-active`, it becomes visible immediately
4. Animations respect `prefers-reduced-motion` preference

## Proposed Solutions

### Option A: Keep as Utility Class (Recommended)

**Approach:**
1. Keep `.scroll-animate` in `app.css` as a global utility
2. Add comprehensive documentation explaining the pattern
3. Document required CSS variables and their usage
4. Document integration with section observers

**Benefits:**
- Minimal changes required
- Works seamlessly with existing section observer pattern
- No breaking changes
- Easier to maintain current behavior
- No performance overhead from wrapper components

**Drawbacks:**
- Still global CSS (but acceptable for a utility)
- Less encapsulated than a component

**Implementation:**
- Add detailed comments to `app.css`
- Document the pattern in component guidelines
- No code changes required

### Option B: Componentize as ScrollAnimate.svelte

**Approach:**
1. Create `ScrollAnimate.svelte` wrapper component
2. Move CSS from `app.css` to component
3. Add TypeScript props for animation parameters
4. Update all 36 instances to use component
5. Handle `data-item-active` attribute support

**Benefits:**
- Better encapsulation
- TypeScript props for type safety
- Reusable component with clear API
- Easier to test in isolation

**Drawbacks:**
- Requires wrapping 36 elements (performance consideration)
- More complex implementation
- Need to handle section observer integration
- Breaking change to component APIs
- More files to maintain

**Implementation:**
```svelte
<!-- ScrollAnimate.svelte -->
<script module lang="ts">
    type OffsetType = 'text' | 'visual' | number;
    
    interface Props {
        delay?: number;
        offset?: OffsetType;
        duration?: number;
        scale?: number;
        easing?: string;
        class?: string;
        dataItemActive?: boolean;
        children: import('svelte').Snippet;
    }
</script>

<script lang="ts">
    import { animationOffset, animationDuration, animationDelay } from '$lib/constants/animation';
    
    let {
        delay,
        offset,
        duration,
        scale = 0.98,
        easing = 'cubic-bezier(0.22, 1, 0.36, 1)',
        class: className = '',
        dataItemActive = false,
        children
    }: Props = $props();
    
    let computedOffset = $derived.by(() => {
        if (typeof offset === 'number') return `${offset}px`;
        if (offset === 'text' || offset === 'visual') {
            return animationOffset(offset);
        }
        return animationOffset('text');
    });
    
    let computedDuration = $derived(duration ?? animationDuration());
    let computedDelay = $derived(delay ?? 0);
</script>

<div
    class="scroll-animate {className}"
    data-item-active={dataItemActive || undefined}
    style="--scroll-animate-delay: {computedDelay}ms; --scroll-animate-offset: {computedOffset}; --scroll-animate-duration: {computedDuration}ms; --scroll-animate-scale: {scale}; --scroll-animate-easing: {easing};"
>
    {@render children()}
</div>

<style>
    .scroll-animate {
        transition:
            transform var(--scroll-animate-duration, 500ms) var(--scroll-animate-easing, cubic-bezier(0.22, 1, 0.36, 1)),
            opacity var(--scroll-animate-duration, 500ms) ease;
        transition-delay: var(--scroll-animate-delay, 0ms);
    }

    .scroll-animate:not([data-item-active]) {
        opacity: 0;
        transform: translate3d(0, var(--scroll-animate-offset, 40px), 0)
            scale(var(--scroll-animate-scale, 0.98));
    }

    [data-section-active='true'] .scroll-animate:not([data-item-active]) {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
    }

    .scroll-animate[data-item-active] {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
    }

    @media (prefers-reduced-motion: reduce) {
        [data-section-active] .scroll-animate {
            transform: none;
            transition-duration: 0ms;
        }
    }
</style>
```

## Decision Criteria

### Choose Option A (Utility Class) if:
- Current implementation works well
- Section observer pattern is stable
- Performance is a concern (36 wrapper components)
- Team prefers minimal changes
- Documentation is sufficient

### Choose Option B (Component) if:
- Type safety is important
- Component API would be clearer
- Team wants better encapsulation
- Willing to refactor 36 instances
- Performance impact is acceptable

## Acceptance Criteria

### If Option A (Utility Class):
- [ ] Comprehensive documentation added to `app.css`
- [ ] Pattern documented in component guidelines
- [ ] All 36 instances continue to work correctly
- [ ] Section observer integration documented
- [ ] CSS variables usage documented

### If Option B (Component):
- [ ] `ScrollAnimate.svelte` component created
- [ ] All CSS moved from `app.css` to component
- [ ] All 36 instances updated to use component
- [ ] TypeScript props implemented correctly
- [ ] `data-item-active` attribute support added
- [ ] Section observer integration works
- [ ] All animations work correctly
- [ ] Reduced motion preference respected
- [ ] No performance regressions

## Implementation Steps

### If Option A (Recommended):

#### Step 1: Add Documentation
1. Open `fe/src/app.css`
2. Add comprehensive comments before `.scroll-animate` class:
   ```css
   /* ===== Scroll Animation Utility =====
    * 
    * The .scroll-animate class provides scroll-triggered fade-in animations
    * for section content. It integrates with section observers to trigger
    * animations when sections become visible.
    * 
    * Usage:
    *   <div class="scroll-animate" style="--scroll-animate-delay: 0ms; ...">
    *     <!-- content -->
    *   </div>
    * 
    * Required CSS Variables:
    *   --scroll-animate-delay: Animation delay in milliseconds (default: 0ms)
    *   --scroll-animate-offset: Vertical offset for initial position (default: 40px)
    *   --scroll-animate-duration: Animation duration in milliseconds (default: 500ms)
    *   --scroll-animate-scale: Initial scale factor (default: 0.98)
    *   --scroll-animate-easing: CSS easing function (default: cubic-bezier(0.22, 1, 0.36, 1))
    * 
    * Integration:
    *   - Parent sections use createSectionObserver() which sets data-section-active='true'
    *   - Individual elements can use createTitleObserver() which sets data-item-active
    *   - Animations trigger when data-section-active='true' is set on parent
    *   - Elements with data-item-active animate immediately
    * 
    * Accessibility:
    *   - Respects prefers-reduced-motion media query
    *   - Animations disabled for users who prefer reduced motion
    */
   ```

#### Step 2: Verify Current Usage
1. Review all 36 instances
2. Confirm they follow the documented pattern
3. Verify no component-specific customizations
4. Document any edge cases

#### Step 3: Update Component Guidelines
1. Add section to `docs/specs/svelte-guidelines.md` about scroll animations
2. Document the pattern and best practices
3. Include examples

### If Option B (Componentization):

#### Step 1: Create ScrollAnimate Component
1. Create `fe/src/lib/components/ui/ScrollAnimate.svelte`
2. Implement component structure (see Option B example above)
3. Move CSS from `app.css` to component
4. Add TypeScript props interface
5. Implement offset type handling (text/visual/number)

#### Step 2: Update Location.svelte (6 instances)
1. Import `ScrollAnimate` component
2. Replace each `class="scroll-animate"` usage:
   ```svelte
   <!-- Before -->
   <div class="scroll-animate" style="...">
   
   <!-- After -->
   <ScrollAnimate offset="text" delay={animationDelay(0)}>
   ```
3. Handle `data-item-active` if needed
4. Test each instance

#### Step 3: Update Intro.svelte (6 instances)
1. Same pattern as Location.svelte
2. Test animations

#### Step 4: Update ContactSection.svelte (4 instances)
1. Same pattern
2. Test animations

#### Step 5: Update Equipment.svelte (4 instances)
1. Same pattern
2. Test animations

#### Step 6: Update Interior.svelte (10 instances)
1. Same pattern
2. Test animations (most instances)

#### Step 7: Update Hero.svelte (2 instances)
1. Same pattern
2. Test animations

#### Step 8: Update FloorPlans.svelte (4 instances)
1. Same pattern
2. Test animations

#### Step 9: Remove CSS from app.css
1. Remove all `.scroll-animate` rules
2. Remove `[data-section-active]` rules
3. Remove reduced motion media query

#### Step 10: Verification
1. Test all 36 instances
2. Verify section observer integration
3. Test reduced motion preference
4. Performance testing

## Related Files
- `fe/src/app.css` - Contains `.scroll-animate` CSS (lines 244-272)
- `fe/src/lib/components/sections/Location.svelte` - 6 instances
- `fe/src/lib/components/sections/Intro.svelte` - 6 instances
- `fe/src/lib/components/sections/ContactSection.svelte` - 4 instances
- `fe/src/lib/components/sections/Equipment.svelte` - 4 instances
- `fe/src/lib/components/sections/Interior.svelte` - 10 instances
- `fe/src/lib/components/sections/Hero.svelte` - 2 instances
- `fe/src/lib/components/sections/FloorPlans.svelte` - 4 instances
- `fe/src/lib/utils/sectionVisibility.ts` - Section observer utilities
- `fe/src/lib/constants/animation.ts` - Animation constants

## Estimated Effort
- **Option A (Documentation):** 30-45 minutes
- **Option B (Componentization):** 3-4 hours

## Dependencies
- Ticket #014 - Should be completed first (other utility classes refactored)

## Status
**Pending** - Not started

## Notes
- This is a complex refactoring due to extensive usage (36 instances)
- The decision between utility class and component should be made based on team preferences and project needs
- Option A is recommended for minimal disruption and better performance
- Option B provides better type safety and encapsulation but requires significant refactoring
- Consider the impact on bundle size and runtime performance when making the decision

