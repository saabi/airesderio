# Image Usage

**Last updated:** 2025-03  
**Note:** This project no longer uses `@sveltejs/enhanced-img`. Images in `fe/static/` are served as-is; optimization is done via re-runnable scripts.

## Current approach

- **Static files:** Images live under `fe/static/` and are referenced by path (e.g. `/carrousel-hero/desktop/d-2-frente-edificio.jpg`, `/planos/depto-1hab-balcon.png`). They are not processed by Vite at build time.
- **Rendering:** Components use the native `<img src={url} alt="..." />` element. Carousels (Hero, Interior, PhotoCarousel, FloorPlans) pass URL strings to the `Slide` component, which renders `<img>` (or `Picture` for WebP fallback).
- **Optimization:** Run the image scripts (see below) to resize/compress per category and generate WebP siblings. Scripts overwrite originals in place.

## Where images are used

- **Hero:** Carousel images from `fe/static/carrousel-hero/desktop/` (desktop) and `fe/static/carrousel-hero/mobile/` (mobile/vertical). Video `promo.webm` in `desktop/`. Optimization runs recursively over `carrousel-hero` and **outputs JPG + WebP** (PNG sources are converted to JPG for smaller fallback size).
- **Interior:** Carousel images from `fe/static/carrousel-interior/`.
- **ContactSection:** Single image from `fe/static/exteriores/exterior_03.png`.
- **PhotoCarousel (Location):** Place photos from `fe/static/places/{placeId}/` (paths from `places.json`).
- **FloorPlans:** Plan images from `fe/static/planos/` as **PNG** (transparency). WebP siblings are generated with alpha; `Picture` uses WebP when available.

No responsive srcset or automatic format conversion is applied in the app; use standard `src` and optional `sizes`/`loading`. WebP files are generated alongside originals for `<picture>` use (e.g. `Picture.svelte`).

## Image analyze and optimize scripts

When you add or replace images in the static directories, run these from `fe/`:

- **Analyze (read-only):** `npm run images:analyze`  
  Reports per-category counts, total size, min/avg/max file size, and how many images exceed the recommended dimensions.

- **Optimize (writes files):** `npm run images:optimize`  
  Resizes and compresses images per category rules, overwrites originals in place, and writes a `.webp` sibling next to each image. Categories: hero, interior, planos, exteriores, places.

- **Optimize places only:** `npm run images:optimize:places`  
  Same as above but only for `fe/static/places/**/*` (useful when only place photos changed).

Category rules (max dimensions, quality, skip thresholds) are defined in `fe/scripts/image-rules.js`. Hero is recursive (`carrousel-hero` with subdirs desktop/mobile) and uses `outputFormat: 'jpg'` so PNG sources are converted to JPG + WebP. Planos use PNG only (no JPG); optimization keeps PNG and writes WebP with alpha. Floor plans use 2400px long side; carousels and place photos are capped at 1920×1080 with moderate compression.
