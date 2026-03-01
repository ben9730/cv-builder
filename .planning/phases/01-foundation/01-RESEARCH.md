# Phase 1: Foundation - Research

**Researched:** 2026-03-01
**Domain:** TypeScript data modeling, Zod 4 schema validation, Zustand 5 persistence, Next.js 16 App Router scaffold
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUN-01 | Resume data model supports ordered sections with structured fields (contact, summary, experience, education, skills) | JSON Resume schema structure verified; Zod 4 object/array patterns documented; ordered arrays (not keyed objects) confirmed correct approach |
| FOUN-02 | Data model supports optional section types (certifications, projects, languages, volunteer) | JSON Resume `certificates`, `projects`, `languages`, `volunteer` arrays documented; all use `.optional()` in Zod |
| FOUN-03 | Resume data persists in localStorage for anonymous users across page refreshes | Zustand 5 `persist` middleware + `createJSONStorage` pattern verified; hydration fix documented |
| FOUN-04 | Resume data is serializable to JSON for storage and export | Zod 4 `z.infer<>` types are plain objects; JSON.stringify/parse roundtrip verified safe with ISO8601 date strings |
| PERS-01 | Anonymous user data saved to localStorage automatically | Zustand `persist` middleware auto-saves on every state change; no user action required |
</phase_requirements>

---

## Summary

Phase 1 establishes the data model and persistence layer for the CV Builder. The work splits into two tasks: (1) scaffolding the Next.js 16 project with TypeScript, Tailwind CSS 4, and Zustand; (2) defining the `ResumeData` schema using Zod 4 aligned with the JSON Resume v1 standard, wired into Zustand's `persist` middleware for automatic localStorage persistence.

The stack is fully confirmed and current as of March 2026. Next.js 16.1.6 is stable with Turbopack as the default bundler. Zod 4.3.6 is the current release with a partially breaking API versus Zod 3 (error param renamed, some method deprecations). Zustand 5.0.11 is stable but has a critical SSR pitfall: the `persist` middleware reads localStorage only on the client, causing a server/client hydration mismatch in Next.js App Router unless a deferred-hydration pattern is applied.

The primary design decision already locked by the project (STATE.md) is to use **ordered arrays** for all resume sections rather than fixed-key objects, enabling future drag-and-drop reordering. This aligns with the JSON Resume standard structure and must be preserved in the Zod schema design.

**Primary recommendation:** Scaffold with `create-next-app@latest --yes`, install `zustand@^5` and `zod@^4`, define a Zod schema mirroring JSON Resume v1, wrap the Zustand store with `persist({ name: 'cv-builder-resume', storage: createJSONStorage(() => localStorage) })`, and use a `useHydration` hook pattern to avoid SSR mismatches in Client Components.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^16.1.6 | Framework (App Router, SSR, routing) | Project decision; Turbopack default, React 19 built-in |
| react / react-dom | ^19 (canary via Next) | UI rendering | Shipped with Next.js 16 |
| typescript | ^5.5 (min 5.1) | Type safety | Required by Next.js 16; strict mode for schema inference |
| tailwindcss | ^4.2.1 | Utility CSS | Project decision; CSS-first config, auto content detection |
| @tailwindcss/postcss | ^4.x | Tailwind v4 PostCSS plugin | Required for v4 (replaces old `tailwindcss` PostCSS plugin) |
| zustand | ^5.0.11 | Client state management + persistence | Project decision; persist middleware handles localStorage |
| zod | ^4.3.6 | Schema definition + runtime validation | Project decision; generates TypeScript types via `z.infer<>` |

### Supporting (Dev/Test)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | latest | Unit test runner | Schema validation tests, store action tests |
| @vitejs/plugin-react | latest | React support in Vitest | Required for JSX in tests |
| @testing-library/react | latest | Component testing | Testing store-connected components |
| jsdom | latest | DOM environment for tests | Required by Vitest for browser-like env |
| vite-tsconfig-paths | latest | Path alias resolution in tests | Required for `@/*` imports to work in tests |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zod 4 | Zod 3 | Zod 3 still widely used; Zod 4 is 6-14x faster, smaller bundle, but has breaking changes from v3 — migration path is well documented |
| Zustand persist | redux-persist | Redux adds boilerplate; Zustand persist is minimal and built-in |
| Zustand persist | custom localStorage hook | Custom hook can't be as reliable — serialization, partial hydration, storage quota handling all solved by persist middleware |
| Tailwind CSS 4 | Tailwind CSS 3 | TW4 requires CSS-first config change; no `tailwind.config.js`; worth it for 100x faster incremental builds |

**Installation:**
```bash
# Project scaffold
npx create-next-app@latest . --yes
# (enables: TypeScript, Tailwind, ESLint, App Router, Turbopack, @/* alias)

# Runtime dependencies
npm install zustand zod

# Dev dependencies (testing)
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/                     # Next.js App Router pages & layouts
│   ├── layout.tsx           # Root layout (html, body, providers)
│   └── page.tsx             # Home/editor page
├── types/
│   └── resume.ts            # ResumeData TypeScript types (z.infer<> exports)
├── lib/
│   ├── schema/
│   │   └── resume-schema.ts # Zod 4 schema definitions
│   └── store/
│       └── resume-store.ts  # Zustand store with persist middleware
├── hooks/
│   └── use-hydration.ts     # Hydration deferred-read hook for SSR safety
└── __tests__/
    ├── resume-schema.test.ts
    └── resume-store.test.ts
```

### Pattern 1: Zod Schema with JSON Resume Alignment

**What:** Define `ResumeData` as a Zod object schema where every section is an array (not a keyed object), matching the JSON Resume v1 standard. Extract TypeScript types via `z.infer<>`.

**When to use:** At schema definition time — this is the single source of truth for the data shape used everywhere in the app.

**Example:**
```typescript
// Source: Zod v4 docs (https://zod.dev/api) + JSON Resume schema (https://jsonresume.org/schema)
import { z } from 'zod'

const ContactSchema = z.object({
  name: z.string().default(''),
  label: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  url: z.string().optional(),
  summary: z.string().optional(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    countryCode: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  profiles: z.array(z.object({
    network: z.string(),
    username: z.string(),
    url: z.string().optional(),
  })).default([]),
})

const WorkEntrySchema = z.object({
  name: z.string().default(''),        // employer / company
  position: z.string().default(''),
  startDate: z.string().optional(),    // ISO8601 string e.g. "2020-01"
  endDate: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  url: z.string().optional(),
  location: z.string().optional(),
})

const EducationEntrySchema = z.object({
  institution: z.string().default(''),
  area: z.string().optional(),         // field of study
  studyType: z.string().optional(),    // e.g. "Bachelor"
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  score: z.string().optional(),        // GPA
  courses: z.array(z.string()).default([]),
  url: z.string().optional(),
})

const SkillEntrySchema = z.object({
  name: z.string().default(''),
  level: z.string().optional(),
  keywords: z.array(z.string()).default([]),
})

// Optional sections
const CertificateEntrySchema = z.object({
  name: z.string().default(''),
  issuer: z.string().optional(),
  date: z.string().optional(),
  url: z.string().optional(),
})

const ProjectEntrySchema = z.object({
  name: z.string().default(''),
  description: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  url: z.string().optional(),
  roles: z.array(z.string()).default([]),
})

const LanguageEntrySchema = z.object({
  language: z.string().default(''),
  fluency: z.string().optional(),
})

const VolunteerEntrySchema = z.object({
  organization: z.string().default(''),
  position: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  url: z.string().optional(),
})

export const ResumeDataSchema = z.object({
  basics: ContactSchema.default({}),
  work: z.array(WorkEntrySchema).default([]),
  education: z.array(EducationEntrySchema).default([]),
  skills: z.array(SkillEntrySchema).default([]),
  // Optional sections (FOUN-02)
  certificates: z.array(CertificateEntrySchema).optional(),
  projects: z.array(ProjectEntrySchema).optional(),
  languages: z.array(LanguageEntrySchema).optional(),
  volunteer: z.array(VolunteerEntrySchema).optional(),
})

// Single source of TypeScript types (FOUN-04)
export type ResumeData = z.infer<typeof ResumeDataSchema>
export type WorkEntry = z.infer<typeof WorkEntrySchema>
export type EducationEntry = z.infer<typeof EducationEntrySchema>
export type SkillEntry = z.infer<typeof SkillEntrySchema>
// ... etc
```

### Pattern 2: Zustand Store with persist Middleware

**What:** A Zustand store that holds `ResumeData` and auto-saves to localStorage on every mutation via the `persist` middleware.

**When to use:** The store is the live state container. Every editor field write calls a store action. localStorage is written automatically — no explicit save needed (fulfills PERS-01).

**Example:**
```typescript
// Source: Zustand docs (https://zustand.docs.pmnd.rs) + verified community pattern
// File: src/lib/store/resume-store.ts
'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { ResumeDataSchema, type ResumeData } from '@/lib/schema/resume-schema'

interface ResumeStore {
  resume: ResumeData
  setResume: (data: ResumeData) => void
  updateBasics: (basics: Partial<ResumeData['basics']>) => void
  reset: () => void
}

const DEFAULT_RESUME: ResumeData = ResumeDataSchema.parse({})

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      resume: DEFAULT_RESUME,
      setResume: (data) => set({ resume: data }),
      updateBasics: (basics) =>
        set((state) => ({
          resume: {
            ...state.resume,
            basics: { ...state.resume.basics, ...basics },
          },
        })),
      reset: () => set({ resume: DEFAULT_RESUME }),
    }),
    {
      name: 'cv-builder-resume',          // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

### Pattern 3: Hydration-Safe Hook for SSR (CRITICAL)

**What:** A custom hook that defers access to persisted store state until after client-side hydration, preventing Next.js hydration mismatches.

**When to use:** In every Client Component that reads from the Zustand store. Without this, the server renders initial state while the client renders localStorage state — causing a React hydration error.

**Example:**
```typescript
// Source: Verified community pattern (dev.to/abdulsamad, Zustand GitHub discussions)
// File: src/hooks/use-hydration.ts
'use client'

import { useState, useEffect } from 'react'

/**
 * Returns false until the component has mounted on the client.
 * Use to prevent SSR hydration mismatches with persisted Zustand stores.
 */
export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  return hydrated
}

// Usage in a Client Component:
// const hydrated = useHydration()
// const resume = useResumeStore((s) => s.resume)
// if (!hydrated) return <LoadingSkeleton />
// return <ResumeForm data={resume} />
```

### Anti-Patterns to Avoid

- **Using Zustand store in a Server Component:** Zustand is client-only. Only use in `'use client'` components or custom hooks. Server Components cannot access browser state.
- **Storing Date objects in the Zustand store:** `JSON.stringify` will serialize `Date` to ISO strings but `JSON.parse` won't restore them as `Date` — they stay strings. Store all dates as ISO8601 strings (consistent with JSON Resume standard).
- **Fixed-key objects for resume sections:** Do NOT use `{ experience: {...}, education: {...} }` as a map of items. Use ordered arrays. This enables future reordering without schema changes.
- **Calling `ResumeDataSchema.parse()` in every render:** Parse once (e.g., on load from localStorage) and store the validated result. Zustand `persist` handles serialization — do not re-parse on every selector call.
- **Using `z.strictObject()` for resume sections:** Sections need to be extensible (JSON Resume allows `additionalProperties`). Use `z.object()` (loose by default in Zod 4).
- **Skipping `createJSONStorage`:** Directly providing `storage: localStorage` in the persist config will fail during SSR (localStorage is undefined on the server). Always use `createJSONStorage(() => localStorage)` — the arrow function defers access until client-side.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Schema → TypeScript types | Manual type declarations | `z.infer<typeof Schema>` | Types auto-update when schema changes; no sync bugs |
| localStorage serialization | Custom JSON encode/decode | `createJSONStorage(() => localStorage)` from `zustand/middleware` | Handles storage quota errors, versioning, migration |
| Form default values | Hardcoded empty objects | `ResumeDataSchema.parse({})` | Zod applies `.default()` values; always valid shape |
| Schema validation in tests | Manual type checks | `schema.safeParse(data)` | Returns `{ success, data, error }` — no try/catch needed |
| State subscription / reactivity | Custom pub/sub or Context | Zustand selectors (`useResumeStore(s => s.resume)`) | Built-in referential equality, batched updates |

**Key insight:** Zod and Zustand together eliminate two entire categories of bugs: (1) type/runtime mismatch (Zod catches bad shapes at parse time), and (2) stale localStorage data (persist middleware handles versioning with `migrate` option for future schema changes).

---

## Common Pitfalls

### Pitfall 1: SSR Hydration Mismatch with persist Middleware

**What goes wrong:** `useResumeStore` reads localStorage on the client but returns the Zustand initial state on the server. React's hydration check sees different HTML and throws `Hydration failed because the server rendered HTML didn't match the client.`

**Why it happens:** `persist` middleware runs its `getItem` call only on the browser. SSR renders with the store's initial state. When React hydrates on the client, the store may already have data from localStorage — causing a content mismatch.

**How to avoid:** Use the `useHydration()` hook (Pattern 3 above). Render a loading skeleton until `hydrated === true`. The `createJSONStorage(() => localStorage)` arrow function prevents the SSR crash itself — the mismatch fix requires the deferred render.

**Warning signs:** Console error: "Hydration failed because..." or "Text content did not match" during development.

---

### Pitfall 2: Zod 4 Breaking Changes from v3

**What goes wrong:** If any prior code or documentation example uses Zod v3 API, several things silently break or produce TypeScript errors.

**Why it happens:** Zod 4 deprecated and removed several v3 APIs:
- `.strict()` on objects → use `z.strictObject()` instead (for lockdown) or nothing (loose is default)
- `.passthrough()` → use `z.looseObject()`
- `z.nativeEnum()` → use `z.enum()` (now accepts native enums too)
- Error customization: `{ message: "..." }` → `{ error: "..." }`
- `invalid_type_error` / `required_error` → both replaced by unified `error` param

**How to avoid:** Reference Zod 4 docs at `https://zod.dev/api` only. Do not copy Zod 3 examples. Migration guide at `https://zod.dev/v4/changelog`.

**Warning signs:** TypeScript error `Property 'strict' does not exist on type ZodObject` or `Object literal may only specify known properties, and 'message' does not exist`.

---

### Pitfall 3: Date Handling in JSON Serialization

**What goes wrong:** Resume dates stored as JavaScript `Date` objects serialize to ISO strings in JSON but deserialize as strings (not `Date` objects) when read back from localStorage. Code that calls `.getFullYear()` on a date field will throw `TypeError`.

**Why it happens:** `JSON.parse` does not know to reconstruct `Date` objects from ISO strings.

**How to avoid:** Store all dates as ISO8601 strings (e.g., `"2020-01"`, `"2023-06-15"`) in the Zod schema. Use `z.string()` for date fields — this is also what JSON Resume uses. No `Date` objects in `ResumeData` at all.

**Warning signs:** `TypeError: date.getFullYear is not a function` after a page refresh; or date fields showing as strings in the UI when you expected `Date` objects.

---

### Pitfall 4: Next.js 16 Async params/searchParams

**What goes wrong:** In Next.js 16, the synchronous `params` and `searchParams` props on page components are removed. Code using `params.id` (sync) throws a runtime error.

**Why it happens:** Next.js 16 completed the migration to async dynamic APIs. Previously deprecated sync access is now fully removed.

**How to avoid:** Use `const { id } = await params` in page components. This only affects pages/layouts — the store layer in Phase 1 is unaffected, but it matters during scaffold setup.

**Warning signs:** `Error: Route "/[id]/page" used `params.id`. `params` should be awaited before using its properties.`

---

### Pitfall 5: Tailwind CSS 4 Config File Missing

**What goes wrong:** Attempting to customize Tailwind with a `tailwind.config.js` file has no effect in Tailwind v4.

**Why it happens:** Tailwind v4 moved to CSS-first configuration. The JavaScript config file is no longer read.

**How to avoid:** Use `@theme` directive in your CSS file for customizations. The `@import "tailwindcss"` in `globals.css` is the only required setup — no config file needed for defaults.

**Warning signs:** Custom colors or fonts defined in `tailwind.config.js` not appearing in the UI.

---

## Code Examples

Verified patterns from official sources:

### Zod 4 Schema Parse with Defaults

```typescript
// Source: https://zod.dev/api
import { z } from 'zod'

const ResumeDataSchema = z.object({
  basics: z.object({ name: z.string().default('') }).default({}),
  work: z.array(z.object({ name: z.string().default('') })).default([]),
})

// Produces a fully-valid ResumeData with all defaults applied:
const empty = ResumeDataSchema.parse({})
// => { basics: { name: '' }, work: [] }

// Type is automatically derived:
type ResumeData = z.infer<typeof ResumeDataSchema>
```

### Zustand persist with createJSONStorage

```typescript
// Source: Zustand middleware docs + verified community pattern
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useStore = create<{ count: number; inc: () => void }>()(
  persist(
    (set) => ({
      count: 0,
      inc: () => set((s) => ({ count: s.count + 1 })),
    }),
    {
      name: 'counter-storage',
      storage: createJSONStorage(() => localStorage),
      // Optional: persist only specific keys
      // partialize: (state) => ({ count: state.count }),
    }
  )
)
```

### Tailwind CSS 4 — globals.css

```css
/* Source: https://tailwindcss.com/docs/guides/nextjs */
@import "tailwindcss";

/* Custom theme tokens (replaces tailwind.config.js theme.extend) */
@theme {
  --color-brand: #2563eb;
  --font-sans: "Inter", sans-serif;
}
```

### Tailwind CSS 4 — postcss.config.mjs

```javascript
// Source: https://tailwindcss.com/docs/guides/nextjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

### Vitest Config for Next.js 16

```typescript
// Source: https://nextjs.org/docs/app/guides/testing/vitest
// File: vitest.config.mts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
  },
})
```

### Schema Validation Test (Vitest)

```typescript
// File: __tests__/resume-schema.test.ts
import { describe, it, expect } from 'vitest'
import { ResumeDataSchema } from '@/lib/schema/resume-schema'

describe('ResumeDataSchema', () => {
  it('parses empty object with defaults', () => {
    const result = ResumeDataSchema.safeParse({})
    expect(result.success).toBe(true)
    expect(result.data?.work).toEqual([])
  })

  it('roundtrips through JSON without data loss', () => {
    const original = ResumeDataSchema.parse({
      basics: { name: 'Jane Doe', email: 'jane@example.com' },
      work: [{ name: 'Acme Corp', position: 'Engineer', startDate: '2020-01' }],
    })
    const json = JSON.stringify(original)
    const parsed = ResumeDataSchema.parse(JSON.parse(json))
    expect(parsed).toEqual(original)
  })
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Zod 3 `z.object().strict()` | Zod 4 `z.strictObject()` | Zod 4.0 (Aug 2025) | Must update schema definitions |
| Zod 3 `{ message: "..." }` error opts | Zod 4 `{ error: "..." }` | Zod 4.0 (Aug 2025) | Compiler error if using old syntax |
| Tailwind CSS 3 `tailwind.config.js` | Tailwind CSS 4 `@theme` in CSS | TW v4.0 (Jan 2025) | JavaScript config file ignored |
| Tailwind CSS 3 `@tailwind base/utilities` | TW4 `@import "tailwindcss"` | TW v4.0 | Three lines become one |
| Tailwind PostCSS `tailwindcss` plugin | `@tailwindcss/postcss` | TW v4.0 | Different npm package name |
| Next.js 15 `middleware.ts` | Next.js 16 `proxy.ts` (middleware.ts deprecated) | Next.js 16 (Oct 2025) | Rename for new projects |
| Next.js sync `params.id` | Next.js 16 `(await params).id` | Next.js 16 | Breaking — must await |
| Zustand 4 `create<T>()` | Zustand 5 `create<T>()()` curried | Zustand 5.0 | Double parentheses required |

**Deprecated/outdated:**
- `tailwind.config.js`: Ignored in Tailwind v4. Use CSS `@theme` directive.
- `z.nativeEnum()`: Deprecated in Zod 4. Use `z.enum()` which now accepts native TS enums.
- `z.object().strict()` / `.passthrough()` / `.merge()`: Deprecated. Use `z.strictObject()` / `z.looseObject()` / `.extend()`.
- `middleware.ts` in Next.js 16: Deprecated. Rename to `proxy.ts` for new projects.

---

## Open Questions

1. **Schema versioning / migration for localStorage data**
   - What we know: Zustand `persist` has a `version` and `migrate` option for evolving stored schemas without breaking old localStorage data.
   - What's unclear: Phase 1 doesn't need migration yet, but the `version: 1` should be set now so future migrations have a baseline.
   - Recommendation: Set `version: 1` in the persist config. Document the pattern so Phase 2+ can safely add fields without breaking existing user data.

2. **`basics.profiles` (social links) for v1**
   - What we know: JSON Resume defines `profiles` as an array of `{ network, username, url }`.
   - What's unclear: Phase 1 FOUN-01 mentions "website/LinkedIn" but no spec for multiple profiles; EDIT-01 in Phase 2 will define the editor fields.
   - Recommendation: Include `profiles` array in the schema now (JSON Resume aligned) even if Phase 2 editor only exposes one profile field. Schema can hold more than the editor exposes.

3. **Next.js 16 `proxy.ts` vs `middleware.ts`**
   - What we know: `middleware.ts` is deprecated in Next.js 16; `proxy.ts` is the replacement. Phase 1 likely won't need either.
   - What's unclear: If any auth redirect or header manipulation is needed later, which file to create.
   - Recommendation: Phase 1 scaffold needs neither. Note for Phase 4 (import) if CORS handling for file parsing APIs is needed.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (latest) + @testing-library/react |
| Config file | `vitest.config.mts` — none exists yet (Wave 0 gap) |
| Quick run command | `npm run test -- --run` |
| Full suite command | `npm run test -- --run --reporter=verbose` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUN-01 | `ResumeDataSchema` has contact, summary (in basics), work, education, skills fields with correct types | unit | `npm run test -- --run __tests__/resume-schema.test.ts` | ❌ Wave 0 |
| FOUN-02 | Schema has optional certificates, projects, languages, volunteer fields | unit | `npm run test -- --run __tests__/resume-schema.test.ts` | ❌ Wave 0 |
| FOUN-03 | Zustand store reads from localStorage key `cv-builder-resume` on mount | unit | `npm run test -- --run __tests__/resume-store.test.ts` | ❌ Wave 0 |
| FOUN-04 | `JSON.stringify(resume)` → `JSON.parse(...)` → `schema.parse(...)` roundtrip preserves all fields | unit | `npm run test -- --run __tests__/resume-schema.test.ts` | ❌ Wave 0 |
| PERS-01 | Store write auto-updates localStorage without user action (no explicit save call) | unit | `npm run test -- --run __tests__/resume-store.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run test -- --run`
- **Per wave merge:** `npm run test -- --run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `vitest.config.mts` — test runner config, must be created before any tests run
- [ ] `__tests__/resume-schema.test.ts` — covers FOUN-01, FOUN-02, FOUN-04
- [ ] `__tests__/resume-store.test.ts` — covers FOUN-03, PERS-01
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths`
- [ ] `package.json` test script: `"test": "vitest"`

---

## Sources

### Primary (HIGH confidence)

- Next.js official docs (`https://nextjs.org/docs/app/getting-started/installation`, version 16.1.6, lastUpdated 2026-02-27) — installation, App Router structure, TypeScript setup
- Next.js blog (`https://nextjs.org/blog/next-16`) — breaking changes, version requirements, async params removal, middleware.ts deprecation
- Vitest official docs (`https://nextjs.org/docs/app/guides/testing/vitest`, version 16.1.6, lastUpdated 2026-02-27) — exact setup steps and config
- Zod v4 docs (`https://zod.dev/api`) — object, array, optional, default, infer APIs
- Zod v4 changelog (`https://zod.dev/v4/changelog`) — breaking changes from v3
- Tailwind CSS docs (`https://tailwindcss.com/docs/guides/nextjs`) — v4 PostCSS setup for Next.js
- JSON Resume schema (`https://jsonresume.org/schema`) — all section types, field names, types

### Secondary (MEDIUM confidence)

- Zustand persist pattern (verified via Zustand GitHub discussions/1382 and dev.to/abdulsamad article) — `createJSONStorage`, hydration deferred-hook pattern
- WebSearch for npm versions (confirmed: next@16.1.6, zustand@5.0.11, zod@4.3.6, tailwindcss@4.2.1) — multiple sources consistent

### Tertiary (LOW confidence)

- None — all critical claims verified with official sources.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified via npm search and official release notes
- Architecture: HIGH — patterns verified against official Next.js, Zustand, and Zod documentation
- Pitfalls: HIGH — SSR hydration issue verified in multiple official GitHub discussions; Zod 4 breaking changes from official changelog; Tailwind 4 changes from official docs
- Test mapping: HIGH — Vitest setup verified from official Next.js docs (v16.1.6, 2026-02-27)

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable stack; Tailwind/Zod patch releases won't affect patterns)
