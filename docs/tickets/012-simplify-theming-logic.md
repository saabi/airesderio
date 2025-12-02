# Ticket #012: Simplify Theming Logic

## Priority
**Medium** - Code Quality, Refactoring

## Type
Refactoring, Code Simplification

## Description
The current theming system has redundant logic split between `$lib/utils/theme.ts` (utility functions) and `$lib/stores/theme.ts` (Svelte store). The store wraps the utilities but duplicates some functionality (e.g., system preference watching, DOM observation). This creates unnecessary complexity and maintenance burden.

The theming logic can be greatly simplified by consolidating all functionality into the store and removing most of the legacy utility functions.

## Current State

### Utility Functions (`$lib/utils/theme.ts`)
- `resolveInitialTheme()` - Resolves theme from localStorage or system preference
- `applyTheme()` - Applies theme to DOM
- `setTheme()` - Sets theme in localStorage and applies to DOM
- `clearThemePreference()` - Clears localStorage and applies system preference
- `startThemeObserver()` - Watches system preference changes

### Store (`$lib/stores/theme.ts`)
- Wraps utility functions
- Duplicates system preference watching logic
- Adds DOM MutationObserver for sync
- Provides `subscribe`, `set`, `toggle`, `clear`, `cleanup` methods

### Usage Issues
- `Header.svelte` still uses utility functions directly (`resolveInitialTheme`, `setTheme`)
- Store and utilities have overlapping responsibilities
- Redundant system preference watching in both store and utilities

## Proposed Solution

### Consolidate into Store
1. **Move all logic into the store** - The store should be the single source of truth
2. **Remove utility functions** - Keep only `Theme` type export from `theme.ts`
3. **Simplify store implementation** - Remove wrapper functions, implement directly
4. **Update all usages** - Migrate `Header.svelte` and any other components to use store only

### Simplified Store Structure
```typescript
// All logic in store:
- Initialize from localStorage or system preference
- Watch system preference changes (only when no user preference)
- Apply theme to DOM automatically
- Manage localStorage
- Provide reactive interface
```

### Benefits
- Single source of truth for theme logic
- Reduced code duplication
- Easier to maintain and test
- Better alignment with Svelte patterns
- Simpler API (just use `$theme` store)

## Acceptance Criteria
- [ ] All theme logic consolidated into store
- [ ] Utility functions removed (except `Theme` type export)
- [ ] `Header.svelte` updated to use store instead of utilities
- [ ] All components use store exclusively
- [ ] System preference watching works correctly
- [ ] localStorage persistence works correctly
- [ ] DOM theme application works correctly
- [ ] Tests updated to test store instead of utilities
- [ ] No breaking changes to component APIs
- [ ] svelte-check passes with no errors

## Implementation Steps
1. Review current usage of theme utilities across codebase
2. Consolidate all logic into `$lib/stores/theme.ts`
3. Remove utility functions from `$lib/utils/theme.ts` (keep only type export)
4. Update `Header.svelte` to use store instead of utilities
5. Update any other components using utilities directly
6. Update tests to test store functionality
7. Remove `startThemeObserver` usage from `+layout.svelte` (if still present)
8. Verify all theme functionality works correctly
9. Run svelte-check and fix any issues
10. Update documentation if needed

## Related Files
- `fe/src/lib/utils/theme.ts` - Legacy utility functions (to be simplified)
- `fe/src/lib/stores/theme.ts` - Theme store (to be enhanced)
- `fe/src/lib/components/layout/Header.svelte` - Uses utilities directly (needs update)
- `fe/src/routes/+layout.svelte` - May use utilities (needs review)
- `fe/src/lib/utils/theme.test.ts` - Tests (need update)

## Estimated Effort
2-4 hours

## Dependencies
None

## Notes
- The store already has most of the functionality, just needs to be self-contained
- Consider keeping `Theme` type export for backwards compatibility
- May need to update tests to work with store instead of individual functions
- This is a good opportunity to improve test coverage of the store

