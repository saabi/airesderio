# Ticket #021: Select Typeface System for Titles and Body Text

## Status
**Pending**

## Priority
**Medium** - Design, Branding

## Description

The application currently uses default system fonts. We need to select and implement a cohesive typeface system that includes:
- A font for headings/titles
- A font for body text
- Optional accent font for special elements (captions, quotes, etc.)

The typeface selection should align with the brand's aesthetic (warm, modern, residential development) and ensure excellent readability across all devices.

## Current State

### Current Typography
- **Headings**: Using default system font stack (likely `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
- **Body Text**: Using default system font stack
- **No Custom Fonts**: No Google Fonts or custom typefaces are currently loaded

### Typography Usage
- Section titles (e.g., "DISEÑO INTERIOR", "CÓMO ESTÁN EQUIPADOS", "PLANOS")
- Body paragraphs throughout the site
- Navigation links
- Form labels and inputs
- Button text
- Captions and descriptions

## Available Typeface Options

### Serif — Elegant, Editorial, Classic

**Playfair Display**
- High contrast, refined
- Great for headings, magazine-style layouts
- **Best for**: Section titles, hero headings

**Lora**
- Balanced and readable
- Good for body text paired with Playfair Display headings
- **Best for**: Body text, descriptions

**Merriweather**
- Sturdy, slightly condensed
- Excellent for long reading and professional docs
- **Best for**: Body text, detailed content

**EB Garamond**
- Traditional book serif
- Use for sophisticated printed pieces
- **Best for**: Elegant body text, formal content

### Sans-serif — Clean, Modern, Minimal

**Inter**
- Neutral, legible, UI-friendly
- Excellent for digital documents and slides
- **Best for**: Body text, UI elements, navigation

**Montserrat**
- Geometric and stylish
- Works well for headings and bold display text
- **Best for**: Headings, section titles, buttons

**Poppins**
- Rounded geometric sans
- Friendly, modern
- Pairs with Lora or Merriweather
- **Best for**: Headings, friendly UI elements

**Roboto**
- Versatile and readable
- Good default body font for web-like layouts
- **Best for**: Body text, general purpose

### Humanist & Warm — Approachable, Friendly

**Nunito / Nunito Sans**
- Rounded, soft
- Suitable for casual branding and presentations
- **Best for**: Body text, friendly UI

**Quicksand**
- Light and airy
- Best for headers or short blocks of text, not long reading
- **Best for**: Headings, short text blocks

### Display & Decorative — Distinctive for Attention-Grabbing

**Abril Fatface**
- Dramatic display serif
- Ideal for posters or strong headlines
- **Best for**: Hero headings, large display text

**Pacifico**
- Handwritten script
- Use sparingly for logos or playful headers
- **Best for**: Accent text, decorative elements (use sparingly)

**Great Vibes**
- Elegant script
- For invitations or stylized headings (limit to large sizes)
- **Best for**: Accent text, decorative headings (use sparingly)

### Monospace & Technical — Structured, Modern-Coding Aesthetic

**Source Code Pro**
- Clean monospace
- Good for technical documents, captions, or stylized blocks
- **Best for**: Code snippets, technical captions (if needed)

**Inconsolata**
- Designer-friendly monospace with personality
- **Best for**: Technical elements, captions (if needed)

### Handwritten & Casual — Personal, Artisanal Feel

**Indie Flower**
- Relaxed hand-drawn look
- Best for informal notes or creative thumbnails
- **Best for**: Accent text, informal elements (use sparingly)

**Caveat**
- Neat handwriting style
- Works for annotations or friendly callouts
- **Best for**: Accent text, annotations (use sparingly)

## Recommended Pairing Suggestions

### Option 1: Editorial with Modern Readability (Recommended)
- **Headings**: Playfair Display
- **Body**: Inter
- **Rationale**: Elegant, editorial headings with highly readable, modern body text. Perfect for a residential development brand that wants to convey sophistication and quality.

### Option 2: Stylish with Comfortable Reading
- **Headings**: Montserrat
- **Body**: Lora
- **Rationale**: Modern, geometric headings with comfortable serif body text. Clean and professional.

### Option 3: Modern but Warm
- **Headings**: Poppins
- **Body**: Nunito Sans
- **Rationale**: Friendly, approachable, modern. Good for a warm, welcoming brand.

### Option 4: Strong Visual Impact
- **Headings**: Abril Fatface (for hero/display) + Montserrat (for section titles)
- **Body**: Roboto
- **Rationale**: Dramatic impact for hero sections, clean and readable for body.

### Option 5: Classic Editorial
- **Headings**: Playfair Display
- **Body**: Merriweather
- **Rationale**: Traditional serif pairing, excellent for long-form reading.

## Brand Considerations

### Aires de Río Brand
- **Tone**: Warm, modern, residential development
- **Target Audience**: Potential homebuyers, families
- **Aesthetic**: Sophisticated but approachable, premium but welcoming
- **Content**: Mix of descriptive text, feature lists, and promotional content

### Recommended Approach
Given the brand's warm, modern aesthetic and residential focus, **Option 1 (Playfair Display + Inter)** or **Option 3 (Poppins + Nunito Sans)** would be most appropriate:
- Playfair Display + Inter: More sophisticated, premium feel
- Poppins + Nunito Sans: More friendly, approachable feel

## Implementation Steps

1. **Select Primary Pairing**
   - Review brand requirements
   - Choose heading font and body font
   - Optionally select accent font for special elements

2. **Load Google Fonts**
   - Add Google Fonts `<link>` tags to `app.html`
   - Or use `@import` in `app.css`
   - Consider font-display strategy (e.g., `font-display: swap`)

3. **Update CSS Variables**
   - Add font-family variables to `app.css`:
     ```css
     :root {
         --font-heading: 'Playfair Display', serif;
         --font-body: 'Inter', sans-serif;
         --font-accent: /* optional */;
     }
     ```

4. **Apply Fonts to Elements**
   - Update heading styles (h1, h2, h3, etc.) to use `--font-heading`
   - Update body text to use `--font-body`
   - Update navigation, buttons, forms to use appropriate fonts
   - Apply accent font to special elements if selected

5. **Typography Refinement**
   - Adjust font weights (e.g., headings: 700, body: 400)
   - Set appropriate font sizes for hierarchy
   - Adjust letter spacing (increase for display headings, normal for body)
   - Set line height for optimal readability

6. **Testing**
   - Test on multiple devices and browsers
   - Verify font loading performance
   - Check readability at different sizes
   - Ensure fallback fonts work correctly

7. **Optimization**
   - Consider font subsetting (if using custom fonts)
   - Implement font preloading for critical fonts
   - Monitor font loading performance

## Acceptance Criteria

- [ ] Primary typeface pairing selected and documented
- [ ] Google Fonts loaded in `app.html` or `app.css`
- [ ] CSS variables defined for font families
- [ ] All headings use the selected heading font
- [ ] All body text uses the selected body font
- [ ] Navigation, buttons, and forms use appropriate fonts
- [ ] Font weights and sizes create clear hierarchy
- [ ] Letter spacing optimized for readability
- [ ] Fonts load correctly on all tested browsers
- [ ] Fallback fonts work when custom fonts fail to load
- [ ] Performance impact is acceptable (font loading doesn't block rendering)
- [ ] Typography aligns with brand aesthetic

## Related Files

- `fe/src/app.html` - Add Google Fonts link tags
- `fe/src/app.css` - Define font CSS variables and apply fonts
- `fe/src/lib/components/ui/Title.svelte` - Heading component (may need font updates)
- All component files using typography

## Notes

- **Font Loading Strategy**: Use `font-display: swap` to prevent invisible text during font load
- **Performance**: Limit to 2-3 font families to avoid performance issues
- **Accessibility**: Ensure sufficient contrast and readable font sizes
- **Responsive**: Font sizes should scale appropriately on mobile devices
- **Script/Decorative Fonts**: If used, limit to large sizes and short text only
- **Pairing Rule**: Use 2-3 fonts maximum (heading + body + optional accent)

## Decision Required

**Action Needed**: Select the primary typeface pairing from the recommended options or propose an alternative based on brand requirements.

**Recommended**: Start with **Option 1 (Playfair Display + Inter)** for a sophisticated, modern editorial feel that aligns with a premium residential development brand.

