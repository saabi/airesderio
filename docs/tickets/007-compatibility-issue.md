# Ticket #007: Compatibility Issue with @sveltejs/enhanced-img

## Problem

`@sveltejs/enhanced-img@0.9.2` requires:
- `@sveltejs/vite-plugin-svelte@^6.0.0`
- `vite@^6.3.0 || >=7.0.0`

However, the project uses:
- `@sveltejs/kit@2.16.1` which only supports `@sveltejs/vite-plugin-svelte@^5.0.0`
- `vite@6.0.11` (below the required 6.3.0)

## Error

```
Error: @sveltejs/enhanced-img requires @sveltejs/vite-plugin-svelte 6 or higher to be installed
```

## Options

### Option 1: Upgrade SvelteKit (Risky)
- Upgrade to latest SvelteKit (2.49.1+) which supports vite-plugin-svelte 6.0
- **Risk**: Major version jump (2.16.1 → 2.49.1) may introduce breaking changes
- **Effort**: High - requires testing all functionality
- **Recommendation**: Not recommended without thorough testing

### Option 2: Use vite-imagetools (Recommended)
- Switch to `vite-imagetools` (Option A from original plan)
- **Pros**: 
  - No dependency conflicts
  - Works with current SvelteKit version
  - More flexible configuration
- **Cons**: 
  - Requires query string syntax (`?w=800&format=webp`)
  - Slightly more manual setup
- **Recommendation**: ✅ **Recommended**

### Option 3: Wait for Compatibility
- Wait for `@sveltejs/enhanced-img` to support older SvelteKit versions
- **Risk**: May never happen (plugin targets latest versions)
- **Recommendation**: Not practical

## Decision

**Switch to `vite-imagetools`** - This was Option A in the original plan and is more compatible with the current project setup.

## Next Steps

1. Update implementation plan to use `vite-imagetools`
2. Install `vite-imagetools`
3. Configure Vite
4. Update components to use query string syntax

---

**Last Updated**: 2025-01-XX  
**Related**: Ticket #007 - Image Optimization

