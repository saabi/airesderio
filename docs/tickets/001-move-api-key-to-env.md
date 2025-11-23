# Ticket #001: Move Google Maps API Key to Environment Variables

## Priority
**High** - Security

## Type
Security, Configuration

## Description
The Google Maps API key is currently hardcoded in `Location.svelte` (line 9). This is a security risk as the key is exposed in version control and cannot be easily changed between environments.

## Current State
```typescript
// Location.svelte line 9
const GOOGLE_MAPS_API_KEY = 'AIzaSyAEjLiUxzFltYqAYYiIapqw9yt6O0ge2QY';
```

## Proposed Solution
1. Create `.env` file with `VITE_GOOGLE_MAPS_API_KEY`
2. Create `.env.example` file with placeholder
3. Update `Location.svelte` to use `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`
4. Add `.env` to `.gitignore` (if not already present)
5. Update README with environment variable setup instructions

## Acceptance Criteria
- [x] API key moved to environment variable
- [x] `.env.example` file created
- [x] `.env` added to `.gitignore` (already present)
- [x] Code updated to use environment variable
- [x] Documentation updated
- [x] Error handling added (development mode only)

## Implementation Steps
1. Create `.env.example`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

2. Update `Location.svelte`:
   ```typescript
   const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
   ```

3. Add error handling if key is missing

## Related Files
- `fe/src/lib/components/Location.svelte`
- `fe/.env` (to be created)
- `fe/.env.example` (to be created)
- `fe/.gitignore`
- `fe/README.md`

## Estimated Effort
1-2 hours

## Dependencies
None

