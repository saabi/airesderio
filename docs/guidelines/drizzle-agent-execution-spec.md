# DRIZZLE EXECUTION SPEC (AGENT-STRICT v1)

Deterministic rules for generating and integrating Drizzle ORM code.

---

## RULE PRIORITY

P0 — HARD CONSTRAINTS (must never be violated)
P1 — DEFAULT BEHAVIOR (apply unless overridden)
P2 — STYLE (only if no conflict)

If conflict:
P0 > P1 > P2

---

## P0 — HARD CONSTRAINTS

### Architecture

* DB code MUST live in server-only modules
* NEVER import Drizzle into client/browser code
* NEVER mix schema, queries, and route logic in same file

### Schema

* Schema is the single source of truth
* MUST define:

  * primary key
  * foreign keys (when applicable)
  * nullability
* NEVER rely on application logic for invariants enforceable by DB

### Safety

* MUST validate all external input before DB usage
* MUST authorize before read/write
* MUST NOT expose sensitive fields to client

### Data access

* MUST NOT return full rows unless explicitly required
* MUST select only required fields

### Mutations

* MUST use transaction for multi-step writes

### Migrations

* ANY schema change MUST include migration note

---

## P1 — DEFAULT BEHAVIOR

### File structure

```
src/lib/server/db/
  client.ts
  schema/*.ts
  relations.ts
  queries/*.ts
```

### Schema rules

* Prefer normalized tables over JSON
* Use explicit defaults only if meaningful
* Use enums only if stable

### Query rules

* Prefer domain functions:

  * getUserByEmail
  * createOrder
* Avoid generic repositories

### Pagination

* Prefer cursor-based
* Offset only if explicitly acceptable

### Error handling

* Map DB errors → domain errors

---

## P2 — STYLE

* Use clear domain naming
* Keep queries readable over clever
* Keep modules small and focused

---

## DECISION LOGIC (MANDATORY)

```
IF schema change → include migration notes
IF multi-step mutation → wrap in transaction
IF user input → validate first
IF data sent to client → strip sensitive fields
IF query used in UI → narrow select
IF relation exists → define FK + drizzle relation
```

---

## OUTPUT CONTRACT

Agent MUST return:

### For schema changes

* schema code
* inferred types (if useful)
* migration note (mandatory)

### For queries

* function
* input params
* return shape

### For SvelteKit usage

* server file (+page.server.ts or +server.ts)
* NO client-side DB usage

### Explanation

* minimal, only if non-obvious

---

## TEMPLATES

### Schema

```ts
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export type User = typeof users.$inferSelect;
```

---

### Query

```ts
export async function getUserByEmail(db, email: string) {
  return db.select({
    id: users.id,
    email: users.email
  })
  .from(users)
  .where(eq(users.email, email))
  .limit(1);
}
```

---

### Transaction

```ts
await db.transaction(async (tx) => {
  const user = await tx.insert(users).values(input).returning();
  await tx.insert(profiles).values({ userId: user[0].id });
});
```

---

### SvelteKit server load

```ts
export const load = async ({ locals }) => {
  const user = await getUserByEmail(locals.db, locals.user.email);

  return {
    user: user ? { id: user.id, email: user.email } : null
  };
};
```

---

### Action

```ts
export const actions = {
  create: async ({ request, locals }) => {
    const data = Object.fromEntries(await request.formData());

    // validate(data)

    await locals.db.insert(users).values({ email: data.email });

    return { success: true };
  }
};
```

---

## ANTI-PATTERNS (FORBIDDEN)

* importing DB into client code
* returning full rows blindly
* schema without constraints
* no transaction for dependent writes
* JSON used instead of relational model without justification
* schema changes without migration note
* skipping validation
* skipping authorization

---

## FINAL DIRECTIVE

Optimize for:

* correctness
* explicitness
* safety
* predictability

NOT for:

* abstraction
* cleverness
* brevity at the cost of clarity
