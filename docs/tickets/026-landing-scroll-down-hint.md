# Ticket #026: Landing scroll-down hint

## Status

**Complete**

## Priority

**Medium**

## Description

Users landing on the home page often watch the full-viewport hero video and do not realize there is more content below the fold. A subtle, time-delayed hint communicates that they can scroll.

## Implementation

- **Component:** [`fe/src/lib/components/ui/ScrollDownHint.svelte`](../../fe/src/lib/components/ui/ScrollDownHint.svelte) — fixed mid-viewport edge, 10s delay, pulse animation (fade-in when `prefers-reduced-motion`), dismiss on scroll, `localStorage` key `aires-scroll-hint-dismissed`.
- **Logic helper:** [`fe/src/lib/utils/scrollDownHint.ts`](../../fe/src/lib/utils/scrollDownHint.ts) — eligibility for starting the timer (scrollable page, not already scrolled, not previously dismissed).
- **Usage:** Rendered in [`fe/src/routes/+page.svelte`](../../fe/src/routes/+page.svelte) immediately after `<Hero />` (home only).

## Acceptance criteria

- [x] After 10s without scrolling (and when the page is scrollable), a small hint appears on the side at mid height with a scroll-down graphic.
- [x] Any scroll past the threshold dismisses the hint and persists dismissal in `localStorage`.
- [x] Hint does not show if the user already dismissed before, landed scrolled down, or the page cannot scroll.
