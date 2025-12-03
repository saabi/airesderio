# Map Images Analysis - Ticket #007

## Current Map Images

**Location**: `fe/static/map/`  
**Component**: `fe/src/lib/components/features/Map.svelte`  
**Usage**: Embedded in SVG using `<image href="...">` elements

| Image | Size | Dimensions | Format | Status |
|-------|------|------------|--------|--------|
| `far.jpg` | 713KB | 1414×853px | JPEG (progressive) | ✅ Used |
| `near.jpg` | 547KB | 1414×853px | JPEG (progressive) | ✅ Used |
| **Total** | **1.26MB** | - | - | - |

## Current Implementation

The images are embedded in an SVG element:

```svelte
<svg>
  <g id='maps'>
    <image
      id='far'
      href='/map/far.jpg'
      x='0'
      y='0'
      width='374.12082'
      height='225.68958'
      preserveAspectRatio='none'
    />
    <image
      id='near'
      href='/map/near.jpg'
      x='81.364487'
      y='52.243599'
      width='69.217209'
      height='41.755505'
      preserveAspectRatio='none'
    />
  </g>
</svg>
```

## Optimization Considerations

### ⚠️ Limitation: SVG `<image>` Elements

**Problem**: `@sveltejs/enhanced-img` generates `<picture>` elements with multiple `<source>` tags for WebP/AVIF fallbacks. However, SVG `<image>` elements **cannot contain** `<picture>` elements - they only accept direct image URLs.

### Options for Optimization

#### Option A: Pre-optimize Manually (Recommended)
- Convert to WebP format manually or with a script
- Keep in `static/map/` (no need to move to `src/`)
- Update `href` attributes to point to `.webp` files
- Add fallback for browsers without WebP support (use original JPG)

**Pros**:
- Simple, no code changes needed
- Works with SVG `<image>` elements
- Can optimize both images to ~150-200KB each (70-80% reduction)

**Cons**:
- Manual process (not automated in build)
- Need to handle WebP support detection

#### Option B: Use CSS Background Images
- Move images to `src/lib/assets/map/`
- Use CSS `background-image` instead of SVG `<image>`
- Apply `@sveltejs/enhanced-img` via CSS or component

**Pros**:
- Can use `@sveltejs/enhanced-img` automation
- Modern format support

**Cons**:
- Requires significant refactoring of Map component
- SVG structure would need to change
- May break existing zoom/pan functionality

#### Option C: Keep As-Is (Not Recommended)
- Current images are already reasonably sized (713KB + 547KB)
- JPEG progressive encoding is already good
- Total 1.26MB is acceptable but could be better

**Pros**:
- No changes needed
- Already working

**Cons**:
- Missing 70-80% size reduction opportunity
- Not using modern formats

## Recommendation

**Use Option A**: Pre-optimize manually

1. Convert both images to WebP:
   ```bash
   # Using cwebp (WebP encoder)
   cwebp -q 85 fe/static/map/far.jpg -o fe/static/map/far.webp
   cwebp -q 85 fe/static/map/near.jpg -o fe/static/map/near.webp
   ```

2. Update Map.svelte to use WebP with JPG fallback:
   ```svelte
   <script lang='ts'>
     // Detect WebP support
     const supportsWebP = $derived(
       typeof window !== 'undefined' && 
       document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0
     );
   </script>
   
   <image
     id='far'
     href={supportsWebP ? '/map/far.webp' : '/map/far.jpg'}
     ...
   />
   <image
     id='near'
     href={supportsWebP ? '/map/near.webp' : '/map/near.jpg'}
     ...
   />
   ```

3. Expected results:
   - `far.jpg` (713KB) → `far.webp` (~150-200KB)
   - `near.jpg` (547KB) → `near.webp` (~100-150KB)
   - **Total reduction**: 1.26MB → ~250-350KB (70-80% reduction)

## Priority Assessment

**Priority**: **MEDIUM**

**Reasoning**:
- Images are already reasonably sized (not critical like 8.7MB contact image)
- Total size (1.26MB) is acceptable but optimization would help
- SVG context makes automated optimization complex
- Manual optimization is straightforward and effective

## Integration with Ticket #007

**Decision**: Include map images in optimization plan, but handle separately from carousel images due to SVG limitation.

**Approach**: Add as a separate phase (Phase 9) using manual WebP conversion, or handle as part of cleanup phase.

---

**Last Updated**: 2025-01-XX  
**Related**: Ticket #007 - Image Optimization

