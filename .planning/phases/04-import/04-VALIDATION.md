---
phase: 4
slug: import
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-01
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 + jsdom + @testing-library/react |
| **Config file** | vitest.config.mts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | IMPT-01 | integration | `npx vitest run src/__tests__/api-parse.test.ts --reporter=verbose` | No - W0 | pending |
| 04-01-02 | 01 | 1 | IMPT-01 | unit | `npx vitest run src/__tests__/section-mapper.test.ts --reporter=verbose` | No - W0 | pending |
| 04-02-01 | 02 | 1 | IMPT-02 | unit | `npx vitest run src/__tests__/text-parser.test.ts --reporter=verbose` | No - W0 | pending |
| 04-02-02 | 02 | 1 | IMPT-03 | unit | `npx vitest run src/__tests__/import-modal.test.tsx --reporter=verbose` | No - W0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/section-mapper.test.ts` — stubs for IMPT-01, IMPT-02
- [ ] `src/__tests__/text-parser.test.ts` — stubs for IMPT-02
- [ ] `src/__tests__/api-parse.test.ts` — stubs for IMPT-01
- [ ] `src/__tests__/import-modal.test.tsx` — stubs for IMPT-03

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag-and-drop visual feedback | IMPT-01 | CSS visual state | Drag a file over dropzone, verify border/bg changes |
| Modal transitions and sizing | IMPT-03 | Animation/layout | Upload a file, verify modal expands smoothly to review |
| Loading spinner state text | IMPT-01 | Visual timing | Upload a PDF, verify spinner shows status text updates |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
