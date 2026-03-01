---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-01
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @testing-library/react |
| **Config file** | `vitest.config.mts` — none exists yet (Wave 0 installs) |
| **Quick run command** | `npm run test -- --run` |
| **Full suite command** | `npm run test -- --run --reporter=verbose` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- --run`
- **After every plan wave:** Run `npm run test -- --run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | FOUN-01 | unit | `npm run test -- --run __tests__/resume-schema.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | FOUN-02 | unit | `npm run test -- --run __tests__/resume-schema.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | FOUN-03 | unit | `npm run test -- --run __tests__/resume-store.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | FOUN-04 | unit | `npm run test -- --run __tests__/resume-schema.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 1 | PERS-01 | unit | `npm run test -- --run __tests__/resume-store.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.mts` — test runner config with jsdom environment
- [ ] `__tests__/resume-schema.test.ts` — stubs for FOUN-01, FOUN-02, FOUN-04
- [ ] `__tests__/resume-store.test.ts` — stubs for FOUN-03, PERS-01
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths`
- [ ] `package.json` test script: `"test": "vitest"`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| localStorage persists across page refreshes | FOUN-03 | Browser refresh not testable in jsdom | 1. Run dev server 2. Enter data 3. Refresh page 4. Verify data remains |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
