# Carousel Images Inventory - Ticket #007

This document lists all images currently used in carousels throughout the application. This inventory is essential for implementing image optimization (Ticket #007).

## 1. Hero Carousel (`Hero.svelte`)

**Location**: `fe/static/carrousel-hero/desktop/` (desktop) and `fe/static/carrousel-hero/mobile/` (mobile/vertical)  
**Component**: `fe/src/lib/components/sections/Hero.svelte`  
**Priority**: **HIGH** (Above-the-fold, first impression)

The hero uses separate media sets for desktop and mobile (viewport-based). Desktop images live under `carrousel-hero/desktop/` with naming `d-NN-*.jpg` or `d-NN-*.png`; mobile under `carrousel-hero/mobile/` with `m-NN-*.png`. Video `promo.webm` is in `desktop/` and referenced from both. Optimization runs recursively over `carrousel-hero` (all subdirs) and produces WebP siblings.

| Set | Count | Path prefix |
|-----|-------|-------------|
| Desktop | 1 video + 23 images | `/carrousel-hero/desktop/` |
| Mobile | 1 video + 13 images | `/carrousel-hero/mobile/` |

**Optimization Priority**: **CRITICAL** - First images users see. WebP siblings generated; `Slide`/`Picture` can use them for `<picture>`.

---

## 2. Interior Carousel (`Interior.svelte`)

**Location**: `fe/static/carrousel-interior/`  
**Component**: `fe/src/lib/components/sections/Interior.svelte`  
**Priority**: **MEDIUM** (Below-the-fold, but important for showcasing design)

| # | Filename | Full Path | Status |
|---|----------|-----------|--------|
| 1 | `4_DB_Lobby.jpg` | `/carrousel-interior/4_DB_Lobby.jpg` | ✅ Used |
| 2 | `5_DB_EXTERIOR_01 (6).jpg` | `/carrousel-interior/5_DB_EXTERIOR_01 (6).jpg` | ✅ Used |
| 3 | `6_DB_EXTERIOR_01 (5).jpg` | `/carrousel-interior/6_DB_EXTERIOR_01 (5).jpg` | ✅ Used |
| 4 | `7_DB_EXTERIOR_01 (7).jpg` | `/carrousel-interior/7_DB_EXTERIOR_01 (7).jpg` | ✅ Used |
| 5 | `8_Antebaño y Lavadero.jpg` | `/carrousel-interior/8_Antebaño y Lavadero.jpg` | ✅ Used |
| 6 | `9_DB_INT_BLANCO (5).png` | `/carrousel-interior/9_DB_INT_BLANCO (5).png` | ✅ Used |

**Total**: 6 images  
**Optimization Priority**: **HIGH** - Should use WebP with JPG fallback, lazy loading, responsive srcset.

---

## 3. Floor Plans Carousel (`FloorPlans.svelte`)

**Location**: `fe/static/planos/`  
**Component**: `fe/src/lib/components/sections/FloorPlans.svelte`  
**Priority**: **MEDIUM** (Below-the-fold, informational content)

Planos use **PNG** (transparency preserved). Optimization keeps PNG as source and generates WebP siblings with alpha. FloorPlans references `.png`; `Picture` uses WebP when available.

| # | Filename | Full Path | Status |
|---|----------|-----------|--------|
| 1 | `depto-1hab-balcon.png` | `/planos/depto-1hab-balcon.png` | ✅ Used |
| 2 | `depto-1hab-contrafrente.png` | `/planos/depto-1hab-contrafrente.png` | ✅ Used |
| 3 | `depto-2hab-1ofi.png` | `/planos/depto-2hab-1ofi.png` | ✅ Used |

**Total**: 3 images  
**Optimization Priority**: **MEDIUM** - PNG with transparency; WebP siblings with alpha. Lower quality acceptable for technical drawings.

---

## 4. Place Photos Carousel (`PhotoCarousel.svelte`)

**Location**: `fe/static/places/{placeId}/`  
**Component**: `fe/src/lib/components/features/PhotoCarousel.svelte`  
**Data Source**: `fe/static/places/places.json`  
**Priority**: **HIGH** (User-triggered, but many large images)

### 4.1 Terminal (`terminal`)

| # | Filename | Full Path | Status |
|---|----------|-----------|--------|
| 1 | `exterior.png` | `/places/terminal/exterior.png` | ✅ Used |
| 2 | `interior.png` | `/places/terminal/interior.png` | ✅ Used |

**Total**: 2 images

### 4.2 Forum (`forum`)

| # | Filename | Full Path | Status |
|---|----------|-----------|--------|
| 1 | `1_Forum 02.jpg` | `/places/forum/1_Forum 02.jpg` | ✅ Used |
| 2 | `2_FORUM_03 de Tripadvisor.jpg` | `/places/forum/2_FORUM_03 de Tripadvisor.jpg` | ✅ Used |
| 3 | `3_Forum 01.jpg` | `/places/forum/3_Forum 01.jpg` | ✅ Used |
| 4 | `4_Forum 04.jpg` | `/places/forum/4_Forum 04.jpg` | ✅ Used |
| 5 | `5_Forum_Santiago_del_Estero_3.jpeg` | `/places/forum/5_Forum_Santiago_del_Estero_3.jpeg` | ✅ Used |
| 6 | `forum4.png` | `/places/forum/forum4.png` | ✅ Used |

**Total**: 6 images

### 4.3 Casa de Gobierno (`casagob`)

| # | Filename | Full Path | Status |
|---|----------|-----------|--------|
| 1 | `1.jpg` | `/places/casagob/1.jpg` | ✅ Used |
| 2 | `aerea.JPG` | `/places/casagob/aerea.JPG` | ✅ Used |
| 3 | `casayparque2.JPG` | `/places/casagob/casayparque2.JPG` | ✅ Used |
| 4 | `casayparque3.JPG` | `/places/casagob/casayparque3.JPG` | ✅ Used |
| 5 | `casayplaza.png` | `/places/casagob/casayplaza.png` | ✅ Used |
| 6 | `estatuasanmartin.jpg` | `/places/casagob/estatuasanmartin.jpg` | ✅ Used |
| 7 | `nocturna.jpg` | `/places/casagob/nocturna.jpg` | ✅ Used |

**Total**: 7 images

### 4.4 Plaza Vea (`plazavea`)

| # | Filename | Full Path | Status |
|---|----------|-----------|--------|
| 1 | `cinemas.png` | `/places/plazavea/cinemas.png` | ✅ Used |
| 2 | `comidas.jpg` | `/places/plazavea/comidas.jpg` | ✅ Used |
| 3 | `exterior1.png` | `/places/plazavea/exterior1.png` | ✅ Used |
| 4 | `exterior2.png` | `/places/plazavea/exterior2.png` | ✅ Used |

**Total**: 4 images

### 4.5 Parque Aguirre (`parqueaguirre`)

| # | Filename | Full Path | Status |
|---|----------|-----------|--------|
| 1 | `aerea.png` | `/places/parqueaguirre/aerea.png` | ✅ Used |
| 2 | `calecita.png` | `/places/parqueaguirre/calecita.png` | ✅ Used |
| 3 | `deportes.png` | `/places/parqueaguirre/deportes.png` | ✅ Used |
| 4 | `guardavidas.png` | `/places/parqueaguirre/guardavidas.png` | ✅ Used |
| 5 | `juegos.png` | `/places/parqueaguirre/juegos.png` | ✅ Used |
| 6 | `recital.png` | `/places/parqueaguirre/recital.png` | ✅ Used |
| 7 | `recital1.png` | `/places/parqueaguirre/recital1.png` | ✅ Used |

**Total**: 7 images

### 4.6 Avenida Roca (`avroca`)

| # | Filename | Full Path | Status |
|---|----------|-----------|--------|
| 1 | `1_Untitled-1.jpg` | `/places/avroca/1_Untitled-1.jpg` | ✅ Used |
| 2 | `2__Calle Roca Confiterias_08.jpg` | `/places/avroca/2__Calle Roca Confiterias_08.jpg` | ✅ Used |
| 3 | `3__CALLE LA ROCA_ENCONTRARTE_02 de TURISMO.jpg` | `/places/avroca/3__CALLE LA ROCA_ENCONTRARTE_02 de TURISMO.jpg` | ✅ Used |
| 4 | `4_Calle Roca Confiterias_03.jpg` | `/places/avroca/4_Calle Roca Confiterias_03.jpg` | ✅ Used |
| 5 | `5_CALLE LA ROCA_ENCONTRARTE_03 de TURISMO.jpg` | `/places/avroca/5_CALLE LA ROCA_ENCONTRARTE_03 de TURISMO.jpg` | ✅ Used |
| 6 | `6_Calle Roca Confiterias_01.jpg` | `/places/avroca/6_Calle Roca Confiterias_01.jpg` | ✅ Used |
| 7 | `7_istockphoto-1091469178-612x612.jpg` | `/places/avroca/7_istockphoto-1091469178-612x612.jpg` | ✅ Used |
| 8 | `8_CALLE LA ROCA_ENCONTRARTE_05 de TURISMO.jpg` | `/places/avroca/8_CALLE LA ROCA_ENCONTRARTE_05 de TURISMO.jpg` | ✅ Used |

**Total**: 8 images

**Place Photos Total**: 34 images across 6 places  
**Optimization Priority**: **CRITICAL** - Many images are 5-6MB PNG files. These need aggressive optimization. Should use WebP with JPG fallback, lazy loading, responsive srcset. Quality can be 85% for photos.

---

## 5. Contact Section Image (Not a carousel)

**Location**: `fe/static/exteriores/`  
**Component**: `fe/src/lib/components/sections/ContactSection.svelte`  
**Priority**: **MEDIUM** (Below-the-fold, single image)  
**⚠️ File Size**: **8.7MB** - This is a very large image that needs aggressive optimization!

| # | Filename | Full Path | Size | Status |
|---|----------|-----------|------|--------|
| 1 | `exterior_03.png` | `/exteriores/exterior_03.png` | 8.7MB | ✅ Used |

**Total**: 1 image  
**Optimization Priority**: **HIGH** (upgraded from MEDIUM due to large file size) - Already has lazy loading. Should add WebP with PNG fallback, responsive srcset. Expected reduction: 8.7MB → ~300-500KB WebP (95%+ reduction).

---

## Summary

| Carousel Type | Image Count | Priority | Notes |
|---------------|-------------|----------|-------|
| Hero Carousel | 3 | **CRITICAL** | Above-the-fold, first impression |
| Interior Carousel | 6 | **HIGH** | Showcases design quality |
| Floor Plans | 6 | **MEDIUM** | Technical drawings, lower quality OK |
| Place Photos | 34 | **CRITICAL** | Many large PNG files (5-6MB each) |
| Contact Section | 1 | **HIGH** | Single image (8.7MB!), already lazy loaded |
| **TOTAL** | **50** | - | - |

## Optimization Strategy by Priority

### Critical Priority (37 images)
- **Hero Carousel** (3 images): Preload first image, WebP + JPG fallback, quality 90%, responsive srcset
- **Place Photos** (34 images): WebP + JPG fallback, quality 85%, lazy loading, responsive srcset

### High Priority (6 images)
- **Interior Carousel** (6 images): WebP + JPG fallback, quality 85%, lazy loading, responsive srcset

### High Priority (7 images)
- **Interior Carousel** (6 images): WebP + JPG fallback, quality 85%, lazy loading, responsive srcset
- **Contact Section** (1 image): WebP + PNG fallback, quality 85%, responsive srcset. **Critical**: 8.7MB → ~300-500KB (95%+ reduction)

### Medium Priority (6 images)
- **Floor Plans** (6 images): WebP, quality 80%, lazy loading, responsive srcset

## File Size Issues Identified

Based on initial analysis, the following directories contain very large images that need optimization:

- `fe/static/places/parqueaguirre/`: Multiple 5-6MB PNG files
- `fe/static/places/plazavea/`: Multiple 5-6MB PNG files  
- `fe/static/places/casagob/`: Multiple 5-6MB PNG files
- `fe/static/places/forum/`: Some 3-4MB JPG files

**Estimated total size before optimization**: ~150-200MB  
**Estimated total size after optimization**: ~15-25MB (85-90% reduction)

## Implemented optimization (scripts)

Image optimization is implemented via re-runnable Node scripts using Sharp. When images are added or updated, run from `fe/`:

| Command | Purpose |
|---------|---------|
| `npm run images:analyze` | Report dimensions and file sizes per category (no writes) |
| `npm run images:optimize` | Resize/compress all categories in place and generate WebP siblings |
| `npm run images:optimize:places` | Optimize only `fe/static/places/**` |

- **Rules:** Per-category settings (max dimensions, JPEG/WebP quality, skip thresholds) are in `fe/scripts/image-rules.js`.
- **Categories:** hero (1920×1080), interior (1920×1080), planos (2400 long side, higher quality), exteriores (1920 long side), places (1920×1080).
- **Output:** Originals are overwritten in place; a `.webp` file is written next to each image for optional `<picture>` use.

See [docs/IMAGE_OPTIMIZATION_USAGE.md](../../IMAGE_OPTIMIZATION_USAGE.md) for full details.

---

**Last Updated**: 2025-03  
**Related**: Ticket #007 - Image Optimization

