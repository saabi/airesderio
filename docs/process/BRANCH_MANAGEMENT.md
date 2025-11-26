# Branch Management Strategy for Aires de Río

**Project:** Aires de Río  
**Workflow:** Simple main branch with feature branches

---

## Recommended Strategy

### Branch Structure

**Simple Main Pattern:**

```
main (production)
  └─> feature/T-001-description
  └─> feature/T-002-description
  └─> fix/T-003-description
```

**Rationale:**
- Simple and clear workflow
- Good for static site projects
- Easy for LLM agents to understand
- No need for staging branch (can preview locally)

---

## Branch Naming Convention

**Pattern:** `<type>/T-<ticket>-<description>`

**Types:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `style/` - Code style changes
- `chore/` - Maintenance tasks

**Examples:**
- `feature/T-001-move-api-key-to-env`
- `fix/T-003-navigation-links`
- `docs/T-010-update-readme`
- `refactor/T-010-reorganize-components`

---

## Workflow

### Starting Work on a Ticket

1. **Ensure you're on main and up to date:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create feature branch:**
   ```bash
   git checkout -b feature/T-001-description
   ```

3. **Start working:**
   - Make changes
   - Commit frequently with clear messages
   - Reference ticket in commit: `Closes #001` or `Related to #001`

### During Development

**Commit frequently:**
```bash
git add .
git commit -m "feat(location): move API key to env

Implements environment variable for Google Maps API key.
Uses VITE_ prefix for client-side access.

Closes #001"
```

**Push regularly (backup your work):**
```bash
git push -u origin feature/T-001-description
```

### Completing a Ticket

1. **Ensure all changes are committed:**
   ```bash
   git status
   git add .
   git commit -m "final commit message"
   ```

2. **Push final changes:**
   ```bash
   git push origin feature/T-001-description
   ```

3. **Merge to main:**
   ```bash
   git checkout main
   git pull origin main
   git merge feature/T-001-description
   git push origin main
   ```

4. **Clean up branch:**
   ```bash
   git branch -d feature/T-001-description
   git push origin --delete feature/T-001-description
   ```

---

## Best Practices

### 1. Always Pull Before Starting

Before creating a new branch, ensure main is up to date:

```bash
git checkout main
git pull origin main
```

### 2. Commit Frequently

- Make small, logical commits
- Each commit should represent a working state
- Use clear commit messages
- Reference tickets in commit messages

### 3. Push Regularly

- Push after each logical unit of work
- Push before ending work session
- Push before switching tickets
- This serves as backup and allows others to see progress

### 4. Test Before Merging

Before merging to main:

```bash
cd fe
npm run check    # Type check
npm test         # Run tests
npm run build    # Ensure build works
```

### 5. Clean Up Branches

- Delete local branch after merge: `git branch -d feature/T-XXX`
- Delete remote branch after merge: `git push origin --delete feature/T-XXX`
- Keep main clean and organized

---

## Commit Message Guidelines

Follow the conventions in [COMMITS.md](./COMMITS.md):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Examples:**
```bash
# Feature
git commit -m "feat(location): add Google Maps integration

Implements interactive map showing nearby places.
Uses environment variable for API key.

Closes #001"

# Bug fix
git commit -m "fix(forms): correct email validation

Fixed regex pattern to accept plus signs in emails.

Related to #002"

# Documentation
git commit -m "docs: add development setup guide

Created comprehensive setup documentation.

Part of documentation improvements"
```

---

## Handling Conflicts

If you encounter merge conflicts:

1. **Pull latest main:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Merge main into your branch:**
   ```bash
   git checkout feature/T-001-description
   git merge main
   ```

3. **Resolve conflicts:**
   - Open conflicted files
   - Resolve conflicts manually
   - Test that everything works

4. **Commit resolution:**
   ```bash
   git add .
   git commit -m "fix: resolve merge conflicts with main"
   ```

---

## Emergency Hotfixes

For critical bugs that need immediate fix:

1. **Create hotfix branch from main:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-bug-description
   ```

2. **Fix and test:**
   - Make the fix
   - Test thoroughly
   - Commit with clear message

3. **Merge to main:**
   ```bash
   git checkout main
   git merge hotfix/critical-bug-description
   git push origin main
   ```

4. **Clean up:**
   ```bash
   git branch -d hotfix/critical-bug-description
   git push origin --delete hotfix/critical-bug-description
   ```

---

## Common Commands Reference

### Branch Management

```bash
# List all branches
git branch -a

# Create and switch to new branch
git checkout -b feature/T-001-description

# Switch to existing branch
git checkout feature/T-001-description

# Delete local branch
git branch -d feature/T-001-description

# Delete remote branch
git push origin --delete feature/T-001-description
```

### Status and Information

```bash
# Check current status
git status

# View commit history
git log --oneline

# View branch structure
git log --oneline --graph --all
```

### Syncing

```bash
# Pull latest changes
git pull origin main

# Push current branch
git push -u origin feature/T-001-description

# Push after branch already exists
git push
```

---

## Workflow Summary

**Daily Workflow:**

1. Start: `git checkout main && git pull`
2. Create branch: `git checkout -b feature/T-XXX-description`
3. Work: Make changes, commit frequently
4. Push: `git push origin feature/T-XXX-description` (regularly)
5. Complete: Merge to main, push, cleanup

**Key Principles:**

- ✅ Always start from updated main
- ✅ One ticket = one branch
- ✅ Commit frequently with clear messages
- ✅ Push regularly for backup
- ✅ Test before merging
- ✅ Clean up branches after merge

---

## Related Documents

- [Commit Conventions](./COMMITS.md) - Commit message format
- [Ticket Workflow](./TICKETS.md) - Ticket lifecycle
- [Ticket Creation Guide](./TICKET_CREATION_GUIDE.md) - Creating tickets

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-XX

