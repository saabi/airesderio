# Commit Message Conventions

**Related:** [Ticket Workflow](./TICKETS.md), [Architecture Documentation](../specs/architecture.md)

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, whitespace, etc.)
- `refactor`: Code refactoring (no functional changes)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build config, etc.)
- `perf`: Performance improvements
- `ci`: CI/CD changes

## Scope (Optional)

Scope indicates the area of the codebase affected:
- `location`: Location/map related features
- `forms`: Form components and validation
- `components`: Reusable components
- `styles`: Styling and theme
- `docs`: Documentation
- `build`: Build configuration
- `deps`: Dependencies

## Subject

- Use imperative mood ("add" not "added" or "adds")
- First letter lowercase
- No period at the end
- Maximum 72 characters

## Body (Optional)

- Explain **what** and **why** (not how)
- Wrap at 72 characters
- Can include multiple paragraphs

## Footer (Optional)

- Reference tickets: `Closes #001`, `Related to #002`
- Breaking changes: `BREAKING CHANGE: description`

## Examples

### Simple Feature
```
feat(location): add Google Maps integration

Implements interactive map showing nearby places of interest.
Uses environment variable for API key.

Closes #001
```

### Bug Fix
```
fix(forms): correct contact form email validation

Fixed email validation regex pattern to accept plus signs
in email addresses (e.g., user+tag@example.com).

Related to #002
```

### Documentation
```
docs: add development setup guide

Created comprehensive development setup documentation
in docs/specs/development-setup.md

Part of migration to LLM agent-friendly structure
```

### Refactoring
```
refactor(components): reorganize component structure

Moved form components to lib/components/forms/
for better organization.

Related to #010
```

### With Breaking Change
```
feat(theme): change theme variable naming

BREAKING CHANGE: CSS custom properties renamed from
--color-primary to --theme-primary. Update any custom
styles using the old variable names.

Migration guide: docs/specs/theme-migration.md
```

### Bad Commit Messages

**❌ Avoid these patterns:**

```
❌ fix bug
❌ updated files
❌ WIP
❌ asdf
❌ fix: Fixed the thing that was broken
❌ feat: add new feature (too vague)
❌ docs: update readme (missing context)
❌ changed stuff
❌ quick fix
❌ as per request
```

**Why these are bad:**
- Too vague - doesn't explain what changed
- No context - can't understand the change later
- No ticket reference - can't track related work
- Not descriptive - doesn't help with git history

**✅ Better alternatives:**

```
❌ fix bug
✅ fix(forms): correct email validation regex pattern

❌ updated files
✅ docs: add development setup guide to specs/

❌ WIP
✅ feat(location): add Google Maps integration (WIP)

❌ feat: add new feature
✅ feat(forms): implement contact form validation
```

## Linking to Tickets

When referencing tickets in commits:

- **`Closes #001`** - This commit completes the ticket
- **`Related to #002`** - References ticket but doesn't close it
- **`Part of #003`** - One commit in a multi-commit ticket
- **`Fixes #004`** - Alternative to "Closes" for bug fixes

## Commit Guidelines

### 1. Atomic Commits

- Make one logical change per commit
- Don't mix unrelated changes
- If you need to make multiple changes, use multiple commits

**✅ Good:**
```
feat(location): add Google Maps integration
fix(forms): correct email validation
```

**❌ Bad:**
```
fix: various bugs and added new feature
```

### 2. Commit Frequency

- Commit early and often
- Don't wait until the end of the day to commit
- Each commit should represent a working state (code compiles, tests pass)

### 3. Commit Size

- Keep commits focused and reasonably sized
- Large features should be broken into smaller, logical commits
- Aim for commits that can be reviewed in 5-10 minutes

### 4. Testing

- Ensure code compiles before committing: `npm run check`
- Run relevant tests before committing: `npm test`
- Don't commit broken code (use `WIP:` prefix if necessary, but avoid in main branches)

### 5. Review Your Changes

- Review your changes with `git diff` before committing
- Ensure you're not committing temporary files, debug code, or secrets
- Check that you're committing the right files
- Verify `.env` is not included (already in `.gitignore`)

## Best Practices

1. **Be Descriptive**: Write clear, concise commit messages
2. **Reference Tickets**: Link commits to tickets when applicable
3. **One Logical Change**: Each commit should represent one logical change
4. **Test Before Committing**: Ensure code works before committing
5. **Review Your Message**: Read your commit message before finalizing

## Commit Workflow

1. **Before committing:**
   - Review your changes: `git status` and `git diff`
   - Ensure code compiles: `npm run check`
   - Run tests: `npm test`
   - Check for temporary files, debug code, or secrets

2. **Writing the commit message:**
   - Use the format specified above
   - Be clear and descriptive
   - Reference related tickets
   - Explain what and why (not how)

3. **After committing:**
   - Verify your commit: `git log -1`
   - Push to remote when ready
   - Update ticket status if applicable

## Tools and Automation

### Commit Message Templates

You can set up a Git commit message template:

```bash
git config commit.template .gitmessage
```

Create a `.gitmessage` file in the repository root with:

```
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>
# 
# Examples:
# feat(location): add Google Maps integration
# fix(forms): correct email validation
# docs: add development setup guide
```

### Pre-commit Hooks (Future Enhancement)

Consider adding commit message linting:
- [Commitlint](https://commitlint.js.org/) - Lint commit messages
- [Husky](https://typicode.github.io/husky/) - Git hooks made easy
- [lint-staged](https://github.com/okonet/lint-staged) - Run linters on staged files

Example configuration:
```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [2, "always", [
      "feat", "fix", "docs", "style", "refactor",
      "test", "chore", "perf", "ci"
    ]]
  }
}
```

---

**Related Documents:**
- [Ticket Workflow](./TICKETS.md)
- [Branch Management](./BRANCH_MANAGEMENT.md)
- [Architecture Documentation](../specs/architecture.md)
- [Development Setup](../specs/development-setup.md)

## Additional Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [Semantic Versioning](https://semver.org/) (for versioning based on commit types)

