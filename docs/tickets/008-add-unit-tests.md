# Ticket #008: Add Unit Tests

## Priority
**Medium** - Code Quality

## Type
Testing, Quality Assurance

## Description
The project has Vitest configured but no unit tests. Adding unit tests will improve code quality and prevent regressions.

## Current State
- Vitest is configured in `package.json`
- No unit tests exist
- Test script: `npm run test:unit`

## Proposed Solution
1. Write unit tests for utility functions
2. Write unit tests for component logic
3. Write unit tests for form validation
4. Set up test coverage reporting
5. Add tests to CI/CD pipeline

## Acceptance Criteria
- [ ] Unit tests for all utility functions
- [ ] Unit tests for form validation
- [ ] Unit tests for theme management
- [ ] Unit tests for phone validation
- [ ] Test coverage > 70%
- [ ] All tests pass
- [ ] Tests run in CI/CD

## Implementation Steps
1. Create test files:
   - `src/lib/utils/theme.test.ts`
   - `src/lib/utils/phoneValidator.test.ts`
   - `src/lib/utils/sectionVisibility.test.ts`
2. Write tests for utility functions
3. Write tests for form validation logic
4. Configure coverage reporting in Vitest
5. Add test coverage threshold
6. Update CI/CD to run tests

## Example Test Structure
```typescript
// theme.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resolveInitialTheme, setTheme, applyTheme } from './theme';

describe('theme utilities', () => {
    it('should resolve initial theme from localStorage', () => {
        // Test implementation
    });
    
    it('should apply theme to document', () => {
        // Test implementation
    });
});
```

## Related Files
- `fe/src/lib/utils/theme.ts`
- `fe/src/lib/utils/phoneValidator.ts`
- `fe/src/lib/utils/sectionVisibility.ts`
- `fe/vite.config.ts` (Vitest config)

## Estimated Effort
6-8 hours

## Dependencies
- Vitest (already configured)
- May need additional testing utilities

## Notes
- Start with utility functions (easier to test)
- Consider using `@testing-library/svelte` for component tests
- Mock browser APIs (localStorage, matchMedia) in tests

