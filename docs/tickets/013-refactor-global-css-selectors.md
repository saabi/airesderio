# Ticket #013: Refactor Unnecessary :global CSS Selectors

## Priority
**Medium** - Code Quality, Refactoring

## Type
Refactoring, CSS Architecture

## Description
Several components use `:global()` CSS selectors to style elements that could be styled using scoped selectors instead. While `:global()` is necessary for some cases (theme selectors, Google Maps generated HTML), some uses can be refactored to improve component encapsulation and maintainability.

This ticket focuses on refactoring `:global` selectors that target component classes or child components, which can be replaced with proper scoped selectors or component props.

## Current State

### Refactorable Uses

#### 1. `:global(.location-map)` in `Location.svelte`
**Location:** `fe/src/lib/components/sections/Location.svelte:882`

```css
:global(.location-map) {
  min-height: 25rem;
  overflow: hidden;
  background: var(--color-bg-contrast);
  border-radius: 0.5rem;
}
```

**Current Usage:**
- `Location.svelte` passes `class="location-map"` to `Map` component
- Styles are defined in `Location.svelte` using `:global()` to escape scoping
- This breaks component encapsulation

**Problem:**
- Styles for `Map` component are defined in parent component
- Requires `:global()` to bypass Svelte's CSS scoping
- Creates tight coupling between `Location` and `Map` components
- Makes it harder to reuse `Map` component elsewhere

#### 2. `:global(.country-select.select-input)` in `PhoneNumberInput.svelte`
**Location:** `fe/src/lib/components/forms/PhoneNumberInput.svelte:389`

```css
:global(.country-select.select-input) {
  width: auto !important;
  flex: 0 0 auto;
  min-width: 140px;
  max-width: 200px;
}
```

**Current Usage:**
- `PhoneNumberInput` uses `Select` component with `class="country-select"`
- Styles override `Select` component's default width using `!important`
- Requires `:global()` to target child component

**Problem:**
- Uses `!important` which is a code smell
- Tight coupling between `PhoneNumberInput` and `Select` internals
- Hard to maintain if `Select` component changes

## Proposed Solution

### Solution 1: Move `.location-map` styles to `Map.svelte`

**Approach:**
1. Move the `.location-map` styles from `Location.svelte` to `Map.svelte`
2. Apply styles directly to the root element of `Map` component
3. Remove `class="location-map"` prop from `Location.svelte`
4. If different styling is needed for different contexts, use a `variant` prop

**Benefits:**
- Better component encapsulation
- Styles live with the component they style
- Easier to maintain and understand
- No need for `:global()`

**Implementation:**
```svelte
<!-- Map.svelte -->
<div class="map" class:location-map={variant === 'location'}>
  <!-- map content -->
</div>

<style>
  .map {
    /* base styles */
  }
  
  .location-map {
    min-height: 25rem;
    overflow: hidden;
    background: var(--color-bg-contrast);
    border-radius: 0.5rem;
  }
</style>
```

### Solution 2: Add style props to `Select` component

**Approach:**
1. Add `width` or `size` prop to `Select` component
2. Use CSS custom properties or conditional classes
3. Remove `!important` and `:global()` from `PhoneNumberInput`

**Benefits:**
- No `!important` needed
- Better component API
- More flexible and reusable
- Proper component encapsulation

**Implementation:**
```svelte
<!-- Select.svelte -->
<select class="select-input" class:auto-width={width === 'auto'}>
  <!-- options -->
</select>

<style>
  .select-input.auto-width {
    width: auto;
    flex: 0 0 auto;
    min-width: 140px;
    max-width: 200px;
  }
</style>
```

## Acceptance Criteria
- [ ] `:global(.location-map)` removed from `Location.svelte`
- [ ] Styles moved to `Map.svelte` or handled via props
- [ ] `:global(.country-select.select-input)` removed from `PhoneNumberInput.svelte`
- [ ] `Select` component supports width customization via props
- [ ] No `!important` flags in CSS (unless absolutely necessary)
- [ ] All components maintain their visual appearance
- [ ] No breaking changes to component APIs
- [ ] svelte-check passes with no errors
- [ ] Manual testing confirms all styles work correctly

## Implementation Steps

### Phase 1: Refactor `Map` component styles
1. Review `Map.svelte` component structure
2. Move `.location-map` styles from `Location.svelte` to `Map.svelte`
3. Determine if `variant` prop is needed or if styles should be default
4. Update `Location.svelte` to remove `class="location-map"` prop
5. Remove `:global(.location-map)` selector from `Location.svelte`
6. Test that map displays correctly in `Location` section

### Phase 2: Refactor `Select` component styles
1. Review `Select.svelte` component API
2. Add `width` or `size` prop to `Select` component
3. Implement conditional styling based on prop
4. Update `PhoneNumberInput.svelte` to use new prop instead of class
5. Remove `:global(.country-select.select-input)` selector
6. Remove `!important` flag
7. Test that phone number input displays correctly

### Phase 3: Verification
1. Run `svelte-check` to verify no errors
2. Manually test all affected components
3. Verify responsive behavior still works
4. Check dark mode compatibility
5. Review CSS for any remaining unnecessary `:global()` uses

## Related Files
- `fe/src/lib/components/sections/Location.svelte` - Contains `:global(.location-map)`
- `fe/src/lib/components/features/Map.svelte` - Target component for style migration
- `fe/src/lib/components/forms/PhoneNumberInput.svelte` - Contains `:global(.country-select.select-input)`
- `fe/src/lib/components/forms/Select.svelte` - Target component for API enhancement

## Non-Refactorable Uses (For Reference)

The following `:global()` uses are **necessary** and should **not** be refactored:

### Theme Selectors
- `:global(:root[data-theme='dark'])` - Required to target `:root` element
- Used in: `Header.svelte`, `Location.svelte`, `Select.svelte`
- **Reason:** `:root` is outside component scope

### Google Maps Generated HTML
- `:global(.info-window)`, `:global(.marker-*)`, etc. - Required for Google Maps API
- Used in: `Location.svelte` (~30 selectors)
- **Reason:** HTML is generated dynamically by Google Maps API outside Svelte's control

## Estimated Effort
2-3 hours

## Dependencies
None

## Status
**Pending** - Not started

## Notes
- This refactoring improves component encapsulation and maintainability
- Focus on cases where `:global()` is used to style child components, not external content
- Theme selectors and Google Maps styles are intentionally left as `:global()` and should not be changed

