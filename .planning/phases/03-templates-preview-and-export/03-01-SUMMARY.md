---
phase: 03-templates-preview-and-export
plan: 01
subsystem: templates
tags: [react-pdf, pdf, templates, preview, fonts]

requires:
  - phase: 02-editor
    provides: ResumeData schema, Zustand store, form components
provides:
  - Template registry with TemplateId type and TEMPLATES map
  - Classic resume template as @react-pdf/renderer Document component
  - Shared PDF primitives (SectionTitle, DateRange, BulletList, ContactLine)
  - PDFViewer-based preview panel component
  - PDF export function using pdf().toBlob() + file-saver
  - selectedTemplate field in Zustand store
affects: [03-02-templates, 03-03-export]

tech-stack:
  added: ["@react-pdf/renderer ^4.3.2", "file-saver ^2.0.5", "@types/file-saver"]
  patterns: ["pure template renderer pattern", "template registry pattern", "dynamic import for SSR-unsafe components"]

key-files:
  created:
    - src/components/templates/template-registry.ts
    - src/components/templates/classic-template.tsx
    - src/components/templates/fonts.ts
    - src/components/templates/shared/pdf-primitives.tsx
    - src/components/preview/preview-panel.tsx
    - src/components/export/pdf-export.ts
    - src/__tests__/templates.test.tsx
    - src/__tests__/pdf-export.test.ts
    - public/fonts/Inter-Regular.ttf
    - public/fonts/Inter-Bold.ttf
  modified:
    - src/lib/store/resume-store.ts
    - src/types/resume.ts

key-decisions:
  - "Templates built as @react-pdf/renderer components for WYSIWYG PDF fidelity"
  - "PDFViewer used for preview, same component for export — guarantees PREV-02"
  - "Inter font (v4.1) registered via Font.register() at module level"
  - "selectedTemplate added to Zustand persist store"

patterns-established:
  - "Pure template pattern: templates are (resume: ResumeData) => Document JSX"
  - "Template registry: TEMPLATES record maps TemplateId to component + metadata"
  - "PDF export: pdf(element).toBlob() + saveAs for client-side download"

requirements-completed: [TMPL-01, TMPL-02, PREV-02, EXPT-01]

duration: 5min
completed: 2026-03-01
---

# Phase 3 Plan 01: Template Architecture and Classic Template Summary

**Classic resume template with @react-pdf/renderer, PDFViewer preview panel, and PDF export — establishing the single-source-of-truth pattern where preview and export use identical template components.**

## What Was Built

1. **Template Registry** — Central mapping of TemplateId to component, metadata, and accent color
2. **Classic Template** — Full resume template with all sections (contact, summary, experience, education, skills, and all optional sections) using @react-pdf/renderer primitives
3. **Shared PDF Primitives** — Reusable SectionTitle, DateRange, BulletList, ContactLine components
4. **Preview Panel** — PDFViewer-based component with memoized document rendering
5. **PDF Export** — Async function generating downloadable PDF via pdf().toBlob()
6. **Store Extension** — selectedTemplate field persisted in localStorage
7. **Font Files** — Inter Regular and Bold (v4.1 static TTF files)

## Deviations from Plan

None - plan executed exactly as written.

## Test Results

- 14 new tests (9 template + 5 PDF export)
- 98 total tests passing
- Zero regressions

## Next

Ready for Plan 03-02 (Modern + Minimal templates, switcher, layout) and Plan 03-03 (DOCX + JSON export).
