# Ticket #007: Image Optimization Implementation Plan
## Using @sveltejs/enhanced-img

## Overview

This plan implements image optimization using `@sveltejs/enhanced-img`, SvelteKit's official image optimization solution. This plugin automatically generates responsive images, modern formats (WebP/AVIF), and fallbacks at build time.

## Important Considerations

⚠️ **Key Limitation**: `@sveltejs/enhanced-img` works with **Vite asset imports** (from `src/` directory), not direct references to `static/` directory files. This means we have two options:

1. **Option A (Recommended)**: Move images from `static/` to `src/lib/assets/` and import them
2. **Option B**: Keep images in `static/` but use a hybrid approach (static for some, imported for others)

**Decision**: We'll use **Option A** for carousel images (Hero, Interior, Floor Plans) and **Option B** for dynamic place photos (keep in `static/places/` but optimize manually or use a different strategy).

---

## Phase 1: Setup and Configuration

### Step 1.1: Install Dependencies

```bash
cd fe
npm install -D @sveltejs/enhanced-img
```

### Step 1.2: Configure Vite

**File**: `fe/vite.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';

export default defineConfig({
	plugins: [
		enhancedImages(), // Must come BEFORE sveltekit()
		sveltekit()
	],
	// ... rest of config
});
```

### Step 1.3: Create Assets Directory Structure

Create directories for optimized images:

```bash
mkdir -p fe/src/lib/assets/carousel-hero
mkdir -p fe/src/lib/assets/carousel-interior
mkdir -p fe/src/lib/assets/floor-plans
mkdir -p fe/src/lib/assets/exteriores
```

### Step 1.4: Move Static Images to Assets

Move images from `static/` to `src/lib/assets/`:

```bash
# Hero carousel images
cp fe/static/carrousel-hero/* fe/src/lib/assets/carousel-hero/

# Interior carousel images
cp fe/static/carrousel-interior/* fe/src/lib/assets/carousel-interior/

# Floor plan images
cp fe/static/planos/* fe/src/lib/assets/floor-plans/

# Exterior image
cp fe/static/exteriores/exterior_03.png fe/src/lib/assets/exteriores/
```

**Note**: Keep original files in `static/` as backup until migration is complete and tested.

---

## Phase 2: Update Hero Carousel (Critical Priority)

### Step 2.1: Update Hero.svelte

**File**: `fe/src/lib/components/sections/Hero.svelte`

**Before**:
```svelte
<script module lang='ts'>
	const carouselImageFiles = [
		'1_DB_EXTERIOR_01 (2).jpg',
		'2_DB_EXTERIOR_01 (8).jpg',
		'3_DB_EXTERIOR_01 (1).jpg'
	];

	const CAROUSEL_IMAGES = carouselImageFiles.map(
		(file) => `/carrousel-hero/${encodeURIComponent(file)}`
	);
</script>
```

**After**:
```svelte
<script module lang='ts'>
	import { enhanced } from '@sveltejs/enhanced-img';
	
	// Import images with ?enhanced query parameter
	import hero1 from '$lib/assets/carousel-hero/1_DB_EXTERIOR_01 (2).jpg?enhanced';
	import hero2 from '$lib/assets/carousel-hero/2_DB_EXTERIOR_01 (8).jpg?enhanced';
	import hero3 from '$lib/assets/carousel-hero/3_DB_EXTERIOR_01 (1).jpg?enhanced';

	const CAROUSEL_IMAGES = [
		{ src: hero1, alt: 'Fachada del edificio Aires de Río - Imagen 1' },
		{ src: hero2, alt: 'Fachada del edificio Aires de Río - Imagen 2' },
		{ src: hero3, alt: 'Fachada del edificio Aires de Río - Imagen 3' }
	];
</script>

<script lang='ts'>
	// ... existing code ...
</script>

<section id='top' class='hero' ...>
	<VisuallyHidden id='hero-heading' tag='h2'>Presentación y Contacto - Aires de Río</VisuallyHidden>
	<div class='hero-carousel scroll-animate' ...>
		<Carousel
			images={CAROUSEL_IMAGES}
			interval={5000}
			ariaLabel='Carrusel de imágenes del edificio'
			imageAriaLabel={(index) => CAROUSEL_IMAGES[index].alt}
		/>
	</div>
</section>
```

### Step 2.2: Update Carousel Component

**File**: `fe/src/lib/components/ui/Carousel.svelte`

**Before**:
```svelte
{#each images as image, index}
	<div
		class='carousel-image'
		class:active={index === currentImageIndex}
		style="background-image: url('{image}')"
		role='img'
		aria-label={...}
	></div>
{/each}
```

**After**:
```svelte
<script module lang='ts'>
	import { enhanced } from '@sveltejs/enhanced-img';
	
	interface ImageData {
		src: string | typeof enhanced;
		alt?: string;
	}
	
	interface Props {
		images: string[] | ImageData[];
		// ... rest of props
	}
</script>

{#each images as image, index}
	{#if typeof image === 'string'}
		<!-- Fallback for string paths (backward compatibility) -->
		<div
			class='carousel-image'
			class:active={index === currentImageIndex}
			style="background-image: url('{image}')"
			role='img'
			aria-label={typeof imageAriaLabel === 'function' ? imageAriaLabel(index) : imageAriaLabel}
		></div>
	{:else}
		<!-- Enhanced image with picture element -->
		<div class='carousel-image' class:active={index === currentImageIndex} role='img' aria-label={image.alt || (typeof imageAriaLabel === 'function' ? imageAriaLabel(index) : imageAriaLabel)}>
			<enhanced:img
				src={image.src}
				alt={image.alt || `Imagen ${index + 1}`}
				sizes="100vw"
				loading={index === 0 ? 'eager' : 'lazy'}
				class='carousel-image-content'
			/>
		</div>
	{/if}
{/each}
```

**CSS Update**:
```css
.carousel-image {
	/* ... existing styles ... */
}

.carousel-image-content {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
```

### Step 2.3: Add Preload for First Image

**File**: `fe/src/app.html`

Add preload link in `<head>`:
```html
<link rel="preload" as="image" href="/_app/immutable/assets/carousel-hero/1_DB_EXTERIOR_01..." />
```

**Note**: The exact path will be generated at build time. We may need to use a dynamic approach or add this after first build.

---

## Phase 3: Update Interior Carousel (High Priority)

### Step 3.1: Update Interior.svelte

**File**: `fe/src/lib/components/sections/Interior.svelte`

**Before**:
```svelte
<script module lang='ts'>
	const interiorImageFiles = [
		'4_DB_Lobby.jpg',
		'5_DB_EXTERIOR_01 (6).jpg',
		'6_DB_EXTERIOR_01 (5).jpg',
		'7_DB_EXTERIOR_01 (7).jpg',
		'8_Antebaño y Lavadero.jpg',
		'9_DB_INT_BLANCO (5).png'
	];

	const INTERIOR_IMAGES = interiorImageFiles.map(
		(file) => `/carrousel-interior/${encodeURIComponent(file)}`
	);
</script>
```

**After**:
```svelte
<script module lang='ts'>
	import interior1 from '$lib/assets/carousel-interior/4_DB_Lobby.jpg?enhanced';
	import interior2 from '$lib/assets/carousel-interior/5_DB_EXTERIOR_01 (6).jpg?enhanced';
	import interior3 from '$lib/assets/carousel-interior/6_DB_EXTERIOR_01 (5).jpg?enhanced';
	import interior4 from '$lib/assets/carousel-interior/7_DB_EXTERIOR_01 (7).jpg?enhanced';
	import interior5 from '$lib/assets/carousel-interior/8_Antebaño y Lavadero.jpg?enhanced';
	import interior6 from '$lib/assets/carousel-interior/9_DB_INT_BLANCO (5).png?enhanced';

	const INTERIOR_IMAGES = [
		{ src: interior1, alt: 'Lobby del edificio' },
		{ src: interior2, alt: 'Exterior del edificio' },
		{ src: interior3, alt: 'Exterior del edificio' },
		{ src: interior4, alt: 'Exterior del edificio' },
		{ src: interior5, alt: 'Antebaño y lavadero' },
		{ src: interior6, alt: 'Interior del departamento' }
	];
</script>
```

Update Carousel usage:
```svelte
<Carousel
	images={INTERIOR_IMAGES}
	interval={2500}
	ariaLabel='Galería de imágenes del diseño interior'
	imageAriaLabel={(index) => INTERIOR_IMAGES[index].alt}
/>
```

---

## Phase 4: Update Floor Plans Carousel (Medium Priority)

### Step 4.1: Update FloorPlans.svelte

**File**: `fe/src/lib/components/sections/FloorPlans.svelte`

**Before**:
```svelte
<script module lang='ts'>
	const FLOOR_PLANS: FloorPlan[] = [
		{
			image: '/planos/1ra-planta-4-deptos.png',
			title: 'Primera Planta - 4 Departamentos',
			description: '...'
		},
		// ... more plans
	];
</script>
```

**After**:
```svelte
<script module lang='ts'>
	import plan1 from '$lib/assets/floor-plans/1ra-planta-4-deptos.png?enhanced';
	import plan2 from '$lib/assets/floor-plans/1ra-planta-4-deptos-a.png?enhanced';
	import plan3 from '$lib/assets/floor-plans/2 OCTUBRE_MODELO 1ra PLANTA_4 DPTOS 1 DORM.jpg?enhanced';
	import plan4 from '$lib/assets/floor-plans/2da-planta-3-deptos.png?enhanced';
	import plan5 from '$lib/assets/floor-plans/2da-planta-3-deptos-a.png?enhanced';
	import plan6 from '$lib/assets/floor-plans/2 OCTUBRE_MODELO 2da PLANTA_2 DPTOS 1 DORM_1 DEPTO DOBLE.jpg?enhanced';

	interface FloorPlan {
		image: typeof enhanced | string;
		title: string;
		description: string;
	}

	const FLOOR_PLANS: FloorPlan[] = [
		{
			image: plan1,
			title: 'Primera Planta - 4 Departamentos',
			description: 'Plano de la primera planta con 4 departamentos de 1 dormitorio cada uno.'
		},
		// ... more plans
	];
</script>
```

Update template:
```svelte
{#each FLOOR_PLANS as plan, index}
	<div
		class='carousel-image'
		class:active={index === currentPlanIndex}
		role='img'
		aria-label={`Plano ${index + 1}: ${plan.title}`}
	>
		<enhanced:img
			src={plan.image}
			alt={plan.title}
			sizes="(min-width: 1024px) 1024px, 100vw"
			loading="lazy"
			class='floor-plan-image'
		/>
	</div>
{/each}
```

**CSS Update**:
```css
.floor-plan-image {
	width: 100%;
	height: 100%;
	object-fit: contain;
}
```

---

## Phase 5: Update Contact Section Image (Medium Priority)

**Note**: The contact section image (`exterior_03.png`) is currently **8.7MB**, making it a high-priority optimization target despite being below-the-fold.

### Step 5.1: Move Image to Assets

```bash
# Create directory
mkdir -p fe/src/lib/assets/exteriores

# Copy image (keep original in static/ as backup)
cp fe/static/exteriores/exterior_03.png fe/src/lib/assets/exteriores/
```

### Step 5.2: Update ContactSection.svelte

**File**: `fe/src/lib/components/sections/ContactSection.svelte`

**Before**:
```svelte
<img
	src='/exteriores/exterior_03.png'
	alt='Aires de Río exterior'
	loading='lazy'
	decoding='async'
	class='exterior-image scroll-animate'
	style={`--scroll-animate-delay: ${animationDelay(1)}; --scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration()};`}
/>
```

**After**:
```svelte
<script module lang='ts'>
	import exteriorImage from '$lib/assets/exteriores/exterior_03.png?enhanced';
</script>

<enhanced:img
	src={exteriorImage}
	alt='Aires de Río exterior'
	sizes="(min-width: 850px) 50vw, 100vw"
	loading='lazy'
	decoding='async'
	class='exterior-image scroll-animate'
	style={`--scroll-animate-delay: ${animationDelay(1)}; --scroll-animate-offset: ${animationOffset('visual')}; --scroll-animate-duration: ${animationDuration()};`}
/>
```

**Expected Optimization**: 8.7MB PNG → ~300-500KB WebP (95%+ reduction)

---

## Phase 6: Handle Place Photos (Critical Priority - Special Case)

### Challenge

Place photos are **dynamically loaded** from `places.json` and referenced by filename. `@sveltejs/enhanced-img` requires **static imports** at build time, so we can't use it directly for dynamic images.

### Solution Options

**Option A (Recommended)**: Pre-optimize place photos manually or with a script, then reference optimized versions.

**Option B**: Use a hybrid approach - keep place photos in `static/` but optimize them with a build script.

**Option C**: Create a mapping file that imports all place photos statically.

### Step 6.1: Create Place Photos Import Map

**File**: `fe/src/lib/assets/places/index.ts`

```typescript
import { enhanced } from '@sveltejs/enhanced-img';

// Terminal
import terminal1 from './terminal/exterior.png?enhanced';
import terminal2 from './terminal/interior.png?enhanced';

// Forum
import forum1 from './forum/1_Forum 02.jpg?enhanced';
import forum2 from './forum/2_FORUM_03 de Tripadvisor.jpg?enhanced';
import forum3 from './forum/3_Forum 01.jpg?enhanced';
import forum4 from './forum/4_Forum 04.jpg?enhanced';
import forum5 from './forum/5_Forum_Santiago_del_Estero_3.jpeg?enhanced';
import forum6 from './forum/forum4.png?enhanced';

// Casa de Gobierno
import casagob1 from './casagob/1.jpg?enhanced';
import casagob2 from './casagob/aerea.JPG?enhanced';
import casagob3 from './casagob/casayparque2.JPG?enhanced';
import casagob4 from './casagob/casayparque3.JPG?enhanced';
import casagob5 from './casagob/casayplaza.png?enhanced';
import casagob6 from './casagob/estatuasanmartin.jpg?enhanced';
import casagob7 from './casagob/nocturna.jpg?enhanced';

// Plaza Vea
import plazavea1 from './plazavea/cinemas.png?enhanced';
import plazavea2 from './plazavea/comidas.jpg?enhanced';
import plazavea3 from './plazavea/exterior1.png?enhanced';
import plazavea4 from './plazavea/exterior2.png?enhanced';

// Parque Aguirre
import parqueaguirre1 from './parqueaguirre/aerea.png?enhanced';
import parqueaguirre2 from './parqueaguirre/calecita.png?enhanced';
import parqueaguirre3 from './parqueaguirre/deportes.png?enhanced';
import parqueaguirre4 from './parqueaguirre/guardavidas.png?enhanced';
import parqueaguirre5 from './parqueaguirre/juegos.png?enhanced';
import parqueaguirre6 from './parqueaguirre/recital.png?enhanced';
import parqueaguirre7 from './parqueaguirre/recital1.png?enhanced';

// Avenida Roca
import avroca1 from './avroca/1_Untitled-1.jpg?enhanced';
import avroca2 from './avroca/2__Calle Roca Confiterias_08.jpg?enhanced';
import avroca3 from './avroca/3__CALLE LA ROCA_ENCONTRARTE_02 de TURISMO.jpg?enhanced';
import avroca4 from './avroca/4_Calle Roca Confiterias_03.jpg?enhanced';
import avroca5 from './avroca/5_CALLE LA ROCA_ENCONTRARTE_03 de TURISMO.jpg?enhanced';
import avroca6 from './avroca/6_Calle Roca Confiterias_01.jpg?enhanced';
import avroca7 from './avroca/7_istockphoto-1091469178-612x612.jpg?enhanced';
import avroca8 from './avroca/8_CALLE LA ROCA_ENCONTRARTE_05 de TURISMO.jpg?enhanced';

// Create mapping object
export const PLACE_PHOTOS_MAP: Record<string, Record<string, typeof enhanced>> = {
	terminal: {
		'exterior.png': terminal1,
		'interior.png': terminal2
	},
	forum: {
		'1_Forum 02.jpg': forum1,
		'2_FORUM_03 de Tripadvisor.jpg': forum2,
		'3_Forum 01.jpg': forum3,
		'4_Forum 04.jpg': forum4,
		'5_Forum_Santiago_del_Estero_3.jpeg': forum5,
		'forum4.png': forum6
	},
	casagob: {
		'1.jpg': casagob1,
		'aerea.JPG': casagob2,
		'casayparque2.JPG': casagob3,
		'casayparque3.JPG': casagob4,
		'casayplaza.png': casagob5,
		'estatuasanmartin.jpg': casagob6,
		'nocturna.jpg': casagob7
	},
	plazavea: {
		'cinemas.png': plazavea1,
		'comidas.jpg': plazavea2,
		'exterior1.png': plazavea3,
		'exterior2.png': plazavea4
	},
	parqueaguirre: {
		'aerea.png': parqueaguirre1,
		'calecita.png': parqueaguirre2,
		'deportes.png': parqueaguirre3,
		'guardavidas.png': parqueaguirre4,
		'juegos.png': parqueaguirre5,
		'recital.png': parqueaguirre6,
		'recital1.png': parqueaguirre7
	},
	avroca: {
		'1_Untitled-1.jpg': avroca1,
		'2__Calle Roca Confiterias_08.jpg': avroca2,
		'3__CALLE LA ROCA_ENCONTRARTE_02 de TURISMO.jpg': avroca3,
		'4_Calle Roca Confiterias_03.jpg': avroca4,
		'5_CALLE LA ROCA_ENCONTRARTE_03 de TURISMO.jpg': avroca5,
		'6_Calle Roca Confiterias_01.jpg': avroca6,
		'7_istockphoto-1091469178-612x612.jpg': avroca7,
		'8_CALLE LA ROCA_ENCONTRARTE_05 de TURISMO.jpg': avroca8
	}
};
```

### Step 6.2: Move Place Photos to Assets

```bash
mkdir -p fe/src/lib/assets/places/{terminal,forum,casagob,plazavea,parqueaguirre,avroca}
cp -r fe/static/places/* fe/src/lib/assets/places/
```

### Step 6.3: Update PhotoCarousel Component

**File**: `fe/src/lib/components/features/PhotoCarousel.svelte`

Update to use the import map:

```svelte
<script module lang='ts'>
	import { PLACE_PHOTOS_MAP } from '$lib/assets/places/index';
	import type { PlaceMetadata } from '$lib/types';
	
	interface Props {
		place: PlaceMetadata;
		placeId: string;
		photos: string[];
		currentIndex?: number;
		onClose: () => void;
	}
</script>

<script lang='ts'>
	let { place, placeId, photos, currentIndex = 0, onClose }: Props = $props();
	
	// Map photo filenames to enhanced imports
	const enhancedPhotos = $derived.by(() => {
		const placeMap = PLACE_PHOTOS_MAP[placeId];
		if (!placeMap) return photos.map(p => ({ src: p, enhanced: false }));
		
		return photos.map(filename => {
			const enhanced = placeMap[filename];
			return enhanced 
				? { src: enhanced, enhanced: true, filename }
				: { src: `/places/${placeId}/${filename}`, enhanced: false, filename };
		});
	});
</script>

{#if enhancedPhotos.length > 0}
	<div class='overlay' ...>
		<div class='modal' ...>
			{#each enhancedPhotos as photo, index}
				{#if photo.enhanced}
					<enhanced:img
						src={photo.src}
						alt={`${place.nombre} - Foto ${index + 1}`}
						sizes="(min-width: 1024px) 90vw, 100vw"
						loading="lazy"
						class='photo-image'
						class:active={index === currentIndex}
					/>
				{:else}
					<img
						src={photo.src}
						alt={`${place.nombre} - Foto ${index + 1}`}
						loading="lazy"
						class='photo-image'
						class:active={index === currentIndex}
					/>
				{/if}
			{/each}
		</div>
	</div>
{/if}
```

---

## Phase 7: Testing and Verification

### Step 7.1: Build and Test

```bash
cd fe
npm run build
npm run preview
```

### Step 7.2: Verify Optimized Images

1. Check `fe/.svelte-kit/output/client/_app/immutable/assets/` for generated images
2. Verify WebP/AVIF formats are generated
3. Check responsive srcset attributes in generated HTML
4. Test image loading in browser DevTools

### Step 7.3: Performance Testing

1. Run Lighthouse audit:
   ```bash
   # Use Chrome DevTools Lighthouse or CLI
   lighthouse http://localhost:4173 --view
   ```

2. Check metrics:
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Total image size reduction
   - Network requests for images

3. Compare before/after:
   - Before: ~150-200MB total
   - After: Target ~15-25MB total (85-90% reduction)

### Step 7.4: Cross-Browser Testing

Test in:
- Chrome/Edge (WebP support)
- Firefox (WebP support)
- Safari (WebP support, AVIF limited)
- Mobile browsers

---

## Phase 8: Cleanup

### Step 8.1: Remove Old Static Images (After Verification)

Once everything is working:

```bash
# Backup first
cp -r fe/static fe/static.backup

# Remove old carousel images (keep places/ for now as fallback)
rm -rf fe/static/carrousel-hero
rm -rf fe/static/carrousel-interior
rm -rf fe/static/planos
# Keep fe/static/exteriores/exterior_03.png as fallback
```

### Step 8.2: Update .gitignore (if needed)

Add cache directory:
```
node_modules/.cache/imagetools
```

---

## Configuration Options

### Custom Image Transformations

You can add query parameters for specific transformations:

```svelte
<enhanced:img
	src={image}
	alt="..."
	sizes="100vw"
	?w=1920
	?h=1080
	?format=webp
	?quality=85
/>
```

### Build Performance

- First build will be slower (image processing)
- Subsequent builds use cache (`node_modules/.cache/imagetools`)
- Consider CI/CD cache for faster builds

---

## Rollback Plan

If issues arise:

1. Revert component changes
2. Remove `enhancedImages()` from `vite.config.ts`
3. Restore original image paths
4. Images in `static/` will still work

---

## Estimated Timeline

- **Phase 1 (Setup)**: 30 minutes
- **Phase 2 (Hero)**: 45 minutes
- **Phase 3 (Interior)**: 30 minutes
- **Phase 4 (Floor Plans)**: 30 minutes
- **Phase 5 (Contact)**: 15 minutes
- **Phase 6 (Place Photos)**: 2-3 hours (most complex)
- **Phase 7 (Testing)**: 1-2 hours
- **Phase 8 (Cleanup)**: 30 minutes

**Total**: 6-8 hours

---

## Success Criteria

- [ ] All carousel images use `enhanced:img` component
- [ ] WebP/AVIF formats generated automatically
- [ ] Responsive srcset attributes present
- [ ] Lazy loading implemented for below-fold images
- [ ] Preload for first hero image
- [ ] Lighthouse Performance score > 90
- [ ] Image size reduction > 80%
- [ ] All images load correctly in all browsers
- [ ] No broken image references
- [ ] Build process completes successfully

---

## Notes

- `@sveltejs/enhanced-img` requires images to be imported statically
- Dynamic images (from JSON) need special handling (import map)
- First build will be slower due to image processing
- Cache significantly speeds up subsequent builds
- Consider image CDN for production if needed

---

**Last Updated**: 2025-01-XX  
**Related**: Ticket #007 - Image Optimization  
**Images Inventory**: `docs/tickets/007-carousel-images-list.md`

