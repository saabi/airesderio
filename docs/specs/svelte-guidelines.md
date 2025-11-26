# Svelte Guidelines

**Related:** [Architecture Documentation](./architecture.md), [Development Setup](./development-setup.md)

## Overview

This document outlines Svelte-specific conventions, patterns, and best practices for the Aires de Río project. The project uses **Svelte 5** with the new runes API and **SvelteKit 2.16.0** for routing and build tooling.

## Svelte Version

- **Svelte 5.0.0** - Using the new runes API
- **SvelteKit 2.16.0** - Full-stack framework

## Core Concepts

### Runes API (Svelte 5)

Svelte 5 introduces runes as the primary way to handle reactivity. Use runes instead of the old reactive declarations and stores for component-local state.

#### State (`$state`)

Use `$state` for reactive state variables:

```typescript
<script lang="ts">
  let count = $state(0);
  let name = $state('');
  let items = $state<string[]>([]);
</script>
```

#### Derived (`$derived`)

Use `$derived` for computed values that automatically update:

```typescript
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
  let isEven = $derived(count % 2 === 0);
</script>
```

#### Effects (`$effect`)

Use `$effect` for side effects that run when dependencies change:

```typescript
<script lang="ts">
  let count = $state(0);
  
  $effect(() => {
    console.log('Count changed:', count);
  });
</script>
```

#### Props (`$props`)

Use `$props` for component props:

```typescript
<script lang="ts">
  // Required prop
  let { name } = $props();
  
  // Optional prop with default
  let { count = $bindable(0) } = $props();
  
  // Bindable prop (two-way binding)
  let { value = $bindable() } = $props();
</script>
```

---

## Forbidden: Deprecated Syntax

**Important:** This project uses **Svelte 5 only**. Deprecated Svelte 4 syntax must not be used under any circumstances.

### ❌ Never Use `<slot>`

**Forbidden:**
```svelte
<div>
  <slot />
</div>

<div>
  <slot name="header" />
  <slot name="default" />
  <slot name="footer" />
</div>
```

**Use `{@render children()}` instead** (see [Children Rendering](#children-rendering) section).

### ❌ Never Use `export let`

**Forbidden:**
```svelte
<script lang="ts">
  export let title: string;
  export let count = 0;
  export let disabled = false;
</script>
```

**Use `$props()` instead** (see [Props and Binding](#props-and-binding) section).

**✅ Correct:**
```svelte
<script lang="ts">
  interface Props {
    title: string;
    count?: number;
    disabled?: boolean;
  }
  
  let { title, count = 0, disabled = false }: Props = $props();
</script>
```

### ❌ Never Use Reactive Statements (`$:`)

**Forbidden:**
```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $state(0);
  
  $: doubled = count * 2;
  $: {
    console.log('Count:', count);
  }
  $: if (count > 10) {
    console.log('High count!');
  }
</script>
```

**Use `$derived()` and `$effect()` instead** (see [Reactivity](#reactivity) section).

**✅ Correct:**
```svelte
<script lang="ts">
  let count = $state(0);
  
  let doubled = $derived(count * 2);
  
  $effect(() => {
    console.log('Count:', count);
  });
  
  $effect(() => {
    if (count > 10) {
      console.log('High count!');
    }
  });
</script>
```

### ❌ Never Use `runes={false}`

**Forbidden:**
```svelte
<svelte:options runes={false} />
```

**All components must use runes mode** (this is the default in Svelte 5). Do not disable runes.

### ❌ Never Use `on:click` Event Syntax

**Forbidden:**
```svelte
<button on:click={handleClick}>Click</button>
```

**Use `onclick` instead** (Svelte 5 syntax).

**✅ Correct:**
```svelte
<button onclick={handleClick}>Click</button>
```

### ❌ Never Mix Svelte 4 and Svelte 5 Patterns

**Forbidden:**
```svelte
<script lang="ts">
  export let title: string;  // Svelte 4
  let count = $state(0);    // Svelte 5
</script>
```

**Use Svelte 5 patterns consistently throughout the component.**

---

## Component Structure

### File Naming

- **Component files**: PascalCase (e.g., `ContactForm.svelte`, `Hero.svelte`)
- **Route files**: SvelteKit conventions (`+page.svelte`, `+layout.svelte`)
- **Utility files**: kebab-case (e.g., `contact-form.svelte` if not a component)

### Component Template

**Note:** For detailed ordering guidelines, see [Code Organization and Ordering](#code-organization-and-ordering) section.

```svelte
<script lang="ts">
  // Imports (see ordering guidelines)
  import { onMount } from 'svelte';
  
  // Props
  let { title = $bindable('Default Title') } = $props();
  
  // State
  let isOpen = $state(false);
  let items = $state<string[]>([]);
  
  // Derived
  let itemCount = $derived(items.length);
  
  // Effects
  $effect(() => {
    if (isOpen) {
      // Side effect logic
    }
  });
  
  // Lifecycle
  onMount(() => {
    // Component initialization
  });
  
  // Functions
  function handleClick() {
    isOpen = !isOpen;
  }
</script>

<!-- Template -->
<div class="component">
  <h2>{title}</h2>
  <button onclick={handleClick}>
    {isOpen ? 'Close' : 'Open'}
  </button>
  {#if isOpen}
    <div class="content">
      <p>Item count: {itemCount}</p>
    </div>
  {/if}
</div>

<style>
  .component {
    /* Scoped styles */
  }
</style>
```

## Code Organization and Ordering

### Script Block Structure

Components should follow a consistent structure for readability and maintainability. Use comments to separate sections.

**Recommended Order:**

1. **Imports** (grouped by source)
2. **Type Definitions** (interfaces, types)
3. **Props** (`$props()`)
4. **State** (`$state()`)
5. **Derived** (`$derived()`)
6. **Effects** (`$effect()`)
7. **Constants** (non-reactive values)
8. **Lifecycle Functions** (`onMount`, `onDestroy`, etc.)
9. **Regular Functions** (event handlers, utility functions)

### Import Ordering

Group imports in this order:

1. **Svelte core imports** (`svelte`)
2. **SvelteKit imports** (`$app/*`)
3. **Third-party library imports**
4. **Local component imports** (`$lib/components/*`)
5. **Local utility imports** (`$lib/utils/*`)
6. **Local type imports** (`$lib/types`)
7. **Type-only imports** (use `import type`)

```typescript
<script lang="ts">
  // 1. Svelte core
  import { onMount, onDestroy } from 'svelte';
  
  // 2. SvelteKit
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  
  // 3. Third-party (if any)
  // import { someLib } from 'some-lib';
  
  // 4. Local components
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/forms/Input.svelte';
  
  // 5. Local utilities
  import { formatDate } from '$lib/utils/date';
  
  // 6. Local types
  import type { User, Post } from '$lib/types';
  
  // 7. Type-only imports (if needed separately)
  // import type { ComponentProps } from 'svelte';
</script>
```

### Variable Declaration Order

Declare variables in this order:

1. **Props** - Component inputs
2. **State** - Reactive state variables
3. **Derived** - Computed values
4. **Effects** - Side effects
5. **Constants** - Non-reactive values
6. **Refs** - DOM element references

```typescript
<script lang="ts">
  // 1. Props
  let { title, count = 0, onAction }: Props = $props();
  
  // 2. State
  let isOpen = $state(false);
  let items = $state<Item[]>([]);
  let selectedId = $state<string | null>(null);
  
  // 3. Derived
  let itemCount = $derived(items.length);
  let hasItems = $derived(items.length > 0);
  let selectedItem = $derived.by(() => 
    items.find(item => item.id === selectedId)
  );
  
  // 4. Effects
  $effect(() => {
    if (isOpen) {
      // Side effect logic
    }
  });
  
  // 5. Constants
  const MAX_ITEMS = 10;
  const ANIMATION_DURATION = 300;
  
  // 6. Refs
  let containerElement: HTMLDivElement | null = $state(null);
  let inputElement: HTMLInputElement | null = $state(null);
</script>
```

### Reactive Code Organization

#### State Variables (`$state`)

- Group related state together
- Use descriptive names
- Initialize with appropriate default values
- Use TypeScript types explicitly

```typescript
// ✅ Good: Grouped by concern
let isLoading = $state(false);
let error = $state<string | null>(null);
let data = $state<Data | null>(null);

let isMenuOpen = $state(false);
let activeItem = $state<string | null>(null);
```

#### Derived Values (`$derived`)

- Place derived values after the state they depend on
- Use `$derived.by()` for complex computations
- Keep derived values simple and focused
- Document complex derived logic

```typescript
let items = $state<Item[]>([]);
let filter = $state('');

// Simple derived
let filteredItems = $derived(
  items.filter(item => item.name.includes(filter))
);

// Complex derived
let statistics = $derived.by(() => {
  const total = items.length;
  const filtered = filteredItems.length;
  return {
    total,
    filtered,
    percentage: total > 0 ? (filtered / total) * 100 : 0
  };
});
```

#### Effects (`$effect`)

- Place effects after all state and derived values
- Group related effects together
- Use descriptive comments for complex effects
- Clean up resources in effect cleanup functions

```typescript
let isOpen = $state(false);
let data = $state<Data | null>(null);

// Effect: Handle body class when menu opens
$effect(() => {
  if (isOpen) {
    document.body.classList.add('menu-open');
    return () => {
      document.body.classList.remove('menu-open');
    };
  }
});

// Effect: Fetch data when component mounts
$effect(() => {
  if (data === null) {
    fetchData().then(result => {
      data = result;
    });
  }
});
```

### Function Organization

Organize functions in this order:

1. **Event Handlers** - User interaction handlers
2. **Lifecycle Functions** - Component lifecycle hooks
3. **Utility Functions** - Helper functions
4. **Async Functions** - Data fetching, API calls

```typescript
<script lang="ts">
  // ... state, derived, effects ...
  
  // 1. Event Handlers
  function handleClick() {
    isOpen = !isOpen;
  }
  
  function handleSubmit(event: Event) {
    event.preventDefault();
    // Handle submission
  }
  
  // 2. Lifecycle
  onMount(() => {
    // Component initialization
  });
  
  onDestroy(() => {
    // Cleanup
  });
  
  // 3. Utility Functions
  function formatValue(value: number): string {
    return value.toLocaleString();
  }
  
  // 4. Async Functions
  async function fetchData() {
    const response = await fetch('/api/data');
    return response.json();
  }
</script>
```

### Comments and Sections

Use comments to separate logical sections:

```typescript
<script lang="ts">
  // ===== IMPORTS =====
  import { onMount } from 'svelte';
  
  // ===== TYPES =====
  interface Props {
    title: string;
  }
  
  // ===== PROPS =====
  let { title }: Props = $props();
  
  // ===== STATE =====
  let isOpen = $state(false);
  
  // ===== DERIVED =====
  let status = $derived(isOpen ? 'open' : 'closed');
  
  // ===== EFFECTS =====
  $effect(() => {
    // Effect logic
  });
  
  // ===== FUNCTIONS =====
  function handleClick() {
    // Handler logic
  }
</script>
```

### Complete Example

Here's a complete example following all ordering guidelines:

```svelte
<script lang="ts">
  // ===== IMPORTS =====
  // Svelte core
  import { onMount } from 'svelte';
  
  // SvelteKit
  import { browser } from '$app/environment';
  
  // Local components
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/forms/Input.svelte';
  
  // Local utilities
  import { formatDate } from '$lib/utils/date';
  
  // Local types
  import type { User, Post } from '$lib/types';
  
  // ===== TYPES =====
  interface Props {
    userId: string;
    onSave?: (data: Post) => void;
  }
  
  // ===== PROPS =====
  let { userId, onSave }: Props = $props();
  
  // ===== STATE =====
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let post = $state<Post | null>(null);
  let isEditing = $state(false);
  
  // ===== DERIVED =====
  let canEdit = $derived(post !== null && !isLoading);
  let formattedDate = $derived.by(() => 
    post ? formatDate(post.createdAt) : ''
  );
  
  // ===== EFFECTS =====
  $effect(() => {
    if (userId && !post) {
      loadPost();
    }
  });
  
  // ===== CONSTANTS =====
  const MAX_TITLE_LENGTH = 100;
  
  // ===== REFS =====
  let titleInput: HTMLInputElement | null = $state(null);
  
  // ===== LIFECYCLE =====
  onMount(() => {
    // Initialization
  });
  
  // ===== EVENT HANDLERS =====
  function handleEdit() {
    isEditing = true;
  }
  
  function handleSave() {
    if (post) {
      onSave?.(post);
      isEditing = false;
    }
  }
  
  // ===== UTILITY FUNCTIONS =====
  function validateTitle(title: string): boolean {
    return title.length > 0 && title.length <= MAX_TITLE_LENGTH;
  }
  
  // ===== ASYNC FUNCTIONS =====
  async function loadPost() {
    isLoading = true;
    error = null;
    try {
      const response = await fetch(`/api/posts/${userId}`);
      post = await response.json();
    } catch (e) {
      error = 'Failed to load post';
    } finally {
      isLoading = false;
    }
  }
</script>

<!-- Template -->
<div class="post-editor">
  <!-- Component markup -->
</div>

<style>
  /* Component styles */
</style>
```

### Best Practices

1. **Consistency**: Follow the same order in all components
2. **Grouping**: Group related declarations together
3. **Comments**: Use section comments for large components
4. **Spacing**: Add blank lines between logical sections
5. **Readability**: Keep related code close together
6. **Dependencies**: Place derived values after their dependencies

## Component Organization

### Directory Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── forms/          # Form components
│   │   │   ├── Input.svelte
│   │   │   └── ContactForm.svelte
│   │   ├── sections/       # Page sections
│   │   │   ├── Hero.svelte
│   │   │   └── Location.svelte
│   │   ├── layout/         # Layout components
│   │   │   ├── Header.svelte
│   │   │   └── Footer.svelte
│   │   └── dev/            # Development tools
│   │       └── DevColorEditor.svelte
│   └── utils/               # Utility functions
└── routes/                  # SvelteKit routes
    ├── +layout.svelte
    └── +page.svelte
```

### Component Types

1. **Page Components** (`src/routes/`)
   - `+layout.svelte` - Root layout
   - `+page.svelte` - Page content

2. **Feature Components** (`src/lib/components/sections/`)
   - Large, feature-specific components
   - Examples: `Hero.svelte`, `Location.svelte`, `ContactSection.svelte`

3. **UI Components** (`src/lib/components/forms/`)
   - Reusable form inputs
   - Examples: `Input.svelte`, `Select.svelte`, `Textarea.svelte`

4. **Layout Components** (`src/lib/components/layout/`)
   - Site-wide layout elements
   - Examples: `Header.svelte`, `Footer.svelte`

## State Management

### Component-Local State

Use runes for component-local state:

```typescript
let isOpen = $state(false);
let selectedItem = $state<string | null>(null);
```

### Cross-Component State

For state shared across components, use Svelte stores:

```typescript
// stores.ts
import { writable } from 'svelte/store';

export const theme = writable<'light' | 'dark'>('light');
```

```typescript
// Component usage
import { theme } from '$lib/stores';

$: currentTheme = $theme;
```

### Derived State

Use `$derived` for computed values:

```typescript
let items = $state<Item[]>([]);
let selectedItems = $state<Item[]>([]);

let totalCount = $derived(items.length);
let selectedCount = $derived(selectedItems.length);
let hasSelection = $derived(selectedItems.length > 0);
```

## Event Handling

### Event Handlers

```svelte
<!-- Inline handler -->
<button onclick={() => handleClick()}>Click</button>

<!-- Method reference -->
<button onclick={handleClick}>Click</button>

<!-- With parameters -->
<button onclick={() => handleClick(id)}>Click</button>
```

### Event Modifiers

```svelte
<!-- Prevent default -->
<form onsubmit|preventDefault={handleSubmit}>

<!-- Stop propagation -->
<button onclick|stopPropagation={handleClick}>

<!-- Once -->
<button onclick|once={handleClick}>

<!-- Self (only if event.target === event.currentTarget) -->
<div onclick|self={handleClick}>
```

## Conditional Rendering

### If Blocks

```svelte
{#if condition}
  <p>Visible when condition is true</p>
{/if}

{#if condition}
  <p>True</p>
{:else}
  <p>False</p>
{/if}

{#if condition1}
  <p>First</p>
{:else if condition2}
  <p>Second</p>
{:else}
  <p>Default</p>
{/if}
```

### Key Blocks

Use key blocks for re-rendering when a value changes:

```svelte
{#key selectedId}
  <Component id={selectedId} />
{/key}
```

## Loops

### Each Blocks

```svelte
{#each items as item}
  <div>{item.name}</div>
{/each}

{#each items as item, index}
  <div>{index}: {item.name}</div>
{/each}

{#each items as item (item.id)}
  <div>{item.name}</div>
{/each}
```

### Keyed Each

Always use keyed each blocks for lists that may change:

```svelte
{#each items as item (item.id)}
  <ItemComponent {item} />
{/each}
```

## Props and Binding

### Props

```typescript
// Required prop
let { name } = $props();

// Optional prop
let { count = 0 } = $props();

// Type-safe props
let { name, count = 0 }: { name: string; count?: number } = $props();
```

### Two-Way Binding

```typescript
// Bindable prop
let { value = $bindable('') } = $props();
```

```svelte
<!-- Parent component -->
<Input bind:value={inputValue} />
```

### Binding to Component Props

```svelte
<!-- Bind to input value -->
<input bind:value={name} />

<!-- Bind to checkbox -->
<input type="checkbox" bind:checked={isActive} />

<!-- Bind to select -->
<select bind:value={selectedOption}>
  <option value="a">Option A</option>
  <option value="b">Option B</option>
</select>
```

## Styling

### Scoped Styles

Styles in Svelte components are automatically scoped:

```svelte
<style>
  .button {
    padding: 1rem;
    background: var(--color-primary);
  }
</style>
```

### Global Styles

Use `:global()` for global styles:

```svelte
<style>
  :global(.global-class) {
    /* Global styles */
  }
  
  .component :global(p) {
    /* All <p> tags inside .component */
  }
</style>
```

### CSS Variables

Use CSS custom properties for theming:

```svelte
<style>
  .component {
    color: var(--color-text);
    background: var(--color-bg);
  }
</style>
```

## SvelteKit Specifics

### Routing

SvelteKit uses file-based routing:

```
src/routes/
├── +page.svelte          # Home page (/)
├── +layout.svelte        # Root layout
└── about/
    └── +page.svelte      # About page (/about)
```

### Page Data

Use `+page.ts` or `+page.server.ts` for page data:

```typescript
// +page.ts
export async function load() {
  return {
    title: 'Page Title'
  };
}
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  
  // Access page data
  $: title = $page.data.title;
</script>
```

### Navigation

```typescript
import { goto } from '$app/navigation';

function navigate() {
  goto('/about');
}
```

### Head Management

```svelte
<svelte:head>
  <title>Page Title</title>
  <meta name="description" content="Page description" />
</svelte:head>
```

## Best Practices

### 1. Use Runes for Local State

✅ **Good:**
```typescript
let count = $state(0);
let doubled = $derived(count * 2);
```

❌ **Avoid:**
```typescript
let count = 0;
$: doubled = count * 2;
```

### 2. Key Your Lists

✅ **Good:**
```svelte
{#each items as item (item.id)}
  <ItemComponent {item} />
{/each}
```

❌ **Avoid:**
```svelte
{#each items as item}
  <ItemComponent {item} />
{/each}
```

### 3. Use TypeScript

✅ **Good:**
```typescript
<script lang="ts">
  let { name }: { name: string } = $props();
  let items = $state<string[]>([]);
</script>
```

❌ **Avoid:**
```javascript
<script>
  let { name } = $props();
  let items = $state([]);
</script>
```

### 4. Extract Complex Logic

✅ **Good:**
```typescript
<script lang="ts">
  import { calculateTotal } from '$lib/utils';
  
  let items = $state<Item[]>([]);
  let total = $derived(calculateTotal(items));
</script>
```

❌ **Avoid:**
```typescript
<script lang="ts">
  let items = $state<Item[]>([]);
  let total = $derived(
    items.reduce((sum, item) => {
      // Complex calculation logic here
      return sum + item.price * item.quantity;
    }, 0)
  );
</script>
```

### 5. Use Scoped Styles

✅ **Good:**
```svelte
<style>
  .component {
    /* Scoped automatically */
  }
</style>
```

❌ **Avoid:**
```svelte
<style>
  :global(.component) {
    /* Unnecessary global */
  }
</style>
```

### 6. Handle Loading States

```svelte
{#if loading}
  <LoadingSpinner />
{:else if error}
  <ErrorMessage {error} />
{:else}
  <Content {data} />
{/if}
```

### 7. Use Actions for Reusable Behavior

```typescript
// actions.ts
export function clickOutside(node: HTMLElement, callback: () => void) {
  function handleClick(event: MouseEvent) {
    if (!node.contains(event.target as Node)) {
      callback();
    }
  }
  
  document.addEventListener('click', handleClick);
  
  return {
    destroy() {
      document.removeEventListener('click', handleClick);
    }
  };
}
```

```svelte
<div use:clickOutside={() => isOpen = false}>
  <!-- Content -->
</div>
```

## Common Patterns

### Form Handling

```svelte
<script lang="ts">
  let formData = $state({
    name: '',
    email: ''
  });
  
  let errors = $state<Record<string, string>>({});
  
  async function handleSubmit() {
    // Validation
    errors = {};
    if (!formData.name) {
      errors.name = 'Name is required';
    }
    if (!formData.email) {
      errors.email = 'Email is required';
    }
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    // Submit
    try {
      await submitForm(formData);
    } catch (error) {
      errors.submit = 'Submission failed';
    }
  }
</script>

<form onsubmit|preventDefault={handleSubmit}>
  <input bind:value={formData.name} />
  {#if errors.name}
    <span class="error">{errors.name}</span>
  {/if}
  
  <input bind:value={formData.email} />
  {#if errors.email}
    <span class="error">{errors.email}</span>
  {/if}
  
  <button type="submit">Submit</button>
</form>
```

### Async Data Loading

```svelte
<script lang="ts">
  let data = $state<Data | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  
  async function loadData() {
    loading = true;
    error = null;
    
    try {
      const response = await fetch('/api/data');
      data = await response.json();
    } catch (e) {
      error = 'Failed to load data';
    } finally {
      loading = false;
    }
  }
  
  onMount(loadData);
</script>

{#if loading}
  <LoadingSpinner />
{:else if error}
  <ErrorMessage {error} />
{:else if data}
  <DataDisplay {data} />
{/if}
```

### Modal/Dialog Pattern

```svelte
<script lang="ts">
  let isOpen = $state(false);
  
  function open() {
    isOpen = true;
  }
  
  function close() {
    isOpen = false;
  }
</script>

<button onclick={open}>Open Modal</button>

{#if isOpen}
  <div class="modal-backdrop" onclick={close}>
    <div class="modal" onclick|stopPropagation>
      <button onclick={close}>Close</button>
      <!-- Modal content -->
    </div>
  </div>
{/if}
```

## Performance Considerations

### 1. Use Keyed Each Blocks

Keyed each blocks help Svelte efficiently update the DOM:

```svelte
{#each items as item (item.id)}
  <ItemComponent {item} />
{/each}
```

### 2. Avoid Unnecessary Reactivity

Use `$derived` only when needed:

```typescript
// Only reactive if needed
let count = $state(0);
let doubled = $derived(count * 2); // Only recalculates when count changes
```

### 3. Lazy Load Components

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  
  let HeavyComponent: typeof import('./HeavyComponent.svelte').default;
  
  onMount(async () => {
    const module = await import('./HeavyComponent.svelte');
    HeavyComponent = module.default;
  });
</script>

{#if HeavyComponent}
  <svelte:component this={HeavyComponent} />
{/if}
```

## Testing

### Component Testing

```typescript
import { render } from '@testing-library/svelte';
import Component from './Component.svelte';

test('renders correctly', () => {
  const { getByText } = render(Component, { props: { name: 'Test' } });
  expect(getByText('Test')).toBeInTheDocument();
});
```

## Migration Checklist

When updating existing components or creating new ones, ensure:

### Syntax Compliance
- [ ] All props use `$props()` instead of `export let`
- [ ] All state uses `$state()` instead of regular `let` declarations
- [ ] All derived values use `$derived()` instead of `$:`
- [ ] All effects use `$effect()` instead of `$:`
- [ ] All children use `{@render children()}` instead of `<slot />`
- [ ] No `runes={false}` option is present
- [ ] TypeScript types are properly defined for all props
- [ ] Bindable props use `$bindable()`
- [ ] Event handlers use `onclick`, `onsubmit`, etc. (not `on:click`, `on:submit`)
- [ ] No reactive statements (`$:`) are used
- [ ] Component follows Svelte 5 patterns consistently

### Code Organization
- [ ] Imports are ordered correctly (Svelte → SvelteKit → third-party → local)
- [ ] Props are declared first after imports
- [ ] State variables are grouped logically
- [ ] Derived values are placed after their dependencies
- [ ] Effects are placed after state and derived values
- [ ] Functions are organized (event handlers → lifecycle → utilities → async)
- [ ] Section comments are used for large components
- [ ] Related code is grouped together

## Resources

- [Svelte 5 Documentation](https://svelte.dev/docs)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Svelte Tutorial](https://svelte.dev/tutorial)
- [Svelte Examples](https://svelte.dev/examples)
- [Svelte 5 Migration Guide](https://svelte.dev/docs/v5-migration-guide)

---

## Related Documents

- [Architecture Documentation](./architecture.md) - Complete architecture overview
- [Development Setup](./development-setup.md) - Development environment setup
- [Process Documentation](../process/) - Development processes

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-XX  
**Maintained By:** Development Team

