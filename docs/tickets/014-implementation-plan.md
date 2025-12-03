# Ticket #014: Detailed Implementation Plan

## Overview
This document provides a step-by-step implementation plan for refactoring utility classes from `app.css` into components. The plan is organized by priority and complexity, with detailed steps for each refactoring task.

## Prerequisites
- ✅ Ticket #015 completed (category classes removed)
- Understanding of Svelte 5 runes (`$state`, `$derived`, `$props`, `$effect`)
- Understanding of Svelte actions and snippets

## Implementation Order

The refactoring will be done in this order (from simplest to most complex):
1. **`.wrap` → Footer component** (Simplest - single usage)
2. **`.skip-link` → SkipLink component** (Simple - single usage, reusable)
3. **`body.nav-open` → Svelte action** (Simple - single usage, better pattern)

**Note:** The `.scroll-animate` class has been moved to a separate ticket (#016) due to its complexity (36 instances across 7 components).

---

## Phase 1: Refactor `.wrap` Class → Footer Component

### Current State
- **Location:** `fe/src/app.css:299-303`
- **Usage:** Single usage in `Footer.svelte:38`
- **Complexity:** ⭐ Simple

### Implementation Steps

#### Step 1.1: Move CSS to Footer Component
1. Open `fe/src/lib/components/layout/Footer.svelte`
2. Locate the `<style>` block
3. Add new CSS rule:
   ```css
   .footer-wrap {
       max-width: var(--max);
       margin: auto;
       padding: 0 clamp(0.875rem, 3vw, 1.5rem);
   }
   ```

#### Step 1.2: Update Footer Template
1. Find `<div class="wrap">` in Footer.svelte (line 38)
2. Replace with `<div class="footer-wrap">`
3. Verify the change

#### Step 1.3: Remove from app.css
1. Open `fe/src/app.css`
2. Locate `.wrap` class (around line 299)
3. Remove the entire rule:
   ```css
   .wrap {
       max-width: var(--max);
       margin: auto;
       padding: 0 clamp(0.875rem, 3vw, 1.5rem)
   }
   ```

#### Step 1.4: Verification
1. Run `svelte-check` - should pass
2. Build application - should succeed
3. Manually test footer:
   - Verify footer content is centered
   - Verify max-width constraint works
   - Verify responsive padding works
   - Test on mobile and desktop viewports

### Expected Outcome
- `.wrap` class removed from `app.css`
- `.footer-wrap` class added to `Footer.svelte`
- Footer layout unchanged visually
- No breaking changes

### Files Modified
- `fe/src/lib/components/layout/Footer.svelte`
- `fe/src/app.css`

### Estimated Time
15-20 minutes

---

## Phase 2: Componentize `.skip-link` → SkipLink Component

### Current State
- **Location:** `fe/src/app.css:312-326`
- **Usage:** Single usage in `+layout.svelte:30`
- **Complexity:** ⭐ Simple

### Implementation Steps

#### Step 2.1: Create SkipLink Component
1. Create new file: `fe/src/lib/components/ui/SkipLink.svelte`
2. Add component structure:
   ```svelte
   <script module lang="ts">
       // ===== TYPES =====
       interface Props {
           targetId?: string;
           text?: string;
       }
   </script>
   
   <script lang="ts">
       // ===== PROPS =====
       let {
           targetId = 'main-content',
           text = 'Saltar al contenido principal'
       }: Props = $props();
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

#### Step 2.2: Move CSS Styles
1. Copy CSS from `app.css:312-326`:
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
2. Paste into `<style>` block of `SkipLink.svelte`
3. Verify styles are complete

#### Step 2.3: Update Layout File
1. Open `fe/src/routes/+layout.svelte`
2. Add import at top of `<script module>`:
   ```typescript
   import SkipLink from '$lib/components/ui/SkipLink.svelte';
   ```
3. Replace:
   ```svelte
   <a href="#main-content" class="skip-link">Saltar al contenido principal</a>
   ```
   with:
   ```svelte
   <SkipLink />
   ```

#### Step 2.4: Remove from app.css
1. Open `fe/src/app.css`
2. Locate `.skip-link` class (around line 312)
3. Remove both rules:
   ```css
   .skip-link { ... }
   .skip-link:focus { ... }
   ```

#### Step 2.5: Verification
1. Run `svelte-check` - should pass
2. Build application - should succeed
3. Manually test skip link:
   - Press Tab key on page load
   - Verify skip link appears at top
   - Press Enter to activate
   - Verify page scrolls to main content
   - Test keyboard navigation flow

### Expected Outcome
- `SkipLink.svelte` component created
- `.skip-link` classes removed from `app.css`
- Layout uses new component
- Accessibility functionality unchanged
- Component is reusable with customizable props

### Files Created
- `fe/src/lib/components/ui/SkipLink.svelte`

### Files Modified
- `fe/src/routes/+layout.svelte`
- `fe/src/app.css`

### Estimated Time
20-30 minutes

---

## Phase 3: Replace `body.nav-open` with Svelte Action

### Current State
- **Location:** `fe/src/app.css:307-309`
- **Usage:** `Header.svelte:51, 53` - toggles class on `document.body`
- **Complexity:** ⭐ Simple

### Implementation Steps

#### Step 3.1: Create preventScroll Action
1. Open `fe/src/lib/components/layout/Header.svelte`
2. Locate the `<script lang="ts">` block
3. Add action function before the `$effect` block:
   ```typescript
   // ===== ACTIONS =====
   function preventScroll(node: HTMLElement) {
       node.style.overflow = 'hidden';
       return {
           destroy() {
               node.style.overflow = '';
           }
       };
   }
   ```

#### Step 3.2: Update Effect to Use Action
1. Find the `$effect` block that toggles `nav-open` class (around line 49-55)
2. Replace with:
   ```typescript
   $effect(() => {
       if (!browser) return;
       
       if (isMenuOpen) {
           document.body.style.overflow = 'hidden';
       } else {
           document.body.style.overflow = '';
       }
   });
   ```
   
   **Note:** We're using direct style manipulation instead of action because `document.body` is not a Svelte component node. Actions work on component nodes, but we can directly manipulate body styles.

#### Step 3.3: Remove CSS Class
1. Open `fe/src/app.css`
2. Locate `body.nav-open` rule (around line 307)
3. Remove:
   ```css
   body.nav-open {
       overflow: hidden;
   }
   ```

#### Step 3.4: Clean Up (if action not used)
1. If we used direct style manipulation (as recommended above), remove the `preventScroll` action function
2. If we want to keep it for potential future use, leave it commented

#### Step 3.5: Verification
1. Run `svelte-check` - should pass
2. Build application - should succeed
3. Manually test mobile menu:
   - Open site on mobile viewport (or resize browser)
   - Click hamburger menu to open
   - Verify body scroll is disabled (can't scroll page)
   - Click menu items or close button
   - Verify body scroll is re-enabled
   - Test multiple open/close cycles

### Expected Outcome
- `body.nav-open` class removed from `app.css`
- Body scroll prevention handled via `$effect` in Header
- Mobile menu behavior unchanged
- More Svelte-idiomatic approach

### Files Modified
- `fe/src/lib/components/layout/Header.svelte`
- `fe/src/app.css`

### Estimated Time
15-20 minutes

---

**Note:** The `.scroll-animate` class refactoring has been moved to ticket #016 due to its complexity (36 instances across 7 components). See `016-refactor-scroll-animate.md` for details.

---

## Phase 4: Final Verification

### Step 5.1: Code Quality Checks
1. Run `svelte-check` - must pass with 0 errors
2. Run `npm run build` - must succeed
3. Run `npm run lint` - fix any issues
4. Review all modified files for consistency

### Step 5.2: Visual Testing
1. Test footer layout (`.wrap` → `.footer-wrap`)
2. Test skip link functionality (keyboard navigation)
3. Test mobile menu scroll prevention
4. Test all scroll animations in sections:
   - Hero section
   - Intro section
   - Location section
   - Interior section
   - Equipment section
   - FloorPlans section
   - ContactSection

### Step 5.3: Responsive Testing
1. Test on mobile viewport (< 640px)
2. Test on tablet viewport (640px - 850px)
3. Test on desktop viewport (> 850px)
4. Verify all animations work at each breakpoint

### Step 5.4: Accessibility Testing
1. Test skip link with keyboard only
2. Test with screen reader (if available)
3. Verify focus indicators still work
4. Test with `prefers-reduced-motion` enabled

### Step 5.5: Performance Check
1. Check bundle size (should be similar or smaller)
2. Verify no console errors
3. Check animation performance (should be smooth)

---

## Testing Checklist

### Footer (`.wrap` → `.footer-wrap`)
- [ ] Footer content is centered
- [ ] Max-width constraint works correctly
- [ ] Responsive padding works on all viewports
- [ ] Footer layout matches previous design

### Skip Link (Componentized)
- [ ] Skip link appears on Tab key press
- [ ] Skip link navigates to main content
- [ ] Skip link styles match previous design
- [ ] Component props work (targetId, text)

### Mobile Menu (body.nav-open → effect)
- [ ] Body scroll disabled when menu opens
- [ ] Body scroll enabled when menu closes
- [ ] Multiple open/close cycles work
- [ ] No visual glitches

### Scroll Animations
- [ ] Note: Scroll animations are tracked in ticket #016
- [ ] Verify animations still work (they should, as CSS remains in app.css)

---

## Rollback Plan

If issues are discovered:

1. **For `.wrap` refactoring:**
   - Revert Footer.svelte changes
   - Restore `.wrap` in app.css

2. **For `.skip-link` refactoring:**
   - Revert +layout.svelte changes
   - Restore `.skip-link` in app.css
   - Delete SkipLink.svelte

3. **For `body.nav-open` refactoring:**
   - Revert Header.svelte changes
   - Restore `body.nav-open` in app.css

4. **For scroll-animate refactoring:**
   - See ticket #016 for rollback procedures

---

## Success Criteria

- [ ] All utility classes refactored or documented
- [ ] No visual regressions
- [ ] All animations work correctly
- [ ] All accessibility features work
- [ ] svelte-check passes
- [ ] Build succeeds
- [ ] No console errors
- [ ] Performance maintained or improved
- [ ] Code is more maintainable

---

## Estimated Total Time

- Phase 1 (`.wrap`): 15-20 minutes
- Phase 2 (`.skip-link`): 20-30 minutes
- Phase 3 (`body.nav-open`): 15-20 minutes
- Phase 4 (Verification): 30-45 minutes

**Total: 1-2 hours**

---

## Notes

- Start with simpler refactorings (Phases 1-3) to build confidence
- Test thoroughly after each phase before moving to next
- Consider committing after each phase for easier rollback
- Document any deviations from this plan
- Scroll-animate refactoring is tracked in ticket #016

