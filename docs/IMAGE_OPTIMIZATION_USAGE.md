# Image Optimization Usage Report

**Generated:** 2025-01-XX  
**Plugin:** `@sveltejs/enhanced-img@0.9.2`  
**Configuration:** Default settings (no explicit quality/format parameters)

## Summary

- **Total Enhanced Images:** 38 unique images
- **Usage Sites:** 6 components + 1 import map
- **Quality Settings:** Default (typically 80-85% for WebP/AVIF)
- **Format:** Automatic (WebP/AVIF with fallbacks)
- **Responsive Breakpoints:** Determined by `sizes` attribute and plugin defaults
- **Development Mode:** Images served as-is (no optimization)
- **Production Build:** Full optimization with multiple formats and sizes

---

## Usage Sites

### 1. Hero Carousel (`Hero.svelte`)

**File:** `fe/src/lib/components/sections/Hero.svelte`

**Images (3):**
- `1_DB_EXTERIOR_01 (2).jpg`
- `2_DB_EXTERIOR_01 (8).jpg`
- `3_DB_EXTERIOR_01 (1).jpg`

**Component Used:** `ImageCarousel` → `enhanced:img`

**Settings:**
- **sizes:** `100vw` (default from ImageCarousel)
- **loading:** First image `eager`, others `lazy`
- **imageFit:** `cover`
- **Quality:** Default (no explicit parameter)
- **Resolution:** Full viewport width (responsive srcset generated automatically)

**Responsive Behavior:**
- Full-width hero carousel
- Images scale to 100% viewport width
- Plugin generates multiple sizes: typically 640w, 768w, 1024w, 1280w, 1920w

---

### 2. Interior Carousel (`Interior.svelte`)

**File:** `fe/src/lib/components/sections/Interior.svelte`

**Images (6):**
- `4_DB_Lobby.jpg`
- `5_DB_EXTERIOR_01 (6).jpg`
- `6_DB_EXTERIOR_01 (5).jpg`
- `7_DB_EXTERIOR_01 (7).jpg`
- `8_Antebaño y Lavadero.jpg`
- `9_DB_INT_BLANCO (5).png`

**Component Used:** `ImageCarousel` → `enhanced:img`

**Settings:**
- **sizes:** `100vw` (default from ImageCarousel)
- **loading:** First image `eager`, others `lazy`
- **imageFit:** `cover`
- **Quality:** Default
- **Resolution:** Full container width (16:9 aspect ratio on desktop, 4:3 on mobile)

**Responsive Behavior:**
- Desktop: 16:9 aspect ratio, ~66% of max-width container
- Mobile: 4:3 aspect ratio, full width
- Breakpoint: 850px

---

### 3. Floor Plans Carousel (`FloorPlans.svelte`)

**File:** `fe/src/lib/components/sections/FloorPlans.svelte`

**Images (6):**
- `1ra-planta-4-deptos.png`
- `1ra-planta-4-deptos-a.png`
- `2 OCTUBRE_MODELO 1ra PLANTA_4 DPTOS 1 DORM.jpg`
- `2da-planta-3-deptos.png`
- `2da-planta-3-deptos-a.png`
- `2 OCTUBRE_MODELO 2da PLANTA_2 DPTOS 1 DORM_1 DEPTO DOBLE.jpg`

**Component Used:** `ImageCarousel` → `enhanced:img`

**Settings:**
- **sizes:** `(min-width: 1024px) 1024px, 100vw` (explicitly set)
- **loading:** First image `eager`, others `lazy`
- **imageFit:** `contain`
- **Quality:** Default
- **Resolution:** 
  - Desktop (≥1024px): Max 1024px width
  - Mobile (<1024px): Full viewport width

**Responsive Behavior:**
- Fixed max width of 1024px on desktop
- Full width on mobile
- Images use `contain` to preserve aspect ratio (important for floor plans)

---

### 4. Contact Section (`ContactSection.svelte`)

**File:** `fe/src/lib/components/sections/ContactSection.svelte`

**Images (1):**
- `exterior_03.png` (originally 8.7MB - high priority optimization target)

**Component Used:** Direct `enhanced:img`

**Settings:**
- **sizes:** `(min-width: 850px) 50vw, 100vw`
- **loading:** `lazy`
- **decoding:** `async`
- **Quality:** Default
- **Resolution:**
  - Desktop (≥850px): 50% of viewport width (half of 2-column layout)
  - Mobile (<850px): Full viewport width

**Responsive Behavior:**
- Part of 2-column grid on desktop
- Full width on mobile
- Expected optimization: 8.7MB PNG → ~300-500KB WebP (95%+ reduction)

---

### 5. Place Photos (`PhotoCarousel.svelte`)

**File:** `fe/src/lib/components/features/PhotoCarousel.svelte`

**Images (38 total across 6 places):**

#### Terminal (2 images):
- `exterior.png`
- `interior.png`

#### Forum (6 images):
- `1_Forum 02.jpg`
- `2_FORUM_03 de Tripadvisor.jpg`
- `3_Forum 01.jpg`
- `4_Forum 04.jpg`
- `5_Forum_Santiago_del_Estero_3.jpeg`
- `forum4.png`

#### Casa de Gobierno (7 images):
- `1.jpg`
- `aerea.JPG`
- `casayparque2.JPG`
- `casayparque3.JPG`
- `casayplaza.png`
- `estatuasanmartin.jpg`
- `nocturna.jpg`

#### Plaza Vea (4 images):
- `cinemas.png`
- `comidas.jpg`
- `exterior1.png`
- `exterior2.png`

#### Parque Aguirre (7 images):
- `aerea.png`
- `calecita.png`
- `deportes.png`
- `guardavidas.png`
- `juegos.png`
- `recital.png`
- `recital1.png`

#### Avenida Roca (8 images):
- `1_Untitled-1.jpg`
- `2__Calle Roca Confiterias_08.jpg`
- `3__CALLE LA ROCA_ENCONTRARTE_02 de TURISMO.jpg`
- `4_Calle Roca Confiterias_03.jpg`
- `5_CALLE LA ROCA_ENCONTRARTE_03 de TURISMO.jpg`
- `6_Calle Roca Confiterias_01.jpg`
- `7_istockphoto-1091469178-612x612.jpg`
- `8_CALLE LA ROCA_ENCONTRARTE_05 de TURISMO.jpg`

**Component Used:** `ImageCarousel` → `enhanced:img`

**Settings:**
- **sizes:** `(min-width: 1024px) 90vw, 100vw`
- **loading:** First image `eager`, others `lazy`
- **imageFit:** `cover`
- **Quality:** Default
- **Resolution:**
  - Desktop (≥1024px): 90% of viewport width (modal display)
  - Mobile (<1024px): Full viewport width

**Responsive Behavior:**
- Modal overlay carousel
- Large display size for viewing place photos
- Full width on mobile devices

---

### 6. Carousel Component (`Carousel.svelte`)

**File:** `fe/src/lib/components/ui/Carousel.svelte`

**Images:** Dynamic (accepts any enhanced images)

**Component Used:** Direct `enhanced:img`

**Settings:**
- **sizes:** `100vw` (hardcoded)
- **loading:** First image `eager`, others `lazy`
- **Quality:** Default
- **Resolution:** Full viewport width

**Note:** This is a legacy component. New code should use `ImageCarousel` instead.

---

### 7. ImageCarousel Component (`ImageCarousel.svelte`)

**File:** `fe/src/lib/components/ui/ImageCarousel.svelte`

**Images:** Dynamic (accepts any enhanced images)

**Component Used:** Direct `enhanced:img`

**Settings:**
- **sizes:** Configurable via `imageSizes` prop (default: `100vw`)
- **loading:** First image `eager`, others `lazy`
- **imageFit:** Configurable (`cover` or `contain`)
- **Quality:** Default
- **Resolution:** Determined by `imageSizes` prop

**Usage Examples:**
- Hero: `imageSizes="100vw"` (default)
- Interior: `imageSizes="100vw"` (default)
- Floor Plans: `imageSizes="(min-width: 1024px) 1024px, 100vw"`
- Place Photos: `imageSizes="(min-width: 1024px) 90vw, 100vw"`

---

## Development Mode vs Production Build

### Development Mode (`npm run dev`)

**Important:** In development mode, `@sveltejs/enhanced-img` does **not** process or optimize images.

**Behavior:**
- Images are served **directly** from source files without transformation
- No WebP/AVIF conversion
- No responsive srcset generation
- No width/height extraction
- `<enhanced:img>` components still work, but serve original images
- Faster dev server startup (no image processing overhead)

**What you'll see:**
- Original image files (JPG/PNG) are served as-is
- No optimized formats
- No multiple sizes generated
- Images may appear larger/slower to load in dev mode

**Why:**
- Image processing is CPU-intensive and slow
- Would significantly slow down dev server startup and HMR (Hot Module Replacement)
- Build-time optimization is sufficient for production

### Production Build (`npm run build`)

**During build, the plugin:**
1. Processes all images imported with `?enhanced`
2. Generates multiple formats (WebP, AVIF, original)
3. Creates responsive srcsets (640w, 768w, 1024w, 1280w, 1920w)
4. Extracts width/height attributes
5. Strips EXIF data
6. Optimizes file sizes

**Output:**
- Optimized images in `.svelte-kit/output/client/_app/immutable/assets/`
- Multiple formats and sizes for each image
- `<enhanced:img>` transformed to `<picture>` with `<source>` elements

### Preview Mode (`npm run preview`)

**Behavior:**
- Uses the production build output
- Serves optimized images from build directory
- Same behavior as production deployment

### Testing Optimizations

To test image optimizations during development:

1. **Build and preview:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Check generated files:**
   ```bash
   ls -la .svelte-kit/output/client/_app/immutable/assets/
   ```

3. **Inspect in browser:**
   - Open DevTools → Network tab
   - Filter by "Img"
   - Check if WebP/AVIF formats are loaded
   - Verify srcset attributes in Elements tab

### Development Workflow

**Recommended approach:**
1. Develop with original images (dev mode)
2. Test layout and functionality
3. Build and preview to verify optimizations
4. Deploy production build

**Note:** File sizes and load times in dev mode will be different from production. Always test with production builds for accurate performance metrics.

---

## How Viewport-Relative Sizes Work

### Two-Phase Process

`@sveltejs/enhanced-img` uses a **two-phase approach** for responsive images:

#### Phase 1: Build Time (Fixed Width Generation)

At build time, the plugin generates **fixed-width image variants** regardless of the `sizes` attribute value. These are physical files created during the build process.

**Default generated widths:**
- 640px
- 768px
- 1024px
- 1280px
- 1920px

**Example:** An image imported with `?enhanced` will generate these 5 variants (plus WebP/AVIF versions):
```
image-640w.jpg
image-768w.jpg
image-1024w.jpg
image-1280w.jpg
image-1920w.jpg
```

#### Phase 2: Runtime (Browser Selection)

At runtime, the browser:
1. Reads the `sizes` attribute (e.g., `100vw`)
2. Calculates the required image size based on current viewport
3. Selects the closest matching image from the `srcset`

**Example with `sizes="100vw"`:**

| Viewport Width | Calculated Need | Selected Image | Reason |
|----------------|-----------------|----------------|--------|
| 375px (mobile) | ~375px | 640w | Closest match (640px > 375px) |
| 768px (tablet) | ~768px | 768w | Exact match |
| 1024px (desktop) | ~1024px | 1024w | Exact match |
| 1920px (full HD) | ~1920px | 1920w | Exact match |
| 2560px (4K) | ~2560px | 1920w | Closest match (largest available) |

**Example with `sizes="(min-width: 1024px) 50vw, 100vw"`:**

| Viewport Width | Condition | Calculated Need | Selected Image |
|----------------|----------|-----------------|----------------|
| 375px | Mobile (<1024px) | 100vw = 375px | 640w |
| 768px | Tablet (<1024px) | 100vw = 768px | 768w |
| 1920px | Desktop (≥1024px) | 50vw = 960px | 1024w |
| 2560px | Desktop (≥1024px) | 50vw = 1280px | 1280w |

### Why This Matters

- **`100vw` doesn't generate a specific width** - it tells the browser "this image will be 100% of viewport width"
- **The browser selects from pre-generated fixed widths** - it doesn't generate new sizes on demand
- **You can override default widths** using `?w=` query parameter if you need specific breakpoints
- **The `sizes` attribute is critical** - without it, the browser assumes `100vw` and may select unnecessarily large images

### Best Practices

1. **Use specific `sizes` values when possible:**
   ```svelte
   <!-- Better: specific max width -->
   sizes="(min-width: 1024px) 1024px, 100vw"
   
   <!-- Less optimal: always 100vw -->
   sizes="100vw"
   ```

2. **Match `sizes` to actual layout:**
   ```svelte
   <!-- If image is in a 2-column grid (50% width) -->
   sizes="(min-width: 850px) 50vw, 100vw"
   ```

3. **Consider max container width:**
   ```svelte
   <!-- If container max-width is 1200px -->
   sizes="(min-width: 1200px) 1200px, 100vw"
   ```

---

## Quality and Format Settings

### Default Quality
- **No explicit quality parameters** are set in any usage
- Plugin uses **default quality** (typically 80-85% for WebP/AVIF)
- Original quality preserved for fallback formats

### Format Generation
- **WebP:** Generated for all images (modern browser support)
- **AVIF:** Generated when supported (better compression than WebP)
- **Original format:** Used as fallback (JPG/PNG)

### How `sizes` Attribute Works with Viewport Units

**Important:** The `sizes` attribute (e.g., `100vw`) is **not** used to generate image widths at build time. Instead:

1. **Build Time:** `@sveltejs/enhanced-img` (using `vite-imagetools` under the hood) generates a **fixed set of image widths** regardless of the `sizes` value. Default widths are typically:
   - 640w (mobile)
   - 768w (tablet)
   - 1024w (desktop)
   - 1280w (large desktop)
   - 1920w (full HD)

2. **Runtime:** The browser uses the `sizes` attribute to:
   - Calculate what size image it needs based on the current viewport
   - Select the closest matching image from the generated `srcset`
   - For `100vw`: Browser calculates "I need 100% of viewport width" and selects appropriate image

**Example with `sizes="100vw"`:**
- On a 375px mobile device: Browser calculates it needs ~375px image, selects 640w variant
- On a 1920px desktop: Browser calculates it needs ~1920px image, selects 1920w variant
- On a 2560px 4K display: Browser calculates it needs ~2560px image, selects 1920w variant (closest available)

**Example with `sizes="(min-width: 1024px) 50vw, 100vw"`:**
- Desktop (≥1024px): Browser calculates 50% of viewport (e.g., 960px for 1920px screen), selects 1024w variant
- Mobile (<1024px): Browser calculates 100% of viewport (e.g., 375px), selects 640w variant

### Default Responsive Breakpoints

The plugin generates these fixed-width variants by default (unless overridden with `?w=` query parameter):
- 640w (mobile)
- 768w (tablet)
- 1024w (desktop)
- 1280w (large desktop)
- 1920w (full HD)

---

## Summary by Component

| Component | Images | Sizes Attribute | Max Resolution | Quality | Loading |
|-----------|--------|----------------|----------------|---------|---------|
| Hero | 3 | `100vw` | Full viewport | Default | Eager/Lazy |
| Interior | 6 | `100vw` | Full viewport | Default | Eager/Lazy |
| Floor Plans | 6 | `(min-width: 1024px) 1024px, 100vw` | 1024px | Default | Eager/Lazy |
| Contact | 1 | `(min-width: 850px) 50vw, 100vw` | 50vw | Default | Lazy |
| Place Photos | 38 | `(min-width: 1024px) 90vw, 100vw` | 90vw | Default | Eager/Lazy |
| Carousel (legacy) | Dynamic | `100vw` | Full viewport | Default | Eager/Lazy |
| ImageCarousel | Dynamic | Configurable | Configurable | Default | Eager/Lazy |

---

## Recommendations

### 1. Explicit Quality Settings
Consider adding explicit quality parameters for critical images:
```svelte
import hero1 from '$lib/assets/carousel-hero/1_DB_EXTERIOR_01 (2).jpg?enhanced&quality=85';
```

### 2. Format Preferences
For images that don't need transparency, consider forcing WebP:
```svelte
import image from '$lib/assets/image.jpg?enhanced&format=webp';
```

### 3. Width Constraints
For very large images, consider adding width constraints:
```svelte
import largeImage from '$lib/assets/image.jpg?enhanced&w=1920';
```

### 4. Performance Monitoring
- Monitor actual file sizes in build output
- Check Lighthouse scores for image optimization
- Verify responsive srcset generation

---

## Notes

- All images use the `?enhanced` query parameter for import
- No explicit quality, format, or width parameters are currently set
- **The `sizes` attribute is used by the browser at runtime, not at build time**
- **Fixed-width image variants are generated at build time** (default: 640w, 768w, 1024w, 1280w, 1920w)
- **Viewport-relative units (`100vw`, `50vw`) are evaluated by the browser** to select the appropriate image from the srcset
- Default quality (80-85%) provides good balance between file size and visual quality
- WebP/AVIF formats are automatically generated with original format fallbacks

### Customizing Generated Widths

To override the default widths, you can specify explicit widths in the import:

```svelte
// Generate specific widths
import hero1 from '$lib/assets/carousel-hero/image.jpg?enhanced&w=400;800;1200;1920';

// Or use a single max width
import hero1 from '$lib/assets/carousel-hero/image.jpg?enhanced&w=1920';
```

### Configuring Format and Quality

#### Global Configuration (All Images)

To configure format and quality for all images, update `vite.config.ts`:

```typescript
import { enhancedImages } from '@sveltejs/enhanced-img';

export default defineConfig({
	plugins: [
		enhancedImages({
			// Generate only JPG format (disable WebP/AVIF)
			// Set default quality to 85 (range: 1-100)
			defaultDirectives: () => new URLSearchParams({
				format: 'jpg',
				quality: '85'
			})
		}),
		sveltekit()
	]
});
```

**Quality Guidelines:**
- **90-100:** Very high quality, large files (use for hero images)
- **80-89:** High quality, good balance (recommended default)
- **70-79:** Good quality, smaller files (acceptable for thumbnails)
- **60-69:** Lower quality, small files (not recommended for photos)
- **Below 60:** Poor quality, very small files (avoid for photos)

**Effects of JPG-only configuration:**
- Only JPG format will be generated (no WebP/AVIF)
- Original PNG files will be converted to JPG
- Smaller build output (fewer format variants)
- **Trade-off:** Larger file sizes (JPG is less efficient than WebP/AVIF)

#### Per-Image Override

You can override format and quality for specific images:

```svelte
// High quality JPG for hero image
import hero1 from '$lib/assets/hero.jpg?enhanced&format=jpg&quality=90';

// Lower quality for thumbnail
import thumb from '$lib/assets/thumb.jpg?enhanced&format=jpg&quality=75';

// Force WebP with specific quality (overrides default)
import image from '$lib/assets/image.jpg?enhanced&format=webp&quality=85';
```

#### Quality Settings by Use Case

**Recommended quality settings:**

| Use Case | Quality | Format | Rationale |
|----------|---------|--------|-----------|
| Hero images | 85-90 | JPG/WebP | High visibility, first impression |
| Interior photos | 80-85 | JPG/WebP | Good balance for gallery images |
| Floor plans | 75-80 | JPG/WebP | Technical drawings, lower quality acceptable |
| Thumbnails | 70-75 | JPG/WebP | Small size, less detail needed |
| Place photos | 80-85 | JPG/WebP | Gallery images, good balance |

#### Current Configuration

**Current settings:**
- Format: JPG only (WebP/AVIF disabled)
- Quality: 85 (high quality, good balance)
- Applied globally to all images

**To change quality only (keep multiple formats):**
```typescript
enhancedImages({
	defaultDirectives: () => new URLSearchParams({
		quality: '85'  // Keep default format behavior (WebP/AVIF)
	})
})
```

**To change format only (keep default quality):**
```typescript
enhancedImages({
	defaultDirectives: () => new URLSearchParams({
		format: 'jpg'  // Use default quality (typically 80-85%)
	})
})
```

This is useful when:
- You know the exact maximum size needed (e.g., max container width is 1200px)
- You want to reduce the number of generated variants
- You need specific breakpoints that match your design system

---

**Related Documentation:**
- [Ticket #007: Image Optimization](../tickets/007-image-optimization.md)
- [Implementation Plan](../tickets/007-implementation-plan.md)
- [Compatibility Issue](../tickets/007-compatibility-issue.md)
