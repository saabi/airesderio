# Ticket #005: Improve TypeScript Type Safety

## Priority
**Medium** - Code Quality

## Type
Refactoring, Type Safety

## Description
The codebase uses `any` types in several places, particularly in `Location.svelte` and data handling. This reduces type safety and makes the code harder to maintain.

## Current State
```typescript
// Location.svelte
let placesData = $state<any>(null);
let carouselPlace = $state<any>(null);
// ... other any types
```

## Proposed Solution
1. Create TypeScript interfaces for all data structures
2. Replace `any` types with proper interfaces
3. Type all component props
4. Enable strict TypeScript mode (if not already)
5. Add type definitions for external APIs (Google Maps)

## Acceptance Criteria
- [x] All `any` types replaced with proper interfaces
- [x] Type definitions created for location data structure
- [x] All component props are typed
- [x] Google Maps types are properly defined
- [x] TypeScript compilation passes with no errors
- [x] No type assertions (`as any`) used (except for dynamically loaded Google Maps API where necessary)

## Implementation Steps
1. Create type definitions file: `src/lib/types/index.ts`
2. Define interfaces:
   ```typescript
   interface Place {
       id: string;
       name: string;
       position: { lat: number; lng: number };
       category: string;
       placeId: string;
       // ... other properties
   }
   
   interface Category {
       name: string;
       icon?: string;
       // ... other properties
   }
   
   interface PlacesData {
       metadata: {
           categories: Record<string, Category>;
       };
       lugares: Record<string, Record<string, Place>>;
   }
   ```
3. Update `Location.svelte` to use types
4. Type all component props
5. Install `@types/google.maps` if needed
6. Update all files using these types

## Related Files
- `fe/src/lib/components/Location.svelte`
- `fe/src/lib/types/index.ts` (to be created)
- All component files using `any` types

## Estimated Effort
4-6 hours

## Dependencies
- `@types/google.maps` (if not already installed)

## Notes
- May need to update data structure if types don't match
- Consider using type guards for runtime validation
- Use `unknown` instead of `any` where type is truly unknown

