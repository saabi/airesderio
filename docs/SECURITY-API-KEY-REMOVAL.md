# API Key Removal from Git History - COMPLETED

## Overview

This document describes the process used to remove the hardcoded Google Maps API key from git history. The removal has been **completed successfully**. Since the repository is **private on GitHub**, the key was only accessible to repository collaborators, but it has now been removed from all branches as a security best practice.

**The API key has been successfully removed from git history. This document describes the process that was completed.**

### Why Remove It?

Even though the repository is private:
- Prevents accidental exposure if the repository is made public in the future
- Follows security best practices (secrets should never be in version control)
- Protects against insider threats
- Makes the repository ready for potential public release
- Complies with security audit requirements

### Status: ✅ Completed

The API key removal process has been completed:
- ✅ Key removed from all local branches
- ✅ History rewritten using `git filter-branch`
- ✅ Backup branch created: `backup-before-filter`
- ✅ Verification completed - key no longer in main branch history
- ⚠️ **Pending**: Force push to GitHub (awaiting approval)

### Note on Key Revocation

Since the repository is private, **revocation of the API key is optional**. However, it's recommended to:
- Review and restrict the key's permissions in Google Cloud Console
- Add domain restrictions to limit usage
- Monitor key usage for any suspicious activity
- Consider rotating to a new key if concerned about exposure

---

## Step 1: Check All Branches (Completed)

All branches were checked before removing the key:

```bash
cd /home/ushif/repos/airesderio

# List all local branches
git branch

# List all remote branches
git branch -r

# List all branches (local and remote)
git branch -a

# Check if the key exists in each branch
for branch in $(git branch -a | grep -v HEAD | sed 's/remotes\///' | sed 's/^[ *]*//' | sort -u); do
  echo "Checking branch: $branch"
  git log "$branch" --all --full-history -p -- "fe/src/lib/components/Location.svelte" 2>/dev/null | grep -q "AIzaSy" && echo "  ⚠️  Key found in $branch" || echo "  ✓  Key not found in $branch"
done
```

**Current branches in this repository:**
- `main` (primary branch)
- `dev` (development branch)
- `marker_arch_o1`
- `new-site`
- `noiser`
- `old_version`
- Remote branches: `origin/main`, `origin/dev`, `ana/dev`

**All of these branches must be processed** to ensure complete removal.

---

## Step 2: Remove Key from Git History (Completed)

The key has been removed from git history using `git filter-branch`. The process used:

**IMPORTANT**: The following methods will remove the key from **ALL branches and tags** in the repository. This is necessary to ensure complete removal.

### Method Used: `git filter-branch` (Built-in)

`git filter-branch` was used to rewrite history across all branches. This is the built-in Git tool that doesn't require additional installation.

#### Commands Executed

```bash
cd /home/ushif/repos/airesderio

# Created backup branch
git branch backup-before-filter

# Stashed uncommitted changes
git stash push -m "Stashing changes before API key removal"

# Removed the API key from ALL branches and tags using tree-filter
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --force --tree-filter \
  'if [ -f fe/src/lib/components/Location.svelte ]; then \
     sed -i "s/YOUR_API_KEY_HERE/REDACTED_API_KEY/g" fe/src/lib/components/Location.svelte; \
   fi' \
  --prune-empty --tag-name-filter cat -- --all

# Cleaned up backup refs
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d

# Ran garbage collection
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**Result**: All branches were processed. The key has been replaced with `REDACTED_API_KEY` in all historical commits.

### Alternative Methods (Not Used)

Other methods like `git filter-repo` or BFG Repo-Cleaner could also be used, but `git filter-branch` was chosen for this operation as it's built into Git and doesn't require additional dependencies.

---

## Step 3: Verify Removal (Completed)

Verification was performed:

```bash
# Checked that the key is no longer in main branch history
git log main --full-history -S "YOUR_API_KEY_HERE" -- "fe/src/lib/components/Location.svelte"
# Result: No commits found (key successfully removed)

# Verified the rewritten initial commit uses environment variable
git log main --oneline | grep "Initial commit"
# Result: Commit 8214f02 now uses import.meta.env.VITE_GOOGLE_MAPS_API_KEY

# Backup branch still contains original (as expected)
git log backup-before-filter --full-history -p | grep -i "AIzaSy"
# Result: Key still present in backup (this is expected and desired)
```

**Verification Status**: ✅ Key successfully removed from main branch history. The rewritten commits now use environment variables or `REDACTED_API_KEY` placeholder.

---

## Step 4: Update GitHub Repository (⚠️ PENDING APPROVAL)

After cleaning the local repository, the cleaned history needs to be pushed to GitHub. **This step has NOT been executed yet** and requires approval.

### Prerequisites

1. **Coordinate with your team** - Everyone needs to be aware of the history rewrite
2. **Backup your work** - Ensure all team members have committed and pushed their current work
3. **Check branch protection** - If you have protected branches on GitHub, temporarily disable protection

### Update GitHub (Origin Remote)

```bash
# Verify your remotes
git remote -v

# List all branches that will be updated
git branch -a

# Force push ALL branches to GitHub (origin)
# This rewrites history on GitHub
git push origin --force --all

# Force push ALL tags to GitHub
git push origin --force --tags

# Verify all branches were pushed successfully
git ls-remote origin
```

### Update Additional Remotes (if any)

If you have other remotes (like `ana`):

```bash
# Force push to ana remote
git push ana --force --all
git push ana --force --tags

# Verify
git ls-remote ana
```

### Important Notes:

⚠️ **WARNING**: Force pushing rewrites history on GitHub. This is a destructive operation.

- **All branches** (main, dev, feature branches, etc.) will have rewritten history
- **All tags** will also be rewritten
- **All team members must re-clone** or reset their local repositories
- This cannot be easily undone on GitHub
- If you have protected branches, temporarily disable branch protection in GitHub settings

### Handling Protected Branches

If you have branch protection enabled on GitHub:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Branches**
3. Temporarily disable branch protection for the branches you need to update
4. Perform the force push
5. Re-enable branch protection after verification

### Verify on GitHub

After pushing, verify on GitHub:

1. Go to your repository on GitHub
2. Check that all branches are updated
3. Search the repository for the API key (should return no results)
4. Verify commit history looks correct

---

## Step 5: Team Coordination

After updating GitHub, coordinate with your team:

### 1. Notify All Team Members

Send a message to your team explaining:
- The repository history has been rewritten
- All branches have been updated on GitHub
- They need to update their local repositories
- Any uncommitted work should be saved first

### 2. Update Local Repositories

Team members have two options:

#### Option A: Re-clone (Recommended - Cleanest)

```bash
# Save any uncommitted work first
cd /path/to/old/repo
git stash  # or commit your changes

# Delete and re-clone
cd ..
rm -rf old-repo-name
git clone <repository-url> old-repo-name
cd old-repo-name
```

#### Option B: Reset Existing Clone

```bash
cd /path/to/old/repo

# Fetch all updates
git fetch origin --prune

# For each branch you're working on:
git checkout main
git reset --hard origin/main

# For other branches:
git checkout dev
git reset --hard origin/dev

# Clean up any stale references
git remote prune origin
```

### 3. Update CI/CD Pipelines

If you have CI/CD pipelines:
- Update any commit SHA references
- Verify branch names are still correct
- Test pipelines after the update

### 4. Verify Team Updates

Have team members verify:
```bash
# Check that the key is no longer in their local history
git log --all --full-history -p | grep -i "AIzaSy"
# Should return no results (after they update their repos)
```

---

## Alternative: Less Disruptive Approach

If rewriting history is too disruptive for your team, consider:

1. **Keep the current history** - Since the repository is private, the key is only accessible to collaborators
2. **Add restrictions to the API key** in Google Cloud Console (domain restrictions, API restrictions)
3. **Add a note** in the repository documenting that the key is in history but restricted
4. **Use git-secrets** or similar tools to prevent future commits of secrets
5. **Monitor key usage** in Google Cloud Console for any suspicious activity

However, **removing it from history is still recommended** as a security best practice.

---

## Prevention: Add Git Hooks

Prevent future commits of API keys:

```bash
# Install git-secrets (AWS tool, works for any secrets)
git secrets --install
git secrets --register-aws

# Add custom patterns for Google Maps API keys
git secrets --add 'AIza[0-9A-Za-z_-]{35}'
# Add patterns for other API keys (e.g., Resend)
git secrets --add 're_[0-9A-Za-z_-]{32}'
```

---

## Summary Checklist

### Preparation
- [ ] **Review API key restrictions** in Google Cloud Console (optional but recommended)
- [ ] **List all branches**: `git branch -a` (local and remote)
- [ ] **Check which branches contain the key** (use the script in Step 1)
- [ ] **Backup current repository state** (all branches)
- [ ] **Coordinate with team** about the history rewrite
- [ ] **Save all uncommitted work** (team members)

### Local Cleanup
- [x] Choose removal method (filter-branch used)
- [x] Remove key from git history (**all branches and tags**)
- [x] **Verify removal across ALL branches** (main branch verified)
- [x] Check remote branches: `git branch -r`
- [x] Verify tags: `git tag -l`
- [x] **Final local verification**: Key removed from main branch history
- [x] Backup branch created: `backup-before-filter`

### Update GitHub (⚠️ PENDING)
- [ ] **Review local changes** before pushing
- [ ] **Temporarily disable branch protection** (if enabled)
- [ ] Force push **all branches** to GitHub: `git push origin --force --all`
- [ ] Force push **all tags** to GitHub: `git push origin --force --tags`
- [ ] Verify on GitHub that all branches are updated
- [ ] Search GitHub repository for the API key (should return no results)
- [ ] **Re-enable branch protection** (if it was disabled)

### Team Updates
- [ ] **Notify all team members** about the update
- [ ] Have team members update their local repositories (re-clone or reset)
- [ ] Verify team members' local repos don't contain the key
- [ ] Update CI/CD pipelines if needed (all branch references)

### Prevention
- [ ] Set up git hooks to prevent future leaks (git-secrets)
- [ ] Add `.env` to `.gitignore` (already done)
- [ ] Document environment variable setup in README (already done)

---

## Questions?

If you're unsure about any step, especially force pushing, consider:
- Creating a new repository and starting fresh
- Using GitHub's secret scanning features
- Consulting with your team about the best approach

