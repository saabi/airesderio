# Ticket #021: Typeface Selection - Detailed Implementation Plan

## Overview

This document provides a detailed, step-by-step implementation plan for adding a cohesive typeface system to the Aires de Río application. The plan assumes **Option 1 (Playfair Display + Inter)** as the selected pairing, but can be adapted for any chosen pairing.

## Phase 1: Load Google Fonts

### Step 1.1: Add Google Fonts to `app.html`

**File**: `fe/src/app.html`

**Location**: Inside `<head>` tag, before `%sveltekit.head%`

**Action**: Add Google Fonts link tags with font-display strategy

**Code to Add**:
```html
<!-- Google Fonts: Playfair Display (headings) and Inter (body) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Notes**:
- `preconnect` improves font loading performance
- `display=swap` prevents invisible text during font load
- Selected weights: Playfair Display (400, 700, 900), Inter (400, 500, 600, 700)
- Adjust weights based on final selection

**Verification**:
- Check Network tab in browser DevTools - fonts should load from Google Fonts
- Verify fonts appear in browser's font inspector

---

## Phase 2: Define CSS Variables

### Step 2.1: Add Font Variables to `app.css`

**File**: `fe/src/app.css`

**Location**: Inside `:root` block, after color variables (around line 100)

**Action**: Add font-family CSS variables

**Code to Add**:
```css
/* === Typography === */
--font-heading: 'Playfair Display', serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
--font-accent: var(--font-body); /* Optional: can be set to different font later */

/* Font weights */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 900;

/* Letter spacing */
--letter-spacing-tight: -0.02em;
--letter-spacing-normal: 0;
--letter-spacing-wide: 0.04em;
--letter-spacing-wider: 0.18em;

/* Line heights */
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.6;
--line-height-loose: 1.8;
```

**Notes**:
- Include fallback fonts in `--font-body` for graceful degradation
- Font weights match the weights loaded from Google Fonts
- Letter spacing values optimized for readability
- Line heights follow best practices

**Verification**:
- Variables should be available in browser DevTools CSS inspector
- No syntax errors in `app.css`

---

## Phase 3: Apply Fonts to Base Elements

### Step 3.1: Update `body` Element

**File**: `fe/src/app.css`

**Location**: `body` selector (around line 314)

**Current Code**:
```css
body {
	margin: 0;
	font-family: Arial, Helvetica, sans-serif;
	line-height: 1.6;
	color: var(--color-text-primary);
	background: var(--color-bg-canvas);
	overflow-x: hidden;
}
```

**Action**: Replace `font-family` and update `line-height`

**New Code**:
```css
body {
	margin: 0;
	font-family: var(--font-body);
	font-weight: var(--font-weight-normal);
	line-height: var(--line-height-relaxed);
	color: var(--color-text-primary);
	background: var(--color-bg-canvas);
	overflow-x: hidden;
}
```

**Notes**:
- Uses CSS variable for font-family
- Sets explicit font-weight
- Uses variable for line-height

---

### Step 3.2: Add Heading Styles (if not present)

**File**: `fe/src/app.css`

**Location**: After `body` selector (around line 322)

**Action**: Add or update heading styles

**Code to Add**:
```css
/* Typography: Headings */
h1, h2, h3, h4, h5, h6 {
	font-family: var(--font-heading);
	font-weight: var(--font-weight-bold);
	line-height: var(--line-height-tight);
	letter-spacing: var(--letter-spacing-normal);
	color: var(--color-text-primary);
	margin: 0;
}

h1 {
	font-size: 2.5rem;
	font-weight: var(--font-weight-extrabold);
	letter-spacing: var(--letter-spacing-tight);
}

h2 {
	font-size: 2rem;
	font-weight: var(--font-weight-bold);
}

h3 {
	font-size: 1.5rem;
	font-weight: var(--font-weight-bold);
}

h4 {
	font-size: 1.25rem;
	font-weight: var(--font-weight-semibold);
}

h5, h6 {
	font-size: 1rem;
	font-weight: var(--font-weight-semibold);
}
```

**Notes**:
- All headings use heading font
- Font sizes create clear hierarchy
- Responsive sizes may need media queries later

---

### Step 3.3: Update Paragraph Styles

**File**: `fe/src/app.css`

**Location**: After heading styles

**Action**: Add paragraph and text element styles

**Code to Add**:
```css
/* Typography: Body text */
p {
	font-family: var(--font-body);
	font-weight: var(--font-weight-normal);
	line-height: var(--line-height-relaxed);
	margin: 0 0 1rem 0;
}

/* Typography: Links */
a {
	font-family: var(--font-body);
	font-weight: var(--font-weight-medium);
	text-decoration: none;
	color: var(--color-text-link);
}

a:hover {
	text-decoration: underline;
}
```

**Notes**:
- Paragraphs use body font
- Links inherit body font with medium weight for emphasis

---

## Phase 4: Update Component-Specific Typography

### Step 4.1: Update `Title.svelte` Component

**File**: `fe/src/lib/components/ui/Title.svelte`

**Location**: `<style>` block (lines 22-68)

**Current Code** (`.title .big`):
```css
.title .big {
	/* Typography */
	font-size: 1.6em;
	font-weight: 800;
	letter-spacing: 0.04em;
	color: var(--color-accent-primary);
	text-transform: uppercase;
}
```

**Action**: Add `font-family` and update letter-spacing to use variable

**New Code**:
```css
.title {
	/* Layout */
	display: inline-block;
	margin: 4rem 0 2rem 0;

	/* Typography */
	font-family: var(--font-heading);
	font-size: 1.7rem;
}

.title .eyebrow {
	/* Layout */
	display: block;

	/* Typography */
	font-family: var(--font-body);
	font-weight: var(--font-weight-medium);
	letter-spacing: var(--letter-spacing-wider);
	color: var(--color-text-secondary);
	font-size: 0.6em;
	text-transform: uppercase;
}

.title .big {
	/* Layout */
	display: block;
	position: relative;
	padding-bottom: 0.5rem;

	/* Typography */
	font-family: var(--font-heading);
	font-size: 1.6em;
	font-weight: var(--font-weight-extrabold);
	letter-spacing: var(--letter-spacing-wide);
	color: var(--color-accent-primary);
	text-transform: uppercase;
}
```

**Notes**:
- `.title` container uses heading font
- `.eyebrow` uses body font (smaller, uppercase text)
- `.big` uses heading font with extrabold weight
- Letter spacing uses CSS variables

---

### Step 4.2: Update `Header.svelte` Navigation

**File**: `fe/src/lib/components/layout/Header.svelte`

**Location**: `<style>` block, navigation styles (around line 297+)

**Action**: Add font-family to navigation links

**Code to Find and Update**:
```css
/* Find .desktop-nav a or similar selector */
.desktop-nav a {
	/* Add or update */
	font-family: var(--font-body);
	font-weight: var(--font-weight-medium);
	/* ... existing styles ... */
}
```

**Specific Locations to Update**:
1. `.desktop-nav a` - Navigation links
2. `.nav-toggle` - Mobile menu button text (if text-based)
3. Any button text in header

**Notes**:
- Navigation typically uses body font for consistency
- Medium weight for better visibility

---

### Step 4.3: Update `FloatingCTA.svelte`

**File**: `fe/src/lib/components/ui/FloatingCTA.svelte`

**Location**: `<style>` block, button styles

**Action**: Add font-family to CTA button

**Code to Add**:
```css
.cta-button {
	/* ... existing styles ... */
	font-family: var(--font-body);
	font-weight: var(--font-weight-semibold);
	/* ... existing styles ... */
}
```

**Notes**:
- Buttons typically use body font
- Semibold weight for emphasis

---

### Step 4.4: Update Form Components

**Files to Update**:
- `fe/src/lib/components/forms/Input.svelte`
- `fe/src/lib/components/forms/Textarea.svelte`
- `fe/src/lib/components/forms/Select.svelte`
- `fe/src/lib/components/forms/PhoneNumberInput.svelte`
- `fe/src/lib/components/forms/ContactForm.svelte`

**Action**: Add font-family to form elements

**Pattern for Each File**:
```css
/* In Input.svelte, Textarea.svelte, Select.svelte */
input,
textarea,
select {
	/* ... existing styles ... */
	font-family: var(--font-body);
	font-weight: var(--font-weight-normal);
	/* ... existing styles ... */
}

/* Labels */
label {
	font-family: var(--font-body);
	font-weight: var(--font-weight-medium);
	/* ... existing styles ... */
}
```

**Specific Updates**:

**Input.svelte**:
- `.input` class - add `font-family: var(--font-body);`
- `.label` class - add `font-family: var(--font-body); font-weight: var(--font-weight-medium);`

**Textarea.svelte**:
- `.textarea` class - add `font-family: var(--font-body);`
- `.label` class - add `font-family: var(--font-body); font-weight: var(--font-weight-medium);`

**Select.svelte**:
- `.select-input` class - add `font-family: var(--font-body);`
- `.label` class - add `font-family: var(--font-body); font-weight: var(--font-weight-medium);`

**PhoneNumberInput.svelte**:
- All input elements - add `font-family: var(--font-body);`
- Labels - add `font-family: var(--font-body); font-weight: var(--font-weight-medium);`

**ContactForm.svelte**:
- Form container - ensure inherits body font
- Error messages - add `font-family: var(--font-body);`
- Success messages - add `font-family: var(--font-body);`

**Notes**:
- Forms should use body font for readability
- Labels use medium weight for emphasis
- Inputs inherit body font

---

### Step 4.5: Update Section Components

**Files to Review and Update**:
- `fe/src/lib/components/sections/Hero.svelte`
- `fe/src/lib/components/sections/Intro.svelte`
- `fe/src/lib/components/sections/Interior.svelte`
- `fe/src/lib/components/sections/Equipment.svelte`
- `fe/src/lib/components/sections/Location.svelte`
- `fe/src/lib/components/sections/FloorPlans.svelte`
- `fe/src/lib/components/sections/ContactSection.svelte`

**Action**: Review each component and ensure typography uses CSS variables

**Pattern**:
- Paragraphs (`<p>`) - should inherit body font from `body` or explicitly set `font-family: var(--font-body);`
- Headings (`<h1>`, `<h2>`, etc.) - should inherit heading font from global styles or explicitly set `font-family: var(--font-heading);`
- Captions, descriptions - use body font

**Specific Locations**:

**Hero.svelte**:
- Any heading text - ensure uses heading font
- Any body text - ensure uses body font

**Intro.svelte**:
- Paragraphs - add `font-family: var(--font-body);` if not inheriting
- KPI descriptions - add `font-family: var(--font-body);`

**Interior.svelte**:
- Paragraphs - ensure body font
- Carousel captions - add `font-family: var(--font-body);`

**Equipment.svelte**:
- Equipment item descriptions - add `font-family: var(--font-body);`
- Icons labels - add `font-family: var(--font-body);`

**Location.svelte**:
- Location description paragraphs - ensure body font
- Map overlay text - add `font-family: var(--font-body);`
- Navigation button labels - add `font-family: var(--font-body);`

**FloorPlans.svelte**:
- Floor plan titles - add `font-family: var(--font-heading); font-weight: var(--font-weight-bold);`
- Floor plan descriptions - add `font-family: var(--font-body);`

**ContactSection.svelte**:
- Section text - ensure body font
- Form labels - already handled in form components

**Notes**:
- Most components will inherit fonts from global styles
- Explicitly set fonts only when needed for specific styling
- Captions and descriptions use body font

---

### Step 4.6: Update Footer Component

**File**: `fe/src/lib/components/layout/Footer.svelte`

**Location**: `<style>` block

**Action**: Add font-family to footer text

**Code to Add**:
```css
.footer-wrap {
	/* ... existing styles ... */
	font-family: var(--font-body);
	/* ... existing styles ... */
}

.footer-grid a {
	/* ... existing styles ... */
	font-family: var(--font-body);
	font-weight: var(--font-weight-normal);
	/* ... existing styles ... */
}
```

**Notes**:
- Footer typically uses body font
- Links use normal weight

---

## Phase 5: Typography Refinement

### Step 5.1: Adjust Font Sizes for Hierarchy

**File**: `fe/src/app.css`

**Location**: After base typography styles

**Action**: Add responsive font size adjustments

**Code to Add**:
```css
/* Responsive typography */
@media (max-width: 640px) {
	h1 {
		font-size: 2rem;
	}
	
	h2 {
		font-size: 1.75rem;
	}
	
	h3 {
		font-size: 1.25rem;
	}
	
	.title {
		font-size: 1.4rem;
	}
	
	.title .big {
		font-size: 1.4em;
	}
}
```

**Notes**:
- Mobile font sizes slightly smaller
- Maintains hierarchy on small screens

---

### Step 5.2: Refine Letter Spacing

**File**: `fe/src/lib/components/ui/Title.svelte`

**Location**: Already updated in Step 4.1

**Action**: Verify letter spacing values work well with selected fonts

**Notes**:
- Playfair Display may need adjusted letter spacing
- Test and refine based on visual appearance

---

### Step 5.3: Optimize Line Heights

**File**: `fe/src/app.css`

**Location**: Body and paragraph styles

**Action**: Verify line heights are optimal for readability

**Notes**:
- Inter works well with 1.5-1.6 line height
- Playfair Display may need tighter line height for headings

---

## Phase 6: Testing and Verification

### Step 6.1: Visual Testing

**Actions**:
1. Open application in browser
2. Navigate through all sections
3. Verify fonts load correctly
4. Check typography hierarchy
5. Verify readability at different screen sizes
6. Test in light and dark modes

**Checklist**:
- [ ] Fonts load from Google Fonts
- [ ] Headings use Playfair Display (or selected heading font)
- [ ] Body text uses Inter (or selected body font)
- [ ] Navigation uses appropriate font
- [ ] Forms use appropriate font
- [ ] Buttons use appropriate font
- [ ] Typography looks good in light mode
- [ ] Typography looks good in dark mode
- [ ] Mobile typography is readable
- [ ] Desktop typography is readable

---

### Step 6.2: Performance Testing

**Actions**:
1. Open browser DevTools Network tab
2. Reload page
3. Check font loading time
4. Verify `font-display: swap` prevents invisible text
5. Check for layout shift (CLS) during font load

**Checklist**:
- [ ] Fonts load within acceptable time (< 1 second)
- [ ] No invisible text during font load
- [ ] Minimal layout shift
- [ ] Fonts cached on subsequent loads

---

### Step 6.3: Cross-Browser Testing

**Actions**:
1. Test in Chrome/Edge
2. Test in Firefox
3. Test in Safari
4. Test in mobile browsers

**Checklist**:
- [ ] Fonts render correctly in all browsers
- [ ] Fallback fonts work if Google Fonts fail
- [ ] Typography consistent across browsers

---

### Step 6.4: Accessibility Testing

**Actions**:
1. Test with screen reader
2. Verify font sizes meet WCAG AA (minimum 16px for body)
3. Check color contrast with fonts
4. Test keyboard navigation

**Checklist**:
- [ ] Screen reader announces text correctly
- [ ] Body text is at least 16px
- [ ] Sufficient contrast between text and background
- [ ] Focus indicators visible

---

## Phase 7: Optimization (Optional)

### Step 7.1: Font Preloading

**File**: `fe/src/app.html`

**Location**: Inside `<head>`, after Google Fonts links

**Action**: Add preload links for critical fonts

**Code to Add** (if performance needs improvement):
```html
<!-- Preload critical fonts -->
<link rel="preload" href="https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWPN2pK3FqVx9Tg.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2" as="font" type="font/woff2" crossorigin>
```

**Notes**:
- Only add if font loading is slow
- Use actual font file URLs from Google Fonts
- May improve perceived performance

---

### Step 7.2: Font Subsetting (Advanced)

**Action**: If file sizes are too large, consider font subsetting

**Notes**:
- Google Fonts allows subset selection in URL
- Can limit to specific character sets (e.g., `&subset=latin,latin-ext`)
- Reduces file size but limits language support

---

## Summary of Files to Modify

### Core Files (Required)
1. `fe/src/app.html` - Add Google Fonts links
2. `fe/src/app.css` - Add CSS variables, update base typography

### Component Files (Required)
3. `fe/src/lib/components/ui/Title.svelte` - Update heading font
4. `fe/src/lib/components/layout/Header.svelte` - Update navigation fonts
5. `fe/src/lib/components/layout/Footer.svelte` - Update footer fonts
6. `fe/src/lib/components/ui/FloatingCTA.svelte` - Update button font

### Form Components (Required)
7. `fe/src/lib/components/forms/Input.svelte` - Update input and label fonts
8. `fe/src/lib/components/forms/Textarea.svelte` - Update textarea and label fonts
9. `fe/src/lib/components/forms/Select.svelte` - Update select and label fonts
10. `fe/src/lib/components/forms/PhoneNumberInput.svelte` - Update all form element fonts
11. `fe/src/lib/components/forms/ContactForm.svelte` - Update message fonts

### Section Components (Review and Update as Needed)
12. `fe/src/lib/components/sections/Hero.svelte` - Review typography
13. `fe/src/lib/components/sections/Intro.svelte` - Review typography
14. `fe/src/lib/components/sections/Interior.svelte` - Review typography
15. `fe/src/lib/components/sections/Equipment.svelte` - Review typography
16. `fe/src/lib/components/sections/Location.svelte` - Review typography
17. `fe/src/lib/components/sections/FloorPlans.svelte` - Review typography
18. `fe/src/lib/components/sections/ContactSection.svelte` - Review typography

## Estimated Time

- **Phase 1** (Load Fonts): 5 minutes
- **Phase 2** (CSS Variables): 10 minutes
- **Phase 3** (Base Elements): 15 minutes
- **Phase 4** (Components): 45-60 minutes
- **Phase 5** (Refinement): 15-20 minutes
- **Phase 6** (Testing): 30-45 minutes
- **Phase 7** (Optimization): 15-20 minutes (optional)

**Total**: ~2-3 hours

## Notes

- This plan assumes **Playfair Display + Inter** pairing
- Adjust font names and weights if different pairing is selected
- Test thoroughly before marking ticket complete
- Consider brand feedback on typography choices
- Document final font selection in ticket

