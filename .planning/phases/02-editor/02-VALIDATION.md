---
phase: 2
slug: editor
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-01
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 + @testing-library/react 16.3.2 |
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
| TBD | 01 | 1 | EDIT-01 | integration | `npx vitest run src/__tests__/contact-form.test.tsx -x` | No - W0 | pending |
| TBD | 01 | 1 | EDIT-02 | integration | `npx vitest run src/__tests__/summary-form.test.tsx -x` | No - W0 | pending |
| TBD | 02 | 1 | EDIT-03 | integration | `npx vitest run src/__tests__/experience-form.test.tsx -x` | No - W0 | pending |
| TBD | 02 | 1 | EDIT-04 | integration | `npx vitest run src/__tests__/education-form.test.tsx -x` | No - W0 | pending |
| TBD | 02 | 1 | EDIT-05 | integration | `npx vitest run src/__tests__/skills-form.test.tsx -x` | No - W0 | pending |
| TBD | 03 | 2 | EDIT-06 | integration | `npx vitest run src/__tests__/optional-sections.test.tsx -x` | No - W0 | pending |
| TBD | 03 | 2 | EDIT-07 | integration | `npx vitest run src/__tests__/entry-management.test.tsx -x` | No - W0 | pending |
| TBD | 03 | 2 | UI-01 | integration | `npx vitest run src/__tests__/editor-layout.test.tsx -x` | No - W0 | pending |
| TBD | 03 | 2 | UI-02 | integration | `npx vitest run src/__tests__/sidebar.test.tsx -x` | No - W0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `npm install react-hook-form @hookform/resolvers` — form library
- [ ] `npx shadcn@latest init` + add components — UI component library
- [ ] `src/__tests__/contact-form.test.tsx` — covers EDIT-01
- [ ] `src/__tests__/summary-form.test.tsx` — covers EDIT-02
- [ ] `src/__tests__/experience-form.test.tsx` — covers EDIT-03
- [ ] `src/__tests__/education-form.test.tsx` — covers EDIT-04
- [ ] `src/__tests__/skills-form.test.tsx` — covers EDIT-05
- [ ] `src/__tests__/optional-sections.test.tsx` — covers EDIT-06
- [ ] `src/__tests__/entry-management.test.tsx` — covers EDIT-07
- [ ] `src/__tests__/editor-layout.test.tsx` — covers UI-01
- [ ] `src/__tests__/sidebar.test.tsx` — covers UI-02
- [ ] `src/__tests__/resume-store-actions.test.ts` — covers new store CRUD actions

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mobile responsive layout | UI-01 | Viewport-dependent rendering; jsdom doesn't fully simulate CSS media queries | Resize browser to mobile viewport (375px); verify sidebar collapses; verify form remains usable |
| Visual completion hints in sidebar | UI-02 | Visual indicator styling | Inspect sidebar; verify checkmark/dot appears for sections with content |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
