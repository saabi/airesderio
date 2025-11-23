# Ticket #004: Remove Debug Code

## Priority
**Medium** - Code Quality

## Type
Code Cleanup, Maintenance

## Description
There are multiple `console.log` statements throughout the codebase that should be removed or conditionally disabled for production builds.

## Current State
Debug code found in:
- `Location.svelte`: Multiple console.log statements (lines 161, 170, 177, 243, 318, 393, 414, 423)
- `updatePlacePhotos.js`: Commented-out console.log (line 56)
- Debug comments like "// Debug categories loading"

## Proposed Solution
1. Remove or conditionally disable console.log statements
2. Use proper logging library for development (optional)
3. Configure ESLint rule to warn on console statements
4. Remove debug comments
5. Ensure dev color editor is only loaded in development

## Acceptance Criteria
- [x] All console.log statements removed or conditionally disabled
- [x] Debug comments removed
- [x] ESLint rule configured to warn on console statements
- [x] Dev color editor only loads in development mode
- [x] No debug code in production build
- [x] Application functionality unchanged

## Implementation Steps
1. Review all console.log statements
2. Remove unnecessary console.log statements
3. For useful debugging, use conditional logging:
   ```typescript
   if (import.meta.env.DEV) {
       console.log('Debug info');
   }
   ```
4. Remove debug comments
5. Update ESLint config to warn on console statements:
   ```javascript
   rules: {
       'no-console': ['warn', { allow: ['warn', 'error'] }]
   }
   ```
6. Verify dev color editor is only in dev mode (already implemented)

## Related Files
- `fe/src/lib/components/Location.svelte`
- `fe/scripts/updatePlacePhotos.js`
- `fe/eslint.config.js`

## Estimated Effort
1-2 hours

## Dependencies
None

## Notes
- Some console.log statements may be intentional for debugging
- Consider using a logging library like `debug` for better control
- Keep console.error and console.warn for actual errors/warnings

