# **Svelte 5 Agent Execution Spec v2 (Updated)**

Based on: 
Supersedes previous version.

---

## 0. Mission

Produce **fully compliant Svelte 5 components + SvelteKit patterns**.

No interpretation. Execute spec.

---

## 1. Hard Constraints

* Svelte 5 runes only
* NO:

  * `export let`
  * `$:`
  * `<slot>`
  * `on:click`
  * `$app/stores`
* MUST:

  * `$props`, `$state`, `$derived`, `$effect`
  * `{@render children()}`
  * `onclick`
  * `$app/state` for routing

---

## 2. Mandatory File Structure (NEW — critical)

### ALWAYS split scripts:

```svelte
<script module lang="ts">
  // imports
  // types
  // static constants
</script>

<script lang="ts">
  // ordered sections
</script>
```

---

## 3. Instance Script Order (STRICT)

```ts
// ===== PROPS =====
let { ... }: Props = $props();

// ===== STATE =====
let x = $state(...);

// ===== DERIVED =====
let y = $derived(...);

// ===== EFFECTS =====
$effect(() => { ... });

// ===== INSTANCE CONSTANTS =====
const ...

// ===== REFS =====
let el = $state(null);

// ===== LIFECYCLE =====
onMount(...)

// ===== FUNCTIONS =====
function handleX() {}
```

❌ Any deviation → rewrite entire file

---

## 4. Reactivity Model

* Derived > state duplication
* `$effect` ONLY for:

  * side effects
  * async triggers
* NEVER compute inside template if reusable → use `$derived`

---

## 5. Routing (UPDATED)

```ts
import { page } from '$app/state';

const path = $derived(page.url.pathname);
```

Rules:

* no `$page`
* no `$app/stores`
* no manual subscriptions

---

## 6. Children System

```svelte
{@render children()}
```

Named:

```svelte
<Card header={<h1/>}>
```

---

## 7. Event System

```svelte
<button onclick={fn}>
```

Forwarding:

```ts
let { onclick }: Props = $props();
```

---

## 8. Remote Functions (NEW — major addition)

### Types

| Type      | Use             |
| --------- | --------------- |
| `query`   | read            |
| `form`    | form submission |
| `command` | mutation        |

---

### Rules (critical)

#### 1. ALWAYS include Zod schema

```ts
query(z.string(), async (id) => ...)
```

❌ Missing schema = broken

---

#### 2. ALWAYS use `getRequestEvent()`

```ts
const event = getRequestEvent();
```

---

#### 3. NEVER pass `{ locals }` param

---

#### 4. FORM usage (STRICT)

```svelte
<form {...login}>
```

* no manual FormData
* no programmatic call (unless explicitly needed)

---

#### 5. Validation errors

```ts
invalid(issue.field('msg'))
```

❌ never throw for validation

---

#### 6. Pending transition pattern (MANDATORY)

```ts
if (pending → false after true) → completed
```

---

#### 7. Fields API usage

```ts
form.fields.field.issues()
form.fields.field.as('text')
```

* always call as functions
* always wrap in `$derived`

---

#### 8. Boolean handling

```svelte
<input type="hidden" name="x" value="true|false" />
```

---

## 9. Server Patterns (NEW)

### Auth

```ts
if (!event.locals.user) throw Error
```

### RLS

```ts
await setOrganizationContext(id)
```

### Audit

```ts
getAuditContext(...)
```

---

## 10. Error Handling (NEW)

### Levels

| Level           | Tool           |
| --------------- | -------------- |
| Load            | `error()`      |
| Remote          | `throw Error`  |
| Form validation | `invalid()`    |
| UI              | `ErrorDisplay` |

---

### Error Boundary

```svelte
+error.svelte
```

---

### UI Errors (MANDATORY)

```svelte
<ErrorDisplay variant="page" />
```

❌ no custom error UI

---

## 11. Component Rules

* max 3 `$state`
* max 5 `$derived`
* else → split component

---

## 12. Data Boundaries

* ❌ no fetch in components
* ❌ no business logic in UI
* ✅ props only

---

## 13. Anti-Entropy Rule

On edit:
→ normalize entire file
→ not partial fixes

---

## 14. Output Requirements

* full component
* correct structure
* no placeholders
* no mixed patterns

---

## 15. Self Check

Before output:

* module script present
* order correct
* no forbidden syntax
* runes everywhere
* events correct
* routing correct
* Remote Functions valid (if used)

---

# 🔥 What Changed (Key Upgrades)

From your newer doc:

### 1. **Module vs Instance split (biggest missing piece)**

Now enforced.

### 2. **Strict ordering**

Removes LLM randomness.

### 3. **Remote Functions system**

Now first-class (previous spec ignored this entirely).

### 4. **Error system unified**

* `invalid()` vs `throw`
* ErrorDisplay enforced

### 5. **$app/state migration**

Eliminates outdated patterns.

### 6. **Fields API clarified**

Prevents subtle bugs.

---

# ⚠️ Remaining Improvement (my suggestion)

Add this to your official doc:

## “LLM Guardrail Section” (missing)

Explicitly state:

* If legacy syntax appears → rewrite file
* If unsure → pick simplest valid pattern
* Never mix patterns from different sections
