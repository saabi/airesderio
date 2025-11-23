# Ticket #007: Implement Image Optimization

## Priority
**Medium** - Performance

## Type
Performance, Optimization

## Description
Images are currently manually optimized. Implementing an automated image optimization pipeline will improve performance and reduce bundle size.

## Current State
- Images stored in `static/` directory
- Manual optimization process
- No responsive image sets
- No lazy loading

## Proposed Solution
1. Implement image optimization pipeline using `vite-imagetools` or `@sveltejs/enhanced-img`
2. Generate responsive image sets
3. Implement lazy loading for images below the fold
4. Use modern formats (WebP, AVIF) with fallbacks
5. Add image optimization to build process

## Acceptance Criteria
- [ ] Image optimization pipeline implemented
- [ ] Responsive image sets generated
- [ ] Lazy loading implemented
- [ ] Modern image formats used with fallbacks
- [ ] Build process includes image optimization
- [ ] Performance improvements measurable (Lighthouse)
- [ ] All images load correctly

## Status
**Pending** - Blocked by ticket #011. Photo carousel images need to be organized first before optimization can proceed.

## Implementation Steps
1. Install image optimization package:
   ```bash
   npm install -D vite-imagetools
   ```
2. Configure Vite to process images
3. Update image imports to use optimized versions
4. Implement lazy loading:
   ```html
   <img loading="lazy" src="..." alt="...">
   ```
5. Generate responsive image sets
6. Update all image references in components
7. Test performance improvements

## Related Files
- `fe/vite.config.ts`
- `fe/src/lib/components/PhotoCarousel.svelte`
- `fe/src/lib/components/Hero.svelte`
- All components using images

## Estimated Effort
4-6 hours

## Dependencies
- **Ticket #011**: Organize Place Photo Carousel Files (should be completed first)
  - Photos need to be organized in the correct directory structure before optimization
  - The carousel images are currently stashed/unorganized
- Image optimization package
- May require build process changes

## Notes
- **Important**: Complete ticket #011 (Organize Place Photos) first, as the carousel images are currently stashed/unorganized
- Consider using `@sveltejs/enhanced-img` for SvelteKit integration
- May need to update image paths in components
- Test with various image sizes and formats
- Once photos are organized (ticket #011), optimize all images in `static/lugares/` directory

