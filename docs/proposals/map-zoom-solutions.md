# Map Zoom Solutions: Handling Vertically Distant POI and Focal

## Problem
When a POI (Point of Interest) and the focal point are far apart vertically, the current zoom algorithm may:
- Require excessive zoom out to fit both in a wide container
- Exceed image bounds when trying to maintain container aspect ratio
- Make both elements too small to be useful

## Proposed Solutions

### 1. Use Base Image Aspect Ratio for Container
**Description**: Constrain the effective display area to match the base image's aspect ratio, regardless of actual container dimensions.

**Implementation**:
- Calculate effective container dimensions: `min(containerWidth, containerHeight * imageAspect)`
- Use this effective aspect ratio for zoom calculations

**Pros**:
- ✅ Prevents excessive horizontal expansion
- ✅ Maintains natural image proportions
- ✅ Simple to implement
- ✅ Works well for portrait images (like the current map)

**Cons**:
- ❌ Wastes horizontal space in wide containers
- ❌ May not use full available display area
- ❌ Less flexible for different screen sizes

---

### 2. Maximum ViewBox Size / Minimum Zoom Level
**Description**: Set a maximum viewBox size (minimum zoom level) to prevent excessive zoom out.

**Implementation**:
- Define `maxViewBoxWidth` and `maxViewBoxHeight` (e.g., 80% of image dimensions)
- If calculated viewBox exceeds these, clamp to maximum
- Center content within the clamped viewBox

**Pros**:
- ✅ Prevents content from becoming too small
- ✅ Maintains readability
- ✅ Simple threshold-based approach
- ✅ Works with any container aspect ratio

**Cons**:
- ❌ May clip content if POI and focal are extremely far apart
- ❌ Requires tuning the maximum size threshold
- ❌ Doesn't solve the fundamental fitting problem

---

### 3. Adaptive Margin Based on Content Spread
**Description**: Reduce margin when content is spread far apart to maximize available space.

**Implementation**:
- Calculate distance between POI and focal
- If distance exceeds threshold, reduce `zoomMargin` proportionally
- Formula: `effectiveMargin = zoomMargin * (1 - clamp((distance - threshold) / maxDistance, 0, 0.5))`

**Pros**:
- ✅ Automatically adapts to content spread
- ✅ Maximizes use of available space
- ✅ Maintains margin when content is close
- ✅ Smooth transition

**Cons**:
- ❌ May reduce margin too much for very distant points
- ❌ Requires tuning thresholds
- ❌ More complex calculation

---

### 4. Prioritize Vertical Fitting with Horizontal Clamping
**Description**: Always fit content vertically, then clamp horizontal expansion to image bounds.

**Implementation**:
- Calculate viewBox to fit content height
- Calculate required width based on container aspect
- If width exceeds image bounds, clamp width and allow vertical scrolling/overflow
- Or: fit by height, then clamp width to image bounds (may show letterboxing)

**Pros**:
- ✅ Ensures vertical content always fits
- ✅ Prevents horizontal overflow
- ✅ Works well for tall content

**Cons**:
- ❌ May show letterboxing (black bars) on sides
- ❌ Doesn't use full container width
- ❌ May require horizontal scrolling indicator

---

### 5. Two-Step Zoom: Fit Width First, Then Check Height
**Description**: Try to fit by width first, then verify height fits. If not, switch to height-first fitting.

**Implementation**:
1. Calculate viewBox fitting by width (current algorithm)
2. Check if resulting height exceeds image bounds
3. If yes, recalculate fitting by height and clamp width
4. Use the approach that keeps both within bounds

**Pros**:
- ✅ Handles both wide and tall content
- ✅ Prevents overflow in both dimensions
- ✅ Uses maximum available space
- ✅ Adaptive to content shape

**Cons**:
- ❌ More complex logic
- ❌ May cause slight jumps when switching strategies
- ❌ Requires careful edge case handling

---

### 6. Content-Aware Aspect Ratio Selection
**Description**: Choose container aspect ratio based on content aspect ratio and available space.

**Implementation**:
- If content is tall (aspect < 1), prefer using image aspect ratio
- If content is wide (aspect > 1), prefer using container aspect ratio
- Blend between the two based on content spread

**Pros**:
- ✅ Adapts to content characteristics
- ✅ Maximizes space usage intelligently
- ✅ Handles both tall and wide content well

**Cons**:
- ❌ Most complex implementation
- ❌ Requires tuning blend factors
- ❌ May cause inconsistent behavior

---

### 7. Allow Vertical Scrolling / Overflow
**Description**: If content doesn't fit, allow the map to scroll vertically while maintaining horizontal fit.

**Implementation**:
- Fit content horizontally to container
- If vertical content exceeds container, allow vertical scrolling
- Show scroll indicators when content overflows

**Pros**:
- ✅ Always shows full content
- ✅ Maintains horizontal fit
- ✅ Familiar UX pattern

**Cons**:
- ❌ Requires scroll handling
- ❌ May be unexpected for map users
- ❌ Less elegant than fitting everything

---

## Recommended Approach: Hybrid Solution

**Combine Solutions 1 + 2 + 4**:

1. **Primary**: Use base image aspect ratio for effective container (Solution 1)
   - Prevents excessive horizontal expansion
   - Maintains natural proportions

2. **Fallback**: Maximum viewBox size constraint (Solution 2)
   - Prevents excessive zoom out
   - Ensures minimum readability

3. **Safety**: Vertical-first fitting with horizontal clamp (Solution 4)
   - If content is extremely tall, prioritize vertical fit
   - Clamp horizontal expansion to image bounds

**Implementation Strategy**:
```typescript
// 1. Calculate effective container using image aspect ratio
const imageAspect = baseImageDimensions.width / baseImageDimensions.height;
const effectiveContainerWidth = Math.min(
  containerWidth,
  containerHeight * imageAspect
);
const effectiveAspect = effectiveContainerWidth / containerHeight;

// 2. Calculate viewBox as usual
// ... (current algorithm)

// 3. Apply maximum viewBox constraint
const maxViewBoxWidth = FULL_VIEWBOX.width * 0.9; // 90% of image
const maxViewBoxHeight = FULL_VIEWBOX.height * 0.9;
if (viewWidth > maxViewBoxWidth || viewHeight > maxViewBoxHeight) {
  // Clamp to maximum, maintaining aspect
  const scale = Math.min(
    maxViewBoxWidth / viewWidth,
    maxViewBoxHeight / viewHeight
  );
  viewWidth *= scale;
  viewHeight *= scale;
}

// 4. If still doesn't fit, prioritize vertical
if (viewHeight > FULL_VIEWBOX.height) {
  viewHeight = FULL_VIEWBOX.height;
  viewWidth = Math.min(viewHeight * effectiveAspect, FULL_VIEWBOX.width);
}
```

This hybrid approach provides:
- ✅ Natural image proportions (Solution 1)
- ✅ Prevents excessive zoom (Solution 2)
- ✅ Handles extreme cases (Solution 4)
- ✅ Progressive fallback strategy
