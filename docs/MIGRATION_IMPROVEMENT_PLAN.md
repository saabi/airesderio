# Aires de Río - LLM Agent-Friendly Structure Improvement Plan

**Based on:** [LLM Agent Project Migration Guide](../llm-agent-project-setup/LLM_AGENT_PROJECT_MIGRATION.md)  
**Date:** 2025-01-XX  
**Status:** Planning Phase

---

## Executive Summary

The Aires de Río project is already well-organized with good documentation structure. This plan outlines progressive improvements to align with LLM agent-friendly best practices while maintaining existing functionality and workflows.

**Current Strengths:**
- ✅ Well-structured `docs/` directory
- ✅ Comprehensive ticket system in `docs/tickets/`
- ✅ Technical architecture documentation
- ✅ Good README structure

**Areas for Improvement:**
- ⚠️ Missing process documentation (`docs/process/`)
- ⚠️ No `.cursorrules` file for LLM agent guidance
- ⚠️ Naming convention: `specs/` vs recommended `new-system/`
- ⚠️ Missing cross-references between documents
- ⚠️ No documented commit message conventions
- ⚠️ README could be better organized with clearer navigation

---

## Current State Assessment

### Directory Structure Analysis

**Current:**
```
airesderio/
├── README.md                    # Comprehensive deployment guide
├── docs/
│   ├── README.md                # Documentation index
│   ├── specs/                   # Technical specifications
│   │   ├── architecture.md
│   │   └── architecture-improvements.md
│   ├── tickets/                 # Improvement tickets (✅ Good!)
│   │   └── 001-*.md through 011-*.md
│   ├── proposals/               # Design proposals
│   └── SECURITY-API-KEY-REMOVAL.md
├── fe/                          # Frontend application
│   ├── README.md
│   └── [SvelteKit structure]
└── .gitignore
```

**Target (LLM Agent-Friendly):**
```
airesderio/
├── README.md                    # Project overview with clear navigation
├── .cursorrules                  # LLM agent guidelines
├── docs/
│   ├── README.md                # Documentation index
│   ├── new-system/              # Technical documentation (rename from specs/)
│   │   ├── feature-specification.md
│   │   ├── technical-architecture.md
│   │   └── development-setup.md
│   ├── process/                 # Process documentation (NEW)
│   │   ├── COMMITS.md
│   │   └── TICKETS.md
│   ├── tickets/                 # ✅ Already good!
│   └── proposals/                # ✅ Keep as-is
├── fe/
└── .gitignore
```

### Gap Analysis

| Category | Current State | Target State | Priority |
|----------|---------------|--------------|----------|
| **Process Docs** | Missing | `docs/process/COMMITS.md`, `TICKETS.md` | High |
| **LLM Agent Config** | Missing | `.cursorrules` file | High |
| **Naming Conventions** | `specs/` | `new-system/` (optional rename) | Low |
| **Cross-References** | Minimal | Comprehensive linking | Medium |
| **Commit Conventions** | Not documented | Documented in `docs/process/COMMITS.md` | Medium |
| **README Organization** | Good but could be clearer | Better navigation structure | Low |

---

## Progressive Improvement Plan

### Phase 1: Foundation (Week 1) - **Low Risk, High Value**

**Goal:** Add essential LLM agent-friendly structure without breaking anything

#### 1.1 Create Process Documentation Directory

**Action:**
```bash
mkdir -p docs/process
```

**Files to Create:**
- `docs/process/COMMITS.md` - Commit message conventions
- `docs/process/TICKETS.md` - Ticket workflow documentation

**Why:** These files help LLM agents understand project conventions and workflows.

#### 1.2 Create `.cursorrules` File

**Action:** Create root-level `.cursorrules` file

**Content:** Reference process docs, project structure, and key conventions.

**Why:** Provides immediate guidance to LLM agents working on the project.

#### 1.3 Update Root README.md

**Action:** Add clear navigation section linking to all documentation

**Why:** Improves discoverability for both humans and LLM agents.

**Validation:**
- [ ] New directories exist
- [ ] `.cursorrules` file created
- [ ] README.md updated with navigation
- [ ] No broken links
- [ ] Existing workflows still work

---

### Phase 2: Documentation Enhancement (Weeks 2-3) - **Low Risk**

**Goal:** Improve documentation organization and cross-references

#### 2.1 Create Development Setup Guide

**Action:** Extract setup information from `fe/README.md` into `docs/new-system/development-setup.md`

**Why:** Centralizes development documentation in the standard location.

#### 2.2 Create Feature Specification

**Action:** Create `docs/new-system/feature-specification.md` documenting:
- Project purpose
- Key features
- User flows
- Business requirements

**Why:** Provides context for LLM agents about what the project does.

#### 2.3 Rename `specs/` to `new-system/` (Optional)

**Decision Point:** 
- **Option A:** Keep `specs/` (less disruptive)
- **Option B:** Rename to `new-system/` (aligns with guide)

**Recommendation:** Keep `specs/` for now, but add symlink or redirect if needed.

#### 2.4 Add Cross-References

**Action:** Add "Related Documents" sections to:
- Architecture docs
- Ticket files
- Process docs
- README files

**Why:** Helps LLM agents navigate related information.

**Validation:**
- [ ] All new docs created
- [ ] Cross-references added
- [ ] All links work
- [ ] README.md updated

---

### Phase 3: Process Documentation (Week 4) - **Low Risk**

**Goal:** Document development processes

#### 3.1 Document Commit Conventions

**Action:** Create `docs/process/COMMITS.md` with:
- Commit message format
- Type prefixes (feat, fix, docs, etc.)
- Examples
- Link to tickets when applicable

**Why:** Helps maintain consistent commit history.

#### 3.2 Document Ticket Workflow

**Action:** Enhance `docs/process/TICKETS.md` with:
- How to create tickets
- Ticket lifecycle
- Priority guidelines
- Linking tickets to commits
- Status conventions

**Why:** Clarifies the existing ticket system for LLM agents.

#### 3.3 Update `.cursorrules` with Process References

**Action:** Update `.cursorrules` to reference process documentation

**Validation:**
- [ ] Process docs complete
- [ ] `.cursorrules` updated
- [ ] Team can follow conventions

---

### Phase 4: Documentation Consolidation (Week 5) - **Medium Risk**

**Goal:** Reorganize documentation for better discoverability

#### 4.1 Reorganize Root README.md

**Action:** Restructure to:
- Quick start (link to `fe/README.md`)
- Documentation index (link to `docs/README.md`)
- Deployment guide (keep or move to `docs/new-system/`)
- Project structure overview

**Why:** Makes README more scannable and navigable.

#### 4.2 Create Documentation Index

**Action:** Enhance `docs/README.md` with:
- Clear sections for each doc type
- Quick links to common tasks
- Status indicators for tickets

**Why:** Improves documentation discoverability.

**Validation:**
- [ ] README restructured
- [ ] All links work
- [ ] Information still accessible
- [ ] No broken references

---

### Phase 5: Naming Conventions (Ongoing) - **Low Priority**

**Goal:** Document and standardize naming conventions

#### 5.1 Document Current Conventions

**Action:** Add naming conventions section to `docs/new-system/development-setup.md`:
- File naming (kebab-case for files)
- Component naming (PascalCase)
- Variable naming (camelCase)
- Directory naming (kebab-case)

**Why:** Helps maintain consistency.

#### 5.2 Optional: Rename `specs/` to `new-system/`

**Action:** If desired, rename directory and update all references

**Risk:** Medium - requires updating many links

**Recommendation:** Only do this if team agrees it's worth the effort.

---

## Detailed Implementation Steps

### Step 1: Create Process Documentation

#### `docs/process/COMMITS.md`

```markdown
# Commit Message Conventions

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
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Examples

```
feat(location): add Google Maps integration

Implements interactive map showing nearby places of interest.
Uses environment variable for API key.

Closes #001
```

```
fix(forms): correct contact form validation

Fixed email validation regex pattern.

Related to #002
```

## Linking to Tickets

- Use `Closes #001` to close a ticket
- Use `Related to #002` to reference without closing
- Use `Part of #003` for multi-commit tickets
```

#### `docs/process/TICKETS.md`

```markdown
# Ticket Workflow

## Ticket Structure

Tickets are located in `docs/tickets/` and follow the naming pattern:
`<number>-<kebab-case-description>.md`

## Ticket Lifecycle

1. **Created** - Ticket file created
2. **In Progress** - Work has started
3. **Review** - Code ready for review
4. **Complete** - Work finished and merged
5. **Closed** - Ticket archived

## Creating Tickets

1. Create new file: `docs/tickets/XXX-description.md`
2. Use template from existing tickets
3. Update `docs/README.md` with ticket entry
4. Set appropriate priority

## Priority Levels

- **High**: Security, critical bugs, blocking issues
- **Medium**: Important features, significant improvements
- **Low**: Nice-to-have, refactoring, optimizations

## Linking Tickets to Commits

In commit messages, reference tickets:
- `Closes #001` - Closes the ticket
- `Related to #002` - References ticket
- `Part of #003` - Part of larger ticket

## Status Tracking

Update ticket status in `docs/README.md`:
- ✅ Complete
- ⚠️ Partially Complete
- ⏸️ Not Started / Pending
```

### Step 2: Create `.cursorrules` File

```markdown
# Aires de Río - LLM Agent Guidelines

## Project Overview

Aires de Río is a promotional website for a residential development project in Santiago del Estero, Argentina. Built with SvelteKit and Svelte 5.

## Documentation Structure

- **Technical Documentation**: `docs/specs/` (or `docs/new-system/` if renamed)
- **Process Documentation**: `docs/process/`
- **Tickets**: `docs/tickets/`
- **Proposals**: `docs/proposals/`

## Key Conventions

### Commit Messages
See `docs/process/COMMITS.md` for commit message conventions.

### Tickets
See `docs/process/TICKETS.md` for ticket workflow.

### Code Style
- TypeScript with strict mode
- Svelte 5 runes (`$state`, `$derived`, `$effect`)
- Component naming: PascalCase
- File naming: kebab-case

## Architecture

- Frontend: SvelteKit with static adapter
- Build: Vite
- Testing: Vitest
- See `docs/specs/architecture.md` for details

## When Making Changes

1. Check existing tickets in `docs/tickets/`
2. Create ticket if needed
3. Follow commit conventions
4. Update documentation if architecture changes
5. Reference tickets in commits

## Important Files

- `fe/src/` - Source code
- `fe/static/` - Static assets
- `docs/specs/architecture.md` - Architecture documentation
- `docs/tickets/` - Improvement tickets
```

### Step 3: Update Root README.md

Add navigation section at the top:

```markdown
# Aires de Río

Promotional website for **Aires de Río**, a residential development project in Santiago del Estero, Argentina.

## Quick Navigation

- **[Development Setup](fe/README.md)** - Get started with development
- **[Documentation](docs/README.md)** - Full project documentation
- **[Architecture](docs/specs/architecture.md)** - Technical architecture
- **[Tickets](docs/tickets/)** - Improvement tickets and tasks
- **[Deployment Guide](#production-deployment)** - Production deployment instructions

## Quick Start

See [`fe/README.md`](fe/README.md) for development setup and project details.

[... rest of existing content ...]
```

---

## Risk Assessment

### Low Risk Changes
- ✅ Creating new directories
- ✅ Adding new documentation files
- ✅ Creating `.cursorrules`
- ✅ Adding cross-references
- ✅ Updating README navigation

### Medium Risk Changes
- ⚠️ Renaming `specs/` to `new-system/` (requires link updates)
- ⚠️ Reorganizing README.md (might break external links)

### Mitigation Strategies

1. **Incremental Changes**: Make one change at a time, test, then proceed
2. **Keep Old Structure**: Don't delete old structure until migration complete
3. **Update Links Gradually**: Use search/replace to update all references
4. **Test Thoroughly**: Verify all links work after each change
5. **Git Tags**: Tag before major changes for easy rollback

---

## Success Metrics

### Phase 1 Success
- [ ] `.cursorrules` file exists and is referenced
- [ ] Process documentation created
- [ ] README has clear navigation
- [ ] No broken links

### Phase 2 Success
- [ ] Development setup guide in standard location
- [ ] Feature specification documented
- [ ] Cross-references added to key docs
- [ ] All documentation accessible

### Phase 3 Success
- [ ] Commit conventions documented and followed
- [ ] Ticket workflow clear
- [ ] `.cursorrules` references process docs

### Overall Success
- [ ] LLM agents can navigate structure easily
- [ ] Team follows documented conventions
- [ ] Documentation is discoverable
- [ ] No disruption to existing workflows

---

## Migration Checklist

### Phase 1: Foundation
- [ ] Create `docs/process/` directory
- [ ] Create `docs/process/COMMITS.md`
- [ ] Create `docs/process/TICKETS.md`
- [ ] Create `.cursorrules` file
- [ ] Update root `README.md` with navigation
- [ ] Test all links
- [ ] Commit changes

### Phase 2: Documentation Enhancement
- [ ] Create `docs/new-system/development-setup.md` (or keep in `fe/README.md`)
- [ ] Create `docs/new-system/feature-specification.md`
- [ ] Add cross-references to architecture docs
- [ ] Add cross-references to tickets
- [ ] Update `docs/README.md`
- [ ] Test all links

### Phase 3: Process Documentation
- [ ] Complete `docs/process/COMMITS.md`
- [ ] Complete `docs/process/TICKETS.md`
- [ ] Update `.cursorrules` with process references
- [ ] Test with LLM agent

### Phase 4: Documentation Consolidation
- [ ] Restructure root `README.md`
- [ ] Enhance `docs/README.md`
- [ ] Verify all information accessible
- [ ] Test navigation

### Phase 5: Naming Conventions (Optional)
- [ ] Document naming conventions
- [ ] (Optional) Rename `specs/` to `new-system/`
- [ ] Update all references

---

## Recommendations

### Immediate Actions (This Week)
1. ✅ Create `docs/process/` directory
2. ✅ Create `docs/process/COMMITS.md` and `TICKETS.md`
3. ✅ Create `.cursorrules` file
4. ✅ Add navigation to root README

### Short Term (Next 2 Weeks)
1. Create feature specification document
2. Add cross-references between docs
3. Enhance `docs/README.md`

### Long Term (Ongoing)
1. Document naming conventions
2. Consider renaming `specs/` to `new-system/` (if team agrees)
3. Continuously improve cross-references
4. Keep documentation up-to-date

---

## Questions to Consider

1. **Should we rename `specs/` to `new-system/`?**
   - **Pros:** Aligns with guide, clearer naming
   - **Cons:** Requires updating many links, potential disruption
   - **Recommendation:** Keep `specs/` unless team strongly prefers `new-system/`

2. **Should deployment guide stay in root README?**
   - **Option A:** Keep in root (current)
   - **Option B:** Move to `docs/new-system/deployment.md`
   - **Recommendation:** Keep in root for visibility, but add link from docs

3. **How detailed should process docs be?**
   - **Recommendation:** Start simple, expand based on team needs

---

## Next Steps

1. **Review this plan** with team
2. **Prioritize phases** based on needs
3. **Start with Phase 1** (lowest risk, highest value)
4. **Iterate and improve** based on feedback

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-XX  
**Related:** [LLM Agent Project Migration Guide](../llm-agent-project-setup/LLM_AGENT_PROJECT_MIGRATION.md)

