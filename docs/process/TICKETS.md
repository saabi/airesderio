# Ticket Workflow

**Related:** [Commit Conventions](./COMMITS.md), [Tickets Directory](../tickets/)

## Overview

Tickets track improvements, features, and bug fixes for the Aires de Río project. They are stored as markdown files in `docs/tickets/` and follow a structured format.

## Ticket Structure

### Naming Convention

Tickets follow the pattern: `<number>-<kebab-case-description>.md`

**Examples:**
- `001-move-api-key-to-env.md`
- `002-implement-form-submission.md`
- `010-reorganize-components.md`

### Ticket Template

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
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Implementation Steps
1. Step 1
2. Step 2
3. Step 3

## Related Files
- `path/to/file1.ts`
- `path/to/file2.svelte`

## Estimated Effort
Small | Medium | Large

## Dependencies
- Blocks: #XXX
- Depends on: #YYY
```

## Ticket Lifecycle

### Status States

1. **Not Started** (⏸️) - Ticket created but work hasn't begun
2. **In Progress** (🔄) - Active work on the ticket
3. **Review** (👀) - Code ready for review
4. **Complete** (✅) - Work finished and merged
5. **Partially Complete** (⚠️) - Some work done but incomplete
6. **Blocked** (🚫) - Waiting on dependencies

### Status Tracking

Update ticket status in `docs/README.md`:

```markdown
### High Priority
- **#001**: ✅ Move API Key to Environment Variables - **Complete**
- **#002**: ⚠️ Implement Form Submission - **Partially Complete**
- **#003**: ⏸️ Fix Navigation Links - **Not Started**
```

## Priority Guidelines

### High Priority
- Security vulnerabilities
- Critical bugs blocking functionality
- Breaking issues affecting users
- Data loss or corruption risks

### Medium Priority
- Important features
- Significant improvements
- Performance optimizations
- Code quality improvements

### Low Priority
- Nice-to-have features
- Refactoring for maintainability
- Documentation improvements
- Minor optimizations

## Creating Tickets

### When to Create a Ticket

Create a ticket for:
- New features
- Bug fixes
- Refactoring work
- Documentation improvements
- Performance optimizations
- Security improvements

### How to Create a Ticket

1. **Determine next ticket number:**
   ```bash
   ls docs/tickets/ | wc -l
   # Or check the highest number
   ```

2. **Create ticket file:**
   ```bash
   touch docs/tickets/XXX-description.md
   ```

3. **Fill in template:**
   - Use the template above
   - Be specific and clear
   - Include acceptance criteria
   - List related files

4. **Update `docs/README.md`:**
   - Add ticket to appropriate priority section
   - Set initial status

5. **Commit:**
   ```bash
   git add docs/tickets/XXX-description.md docs/README.md
   git commit -m "docs: add ticket #XXX for description"
   ```

## Working on Tickets

### Starting Work

1. Read the ticket thoroughly
2. Check related files
3. Understand dependencies
4. Update status to "In Progress" in `docs/README.md`

### During Development

1. Create feature branch: `feature/T-XXX-description`
2. Reference ticket in commits: `Related to #XXX`
3. Update ticket if scope changes
4. Document any blockers

### Completing Work

1. Verify all acceptance criteria met
2. Update ticket status to "Complete" in `docs/README.md`
3. Reference ticket in final commit: `Closes #XXX`
4. Create pull request (if using PR workflow)

## Linking Tickets to Commits

### In Commit Messages

- **`Closes #001`** - This commit completes the ticket
- **`Related to #002`** - References ticket but doesn't close it
- **`Part of #003`** - One commit in a multi-commit ticket
- **`Fixes #004`** - Alternative to "Closes" for bug fixes

### Examples

```bash
git commit -m "feat(forms): implement contact form submission

Adds API route for form submission using Resend service.
Includes validation and error handling.

Closes #002"
```

```bash
git commit -m "refactor(components): extract form components

Part of #010 - reorganizing component structure"
```

## Ticket Dependencies

### Documenting Dependencies

In ticket files, use the Dependencies section:

```markdown
## Dependencies
- Blocks: #007 (this ticket blocks #007)
- Depends on: #011 (this ticket depends on #011)
```

### Dependency Resolution

1. **Check dependencies** before starting work
2. **Complete blocking tickets** first
3. **Update dependent tickets** when dependencies complete
4. **Document blockers** in ticket if dependencies not ready

## Ticket Organization

### By Priority

Tickets are organized by priority in `docs/README.md`:
- High Priority section
- Medium Priority section
- Low Priority section

### By Phase (Future Enhancement)

For larger projects, consider organizing by phase:
```
docs/tickets/
├── phase-1/
│   └── PHASE_1_TICKETS.md
└── phase-2/
    └── PHASE_2_TICKETS.md
```

## Best Practices

1. **Be Specific**: Clear descriptions and acceptance criteria
2. **Keep Updated**: Update status as work progresses
3. **Link Commits**: Reference tickets in commit messages
4. **Document Decisions**: Add notes if approach changes
5. **Close When Done**: Mark complete when merged
6. **Review Regularly**: Archive or update stale tickets

## Ticket Review

### Regular Review Process

- **Weekly**: Review in-progress tickets
- **Monthly**: Review all tickets for stale items
- **Quarterly**: Archive completed tickets (optional)

### Stale Tickets

If a ticket hasn't been worked on for 3+ months:
1. Review if still relevant
2. Update priority if needed
3. Close if no longer needed
4. Document reason for closure

---

**Related Documents:**
- [Commit Conventions](./COMMITS.md)
- [Tickets Directory](../tickets/)
- [Architecture Documentation](../specs/architecture.md)

