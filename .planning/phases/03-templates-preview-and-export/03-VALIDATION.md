---
phase: 3
slug: templates-preview-and-export
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-01
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 + jsdom + @testing-library/react |
| **Config file** | vitest.config.mts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~15 seconds |

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
| 03-01-01 | 01 | 1 | TMPL-01, TMPL-02 | unit | `npx vitest run src/__tests__/templates.test.tsx` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | EXPT-01, PREV-02 | unit | `npx vitest run src/__tests__/pdf-export.test.ts` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | TMPL-01 | unit | `npx vitest run src/__tests__/templates.test.tsx` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | TMPL-03 | unit | `npx vitest run src/__tests__/template-switcher.test.tsx` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 2 | PREV-01 | integration | `npx vitest run src/__tests__/preview-panel.test.tsx` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 2 | EXPT-02 | unit | `npx vitest run src/__tests__/docx-export.test.ts` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 2 | PERS-02 | unit | `npx vitest run src/__tests__/json-export.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending | ✅ green | ❌ red | ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/templates.test.tsx` — stubs for TMPL-01, TMPL-02
- [ ] `src/__tests__/template-switcher.test.tsx` — stubs for TMPL-03
- [ ] `src/__tests__/preview-panel.test.tsx` — stubs for PREV-01
- [ ] `src/__tests__/pdf-export.test.ts` — stubs for PREV-02, EXPT-01
- [ ] `src/__tests__/docx-export.test.ts` — stubs for EXPT-02
- [ ] `src/__tests__/json-export.test.ts` — stubs for PERS-02
- [ ] Font files in `public/fonts/` (Inter Regular + Bold .ttf) for @react-pdf/renderer

*Existing test infrastructure (Vitest + jsdom + testing-library) covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PDF visual fidelity matches preview | PREV-02 | @react-pdf/renderer components cannot render in jsdom; visual comparison requires human eye | Open preview panel, export PDF, compare layout/fonts/spacing visually |
| Three templates have distinct visual styles | TMPL-01 | Visual distinctiveness is subjective | Export PDF from each template, verify they look significantly different |
| PDF text is selectable (ATS-safe) | EXPT-01 | Requires opening actual PDF in reader | Export PDF, open in PDF reader, try to select and copy text |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
