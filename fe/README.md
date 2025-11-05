# Aires de Río - Frontend

Frontend website for **Aires de Río**, a residential development project in Santiago del Estero, Argentina. This is a promotional website showcasing the apartments, amenities, location, and features of the development.

## Project Overview

Aires de Río is a new residential building project offering 2 and 4-room apartments with modern amenities. The website features information about the project's location, floor plans, equipment, nearby places of interest, and contact details.

## Technology Stack

- **[SvelteKit](https://kit.svelte.dev/)** - Full-stack framework
- **[Svelte 5](https://svelte.dev/)** - UI framework with runes
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Vite](https://vitejs.dev/)** - Build tool and dev server
- **[mdsvex](https://mdsvex.pngwn.io/)** - Markdown support for Svelte
- **[Vitest](https://vitest.dev/)** - Unit testing
- **Static Site Generation** - Deployed as static site using `@sveltejs/adapter-static`

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, pnpm, or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev

# Or open in browser automatically
npm run dev -- --open
```

The site will be available at `http://localhost:5173` (or the port shown in terminal).

### Dev Color Editor

While running `npm run dev`, a paint palette button appears next to the theme toggle in the header. Use it to open the in-page color editor:

- The panel lists all CSS custom properties that resolve to a color value, showing a swatch, readable label, and the variable name.
- Adjust any color with the picker to see the change applied live across the site.
- Click **Copy updated variables** at the bottom to place a ready-to-paste `:root { ... }` block on the clipboard. Replace the existing values in `src/app.css` (or wherever your theme tokens live) to persist the changes.

## Building

To create a production build:

```bash
npm run build
```

The built site will be in the `build/` directory.

Preview the production build locally:

```bash
npm run preview
```

## Scripts

### Sync Place Photos

Update the photo references in the places JSON file based on files in the `static/lugares/` directory:

```bash
npm run sync:photos
```

### Sync Place Geolocation

Update geolocation data for places of interest using Google Maps Geocoding API:

```bash
GOOGLE_MAPS_API_KEY=your_api_key npm run sync:geo
```

Options:
- `--dry-run` - Compute updates without writing to the JSON file
- `--place=cat/id` - Only process a specific place (e.g. `transporte/terminal_omnibus`)
- `--ref-lat=value` - Override reference latitude for distance calculations
- `--ref-lng=value` - Override reference longitude for distance calculations
- `--help` - Show help message

## Other Commands

```bash
# Type checking
npm run check

# Type checking in watch mode
npm run check:watch

# Format code
npm run format

# Lint code
npm run lint

# Run tests
npm run test

# Run tests in watch mode
npm run test:unit
```

## Project Structure

```
fe/
├── src/
│   ├── lib/
│   │   ├── components/     # Reusable Svelte components
│   │   └── utils/          # Utility functions
│   ├── routes/             # SvelteKit routes
│   ├── app.css             # Global styles and theme variables
│   ├── app.html            # HTML template
│   └── app.d.ts            # Type definitions
├── static/                 # Static assets
│   └── lugares/            # Place photos and location data
├── scripts/                # Utility scripts
│   ├── updatePlacePhotos.js
│   └── updatePlaceGeo.js
└── build/                  # Production build output
```

## Features

- **Responsive Design** - Mobile-first approach
- **Dark/Light Theme** - System preference detection with manual toggle
- **Interactive Location Map** - Shows nearby places of interest
- **Floor Plans** - Visual representation of available units
- **Equipment Section** - Showcase of building amenities
- **Contact Form** - Lead generation for potential buyers
- **SEO Optimized** - Static site generation for better performance

## Deployment

The site is configured for static deployment and is currently hosted at `ferreyrapons.com`. The build process generates a static site that can be deployed to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

## Development Notes

- The site uses Svelte 5 runes (`$state`, `$effect`, etc.)
- Theme persistence is handled via localStorage
- Location data is stored in `static/lugares/lugares-direcciones.json`
- Place photos are organized by category in `static/lugares/`
