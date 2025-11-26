# Development Setup Guide

**Related:** [Architecture Documentation](./architecture.md), [Feature Specification](./feature-specification.md)

## Prerequisites

Before starting development, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **pnpm** or **yarn**
- **Git** - [Download](https://git-scm.com/)
- **Google Maps API Key** - [Get from Google Cloud Console](https://console.cloud.google.com/google/maps-apis)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd airesderio
```

### 2. Install Dependencies

```bash
cd fe
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the `fe/` directory:

```bash
cd fe
cp .env.example .env
```

Edit `.env` and add your Google Maps API key:

```env
# Google Maps API Key (required)
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here

# Contact Form (optional - see Contact Form section)
RESEND_API_KEY=re_your_key_here
CONTACT_FORM_RECIPIENT=your_email@example.com
CONTACT_FORM_FROM=onboarding@your_domain.com
```

**Note**: Get your API key from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis). Make sure to restrict the API key to your domain for security.

### 4. Start Development Server

```bash
npm run dev

# Or open in browser automatically
npm run dev -- --open
```

The site will be available at `http://localhost:5173` (or the port shown in terminal).

## Development Tools

### Dev Color Editor

While running `npm run dev`, a paint palette button appears next to the theme toggle in the header. Use it to open the in-page color editor:

- The panel lists all CSS custom properties that resolve to a color value, showing a swatch, readable label, and the variable name.
- Adjust any color with the picker to see the change applied live across the site.
- Click **Copy updated variables** at the bottom to place a ready-to-paste `:root { ... }` block on the clipboard. Replace the existing values in `src/app.css` (or wherever your theme tokens live) to persist the changes.

## Available Scripts

### Development

```bash
# Start development server
npm run dev

# Start dev server and open browser
npm run dev -- --open
```

### Building

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

### Code Quality

```bash
# Type checking
npm run check

# Type checking in watch mode
npm run check:watch

# Format code with Prettier
npm run format

# Lint code with ESLint
npm run lint
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:unit
```

### Utility Scripts

#### Sync Place Photos

Update the photo references in the places JSON file based on files in the `static/lugares/` directory:

```bash
npm run sync:photos
```

#### Sync Place Geolocation

Update geolocation data for places of interest using Google Maps Geocoding API:

```bash
GOOGLE_MAPS_API_KEY=your_api_key npm run sync:geo
```

Options:
- `--dry-run` - Compute updates without writing to the JSON file
- `--place=cat/id` - Only process a specific place (e.g., `transporte/terminal_omnibus`)
- `--ref-lat=value` - Override reference latitude for distance calculations
- `--ref-lng=value` - Override reference longitude for distance calculations
- `--help` - Show help message

## Project Structure

```
fe/
├── src/
│   ├── lib/
│   │   ├── components/     # Reusable Svelte components
│   │   │   ├── forms/      # Form input components
│   │   │   └── dev/        # Development-only components
│   │   ├── data/           # Static data files
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Library exports
│   ├── routes/             # SvelteKit routes
│   │   ├── +layout.svelte  # Root layout component
│   │   └── +page.svelte    # Home page component
│   ├── app.css             # Global styles and theme variables
│   ├── app.html            # HTML template
│   └── app.d.ts            # Type definitions
├── static/                 # Static assets
│   ├── lugares/            # Location data and photos
│   └── iconos-servicios/   # Service icons
├── scripts/                # Utility scripts
│   ├── updatePlacePhotos.js
│   └── updatePlaceGeo.js
├── build/                  # Production build output (generated)
└── node_modules/           # Dependencies (generated)
```

## Technology Stack

### Core Framework
- **SvelteKit 2.16.0** - Full-stack framework
- **Svelte 5.0.0** - UI framework with runes
- **TypeScript 5.0.0** - Type safety
- **Vite 6.0.0** - Build tool and dev server

### Build & Deployment
- **@sveltejs/adapter-node** - Node.js adapter for server-side deployment
- **mdsvex 0.12.3** - Markdown support for Svelte

### Development Tools
- **Vitest 3.0.0** - Unit testing
- **ESLint 9.18.0** - Code linting
- **Prettier 3.4.2** - Code formatting
- **svelte-check 4.0.0** - Type checking for Svelte

## Development Workflow

### Making Changes

1. **Create a ticket** (if needed) - See [Ticket Workflow](../process/TICKETS.md)
2. **Create a feature branch**: `git checkout -b feature/T-XXX-description`
3. **Make your changes**
4. **Test your changes**: `npm run check && npm test`
5. **Format code**: `npm run format`
6. **Commit with conventions**: See [Commit Conventions](../process/COMMITS.md)
7. **Reference ticket**: Include ticket number in commit message

### Code Style

- **TypeScript**: Strict mode enabled
- **Svelte 5**: Use runes (`$state`, `$derived`, `$effect`, `$props`)
- **Component naming**: PascalCase (e.g., `ContactForm.svelte`)
- **File naming**: kebab-case (e.g., `contact-form.svelte`)
- **Variable naming**: camelCase
- **Constants**: UPPER_SNAKE_CASE

### Component Development

1. Create component in `src/lib/components/`
2. Export from `src/lib/index.ts` if reusable
3. Add to appropriate route
4. Write tests if needed
5. Update documentation if significant

### Working with Location Data

Location data is stored in `static/lugares/lugares-direcciones.json`.

**To update location data:**

1. Edit `static/lugares/lugares-direcciones.json`
2. Run `npm run sync:photos` if photos changed
3. Run `npm run sync:geo` if geolocation changed

**Location data structure:**
- Categories (e.g., `transporte`, `comercio`, `educacion`)
- Places within categories
- Each place has: name, address, coordinates, photos, distance

## Environment Variables

### Required

- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key for interactive map

### Optional

- `RESEND_API_KEY` - Resend API key for contact form (if using server-side)
- `CONTACT_FORM_RECIPIENT` - Email to receive form submissions
- `CONTACT_FORM_FROM` - Verified sender email in Resend

**Note**: Environment variables prefixed with `VITE_` are embedded in the client-side build and are publicly accessible. Never put sensitive secrets in `VITE_` variables.

## Common Issues

### Google Maps not loading

- Check that `VITE_GOOGLE_MAPS_API_KEY` is set correctly
- Verify API key restrictions allow your domain
- Check browser console for API errors

### Build fails

- Ensure Node.js version is 18 or higher
- Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check that all environment variables are set

### Type errors

- Run `npm run check` to see detailed type errors
- Ensure TypeScript strict mode is enabled
- Check `tsconfig.json` configuration

### Linting errors

- Run `npm run lint` to see linting errors
- Run `npm run format` to auto-fix formatting issues
- Check `.eslintrc` configuration

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:unit
```

### Writing Tests

- Unit tests alongside source files
- Use Vitest for testing
- Test components, utilities, and logic
- See existing tests for examples

## Debugging

### Browser DevTools

- Use browser DevTools for debugging
- Check console for errors
- Use React DevTools (if applicable)
- Network tab for API calls

### VS Code

- Use VS Code debugger
- Set breakpoints in TypeScript/Svelte files
- Use Svelte extension for better support

## Getting Help

- **Architecture questions**: See [Architecture Documentation](../specs/architecture.md)
- **Process questions**: See [Process Documentation](../process/)
- **Ticket questions**: See [Tickets](../tickets/)
- **Feature questions**: See [Feature Specification](./feature-specification.md)

---

**Related Documents:**
- [Architecture Documentation](./architecture.md)
- [Feature Specification](./feature-specification.md)
- [Commit Conventions](../process/COMMITS.md)
- [Ticket Workflow](../process/TICKETS.md)

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-XX

