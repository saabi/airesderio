# Svelte Guidelines Compliance Review

**Date:** 2025-01-XX  
**Reviewer:** AI Assistant  
**Scope:** All Svelte components in `fe/src/lib/components/` and `fe/src/routes/`

## Summary

Reviewed **36 Svelte components** against the guidelines in `docs/specs/svelte-guidelines.md`.

### Overall Status

✅ **Good News:**
- No deprecated `export let` syntax found
- No deprecated `$:` reactive statements found
- No deprecated `<slot>` usage found
- All components use Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`)
- Event handlers use correct `onclick`, `onsubmit` syntax (not `on:click`)

⚠️ **Issues Found:**
- **Code organization** issues in multiple components
- **Module script block** missing or incomplete in several components
- **Import ordering** issues
- **Variable declaration order** issues

## Detailed Findings

### Critical Issues (Must Fix)

#### 1. PinLabel.svelte
**Issue:** Missing module script block, types in instance script

**Current:**
```svelte
<script lang="ts">
  // ===== TYPES =====
  type ArrowPosition = 'bottom' | 'top' | 'left' | 'right';
  interface Props { ... }
</script>
```

**Should be:**
```svelte
<script module lang="ts">
  // ===== TYPES =====
  type ArrowPosition = 'bottom' | 'top' | 'left' | 'right';
  interface Props { ... }
</script>
<script lang="ts">
  // ===== PROPS =====
  ...
</script>
```

**Priority:** High  
**Impact:** Types should be in module script for consistency

---

#### 2. Map.svelte
**Issue:** Static constants in instance script instead of module script

**Current:**
```svelte
<script lang="ts">
  // ===== STATIC CONSTANTS =====
  const FULL_VIEWBOX = { ... };
  const NEAR_VIEWBOX = { ... };
  const PLACE_PATH_IDS = [ ... ];
  ...
</script>
```

**Should be:**
```svelte
<script module lang="ts">
  // ===== STATIC CONSTANTS =====
  const FULL_VIEWBOX = { ... };
  const NEAR_VIEWBOX = { ... };
  const PLACE_PATH_IDS = [ ... ];
  ...
</script>
<script lang="ts">
  // ===== PROPS =====
  ...
</script>
```

**Priority:** High  
**Impact:** Static constants should be in module script for better performance

---

#### 3. ContactForm.svelte
**Issues:**
- Missing Props interface
- State declared before props
- Missing proper organization

**Current:**
```svelte
<script lang="ts">
  // ===== STATE =====
  let formElement: HTMLFormElement | null = $state(null);
  let isLoading = $state(false);
  ...
</script>
```

**Should be:**
```svelte
<script module lang="ts">
  // ===== TYPES =====
  interface Props {
    // Add props if needed
  }
</script>
<script lang="ts">
  // ===== PROPS =====
  let { ... }: Props = $props();
  
  // ===== STATE =====
  let formElement: HTMLFormElement | null = $state(null);
  ...
</script>
```

**Priority:** High  
**Impact:** Violates organization guidelines

---

#### 4. Hero.svelte
**Issues:**
- Props interface in instance script (should be in module script)
- Imports in instance script (should be in module script)
- Instance constants before props

**Current:**
```svelte
<script lang="ts">
  // ===== IMPORTS =====
  import { ANIMATION, ... } from '$lib/constants/animation';
  
  // ===== PROPS =====
  interface Props { ... }
  let { ... }: Props = $props();
  
  // ===== INSTANCE CONSTANTS =====
  const { action: heroObserver, ... } = createSectionObserver(...);
</script>
```

**Should be:**
```svelte
<script module lang="ts">
  // ===== IMPORTS =====
  import { ANIMATION, ... } from '$lib/constants/animation';
  
  // ===== TYPES =====
  interface Props { ... }
</script>
<script lang="ts">
  // ===== PROPS =====
  let { ... }: Props = $props();
  
  // ===== INSTANCE CONSTANTS =====
  const { action: heroObserver, ... } = createSectionObserver(...);
</script>
```

**Priority:** High  
**Impact:** Violates organization guidelines

---

#### 5. +page.svelte
**Issue:** Imports in instance script (should be in module script)

**Current:**
```svelte
<script module lang="ts">
  // ===== IMPORTS =====
  import ContactSection from '...';
  ...
</script>
<script lang="ts">
  // ===== IMPORTS =====
  import { page } from '$app/stores';
  import { ANIMATION, ... } from '$lib/constants/animation';
  ...
</script>
```

**Should be:**
```svelte
<script module lang="ts">
  // ===== IMPORTS =====
  import ContactSection from '...';
  import { page } from '$app/stores';
  import { ANIMATION, ... } from '$lib/constants/animation';
  ...
</script>
<script lang="ts">
  // ===== PROPS =====
  // (if any)
  
  // ===== INSTANCE CONSTANTS =====
  ...
</script>
```

**Priority:** High  
**Impact:** All imports should be in module script

---

### Medium Priority Issues

#### 6. Carousel.svelte
**Issue:** Functions declared before lifecycle functions

**Current:**
```svelte
<script lang="ts">
  // ===== FUNCTIONS =====
  function nextImage() { ... }
  function previousImage() { ... }
  ...
  
  // ===== LIFECYCLE =====
  onMount(() => { ... });
</script>
```

**Should be:**
```svelte
<script lang="ts">
  // ===== LIFECYCLE =====
  onMount(() => { ... });
  
  // ===== FUNCTIONS =====
  function nextImage() { ... }
  ...
</script>
```

**Priority:** Medium  
**Impact:** Organization - lifecycle should come before regular functions

---

#### 7. Input.svelte
**Issue:** Effects before functions (minor organization issue)

**Current:**
```svelte
<script lang="ts">
  // ===== REFS =====
  let inputElement: HTMLInputElement | null = $state(null);
  
  // ===== EFFECTS =====
  $effect(() => { ... });
</script>
```

**Note:** This is actually correct per guidelines (effects come after refs). No change needed.

**Priority:** None  
**Impact:** Actually follows guidelines correctly

---

### Additional Issues Found

#### 8. Header.svelte
**Issues:**
- State declared before props (should have props first, even if empty)
- Functions declared before lifecycle functions

**Current:**
```svelte
<script lang="ts">
  // ===== STATE =====
  let isMenuOpen = $state(false);
  ...
  
  function toggleMenu() { ... }
  function toggleTheme() { ... }
  ...
</script>
```

**Should be:**
```svelte
<script lang="ts">
  // ===== PROPS =====
  // (none, but section should exist)
  
  // ===== STATE =====
  let isMenuOpen = $state(false);
  ...
  
  // ===== LIFECYCLE =====
  onMount(() => { ... });
  
  // ===== FUNCTIONS =====
  function toggleMenu() { ... }
  ...
</script>
```

**Priority:** Medium  
**Impact:** Organization - should follow proper ordering

---

### Components That Follow Guidelines Well

✅ **Input.svelte** - Excellent organization, proper module/instance script separation  
✅ **Select.svelte** - Perfect structure, follows all guidelines  
✅ **Title.svelte** - Simple component, follows guidelines correctly  
✅ **Carousel.svelte** - Good structure, proper use of runes (minor function ordering issue)  
✅ **Map.svelte** - Good use of runes, just needs constants moved to module script

---

## Recommendations

### Priority 1 (Critical - Fix Immediately)
1. **PinLabel.svelte** - Add module script block, move types
2. **Map.svelte** - Move static constants to module script
3. **ContactForm.svelte** - Add Props interface, fix organization
4. **Hero.svelte** - Move Props interface and imports to module script
5. **+page.svelte** - Move imports to module script

### Priority 2 (Medium - Fix Soon)
6. **Carousel.svelte** - Reorder functions/lifecycle
7. **Header.svelte** - Add props section, reorder functions/lifecycle
8. Review other components for similar organization issues

### Priority 3 (Low - Nice to Have)
8. Review all components for consistent section comments
9. Ensure all components follow the exact ordering guidelines

---

## Checklist for Each Component

For each component, verify:

### Module Script Block
- [ ] All imports are in module script
- [ ] Types/interfaces are in module script
- [ ] Static constants are in module script

### Instance Script Block
- [ ] Props declared first
- [ ] State declared after props
- [ ] Derived declared after state
- [ ] Effects declared after derived
- [ ] Instance constants after effects
- [ ] Refs after instance constants
- [ ] Lifecycle functions before regular functions
- [ ] Functions organized (event handlers → lifecycle → utilities → async)

### Syntax Compliance
- [ ] Uses `$props()` not `export let`
- [ ] Uses `$state()` not regular `let` for state
- [ ] Uses `$derived()` not `$:`
- [ ] Uses `$effect()` not `$:`
- [ ] Uses `onclick` not `on:click`
- [ ] No `<slot>` usage (uses `{@render children()}` if needed)

---

## Next Steps

1. **Create tickets** for each critical issue
2. **Fix components** one by one, starting with Priority 1
3. **Test** after each fix to ensure functionality is preserved
4. **Document** any exceptions or special cases

---

## Notes

- All components are using Svelte 5 runes correctly ✅
- No deprecated syntax found ✅
- Main issues are organizational, not functional
- Fixes should be straightforward refactoring

---

**Related Documents:**
- [Svelte Guidelines](../specs/svelte-guidelines.md)
- [Architecture Documentation](../specs/architecture.md)
- [Process Documentation](../process/)

