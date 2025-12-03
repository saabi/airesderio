# Ticket #017: Decouple Header Component from document.body

## Priority
**Medium** - Code Quality, Architecture

## Type
Refactoring, State Management

## Description
The `Header` component currently directly manipulates `document.body.classList` to prevent scrolling when the mobile menu is open. This creates tight coupling between the component and the global DOM, making the code less maintainable and harder to test. We should decouple this by using a Svelte store to manage menu state, similar to how the `theme` store manages theme state.

## Current State
- **Location:** `fe/src/lib/components/layout/Header.svelte:48-55`
- **Pattern:** Direct `$effect` that manipulates `document.body.classList`
- **CSS:** `:global(body.nav-open)` rule in `Header.svelte:570-572`

```svelte
// Current implementation
$effect(() => {
	if (isMenuOpen) {
		document.body.classList.add('nav-open');
	} else {
		document.body.classList.remove('nav-open');
	}
});
```

**Issues:**
- Header component has direct side effects on global DOM
- Hard to test (requires full DOM environment)
- Not reusable if other components need menu state
- Violates separation of concerns

## Proposed Solution

### Create Menu Store
Create a Svelte store (`fe/src/lib/stores/menu.ts`) that:
1. Manages menu open/closed state
2. Automatically applies/removes `nav-open` class on `document.body` when state changes
3. Provides methods: `open()`, `close()`, `toggle()`, and `cleanup()`
4. Follows the same pattern as `theme` store for consistency

### Benefits
- **Decoupling:** Header component no longer directly manipulates `document.body`
- **Testability:** Store can be tested independently
- **Reusability:** Other components can access menu state if needed
- **Consistency:** Follows the same pattern as `theme` store
- **Maintainability:** Centralized menu state management

### Implementation Steps

1. **Create Menu Store:**
   - Create `fe/src/lib/stores/menu.ts`
   - Implement store with `subscribe`, `open()`, `close()`, `toggle()`, and `cleanup()` methods
   - Add automatic `document.body.classList` management in the store
   - Export store instance

2. **Update Stores Index:**
   - Add `menuStore` export to `fe/src/lib/stores/index.ts`

3. **Refactor Header Component:**
   - Remove local `isMenuOpen` state
   - Remove `$effect` that manipulates `document.body`
   - Import and use `menuStore` instead
   - Update all references to `isMenuOpen` to use `menuStore.isOpen` or `$menuStore`
   - Update `toggleMenu()` to call `menuStore.toggle()`
   - Update `handleNavClick()` to call `menuStore.close()`

4. **Update CSS:**
   - Keep `:global(body.nav-open)` CSS in `Header.svelte` (it's still needed for styling)
   - The store will manage the class, CSS just styles it

5. **Cleanup:**
   - Add `cleanup()` call in `Header.svelte` `onDestroy` if needed (or handle in store lifecycle)

6. **Testing:**
   - Run `svelte-check` to verify no errors
   - Manually test mobile menu open/close
   - Verify body scroll is prevented when menu is open
   - Verify body scroll is restored when menu is closed

## Acceptance Criteria
- [ ] Menu store created following the same pattern as `theme` store
- [ ] Header component no longer directly manipulates `document.body`
- [ ] Menu state is managed through the store
- [ ] All menu functionality works as before (open, close, toggle)
- [ ] Body scroll prevention works correctly
- [ ] `svelte-check` passes with no errors
- [ ] Manual testing confirms mobile menu behavior is unchanged
- [ ] Store is exported from `fe/src/lib/stores/index.ts`

## Related Files
- `fe/src/lib/components/layout/Header.svelte` - Component to refactor
- `fe/src/lib/stores/theme.ts` - Reference implementation for store pattern
- `fe/src/lib/stores/index.ts` - Store exports
- `fe/src/lib/stores/menu.ts` - New store file to create

## Estimated Effort
1-2 hours

## Dependencies
None

## Blocks
None

## Status
**Complete** ✅ - Header component has been decoupled from `document.body` using a Svelte store (`menuStore`). The store manages the menu's open state and applies the `nav-open` class to `document.body` via a subscription. The `Header.svelte` component now uses `menuStore.toggle()`, `menuStore.open()`, and `menuStore.close()` methods instead of directly manipulating the DOM. The store is initialized in `+layout.svelte` and cleaned up on destroy.

## Notes
- This refactoring improves code quality and maintainability
- The store pattern is already established in the codebase with `theme` store
- The CSS rule `:global(body.nav-open)` should remain in `Header.svelte` as it's component-specific styling
- The store will handle the DOM manipulation, making it easier to test and reason about

