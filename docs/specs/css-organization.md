# CSS Organization Guidelines

**Related:** [Svelte Guidelines](./svelte-guidelines.md), [CSS Organization Review](../CSS_ORGANIZATION_REVIEW.md)

## Overview

This document outlines CSS organization and styling conventions for the Aires de Río project. Following these guidelines improves code readability, maintainability, and reduces merge conflicts.

## CSS Declaration Order

Follow a consistent, logical order for CSS properties. This improves readability, makes styles easier to maintain, and reduces merge conflicts.

### Order

1. **Positioning** — `position`, `top`/`right`/`bottom`/`left`, `z-index`
2. **Layout** — `display`, `flex`/`grid`, `float`, `width`/`height`, `margin`/`padding`
3. **Box/Visual** — `border`, `background`, `box-shadow`, `opacity`
4. **Typography** — `font-*`, `line-height`, `text-*`, `color`
5. **Effects & Motion** — `transform`, `transition`, `animation`
6. **Misc/Overrides** — `cursor`, `pointer-events`, custom properties, hacks

**Reason:** It flows from "where it is" → "how big it is" → "what it looks like" → "how it behaves." Clear, predictable, low-friction.

### Example

```css
.button {
  /* Positioning */
  position: relative;
  z-index: 10;
  
  /* Layout */
  display: inline-flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  margin: 0.5rem 0;
  
  /* Box/Visual */
  border: 1px solid var(--color-border-default);
  border-radius: 0.25rem;
  background: var(--color-accent-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  /* Typography */
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5;
  text-align: center;
  color: var(--color-text-inverse);
  
  /* Effects & Motion */
  transition: background-color 0.2s, transform 0.1s;
  
  /* Misc/Overrides */
  cursor: pointer;
  --custom-property: value;
}

.button:hover {
  /* Box/Visual */
  background: var(--color-accent-strong);
  
  /* Effects & Motion */
  transform: translateY(-1px);
}
```

## Property Categorization Reference

### Positioning

Properties that control where an element is positioned:

- `position` (static, relative, absolute, fixed, sticky)
- `top`, `right`, `bottom`, `left`
- `z-index`
- `inset` (shorthand for top/right/bottom/left)

**Note:** `position` should **always** be in the Positioning section, even if it's `position: relative` used for containing absolutely positioned children.

### Layout

Properties that control size, spacing, and flow:

- `display` (block, flex, grid, inline, etc.)
- `flex`, `flex-direction`, `flex-wrap`, `flex-grow`, `flex-shrink`, `flex-basis`
- `align-items`, `align-content`, `align-self`, `justify-content`, `justify-items`, `justify-self`
- `gap`, `row-gap`, `column-gap`
- `grid`, `grid-template-columns`, `grid-template-rows`, `grid-template-areas`
- `grid-column`, `grid-row`, `grid-area`
- `float`, `clear`
- `width`, `height`, `min-width`, `max-width`, `min-height`, `max-height`
- `margin`, `margin-top`, `margin-right`, `margin-bottom`, `margin-left`
- `padding`, `padding-top`, `padding-right`, `padding-bottom`, `padding-left`
- `overflow`, `overflow-x`, `overflow-y`
- `content` (for pseudo-elements like `::before` and `::after`)

**Important:** 
- `width` and `height` are **always** Layout properties, not Positioning
- `margin` and `padding` are **always** Layout properties, not Box/Visual
- `content` for pseudo-elements is a Layout property

### Box/Visual

Properties that control appearance and visual styling:

- `border`, `border-top`, `border-right`, `border-bottom`, `border-left`
- `border-width`, `border-style`, `border-color`
- `border-radius`, `border-top-left-radius`, etc.
- `background`, `background-color`, `background-image`, `background-position`, `background-size`, `background-repeat`
- `box-shadow`
- `opacity`
- `outline`, `outline-width`, `outline-style`, `outline-color`, `outline-offset`
- `filter`, `backdrop-filter`
- `visibility`

**Important:**
- `opacity` is a Box/Visual property, not Effects & Motion
- `outline` is Box/Visual, not Layout

### Typography

Properties that control text appearance:

- `font-family`, `font-size`, `font-weight`, `font-style`, `font-variant`
- `line-height`
- `text-align`, `text-decoration`, `text-transform`, `text-shadow`, `text-indent`
- `color`
- `white-space`, `word-wrap`, `word-break`, `overflow-wrap`
- `letter-spacing`, `word-spacing`
- `text-overflow`

**Important:**
- `color` is a Typography property, not Box/Visual
- `text-*` properties are Typography, not Layout

### Effects & Motion

Properties that control animations and transformations:

- `transform`, `transform-origin`, `transform-style`
- `transition`, `transition-property`, `transition-duration`, `transition-timing-function`, `transition-delay`
- `animation`, `animation-name`, `animation-duration`, `animation-timing-function`, `animation-delay`, `animation-iteration-count`, `animation-direction`, `animation-fill-mode`, `animation-play-state`

**Important:**
- `transform` is Effects & Motion, not Layout
- `transition` and `animation` are Effects & Motion, not Misc/Overrides

### Misc/Overrides

Special properties, custom properties, and browser-specific overrides:

- `cursor`
- `pointer-events`
- `user-select`
- `will-change`
- Custom properties (`--custom-property`)
- Browser-specific hacks (`-webkit-`, `-moz-`, `-ms-` prefixes)
- `resize`
- `appearance`

**Important:**
- `pointer-events` is Misc/Overrides, not Box/Visual
- `cursor` is Misc/Overrides, not Layout
- Custom properties (`--*`) go in Misc/Overrides

## Section Comments

Always use section comments to clearly separate property groups:

```css
.component {
  /* Positioning */
  position: relative;
  z-index: 10;
  
  /* Layout */
  display: flex;
  width: 100%;
  padding: 1rem;
  
  /* Box/Visual */
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  
  /* Typography */
  font-size: 1rem;
  color: var(--color-text);
  
  /* Effects & Motion */
  transition: all 0.2s;
  
  /* Misc/Overrides */
  cursor: pointer;
}
```

**Benefits:**
- Makes it easy to find properties
- Enforces consistent organization
- Reduces merge conflicts
- Improves code review

## Scoped Styles

Styles in Svelte components are automatically scoped to the component:

```svelte
<style>
  .button {
    padding: 1rem;
    background: var(--color-primary);
  }
</style>
```

The class `.button` will only apply to elements within this component, preventing style conflicts.

## Global Styles

Use `:global()` sparingly for styles that need to affect elements outside the component:

```svelte
<style>
  /* Global class */
  :global(.global-class) {
    /* Global styles */
  }
  
  /* Global styles within component scope */
  .component :global(p) {
    /* All <p> tags inside .component */
  }
  
  /* Global styles with data attributes */
  :global([data-theme='dark']) .component {
    /* Component styles when dark theme is active */
  }
</style>
```

**Best Practices:**
- Prefer scoped styles over global styles
- Only use `:global()` when necessary
- Document why global styles are needed
- Use data attributes for theme-based global styles

## CSS Variables

Use CSS custom properties (variables) for theming and consistent values:

```svelte
<style>
  .component {
    /* Using theme variables */
    color: var(--color-text);
    background: var(--color-bg);
    border: 1px solid var(--color-border-default);
  }
  
  /* Component-specific variables */
  .component {
    --component-padding: 1rem;
    --component-gap: 0.5rem;
    
    /* Layout */
    padding: var(--component-padding);
    gap: var(--component-gap);
  }
</style>
```

**Best Practices:**
- Use theme variables from `app.css` for colors, spacing, etc.
- Define component-specific variables in the Misc/Overrides section
- Use descriptive variable names
- Document custom variables if their purpose isn't obvious

## Pseudo-elements and Pseudo-classes

### Pseudo-elements (`::before`, `::after`)

Follow the same property order for pseudo-elements:

```css
.component::before {
  /* Positioning */
  position: absolute;
  top: 0;
  left: 0;
  
  /* Layout */
  content: '';
  width: 100%;
  height: 100%;
  
  /* Box/Visual */
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  
  /* Effects & Motion */
  transition: opacity 0.3s;
}
```

**Note:** `content` is required for `::before` and `::after` and is a Layout property.

### Pseudo-classes (`:hover`, `:focus`, etc.)

When adding styles for pseudo-classes, maintain the same section order:

```css
.button {
  /* ... base styles ... */
}

.button:hover {
  /* Box/Visual */
  background: var(--color-accent-strong);
  
  /* Effects & Motion */
  transform: translateY(-1px);
}

.button:focus-visible {
  /* Box/Visual */
  outline: 2px solid var(--color-accent-secondary);
  outline-offset: 2px;
}
```

## Media Queries

Maintain property order within media queries:

```css
.component {
  /* ... base styles ... */
}

@media (max-width: 850px) {
  .component {
    /* Layout */
    flex-direction: column;
    padding: 0.5rem;
    
    /* Typography */
    font-size: 0.9rem;
  }
}
```

## Common Mistakes to Avoid

### ❌ Incorrect: Mixing Property Categories

```css
.component {
  /* Positioning */
  position: relative;
  height: 100vh;  /* ❌ Should be Layout */
  padding: 1rem;   /* ❌ Should be Layout */
  
  /* Layout */
  display: flex;
  opacity: 0.5;   /* ❌ Should be Box/Visual */
  
  /* Box/Visual */
  background: red;
  transform: scale(1.1);  /* ❌ Should be Effects & Motion */
}
```

### ✅ Correct: Proper Categorization

```css
.component {
  /* Positioning */
  position: relative;
  
  /* Layout */
  display: flex;
  height: 100vh;
  padding: 1rem;
  
  /* Box/Visual */
  background: red;
  opacity: 0.5;
  
  /* Effects & Motion */
  transform: scale(1.1);
}
```

### ❌ Incorrect: Missing Section Comments

```css
.component {
  position: relative;
  display: flex;
  width: 100%;
  padding: 1rem;
  background: var(--color-bg);
  color: var(--color-text);
  transition: all 0.2s;
}
```

### ✅ Correct: With Section Comments

```css
.component {
  /* Positioning */
  position: relative;
  
  /* Layout */
  display: flex;
  width: 100%;
  padding: 1rem;
  
  /* Box/Visual */
  background: var(--color-bg);
  
  /* Typography */
  color: var(--color-text);
  
  /* Effects & Motion */
  transition: all 0.2s;
}
```

## Checklist for CSS Organization

When writing or reviewing CSS, verify:

### Property Categorization
- [ ] Positioning properties (`position`, `top`, `right`, `bottom`, `left`, `z-index`) are in "Positioning" section
- [ ] Layout properties (`display`, `width`, `height`, `margin`, `padding`, `flex`, `grid`) are in "Layout" section
- [ ] Visual properties (`border`, `background`, `box-shadow`, `opacity`) are in "Box/Visual" section
- [ ] Typography properties (`font-*`, `color`, `text-*`, `line-height`) are in "Typography" section
- [ ] Animation properties (`transform`, `transition`, `animation`) are in "Effects & Motion" section
- [ ] Override properties (`cursor`, `pointer-events`, custom properties) are in "Misc/Overrides" section

### Section Order
- [ ] Sections appear in correct order: Positioning → Layout → Box/Visual → Typography → Effects & Motion → Misc/Overrides
- [ ] Section comments are present and correctly formatted
- [ ] Properties within each section are logically grouped
- [ ] Empty sections are omitted (don't include a section if it has no properties)

### Code Quality
- [ ] CSS variables are used for theming values
- [ ] Scoped styles are preferred over global styles
- [ ] Global styles are documented when used
- [ ] Media queries maintain the same property order
- [ ] Pseudo-elements and pseudo-classes follow the same organization

## Examples

### Complete Component Example

```svelte
<style>
  .card {
    /* Positioning */
    position: relative;
    z-index: 1;
    
    /* Layout */
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 400px;
    padding: 1.5rem;
    margin: 1rem 0;
    gap: 1rem;
    overflow: hidden;
    
    /* Box/Visual */
    border: 1px solid var(--color-border-default);
    border-radius: 0.5rem;
    background: var(--color-bg-elevated);
    box-shadow: 0 2px 8px var(--shadow-subtle);
    
    /* Typography */
    font-family: var(--font-body);
    font-size: 1rem;
    line-height: 1.5;
    color: var(--color-text-default);
    
    /* Effects & Motion */
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    
    /* Misc/Overrides */
    cursor: pointer;
  }
  
  .card:hover {
    /* Box/Visual */
    box-shadow: 0 4px 12px var(--shadow-strong);
    
    /* Effects & Motion */
    transform: translateY(-2px);
  }
  
  .card-header {
    /* Layout */
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    
    /* Typography */
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-accent-primary);
  }
  
  .card-content {
    /* Layout */
    flex: 1;
    
    /* Typography */
    line-height: 1.6;
    color: var(--color-text-secondary);
  }
  
  @media (max-width: 768px) {
    .card {
      /* Layout */
      padding: 1rem;
      margin: 0.5rem 0;
      
      /* Typography */
      font-size: 0.9rem;
    }
  }
</style>
```

## Related Documents

- [Svelte Guidelines](./svelte-guidelines.md) - Complete Svelte coding guidelines
- [CSS Organization Review](../CSS_ORGANIZATION_REVIEW.md) - Review of CSS organization across components
- [Architecture Documentation](./architecture.md) - Project architecture overview

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-03  
**Maintained By:** Development Team

