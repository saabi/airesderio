# Aires de Río - Frontend Architecture Specification

## Overview

The Aires de Río frontend is a single-page application (SPA) built with **SvelteKit** and **Svelte 5**, designed as a promotional website for a residential development project in Santiago del Estero, Argentina. The application is statically generated and deployed as a static site.

## Technology Stack

### Core Framework
- **SvelteKit 2.16.0** - Full-stack framework providing routing, SSR capabilities, and build tooling
- **Svelte 5.0.0** - UI framework using the new runes API (`$state`, `$derived`, `$effect`, `$props`)
- **TypeScript 5.0.0** - Type safety and enhanced developer experience
- **Vite 6.0.0** - Build tool and development server

### Build & Deployment
- **@sveltejs/adapter-static 3.0.8** - Static site generation adapter
- **mdsvex 0.12.3** - Markdown support for Svelte components (`.svx` files)

### Development Tools
- **Vitest 3.0.0** - Unit testing framework
- **ESLint 9.18.0** - Code linting
- **Prettier 3.4.2** - Code formatting
- **svelte-check 4.0.0** - Type checking for Svelte

## Project Structure

```
fe/
├── src/
│   ├── lib/
│   │   ├── components/          # Reusable Svelte components
│   │   │   ├── forms/           # Form input components
│   │   │   └── dev/             # Development-only components
│   │   ├── data/                # Static data files
│   │   ├── utils/               # Utility functions and helpers
│   │   └── index.ts             # Library exports
│   ├── routes/                  # SvelteKit routes
│   │   ├── +layout.svelte       # Root layout component
│   │   └── +page.svelte         # Home page component
│   ├── app.css                  # Global styles and CSS variables
│   ├── app.html                 # HTML template
│   └── app.d.ts                 # Type definitions
├── static/                      # Static assets
│   ├── lugares/                 # Location data and photos
│   └── iconos-servicios/        # Service icons
├── scripts/                     # Utility scripts
│   ├── updatePlacePhotos.js     # Photo synchronization script
│   └── updatePlaceGeo.js        # Geolocation update script
├── build/                       # Production build output
└── node_modules/                # Dependencies
```

## Architecture Patterns

### Component Architecture

The application follows a **component-based architecture** with clear separation of concerns:

1. **Page Components** (`src/routes/`)
   - `+layout.svelte`: Root layout with Header and Footer
   - `+page.svelte`: Main page composition

2. **Feature Components** (`src/lib/components/`)
   - `Hero.svelte`: Hero section with main visual
   - `Intro.svelte`: Introduction section
   - `Location.svelte`: Interactive map with places of interest
   - `Interior.svelte`: Interior showcase
   - `Equipment.svelte`: Building amenities display
   - `FloorPlans.svelte`: Apartment floor plans
   - `ContactSection.svelte`: Contact information and form
   - `ContactForm.svelte`: Contact form component

3. **UI Components** (`src/lib/components/forms/`)
   - `Input.svelte`: Text input component
   - `PhoneNumberInput.svelte`: Phone number input with country code
   - `Select.svelte`: Dropdown select component
   - `Textarea.svelte`: Multi-line text input

4. **Layout Components**
   - `Header.svelte`: Site navigation and theme toggle
   - `Footer.svelte`: Site footer

5. **Utility Components**
   - `GoogleMap.svelte`: Google Maps integration wrapper
   - `CategorySelector.svelte`: Category filter for locations
   - `PhotoCarousel.svelte`: Image carousel component
   - `SvgViewport.svelte`: SVG viewport component

### State Management

The application uses **Svelte 5 runes** for reactive state management:

- **`$state`**: Reactive state variables
  - Used in components for local component state
  - Example: `let isMenuOpen = $state(false);`

- **`$derived`**: Computed/derived values
  - Automatically updates when dependencies change
  - Example: `let categories = $derived(placesData?.metadata?.categories || {});`

- **`$effect`**: Side effects and lifecycle
  - Runs when dependencies change
  - Used for DOM manipulation and cleanup

- **`$props`**: Component props
  - Type-safe component properties
  - Example: `let { jsonUrl = '/lugares/lugares-direcciones.json' }: Props = $props();`

### Svelte Stores

For cross-component state sharing, the application uses **Svelte stores**:

- `activeSection` (writable store): Tracks which page section is currently visible
- Used for scroll-based navigation highlighting

### Data Flow

1. **Static Data Loading**
   - Location data loaded from JSON: `/lugares/lugares-direcciones.json`
   - Data fetched client-side using `fetch()` API
   - Data structure includes categories, places, and metadata

2. **Component Communication**
   - Parent-child: Props passed down, events emitted up
   - Cross-component: Svelte stores for shared state
   - No global state management library (Redux, Zustand, etc.)

3. **Form Handling**
   - Form components use standard HTML form elements
   - Form submission handler currently empty (TODO)
   - Client-side validation using utility functions

## Styling Architecture

### CSS Custom Properties (Design Tokens)

The application uses a comprehensive **design token system** based on CSS custom properties:

1. **Reference Palette** (`--ref-*`)
   - Base color values in OKLCH color space
   - Brand colors, neutrals, semantic colors
   - Example: `--ref-brand-primary: oklch(0.4244 0.0717 59.27deg);`

2. **Functional Tokens** (`--color-*`, `--svg-*`)
   - Semantic color mappings
   - Background, text, border, icon colors
   - Example: `--color-bg-canvas: var(--ref-cream);`

3. **Theme System**
   - Light and dark themes via `data-theme` attribute
   - Theme switching with localStorage persistence
   - System preference detection
   - Theme observer for automatic updates

4. **Category Colors**
   - Semantic tokens for location categories
   - Example: `--category-transporte: var(--ref-blue-600);`

### CSS Architecture

- **Global Styles**: `src/app.css`
  - Design tokens
  - Base element styles
  - Utility classes
  - Scroll animation utilities

- **Component Styles**: Scoped styles in Svelte components
  - Each component has its own `<style>` block
  - Styles are automatically scoped by Svelte

- **Static CSS**: `static/global.css` (if exists)
  - Additional global styles

## Routing

SvelteKit uses **file-based routing**:

- Single route: `src/routes/+page.svelte` (home page)
- All content is on a single page with anchor-based navigation
- Navigation links use hash anchors: `#ubicacion`, `#planos`, `#equipados`

## Third-Party Integrations

### Google Maps API

- **Integration**: Google Maps JavaScript API
- **Usage**: Interactive map showing building location and nearby places
- **API Key**: Currently hardcoded in `Location.svelte` (security concern)
- **Features**:
  - Map markers for places of interest
  - Category-based filtering
  - Info windows with place details
  - Photo carousel integration

### External Services

- **Form Submission**: Not yet implemented (TODO)
- **Analytics**: Not configured
- **CDN**: Static assets served from build output

## Build Process

### Development
```bash
npm run dev
```
- Vite dev server with HMR (Hot Module Replacement)
- Available at `http://localhost:5173`

### Production Build
```bash
npm run build
```
- Static site generation
- Output in `build/` directory
- All routes pre-rendered as static HTML
- Fallback: `200.html` for SPA routing (if needed)

### Build Configuration

- **Adapter**: `@sveltejs/adapter-static`
  - Generates static HTML, CSS, and JS
  - No server required for deployment

- **Preprocessing**: 
  - `vitePreprocess()`: Vite preprocessing
  - `mdsvex()`: Markdown support

## Data Management

### Location Data

- **Source**: `static/lugares/lugares-direcciones.json`
- **Structure**:
  ```json
  {
    "metadata": {
      "categories": { ... }
    },
    "lugares": {
      "category": {
        "placeId": { ... }
      }
    }
  }
  ```
- **Sync Scripts**:
  - `updatePlacePhotos.js`: Syncs photo references
  - `updatePlaceGeo.js`: Updates geolocation data via Google Maps API

### Static Assets

- Images: `static/` directory
- Icons: `static/iconos-servicios/`
- Photos: `static/lugares/` organized by category

## Utilities

### Theme Management (`src/lib/utils/theme.ts`)

- `resolveInitialTheme()`: Determines initial theme from localStorage or system preference
- `applyTheme(theme)`: Applies theme to document
- `setTheme(theme)`: Sets and persists theme
- `startThemeObserver()`: Watches for system theme changes

### Section Visibility (`src/lib/utils/sectionVisibility.ts`)

- `createSectionObserver()`: Creates IntersectionObserver for scroll-based visibility
- Tracks active section for navigation highlighting
- Uses Svelte stores for reactive updates

### Phone Validation (`src/lib/utils/phoneValidator.ts`)

- Phone number validation utilities
- Multi-country phone support (`multiCountryPhone.ts`)

## Development Features

### Dev Color Editor

- Development-only component: `src/lib/components/dev/DevColorEditor.svelte`
- In-page color editor for design tokens
- Only loaded in development mode
- Allows live editing of CSS custom properties

### Scripts

- `sync:photos`: Updates photo references in JSON
- `sync:geo`: Updates geolocation data using Google Maps Geocoding API

## Performance Considerations

1. **Static Generation**: Pre-rendered HTML for fast initial load
2. **Code Splitting**: SvelteKit automatically code-splits routes
3. **Lazy Loading**: Google Maps API loaded asynchronously
4. **Image Optimization**: Manual optimization (no automatic image optimization configured)
5. **CSS**: Scoped styles reduce CSS bundle size

## Browser Support

- Modern browsers with ES6+ support
- CSS custom properties support required
- IntersectionObserver API for scroll animations
- LocalStorage for theme persistence

## Security Considerations

1. **API Keys**: Google Maps API key is hardcoded (should use environment variables)
2. **Form Submission**: No CSRF protection (not yet implemented)
3. **XSS**: Svelte automatically escapes content (built-in protection)
4. **CSP**: Not configured

## Accessibility

- Semantic HTML elements
- ARIA labels (partial implementation)
- Keyboard navigation support
- Focus management
- Theme respects system preferences
- Scroll animations respect `prefers-reduced-motion`

## Known Limitations

1. **Single Page**: All content on one page (no multi-page routing)
2. **Form Submission**: Not implemented
3. **API Key**: Hardcoded in source code
4. **Debug Code**: Console.log statements in production code
5. **Navigation Links**: Some links point to `#` (not implemented)
6. **SEO**: Limited meta tags and structured data

## Deployment

- **Target**: Static hosting (Netlify, Vercel, GitHub Pages, etc.)
- **Domain**: `ferreyrapons.com`
- **Build Output**: `build/` directory
- **Fallback**: `200.html` for client-side routing (if needed)

## Future Considerations

- Multi-page routing if content grows
- Backend API for form submissions
- Content Management System (CMS) integration
- Analytics integration
- Image optimization pipeline
- Progressive Web App (PWA) features

