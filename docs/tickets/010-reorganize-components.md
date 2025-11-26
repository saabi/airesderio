# Ticket #010: Reorganize Component Structure

## Priority
**Low** - Code Organization

## Type
Refactoring, Code Organization

## Description
Components are currently in a flat structure. Reorganizing into logical directories will improve maintainability and discoverability.

## Current State
```
src/lib/components/
├── CategorySelector.svelte
├── ContactForm.svelte
├── ContactSection.svelte
├── Equipment.svelte
├── FloorPlans.svelte
├── Footer.svelte
├── GoogleMap.svelte
├── Header.svelte
├── Hero.svelte
├── Interior.svelte
├── Intro.svelte
├── Location.svelte
├── PhotoCarousel.svelte
├── SvgViewport.svelte
├── Title.svelte
├── forms/
└── dev/
```

## Proposed Solution
Reorganize into logical directories:
```
src/lib/components/
├── layout/
│   ├── Header.svelte
│   └── Footer.svelte
├── sections/
│   ├── Hero.svelte
│   ├── Intro.svelte
│   ├── Location.svelte
│   ├── Interior.svelte
│   ├── Equipment.svelte
│   ├── FloorPlans.svelte
│   └── ContactSection.svelte
├── features/
│   ├── GoogleMap.svelte
│   ├── CategorySelector.svelte
│   └── PhotoCarousel.svelte
├── ui/
│   ├── Title.svelte
│   └── SvgViewport.svelte
├── forms/
│   ├── ContactForm.svelte
│   ├── Input.svelte
│   ├── PhoneNumberInput.svelte
│   ├── Select.svelte
│   └── Textarea.svelte
└── dev/
    └── DevColorEditor.svelte
```

## Acceptance Criteria
- [x] Components organized into logical directories
- [x] All imports updated
- [x] No broken imports
- [x] Application works correctly (build successful)
- [x] Code is more maintainable

## Status
**Complete** ✅ - All components have been reorganized into logical directories (layout/, sections/, features/, ui/, forms/, icons/, dev/). All imports have been updated across the codebase. Build successful with no broken imports. Cleaned up stray Location.md file (moved to docs/specs/).

## Implementation Steps
1. Create new directory structure
2. Move components to appropriate directories
3. Update all imports:
   ```typescript
   // Before
   import Header from '$lib/components/Header.svelte';
   
   // After
   import Header from '$lib/components/layout/Header.svelte';
   ```
4. Update all files importing components
5. Test application thoroughly
6. Update documentation

## Related Files
- All component files
- All files importing components
- `fe/src/routes/+page.svelte`
- `fe/src/routes/+layout.svelte`

## Estimated Effort
2-3 hours

## Dependencies
None

## Notes
- Use find/replace for import updates
- Test thoroughly after reorganization
- Consider using barrel exports (`index.ts`) for cleaner imports
- May want to do this incrementally to avoid breaking changes

