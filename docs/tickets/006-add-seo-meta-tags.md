# Ticket #006: Add SEO Meta Tags

## Priority
**Medium** - SEO

## Type
Feature, SEO

## Description
The application currently has minimal meta tags. Adding comprehensive meta tags will improve SEO and social media sharing.

## Current State
```html
<!-- app.html -->
<title>Ubicación - Habitat Prime SAS</title>
<!-- Missing: description, Open Graph, Twitter Cards, etc. -->
```

## Proposed Solution
1. Add meta description
2. Add Open Graph tags for social sharing
3. Add Twitter Card meta tags
4. Add canonical URL
5. Add structured data (JSON-LD) for real estate
6. Update page title to be more descriptive

## Acceptance Criteria
- [x] Meta description added
- [x] Open Graph tags implemented
- [x] Twitter Card tags implemented
- [x] Canonical URL set
- [x] Structured data (JSON-LD) added
- [x] Page title updated
- [x] All meta tags are dynamic and relevant
- [x] Social media preview works correctly (requires og-image.jpg to be added to static folder)

## Implementation Steps
1. Create meta tags component or use SvelteKit's `+page.ts`
2. Add meta description:
   ```html
   <meta name="description" content="Aires de Río - Departamentos en Santiago del Estero">
   ```
3. Add Open Graph tags:
   ```html
   <meta property="og:title" content="Aires de Río">
   <meta property="og:description" content="...">
   <meta property="og:image" content="...">
   <meta property="og:url" content="...">
   <meta property="og:type" content="website">
   ```
4. Add Twitter Card tags
5. Add structured data for real estate listing
6. Update `app.html` or use SvelteKit's head management

## Related Files
- `fe/src/app.html`
- `fe/src/routes/+page.svelte` (or `+page.ts` for meta tags)
- `fe/src/lib/components/MetaTags.svelte` (optional component)

## Estimated Effort
3-4 hours

## Dependencies
- Social media preview images (if not already available)

## Notes
- Consider using SvelteKit's `+page.ts` for dynamic meta tags
- May need to generate social media preview images
- Structured data should follow Schema.org RealEstateAgent schema

