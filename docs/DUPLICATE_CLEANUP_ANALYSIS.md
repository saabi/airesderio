# Duplicate Cleanup Logic Analysis

## Issue
Some Svelte components use both `onMount` (with a cleanup return function) and `onDestroy` with duplicate cleanup logic. This is redundant and potentially buggy since the cleanup code will run twice when the component is destroyed.

## Components with Duplicate Cleanup

### 1. `fe/src/lib/components/ui/ImageCarousel.svelte`

**Location**: Lines 118-138

**Problem**:
- `onMount` returns a cleanup function that calls:
  - `stopCarousel()`
  - `cleanupKeyboardNavigation()`
- `onDestroy` also calls:
  - `stopCarousel()`
  - `cleanupKeyboardNavigation()`

**Code**:
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
    stopCarousel();                    // ❌ Duplicate
    cleanupKeyboardNavigation();        // ❌ Duplicate
  };
});

onDestroy(() => {
  stopCarousel();                      // ❌ Duplicate
  cleanupKeyboardNavigation();          // ❌ Duplicate
});
```

**Impact**: Both cleanup functions will be called when the component is destroyed, potentially causing:
- Double cleanup of intervals
- Double removal of event listeners
- Unnecessary function calls

---

### 2. `fe/src/lib/components/ui/Carousel.svelte`

**Location**: Lines 39-48

**Problem**:
- `onMount` returns a cleanup function that calls:
  - `stopCarousel()`
- `onDestroy` also calls:
  - `stopCarousel()`

**Code**:
```typescript
onMount(() => {
  startCarousel();
  return () => {
    stopCarousel();                    // ❌ Duplicate
  };
});

onDestroy(() => {
  stopCarousel();                      // ❌ Duplicate
});
```

**Impact**: `stopCarousel()` will be called twice when the component is destroyed, potentially:
- Clearing the interval twice (harmless but redundant)
- Unnecessary function calls

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

## Recommendation

**Fix**: Remove the `onDestroy` handlers from the affected components and rely solely on the cleanup return from `onMount`. This is the recommended Svelte pattern:

1. Use `onMount` with cleanup return for setup/teardown
2. Only use `onDestroy` when cleanup logic cannot be handled by `onMount`'s return function (rare cases)

**Benefits**:
- Cleaner code
- Single source of truth for cleanup
- Follows Svelte best practices
- Prevents potential bugs from double cleanup

---

## Summary

| Component | Status | Action Required |
|-----------|--------|----------------|
| `ImageCarousel.svelte` | ❌ Duplicate | Remove `onDestroy`, keep `onMount` cleanup return |
| `Carousel.svelte` | ❌ Duplicate | Remove `onDestroy`, keep `onMount` cleanup return |
| `Header.svelte` | ✅ Correct | No action needed |
| `DevColorEditor.svelte` | ✅ Correct | No action needed |
| `+layout.svelte` | ✅ Correct | No action needed |

**Total components with duplicate cleanup**: 2

