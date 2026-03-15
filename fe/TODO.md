# TODO - Pending Tasks

## High Priority

### 1. Navigation Links

- [x] ~~Fix "Preventa" link~~ — Nav uses "Proyecto" linking to `/#proyecto` (no Preventa link)
- [x] ~~Fix "Contacto" link~~ — Points to `/#contacto` (Header + Footer)
- [x] ~~Fix "Home" link~~ — Points to `/` (Header + Footer)
- [x] ~~Verify section anchor IDs~~ — `#ubicacion` (Location), `#planos` (FloorPlans), `#equipados` (Equipment) exist

### 2. Contact Form Implementation

- [x] ~~Implement form submission handler~~ — `ContactForm.svelte` has full `handleSubmit` (fetch `/api/contact`)
- [x] ~~Add API endpoint or form submission service~~ — `/api/contact` with SMTP + Postgres (see git: 1eea14d, 3fb7588)
- [x] ~~Add success/error message display~~ — `successMessage` / `errorMessage` in ContactForm
- [x] ~~Add client-side validation feedback~~ — `reportValidity`, email regex, required fields
- [x] ~~Update form action~~ — Form uses `action='#'` with JS submit (correct for SPA)

### 3. Logo/Visual Assets

- [x] ~~Replace logo placeholder in ContactSection~~ — Uses `AiresDeRioLogo` component
- [x] ~~Change Isotype color for better contrast~~
- [ ] Verify all visual assets are production-ready
- [ ] Right now, logo colors on light are coming from dark theme. Fix

### 4. Production Content Updates

- [x] ~~Update footer text~~ — Footer says "© {year} Habitat Prime SAS · Aires de Río es una marca registrada" (no "Maqueta")
- [x] ~~Update page title in app.html~~ — Title is "Aires de Río - Departamentos en Santiago del Estero"

### 5. Fichas técnicas

- [ ] Fichas técnicas (revisión general)
- [ ] Ficha técnica Harmony incompleta
- [ ] Ficha técnica Luxuri comprobar

### 6. Equipamiento - Orden y carruseles

- [ ] Cambiar orden de carruseles y listas de equipamiento: 1) lista base, 2) carrusel existente, 3) lista adicionales, 4) nuevo carrusel con imágenes de renders de los adicionales

### 7. Mobile / Responsive

- [ ] Map gallery popup (o elemento relacionado) ocupa demasiado ancho en móvil y rompe el layout — acotar ancho máx. o ajustar estilos en viewport pequeño

### 8. Mapa (Location)

- [x] ~~Isotype sobre mapa tiene poco contraste — dar borde verde (mismo de los botones) al círculo~~
- [x] ~~Isotype debe mantener el mismo tamaño final durante zoom.~~ 
- [x] ~~Pines sobre mapa deben elegir la zona al tocar — mismo comportamiento que ya tienen las zonas~~
- [ ] Botón de galería blanco sobre mapa: poco contraste — mismo aspecto que el isotipo (icono negro, círculo blanco, borde verde)

### 9. Carrusel

- [ ] Agregar gestos táctiles para navegar (deslizar izquierda/derecha)

## Medium Priority

### 10. Code Cleanup - Debug Code

- [x] ~~Location.svelte console.log~~ — Only 2 logs, both wrapped in `import.meta.env.DEV` (lines ~125, ~134)
- [x] ~~Debug comments~~ — No "Debug categories loading" in current Location.svelte
- [x] ~~updatePlacePhotos.js~~ — Line 56 is `console.warn` (intentional); no commented console.log found
- [ ] Remove or conditionally disable dev color editor in production builds (optional; dev-only UI)

### 11. Security - API Keys

- [x] ~~Hardcoded API key in Location.svelte~~ — Location uses `Map.svelte` (SVG/SimpleMapBase), not Google Maps; no key in Location
- [x] ~~.env.example~~ — Present with `VITE_GOOGLE_MAPS_API_KEY`, DB, SMTP, admin vars
- [x] ~~Documentation~~ — README has env setup; `.env.example` is documented

### 12. CSS FIXME Comments

- [x] ~~static/global.css FIXMEs~~ — File not present (likely refactored into `app.css`); no FIXMEs in `fe/src/app.css`
- [ ] Verify a11y menu colors if a11y menu still uses custom border vars elsewhere

## Lower Priority

### 13. SEO/Meta Tags

- [x] ~~Add meta description tag~~ — `+page.svelte` has `<meta name="description" content="...">` and keywords
- [x] ~~Add Open Graph tags~~ — og:type, og:url, og:title, og:description, og:image, og:locale, og:site_name
- [x] ~~Add Twitter Card meta tags~~ — twitter:card, url, title, description, image, image:alt
- [ ] Verify all meta tags are production-ready (e.g. canonical, og-image.jpg exists)

### 14. Testing

- [ ] Add unit tests for form validation
- [ ] Add tests for navigation functionality
- [ ] Add tests for key components (ContactForm, Location, etc.)
- [ ] Set up CI/CD pipeline for automated testing

### 15. Accessibility

- [ ] Review FIXME comments related to a11y menu colors
- [ ] Audit all interactive elements for proper ARIA labels
- [ ] Run accessibility audit (e.g., Lighthouse, axe)
- [ ] Ensure keyboard navigation works properly

### 16. Documentation

- [ ] Document form submission endpoint/process (API contract, SMTP/DB requirements)
- [x] ~~Document environment variables~~ — `.env.example` + README "Set up environment variables"
- [ ] Add deployment instructions if not already in README (README has build; root may have PM2/deploy)
- [ ] Document any third-party service integrations

## Notes

- Some items may be intentional (e.g., dev color editor, console.logs for debugging)
- Review each item before marking as complete to ensure it aligns with project requirements
- Consider creating separate issues/tickets for each task if using project management tools
- **Last verified:** 2025-03-14 — Checked git log and code for nav, form, logo, footer, title, console.logs, API key/env, CSS FIXMEs, SEO meta. Many items were already done and are marked [x] above.
