# Ticket #002: Implement Contact Form Submission

## Priority
**High** - Functionality

## Type
Feature, Backend Integration

## Description
The contact form in `ContactForm.svelte` currently has an empty `handleSubmit` function. Form submission needs to be implemented to enable lead generation.

## Current State
```typescript
// ContactForm.svelte
function handleSubmit(event: Event) {
    event.preventDefault();
    // Form submission logic can be added here
}
```

## Proposed Solution
Choose one of the following approaches:

### Option A: SvelteKit API Route (Recommended)
- Create API route: `src/routes/api/contact/+server.ts`
- Integrate with email service (SendGrid, Resend, or similar)
- Handle form validation server-side
- Return success/error responses

### Option B: Third-Party Service
- Integrate Formspree, Netlify Forms, or similar
- Minimal backend code required
- Built-in spam protection

### Option C: Custom Backend API
- Create separate backend service
- RESTful API endpoint
- Database storage for leads

## Acceptance Criteria
- [ ] Form submission handler implemented
- [ ] Success message displayed after submission
- [ ] Error handling and error messages
- [ ] Form validation (client and server-side)
- [ ] Loading state during submission
- [ ] Form reset after successful submission
- [ ] Spam protection (honeypot or reCAPTCHA)
- [ ] Email notification sent to site owner
- [ ] Form data stored/logged appropriately

## Implementation Steps (Option A - Recommended)
1. Install email service SDK (e.g., `@sendgrid/mail` or `resend`)
2. Create API route: `src/routes/api/contact/+server.ts`
3. Implement POST handler with validation
4. Integrate email service
5. Update `ContactForm.svelte` to call API route
6. Add success/error state management
7. Add loading indicator
8. Add form validation feedback

## Related Files
- `fe/src/lib/components/ContactForm.svelte`
- `fe/src/lib/components/ContactSection.svelte`
- `fe/src/routes/api/contact/+server.ts` (to be created)
- `fe/.env` (for email service API key)

## Estimated Effort
4-8 hours (depending on chosen approach)

## Dependencies
- Email service account (SendGrid, Resend, etc.)
- Environment variables for API keys

## Notes
- Consider adding rate limiting to prevent abuse
- May need to handle CORS if using external service
- Consider GDPR compliance for data handling

