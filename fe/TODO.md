# TODO - Pending Tasks

## High Priority

### 1. Navigation Links

- [ ] Fix "Preventa" link - currently points to `#` (should link to a section or dedicated page)
- [ ] Fix "Contacto" link - currently points to `#` (should link to `#contacto` or the contact section)
- [ ] Fix "Home" link - currently points to `#` (should be `/` or `#`)
- [ ] Verify section anchor IDs exist on page: `#ubicacion`, `#planos`, `#equipados`

### 2. Contact Form Implementation

- [ ] Implement form submission handler (`handleSubmit` function is currently empty)
- [ ] Add API endpoint or form submission service (e.g., Formspree, Netlify Forms, or custom backend)
- [ ] Add success/error message display after form submission
- [ ] Add client-side validation feedback
- [ ] Update form action from `#` to actual endpoint

### 3. Logo/Visual Assets

- [ ] Replace logo placeholder in `ContactSection.svelte` with actual logo component or image
- [ ] Verify all visual assets are production-ready

### 4. Production Content Updates

- [ ] Update footer text - currently says "Maqueta" (mockup/prototype) - should be updated for production
- [ ] Update page title in `app.html` - currently "Ubicación - Habitat Prime SAS" should be "Aires de Río" or similar

## Medium Priority

### 5. Code Cleanup - Debug Code

- [ ] Remove or conditionally disable `console.log` statements in `Location.svelte` (lines 161, 170, 177, 243, 318, 393, 414, 423)
- [ ] Remove debug comments like "// Debug categories loading"
- [ ] Clean up commented-out console.log in `updatePlacePhotos.js` (line 56)
- [ ] Remove or conditionally disable dev color editor in production builds

### 6. Security - API Keys

- [ ] Move hardcoded Google Maps API key in `Location.svelte` (line 9) to environment variable
- [ ] Add `.env.example` file with required environment variables
- [ ] Update documentation with environment variable setup instructions

### 7. CSS FIXME Comments

- [ ] Review and resolve FIXME comments in `static/global.css`:
  - Line 110: `--colorBorderAux: #333; /* FIXME needed by a11y menu */`
  - Lines 174-175: `--colorBorder` and `--colorBorderAux` FIXME comments
- [ ] Verify a11y menu colors are properly implemented or remove if not needed

## Lower Priority

### 8. SEO/Meta Tags

- [ ] Add meta description tag
- [ ] Add Open Graph tags for social media sharing
- [ ] Add Twitter Card meta tags
- [ ] Verify all meta tags are production-ready

### 9. Testing

- [ ] Add unit tests for form validation
- [ ] Add tests for navigation functionality
- [ ] Add tests for key components (ContactForm, Location, etc.)
- [ ] Set up CI/CD pipeline for automated testing

### 10. Accessibility

- [ ] Review FIXME comments related to a11y menu colors
- [ ] Audit all interactive elements for proper ARIA labels
- [ ] Run accessibility audit (e.g., Lighthouse, axe)
- [ ] Ensure keyboard navigation works properly

### 11. Documentation

- [ ] Document form submission endpoint/process
- [ ] Document environment variables needed
- [ ] Add deployment instructions if not already in README
- [ ] Document any third-party service integrations

## Notes

- Some items may be intentional (e.g., dev color editor, console.logs for debugging)
- Review each item before marking as complete to ensure it aligns with project requirements
- Consider creating separate issues/tickets for each task if using project management tools
