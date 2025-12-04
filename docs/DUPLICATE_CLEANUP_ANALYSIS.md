# Duplicate Cleanup Logic Analysis

## Status: ✅ Fixed

**Fixed in commit**: `63e8858` (2025-12-03)

## Issue
Some Svelte components use both `onMount` (with a cleanup return function) and `onDestroy` with duplicate cleanup logic. This is redundant and potentially buggy since the cleanup code will run twice when the component is destroyed.

## Components with Duplicate Cleanup (Fixed)

### 1. `fe/src/lib/components/ui/ImageCarousel.svelte` ✅ Fixed

**Location**: Lines 117-133 (after fix)

**Previous Problem**:
- `onMount` returned a cleanup function that called:
  - `stopCarousel()`
  - `cleanupKeyboardNavigation()`
- `onDestroy` also called the same functions (duplicate)

**Resolution**:
- Removed `onDestroy` handler
- Removed unused `onDestroy` import
- Now relies solely on `onMount` cleanup return function

**Current Code**:
```typescript
onMount(() => {
  if (autoRotate) {
    startCarousel();
  }
  if (keyboardNavigation && browser) {
    requestAnimationFrame(() => {
      setupKeyboardNavigation();
    });
  }
  return () => {
    stopCarousel();                    // ✅ Single cleanup
    cleanupKeyboardNavigation();        // ✅ Single cleanup
  };
});
// onDestroy removed - no longer needed
```

---

### 2. `fe/src/lib/components/ui/Carousel.svelte` ✅ Fixed

**Location**: Lines 38-44 (after fix)

**Previous Problem**:
- `onMount` returned a cleanup function that called:
  - `stopCarousel()`
- `onDestroy` also called `stopCarousel()` (duplicate)

**Resolution**:
- Removed `onDestroy` handler
- Removed unused `onDestroy` import
- Now relies solely on `onMount` cleanup return function

**Current Code**:
```typescript
onMount(() => {
  startCarousel();
  return () => {
    stopCarousel();                    // ✅ Single cleanup
  };
});
// onDestroy removed - no longer needed
```

---

## Components Without Issues

### ✅ `fe/src/lib/components/layout/Header.svelte`
- Uses `onMount` with cleanup return function
- No `onDestroy` (correct implementation)

### ✅ `fe/src/lib/components/dev/DevColorEditor.svelte`
- Uses `onMount` without cleanup return
- No `onDestroy` (no cleanup needed)

### ✅ `fe/src/routes/+layout.svelte`
- Uses `onDestroy` only
- No `onMount` cleanup return (correct for this use case)

---

## Resolution

**Fix Applied**: Removed the `onDestroy` handlers from the affected components and rely solely on the cleanup return from `onMount`. This follows the recommended Svelte pattern:

1. Use `onMount` with cleanup return for setup/teardown
2. Only use `onDestroy` when cleanup logic cannot be handled by `onMount`'s return function (rare cases)

**Benefits Achieved**:
- ✅ Cleaner code
- ✅ Single source of truth for cleanup
- ✅ Follows Svelte best practices
- ✅ Prevents potential bugs from double cleanup

**Changes Made**:
- Removed `onDestroy` handlers from both carousel components
- Removed unused `onDestroy` imports
- Cleanup now happens only once via `onMount` return function

---

## Summary

| Component | Status | Resolution |
|-----------|--------|------------|
| `ImageCarousel.svelte` | ✅ Fixed | Removed `onDestroy`, using `onMount` cleanup return only |
| `Carousel.svelte` | ✅ Fixed | Removed `onDestroy`, using `onMount` cleanup return only |
| `Header.svelte` | ✅ Correct | No issues found |
| `DevColorEditor.svelte` | ✅ Correct | No issues found |
| `+layout.svelte` | ✅ Correct | No issues found |

**Total components with duplicate cleanup**: 0 (all fixed)

