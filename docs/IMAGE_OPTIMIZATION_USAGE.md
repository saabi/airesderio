# Image Usage

**Last updated:** 2025-02  
**Note:** This project no longer uses `@sveltejs/enhanced-img`. Images use standard Vite asset imports and `<img>` tags.

## Current approach

- **Imports:** Image files under `fe/src/lib/assets/` are imported directly (e.g. `import hero1 from '$lib/assets/carousel-hero/hero.jpg'`). Vite resolves these to public URL strings at build time.
- **Rendering:** Components use the native `<img src={url} alt="..." />` element. Carousels (Hero, Interior, PhotoCarousel, FloorPlans) pass these URL strings to the `Slide` component, which renders `<img>`.
- **Static files:** Images in `fe/static/` are referenced by path (e.g. `/planos/foo.png`) and are not processed by Vite; they are served as-is.

## Where images are used

- **Hero:** Carousel images from `$lib/assets/carousel-hero/`; video from `static/carrousel-hero/promo.mov`.
- **Interior:** Carousel images from `$lib/assets/carousel-interior/`.
- **ContactSection:** Single image from `$lib/assets/exteriores/exterior_03.png`.
- **PhotoCarousel (Location):** Place photos from `$lib/assets/places/` via `PLACE_PHOTOS_MAP` (filename → URL).
- **FloorPlans:** Plan images referenced by path from `static/planos/` (see `FloorPlans.svelte`).

No responsive srcset or automatic format conversion is applied; use standard `src` and optional `sizes`/`loading` as needed.
