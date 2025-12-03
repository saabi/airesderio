# Ticket #014: Refactor app.css Classes into Components

## Priority
**Medium** - Code Quality, Component Architecture

## Type
Refactoring, CSS Architecture

## Description
Several utility classes in `app.css` are used across components and could be better encapsulated within component files or converted to reusable components. This refactoring will improve component encapsulation, reduce global CSS pollution, and make the codebase more maintainable.

**Note:** Category-related classes (`.category-color`, `.category-border`, `.category-text`, and `.category-*` modifier classes) have been removed in ticket #015. This ticket focuses on the remaining utility classes.

## Current State

### Classes in `app.css` and Their Usage

#### 1. `.scroll-animate` Class
**Location:** `fe/src/app.css:301-329`

```css
.scroll-animate {
    transition: transform var(--scroll-animate-duration, 500ms) ..., 
                opacity var(--scroll-animate-duration, 500ms) ease;
    transition-delay: var(--scroll-animate-delay, 0ms);
}

.scroll-animate:not([data-item-active]) {
    opacity: 0;
    transform: translate3d(0, var(--scroll-animate-offset, 40px), 0) 
        scale(var(--scroll-animate-scale, 0.98));
}
/* ... more rules ... */
```

**Usage:**
- Used in **7 section components**: `Location`, `Intro`, `ContactSection`, `Equipment`, `Interior`, `Hero`, `FloorPlans`
- Total: **36 instances** across components
- Each component applies the class with custom CSS variables for animation parameters

**Analysis:**
- Reusable animation utility class
- Used extensively across multiple components
- Could be componentized as a wrapper component or action

#### 4. `.wrap` Class
**Location:** `fe/src/app.css:356-360`

```css
.wrap {
    max-width: var(--max);
    margin: auto;
    padding: 0 clamp(0.875rem, 3vw, 1.5rem)
}
```

**Usage:**
- `Footer.svelte:38` - Single usage

**Analysis:**
- Layout utility for centered, max-width containers
- Only used in one component
- Should be moved to `Footer.svelte` component styles

#### 5. `.skip-link` Class
**Location:** `fe/src/app.css:369-383`

```css
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--color-accent-primary);
    color: var(--color-text-on-accent);
    padding: 0.5rem 1rem;
    text-decoration: none;
    z-index: 10000;
    border-radius: 0 0 0.25rem 0;
}

.skip-link:focus {
    top: 0;
}
```

**Usage:**
- `+layout.svelte:30` - Single usage for accessibility

**Analysis:**
- Accessibility feature (skip to main content)
- Used in layout file
- Could be componentized as `SkipLink.svelte`

#### 6. `body.nav-open` Class
**Location:** `fe/src/app.css:364-366`

```css
body.nav-open {
    overflow: hidden;
}
```

**Usage:**
- `Header.svelte:51, 53` - Toggles class on `document.body` when mobile menu opens/closes

**Analysis:**
- Prevents body scrolling when mobile menu is open
- Applied via JavaScript in `Header` component
- Could be handled with a Svelte action or component state

## Proposed Solution

### Solution 1: Componentize `.scroll-animate` as `ScrollAnimate.svelte`

**Approach:**
1. Create `ScrollAnimate.svelte` wrapper component
2. Component handles scroll animation logic and styling
3. Replace `class="scroll-animate"` with `<ScrollAnimate>` wrapper
4. Move animation CSS from `app.css` to component

**Benefits:**
- Encapsulates animation logic
- Reusable component
- Easier to maintain and test
- Can add TypeScript props for animation parameters

**Implementation:**
```svelte
<!-- ScrollAnimate.svelte -->
<script lang="ts">
  interface Props {
    delay?: number;
    offset?: number | 'text' | 'visual';
    duration?: number;
    scale?: number;
    children: import('svelte').Snippet;
  }
  
  let { delay = 0, offset = 40, duration = 500, scale = 0.98, children }: Props = $props();
  
  // Animation logic here
</script>

<div class="scroll-animate" style="--scroll-animate-delay: {delay}ms; ...">
  {@render children()}
</div>

<style>
  /* Animation styles moved from app.css */
</style>
```

**Alternative:** Keep as utility class but move to component-specific CSS file if used in single component.

### Solution 2: Move `.wrap` to `Footer.svelte`

**Approach:**
1. Move `.wrap` styles to `Footer.svelte` component
2. Rename to `.footer-wrap` or similar for clarity
3. Remove from `app.css`

**Benefits:**
- Component-specific styles live with component
- No global CSS pollution
- Clearer intent

### Solution 3: Componentize `.skip-link` as `SkipLink.svelte`

**Approach:**
1. Create `SkipLink.svelte` component
2. Move styles from `app.css` to component
3. Update `+layout.svelte` to use component

**Benefits:**
- Reusable accessibility component
- Better encapsulation
- Can add props for customization (target ID, text, etc.)

**Implementation:**
```svelte
<!-- SkipLink.svelte -->
<script lang="ts">
  interface Props {
    targetId?: string;
    text?: string;
  }
  
  let { targetId = 'main-content', text = 'Saltar al contenido principal' }: Props = $props();
</script>

<a href="#{targetId}" class="skip-link">
  {text}
</a>

<style>
  .skip-link {
    /* Styles from app.css */
  }
</style>
```

### Solution 4: Handle `body.nav-open` with Svelte Action

**Approach:**
1. Create `preventScroll` action in `Header.svelte` or utility file
2. Apply action to body element when menu opens
3. Remove global CSS class

**Benefits:**
- More Svelte-idiomatic
- Better encapsulation
- Can be reused elsewhere if needed

**Implementation:**
```svelte
<!-- Header.svelte -->
<script lang="ts">
  function preventScroll(node: HTMLElement) {
    node.style.overflow = 'hidden';
    return {
      destroy() {
        node.style.overflow = '';
      }
    };
  }
  
  $effect(() => {
    if (isMenuOpen) {
      document.body.use(preventScroll);
    }
  });
</script>
```

## Acceptance Criteria
- [ ] `.scroll-animate` either componentized or moved to appropriate component files
- [ ] `.wrap` moved to `Footer.svelte` with component-specific name
- [ ] `.skip-link` componentized as `SkipLink.svelte`
- [ ] `body.nav-open` handled with Svelte action or component state
- [ ] All visual behavior maintained
- [ ] No breaking changes to component APIs
- [ ] svelte-check passes with no errors
- [ ] Manual testing confirms all animations and interactions work correctly

## Implementation Steps

### Phase 1: Category Classes
1. Review `CategorySelector.svelte` usage of category classes
2. Move `.category-color`, `.category-border`, `.category-text` to component
3. Replace category modifier classes with inline `style` attributes
4. Update `toCategoryClass()` function or remove if no longer needed
5. Remove category classes from `app.css`
6. Test category selector functionality

### Phase 2: Scroll Animation
1. Decide on approach: componentize or keep as utility
2. If componentizing:
   - Create `ScrollAnimate.svelte` component
   - Move animation CSS from `app.css` to component
   - Update all 7 section components to use new component
3. If keeping as utility:
   - Move CSS to shared utility CSS file or keep in `app.css` if truly global
4. Test scroll animations in all sections

### Phase 2: Layout Utilities
1. Move `.wrap` styles to `Footer.svelte`
2. Rename class to component-specific name (e.g., `.footer-wrap`)
3. Remove from `app.css`
4. Test footer layout

### Phase 3: Skip Link
1. Create `SkipLink.svelte` component
2. Move styles from `app.css` to component
3. Update `+layout.svelte` to use component
4. Test skip link functionality (keyboard navigation)

### Phase 4: Body Class Management
1. Create `preventScroll` action or handle in `Header` component
2. Replace `body.classList.toggle('nav-open')` with action
3. Remove `body.nav-open` from `app.css`
4. Test mobile menu scroll prevention

### Phase 5: Verification
1. Run `svelte-check` to verify no errors
2. Manually test all affected components
3. Verify animations work correctly
4. Test responsive behavior
5. Check accessibility features (skip link, keyboard navigation)
6. Review remaining classes in `app.css` for any other refactoring opportunities

## Related Files
- `fe/src/app.css` - Contains all classes to be refactored
- `fe/src/lib/components/sections/Location.svelte` - Uses scroll-animate (6 instances)
- `fe/src/lib/components/sections/Intro.svelte` - Uses scroll-animate (6 instances)
- `fe/src/lib/components/sections/ContactSection.svelte` - Uses scroll-animate (4 instances)
- `fe/src/lib/components/sections/Equipment.svelte` - Uses scroll-animate (4 instances)
- `fe/src/lib/components/sections/Interior.svelte` - Uses scroll-animate (10 instances)
- `fe/src/lib/components/sections/Hero.svelte` - Uses scroll-animate (2 instances)
- `fe/src/lib/components/sections/FloorPlans.svelte` - Uses scroll-animate (4 instances)
- `fe/src/lib/components/layout/Footer.svelte` - Uses `.wrap` class
- `fe/src/lib/components/layout/Header.svelte` - Manages `body.nav-open` class
- `fe/src/routes/+layout.svelte` - Uses `.skip-link` class

## Estimated Effort
3-5 hours (reduced after category classes removed in #015)

## Dependencies
- **Ticket #015** - Must be completed first (removes category classes)

## Status
**Pending** - Not started

## Notes
- This refactoring improves component encapsulation and reduces global CSS
- `.scroll-animate` is the most complex case due to extensive usage (36 instances across 7 components)
- Consider whether `scroll-animate` should be a component or remain a utility class based on project patterns
- Layout utilities (`.wrap`, `.skip-link`) are single-use and should definitely be componentized
- Category classes were removed in ticket #015, so they are no longer part of this refactoring

