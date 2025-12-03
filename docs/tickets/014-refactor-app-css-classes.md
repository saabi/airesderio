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

**Note:** The `.scroll-animate` class has been moved to a separate ticket (#016) due to its complexity and extensive usage (36 instances across 7 components).

#### 1. `.wrap` Class
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

#### 2. `.skip-link` Class
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

#### 3. `body.nav-open` Class
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

### Solution 1: Move `.wrap` to `Footer.svelte`

**Approach:**
1. Move `.wrap` styles to `Footer.svelte` component
2. Rename to `.footer-wrap` or similar for clarity
3. Remove from `app.css`

**Benefits:**
- Component-specific styles live with component
- No global CSS pollution
- Clearer intent

### Solution 2: Componentize `.skip-link` as `SkipLink.svelte`

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

### Solution 3: Handle `body.nav-open` with Svelte Action

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
- [ ] `.wrap` moved to `Footer.svelte` with component-specific name
- [ ] `.skip-link` componentized as `SkipLink.svelte`
- [ ] `body.nav-open` handled with Svelte action or component state
- [ ] All visual behavior maintained
- [ ] No breaking changes to component APIs
- [ ] svelte-check passes with no errors
- [ ] Manual testing confirms all animations and interactions work correctly

## Implementation Plan

A detailed step-by-step implementation plan is available in [`014-implementation-plan.md`](./014-implementation-plan.md). The plan includes:
- Detailed steps for each phase
- Code examples for each refactoring
- Testing checklists
- Rollback procedures
- Time estimates

## Implementation Steps

### Phase 1: Layout Utilities
1. Move `.wrap` styles to `Footer.svelte`
2. Rename class to component-specific name (e.g., `.footer-wrap`)
3. Remove from `app.css`
4. Test footer layout

### Phase 2: Skip Link
1. Create `SkipLink.svelte` component
2. Move styles from `app.css` to component
3. Update `+layout.svelte` to use component
4. Test skip link functionality (keyboard navigation)

### Phase 3: Body Class Management
1. Create `preventScroll` action or handle in `Header` component
2. Replace `body.classList.toggle('nav-open')` with action
3. Remove `body.nav-open` from `app.css`
4. Test mobile menu scroll prevention

### Phase 4: Verification
1. Run `svelte-check` to verify no errors
2. Manually test all affected components
3. Verify animations work correctly
4. Test responsive behavior
5. Check accessibility features (skip link, keyboard navigation)
6. Review remaining classes in `app.css` for any other refactoring opportunities

## Related Files
- `fe/src/app.css` - Contains all classes to be refactored
- `fe/src/lib/components/layout/Footer.svelte` - Uses `.wrap` class
- `fe/src/lib/components/layout/Header.svelte` - Manages `body.nav-open` class
- `fe/src/routes/+layout.svelte` - Uses `.skip-link` class

## Estimated Effort
1-2 hours (reduced after removing scroll-animate to separate ticket #016)

## Dependencies
- **Ticket #015** - Must be completed first (removes category classes)

## Related Tickets
- **Ticket #016** - Scroll animation refactoring (separate ticket for complex scroll-animate class)

## Status
**Pending** - Not started

## Notes
- This refactoring improves component encapsulation and reduces global CSS
- `.scroll-animate` has been moved to ticket #016 due to its complexity (36 instances across 7 components)
- Layout utilities (`.wrap`, `.skip-link`) are single-use and should definitely be componentized
- Category classes were removed in ticket #015, so they are no longer part of this refactoring

