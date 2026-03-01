---
phase: 01-foundation
plan: 02
subsystem: database
tags: [zod, zustand, schema, localStorage, persistence, typescript, json-resume]

# Dependency graph
requires:
  - phase: 01-01
    provides: Next.js project with Zustand, Zod, Vitest installed
provides:
  - ResumeData Zod 4 schema with all JSON Resume v1 sections
  - TypeScript types derived from Zod schemas via z.infer
  - Zustand store with automatic localStorage persistence
  - useHydration hook for SSR-safe store access
  - 16 passing unit tests covering schema validation and store actions
affects: [02-editor, 03-templates, 04-import]

# Tech tracking
tech-stack:
  added: []
  patterns: [zod-4-pre-parsed-defaults, zustand-persist-createJSONStorage, useHydration-ssr-pattern, tdd-red-green-refactor]

key-files:
  created:
    - src/lib/schema/resume-schema.ts
    - src/types/resume.ts
    - src/lib/store/resume-store.ts
    - src/hooks/use-hydration.ts
    - src/__tests__/resume-schema.test.ts
    - src/__tests__/resume-store.test.ts
  modified: []

key-decisions:
  - "Zod 4 .default() returns raw values without parsing nested schemas; used pre-parsed DEFAULT_BASICS constant as workaround"
  - "Zustand persist version set to 1 for future migration baseline"
  - "All date fields stored as ISO8601 strings (no Date objects) per JSON Resume standard"

patterns-established:
  - "Schema is single source of truth: types derived via z.infer, defaults via schema.parse({})"
  - "Store uses curried create<T>()() pattern required by Zustand 5"
  - "Client components must use useHydration() before reading persisted store values"

requirements-completed: [FOUN-01, FOUN-02, FOUN-03, FOUN-04, PERS-01]

# Metrics
duration: 3min
completed: 2026-03-01
---

# Phase 01 Plan 02: Resume Schema and Store Summary

**Zod 4 ResumeData schema (JSON Resume v1 aligned) with Zustand persist store, localStorage auto-save, and 16 passing unit tests**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-01T12:18:22Z
- **Completed:** 2026-03-01T12:22:10Z
- **Tasks:** 2 (TDD: RED-GREEN each)
- **Files modified:** 6

## Accomplishments
- Complete ResumeData schema with 8 section types: contact, work, education, skills, certificates, projects, languages, volunteer
- TypeScript types auto-derived from Zod schemas ensuring type-runtime consistency
- Zustand store with persist middleware auto-saves to localStorage on every mutation
- Hydration hook prevents SSR mismatch in Next.js App Router
- 16 passing unit tests: 9 schema validation + 7 store action/persistence tests

## Task Commits

Each task followed TDD (RED then GREEN):

1. **Task 1 RED: Schema tests** - `0060ebd` (test)
2. **Task 1 GREEN: Schema implementation** - `daa885c` (feat)
3. **Task 2 RED: Store tests** - `7ae032e` (test)
4. **Task 2 GREEN: Store + hydration implementation** - `fcb9161` (feat)

## Files Created/Modified
- `src/lib/schema/resume-schema.ts` - Zod 4 schemas for all resume sections (ContactSchema, WorkEntrySchema, etc.)
- `src/types/resume.ts` - TypeScript types via z.infer (ResumeData, WorkEntry, etc.)
- `src/lib/store/resume-store.ts` - Zustand store with persist middleware and localStorage
- `src/hooks/use-hydration.ts` - SSR hydration safety hook
- `src/__tests__/resume-schema.test.ts` - 9 schema validation tests
- `src/__tests__/resume-store.test.ts` - 7 store action and persistence tests

## Decisions Made
- Used pre-parsed DEFAULT_BASICS constant for nested defaults (Zod 4 .default() returns raw value without parsing nested schemas)
- Set persist version: 1 to enable future schema migration
- Stored all dates as ISO8601 strings, not Date objects, per JSON Resume standard and JSON serialization safety

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Zod 4 nested default behavior differs from expected**
- **Found during:** Task 1 GREEN (schema implementation)
- **Issue:** `ContactSchema.default({})` in Zod 4 returns raw `{}` without applying inner `.default('')` values. `basics.name` was `undefined` instead of `''`.
- **Fix:** Pre-parsed the default via `const DEFAULT_BASICS = ContactSchema.parse({})` and used it as the default value.
- **Files modified:** src/lib/schema/resume-schema.ts
- **Verification:** All 9 schema tests pass, including `basics.name === ''`
- **Committed in:** daa885c

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary fix for Zod 4 behavior. No scope change.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Data foundation complete: schema, types, store, persistence, tests all verified
- Phase 1 complete, ready for Phase 2 editor forms
- Editor forms (Phase 2) can import ResumeData types and useResumeStore directly

---
*Phase: 01-foundation*
*Completed: 2026-03-01*
