# Ticket #003: Fix Navigation Links

## Priority
**High** - User Experience

## Type
Bug Fix, Navigation

## Description
Several navigation links in the header point to `#` instead of proper anchor links or routes. This prevents users from navigating to specific sections of the page.

## Current State
```typescript
// Header.svelte
const navLinks = [
    { href: '#', text: 'Home', current: true },
    { href: '#ubicacion', text: 'Ubicación' },
    { href: '#planos', text: 'Planos' },
    { href: '#equipados', text: 'Equipamiento' },
    { href: '#', text: 'Preventa' },
    { href: '#', text: 'Contacto' }
];
```

## Issues
- "Home" link points to `#` (should be `/` or `#top`)
- "Preventa" link points to `#` (needs implementation)
- "Contacto" link points to `#` (should be `#contacto`)

## Proposed Solution
1. Fix "Home" link to scroll to top or use `/`
2. Fix "Contacto" link to `#contacto` (verify section ID exists)
3. Implement "Preventa" section or link, or remove if not needed
4. Verify all section IDs exist on the page
5. Add smooth scroll behavior
6. Update active link highlighting based on scroll position

## Acceptance Criteria
- [ ] All navigation links work correctly
- [ ] Links scroll to correct sections smoothly
- [ ] Active link highlighting works based on scroll position
- [ ] All referenced section IDs exist on the page
- [ ] Mobile navigation works correctly
- [ ] Keyboard navigation works

## Implementation Steps
1. Verify section IDs in page components:
   - `#ubicacion` - Location component
   - `#planos` - FloorPlans component
   - `#equipados` - Equipment component
   - `#contacto` - ContactSection component
2. Update navigation links in `Header.svelte`
3. Implement smooth scroll behavior (CSS or JavaScript)
4. Update active link logic to use scroll position
5. Test on mobile and desktop

## Related Files
- `fe/src/lib/components/Header.svelte`
- `fe/src/routes/+page.svelte`
- `fe/src/lib/components/Location.svelte`
- `fe/src/lib/components/FloorPlans.svelte`
- `fe/src/lib/components/Equipment.svelte`
- `fe/src/lib/components/ContactSection.svelte`

## Estimated Effort
2-4 hours

## Dependencies
None

## Notes
- Consider using SvelteKit's `goto` for programmatic navigation
- May need to add `id` attributes to section components if missing
- Smooth scroll is already enabled in CSS (`scroll-behavior: smooth`)

