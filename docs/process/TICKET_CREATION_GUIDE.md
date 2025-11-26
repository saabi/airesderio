# Ticket Creation Guide for Aires de Río

This guide helps create tickets for the Aires de Río project, using the general ticket guidelines in [TICKETS.md](./TICKETS.md).

**Related Documents:**
- [TICKETS.md](./TICKETS.md) - General ticket composition guidelines
- [Feature Specification](../specs/feature-specification.md) - Feature requirements
- [Architecture Documentation](../specs/architecture.md) - Technical architecture
- [Svelte Guidelines](../specs/svelte-guidelines.md) - Svelte coding conventions

---

## Overview

The general [TICKETS.md](./TICKETS.md) template is excellent for any ticket. This guide adds:
- **Project-specific context** for Aires de Río tickets
- **Pre-filled sections** with project references
- **Common ticket patterns** for this project
- **Checklists** for common ticket types

---

## Project-Specific Ticket Template

Use this template when creating tickets for Aires de Río:

```markdown
# Ticket #XXX: Brief Description

## Priority
**High** | **Medium** | **Low**

## Type
Feature | Bug Fix | Security | Refactoring | Documentation | Performance

## Description
Clear description of what needs to be done.

## Current State
Description of current implementation or problem.

## Proposed Solution
Step-by-step solution approach.

## Acceptance Criteria
- [ ] Criterion 1 (testable, specific)
- [ ] Criterion 2
- [ ] Criterion 3

## Implementation Steps
1. Step 1
2. Step 2
3. Step 3

## Related Files
- `path/to/file1.ts`
- `path/to/file2.svelte`

## Technical Details

**Implementation Notes:**
- Reference: [Architecture Documentation](../specs/architecture.md)
- Component: [Component location]
- Styling: [Theme variables, CSS patterns]
- Svelte: Follow [Svelte Guidelines](../specs/svelte-guidelines.md)

**Constraints:**
- Static site: No server-side code
- Environment variables: Use `VITE_` prefix
- Build: Static adapter only

## Testing Requirements
- [ ] Unit tests (if applicable)
- [ ] Manual testing checklist
- [ ] Browser compatibility check
- [ ] Responsive design check

## Estimated Effort
Small | Medium | Large

## Dependencies
- Blocks: #XXX
- Depends on: #YYY

## Related Documents
- [Feature Specification](../specs/feature-specification.md#section) - If feature-related
- [Architecture Documentation](../specs/architecture.md#section) - If architecture-related
- [Svelte Guidelines](../specs/svelte-guidelines.md) - If component-related
```

---

## Common Ticket Patterns

### Pattern 1: Component Ticket

**When:** Creating or modifying Svelte components

**Required Sections:**
- Component props interface (using `$props()`)
- Component behavior
- Styling requirements (theme variables)
- Accessibility requirements
- Svelte 5 patterns compliance

**References:**
- [Svelte Guidelines](../specs/svelte-guidelines.md)
- [Architecture Documentation - Components](../specs/architecture.md#component-architecture)

**Example:**
```markdown
## Technical Details

**Component:**
- File: `src/lib/components/NewComponent.svelte`
- Props: Use `$props()` with TypeScript interface
- State: Use `$state()` for local state
- Follow: [Svelte Guidelines](../specs/svelte-guidelines.md)

**Styling:**
- Use CSS custom properties from `src/app.css`
- Scoped styles only
- Responsive design required
```

### Pattern 2: Feature Ticket

**When:** Adding new website features

**Required Sections:**
- Feature description
- User flow
- UI/UX requirements
- Integration points

**References:**
- [Feature Specification](../specs/feature-specification.md)
- [Architecture Documentation](../specs/architecture.md)

**Example:**
```markdown
## Background/Context

This feature adds [feature name] to improve [benefit].
Reference: [Feature Specification - Section](../specs/feature-specification.md#section)

## Requirements

From Feature Specification:
- [ ] Requirement 1
- [ ] Requirement 2

## User Flow

1. User does X
2. System responds with Y
3. User sees Z
```

### Pattern 3: Bug Fix Ticket

**When:** Fixing bugs or issues

**Required Sections:**
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Error messages or logs
- Screenshots (if UI-related)

**Example:**
```markdown
## Current State

[Description of the bug or issue]

## Steps to Reproduce

1. Navigate to [page/section]
2. Perform [action]
3. Observe [incorrect behavior]

**Expected Behavior:**
- [What should happen]

**Actual Behavior:**
- [What actually happens]

## Environment
- Browser: [Chrome/Firefox/Safari version]
- OS: [Windows/Mac/Linux]
- Device: [Desktop/Mobile/Tablet]
```

### Pattern 4: Documentation Ticket

**When:** Updating or creating documentation

**Required Sections:**
- Target audience
- Content outline
- Related code/features
- Documentation location

**Example:**
```markdown
## Requirements

**Documentation Type:**
- [ ] Architecture documentation
- [ ] Feature specification
- [ ] Development setup
- [ ] Process documentation
- [ ] Other: [specify]

**Target Audience:**
- Developers
- LLM agents
- Both

**Content:**
- [ ] New documentation
- [ ] Update existing documentation
- [ ] Fix broken links
- [ ] Add examples
```

### Pattern 5: Performance Ticket

**When:** Optimizing performance

**Required Sections:**
- Current performance metrics
- Target performance goals
- Optimization strategy
- Measurement approach

**Example:**
```markdown
## Current State

**Performance Issues:**
- Page load time: [X seconds]
- Lighthouse score: [Y]
- Bundle size: [Z KB]

## Proposed Solution

**Optimization Strategy:**
- [ ] Image optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Bundle size reduction
- [ ] Other: [specify]

## Acceptance Criteria

- [ ] Page load time < 3 seconds
- [ ] Lighthouse Performance score > 90
- [ ] Bundle size reduced by [X]%
```

---

## Labeling Strategy

### Component Labels

Use component labels to indicate the area affected:
- `location` - Location/map related features
- `forms` - Form components and validation
- `components` - Reusable components
- `styles` - Styling and theme
- `navigation` - Navigation and routing
- `seo` - SEO and meta tags

### Type Labels

- `feature` - New features
- `bug` - Bug fixes
- `refactor` - Code refactoring
- `technical-debt` - Technical debt
- `documentation` - Documentation updates
- `performance` - Performance improvements

### Priority Labels

- `priority:high` - Security, critical bugs, blocking issues
- `priority:medium` - Important features, significant improvements
- `priority:low` - Nice-to-have, refactoring, optimizations

### Effort Labels (Optional)

- `effort:small` - < 1 day
- `effort:medium` - 1-3 days
- `effort:large` - 3-5 days
- `effort:xlarge` - > 5 days (consider breaking down)

---

## Checklist: Creating a Ticket

- [ ] Determine ticket type (Feature/Bug/Refactor/Docs)
- [ ] Use project-specific template
- [ ] Fill in Summary (2-3 sentences)
- [ ] Add Background/Context with documentation links
- [ ] List Requirements from feature spec (if applicable)
- [ ] Add Technical Details with architecture references
- [ ] Write specific, testable Acceptance Criteria
- [ ] Add Testing Requirements
- [ ] Link to related documentation
- [ ] Identify dependencies and blocking relationships
- [ ] Add appropriate labels (component, type, priority)
- [ ] Estimate effort if possible
- [ ] Review against [TICKETS.md](./TICKETS.md) guidelines
- [ ] Update `docs/README.md` with ticket entry

---

## Example: Complete Ticket

**Title:** `Ticket #012: Add contact form validation`

**Labels:** `forms`, `feature`, `priority:medium`, `effort:small`

**Description:**

```markdown
# Ticket #012: Add Contact Form Validation

## Priority
**Medium** - Improves user experience and data quality

## Type
Feature, User Experience

## Description

Add client-side validation to the contact form to provide immediate feedback
to users and prevent invalid submissions. This improves user experience and
reduces server-side validation errors.

## Current State

The contact form currently has no client-side validation. Users can submit
invalid data (e.g., invalid email, empty required fields) and only receive
feedback after server response.

## Proposed Solution

1. Add validation rules for each form field
2. Display validation errors inline
3. Disable submit button until form is valid
4. Show success message on valid submission

## Acceptance Criteria

- [ ] Email field validates email format
- [ ] Phone field validates phone number format
- [ ] Required fields show error if empty
- [ ] Validation errors display inline below fields
- [ ] Submit button disabled when form is invalid
- [ ] Submit button enabled when form is valid
- [ ] Success message displays after valid submission
- [ ] Form can be reset after submission

## Implementation Steps

1. Create validation utility functions in `src/lib/utils/validation.ts`
2. Update `ContactForm.svelte` to use validation
3. Add error display components
4. Add success message component
5. Test all validation scenarios

## Related Files

- `fe/src/lib/components/ContactForm.svelte`
- `fe/src/lib/components/forms/Input.svelte`
- `fe/src/lib/utils/validation.ts` (to be created)

## Technical Details

**Implementation Notes:**
- Use Svelte 5 runes (`$state`, `$derived`) for form state
- Follow [Svelte Guidelines](../specs/svelte-guidelines.md)
- Use TypeScript for validation functions
- Reference: [Architecture Documentation - Forms](../specs/architecture.md#forms)

**Validation Rules:**
- Email: Valid email format
- Phone: Valid phone number format (with country code)
- Name: Required, min 2 characters
- Message: Required, min 10 characters

## Testing Requirements

- [ ] Test valid form submission
- [ ] Test invalid email format
- [ ] Test invalid phone format
- [ ] Test empty required fields
- [ ] Test form reset
- [ ] Test on mobile devices
- [ ] Test with screen reader (accessibility)

## Estimated Effort
Small (1-2 days)

## Dependencies
None

## Related Documents

- [Feature Specification - Contact Form](../specs/feature-specification.md#contact-section)
- [Svelte Guidelines](../specs/svelte-guidelines.md)
- [Architecture Documentation](../specs/architecture.md)
```

---

## Differences from Generic Template

The generic template in [TICKETS.md](./TICKETS.md) is excellent and should be used. This guide adds:

1. **Project-Specific References:**
   - Links to `docs/specs/` documentation
   - Links to feature specifications
   - Links to architecture documents
   - Links to Svelte guidelines

2. **Aires de Río Context:**
   - Static site constraints
   - Svelte 5 patterns
   - Component organization
   - Theme/styling patterns

3. **Common Patterns:**
   - Component tickets
   - Feature tickets
   - Bug fix tickets
   - Documentation tickets
   - Performance tickets

**Use both together:**
- [TICKETS.md](./TICKETS.md) for general ticket writing guidelines
- This guide for project-specific context and patterns

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-XX  
**Related:** [TICKETS.md](./TICKETS.md), [Feature Specification](../specs/feature-specification.md)

