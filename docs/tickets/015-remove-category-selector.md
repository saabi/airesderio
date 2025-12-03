# Ticket #015: Remove CategorySelector Component and Related Code

## Priority
**High** - Code Cleanup, Must be done before CSS refactoring tickets

## Type
Code Removal, Cleanup

## Description
The `CategorySelector` component is no longer needed and should be removed along with all related code, CSS classes, props, state, and functionality. This cleanup should be completed before working on CSS refactoring tickets (#014) that reference category-related classes.

## Current State

### Component to Remove
- **File:** `fe/src/lib/components/features/CategorySelector.svelte`
- **Status:** Imported in `Location.svelte` but appears to not be rendered in template

### Related Code to Remove

#### 1. Component File
- `fe/src/lib/components/features/CategorySelector.svelte` - Entire component file

#### 2. Imports
- `Location.svelte:3` - `import CategorySelector from '$lib/components/features/CategorySelector.svelte';`

#### 3. Props and State in Location.svelte
- `categoryFilter?: string[]` - Prop (line 15)
- `categoryFilter = []` - State initialization (line 38)
- `hasInitializedCategoryFilter` - State variable (line 49)
- Category filter logic and functions:
  - `toggleCategory()` function (line 261)
  - `setCategoryFilter()` function (line 269)
  - Category filter initialization effect (line 307-316)
  - Category filter usage in marker filtering logic (line 188)

#### 4. CSS Classes in app.css
- `.category-color` (line 245-247)
- `.category-border` (line 249-251)
- `.category-text` (line 253-255)
- `.category-edificio-principal` (line 257-259)
- `.category-transporte` (line 261-263)
- `.category-cultura-entretenimiento` (line 265-267)
- `.category-infraestructura` (line 269-271)
- `.category-lugares-historicos` (line 273-275)
- `.category-parques-recreacion` (line 277-279)
- `.category-museos` (line 281-283)
- `.category-gastronomia` (line 285-287)
- `.category-supermercados` (line 289-291)
- `.category-servicios` (line 293-295)
- `.category-vida-nocturna` (line 297-299)

#### 5. CSS Variables (Keep These)
- Category color CSS variables (`--category-edificio-principal`, etc.) should be **kept** as they are used for marker styling in Google Maps
- These are defined in `:root` and `:root[data-theme='dark']` blocks (lines 137-147, 219-229)

#### 6. Related Functions
- `toCategoryClass()` function in `CategorySelector.svelte` (line 20-21)
- Any category filtering logic that depends on user selection

### Usage Analysis
- **CategorySelector component:** Imported but not rendered (likely removed from template previously)
- **Category CSS classes:** Only used in `CategorySelector.svelte` (which will be deleted)
- **Category CSS variables:** Used in `Location.svelte` for marker styling (should be kept)
- **Category filter state:** Used in `Location.svelte` for filtering markers (should be removed)

## Proposed Solution

### Step 1: Remove Component and Import
1. Delete `fe/src/lib/components/features/CategorySelector.svelte`
2. Remove import from `Location.svelte`

### Step 2: Remove Category Filter Functionality
1. Remove `categoryFilter` prop from `Location.svelte` Props interface
2. Remove `categoryFilter` state variable
3. Remove `hasInitializedCategoryFilter` state variable
4. Remove `toggleCategory()` function
5. Remove `setCategoryFilter()` function
6. Remove category filter initialization effect
7. Update marker filtering logic to show all markers (remove category filter dependency)

### Step 3: Remove Category CSS Classes
1. Remove `.category-color`, `.category-border`, `.category-text` from `app.css`
2. Remove all `.category-*` modifier classes (11 classes total)
3. **Keep** category color CSS variables (`--category-*`) as they're used for marker colors

### Step 4: Update Related Tickets
1. Update ticket #014 to remove references to category classes
2. Update ticket #010 if it still references CategorySelector

### Step 5: Clean Up Unused Code
1. Remove any unused category-related functions or utilities
2. Remove unused props or state related to category selection
3. Verify no other components reference CategorySelector

## Acceptance Criteria
- [ ] `CategorySelector.svelte` component file deleted
- [ ] Import removed from `Location.svelte`
- [ ] `categoryFilter` prop removed from `Location.svelte`
- [ ] `categoryFilter` state removed from `Location.svelte`
- [ ] `hasInitializedCategoryFilter` state removed
- [ ] `toggleCategory()` function removed
- [ ] `setCategoryFilter()` function removed
- [ ] Category filter initialization effect removed
- [ ] Marker filtering logic updated to show all markers
- [ ] Category utility classes (`.category-color`, `.category-border`, `.category-text`) removed from `app.css`
- [ ] Category modifier classes (`.category-*`) removed from `app.css`
- [ ] Category color CSS variables (`--category-*`) **kept** in `app.css`
- [ ] Ticket #014 updated to remove category class references
- [ ] Ticket #010 updated if needed
- [ ] All markers display correctly (no filtering)
- [ ] No broken imports or references
- [ ] svelte-check passes with no errors
- [ ] Manual testing confirms map displays all markers

## Implementation Steps

### Phase 1: Remove Component
1. Delete `fe/src/lib/components/features/CategorySelector.svelte`
2. Remove import statement from `Location.svelte`
3. Verify no other files import CategorySelector

### Phase 2: Remove Category Filter Logic
1. Remove `categoryFilter` from Props interface in `Location.svelte`
2. Remove `categoryFilter` state variable initialization
3. Remove `hasInitializedCategoryFilter` state variable
4. Remove `toggleCategory()` function
5. Remove `setCategoryFilter()` function
6. Remove category filter initialization `$effect`
7. Update marker filtering logic:
   - Remove `categoryFilter` dependency
   - Show all markers regardless of category
   - Simplify marker generation logic

### Phase 3: Remove CSS Classes
1. Remove `.category-color` class from `app.css`
2. Remove `.category-border` class from `app.css`
3. Remove `.category-text` class from `app.css`
4. Remove all 11 `.category-*` modifier classes from `app.css`
5. **Verify** category color CSS variables remain (they're used for marker colors)

### Phase 4: Update Related Tickets
1. Read ticket #014 (`docs/tickets/014-refactor-app-css-classes.md`)
2. Remove sections about category classes (Solution 1, Phase 1)
3. Update acceptance criteria to remove category-related items
4. Update related files list
5. Update ticket #010 if it references CategorySelector
6. Commit ticket updates

### Phase 5: Verification
1. Run `svelte-check` to verify no errors
2. Build application to verify no broken imports
3. Manually test Location section:
   - Verify all markers display on map
   - Verify no console errors
   - Verify map interactions work correctly
4. Check that category colors still work for markers (CSS variables)

## Related Files
- `fe/src/lib/components/features/CategorySelector.svelte` - **To be deleted**
- `fe/src/lib/components/sections/Location.svelte` - Remove imports, props, state, and functions
- `fe/src/app.css` - Remove category utility and modifier classes (keep CSS variables)
- `docs/tickets/014-refactor-app-css-classes.md` - **To be updated** (remove category class sections)
- `docs/tickets/010-reorganize-components.md` - **To be checked** (may reference CategorySelector)

## Dependencies
None - This should be done **before** ticket #014

## Blocks
- **Ticket #014** - Should be updated after this ticket is complete

## Estimated Effort
1-2 hours

## Status
**Complete** ✅ - CategorySelector component and all related code have been removed. Category CSS classes removed from app.css. Category color CSS variables kept for marker styling. All markers now display when showPlaceMarkers is true.

## Notes
- Category color CSS variables (`--category-*`) must be **kept** as they are used for styling Google Maps markers
- Only the utility classes (`.category-color`, `.category-border`, `.category-text`) and modifier classes (`.category-*`) should be removed
- This cleanup simplifies the codebase and removes unused functionality
- After completion, ticket #014 can be updated to remove category-related refactoring tasks

