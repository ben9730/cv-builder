# Roadmap: CV Builder

## Overview

Four phases deliver a complete resume builder: the data model is established first (everything downstream depends on it), then the form-based editor writes to it, then templates render from it with live preview and export, and finally PDF/text import rounds out the core loop. Every feature works without an account; optional auth is deferred to v2.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Data model, Zod schema, Zustand store, localStorage auto-save
- [ ] **Phase 2: Editor** - Form-based section editing for all resume content, responsive UI
- [ ] **Phase 3: Templates, Preview and Export** - 3 ATS-safe templates, live preview, PDF and DOCX export
- [ ] **Phase 4: Import** - PDF and plain text file import with mandatory section review

## Phase Details

### Phase 1: Foundation
**Goal**: The data model and persistence layer that every other feature builds on exists and is validated
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, PERS-01
**Success Criteria** (what must be TRUE):
  1. A TypeScript `ResumeData` schema exists with typed fields for contact, summary, experience, education, and skills sections, plus optional section types (certifications, projects, languages, volunteer)
  2. Resume data written to the Zustand store persists in localStorage across page refreshes without any user action
  3. The resume data structure can be serialized to JSON and deserialized back without data loss
  4. The store auto-saves anonymously — no login required for persistence to work
**Plans:** 2 plans

Plans:
- [ ] 01-01-PLAN.md — Scaffold Next.js 16 project with TypeScript, Tailwind CSS 4, Zustand, Zod, and Vitest
- [ ] 01-02-PLAN.md — ResumeData Zod 4 schema, Zustand store with localStorage persistence, unit tests

### Phase 2: Editor
**Goal**: Users can fill in every resume section using a clean form-based interface that works on desktop and mobile
**Depends on**: Phase 1
**Requirements**: EDIT-01, EDIT-02, EDIT-03, EDIT-04, EDIT-05, EDIT-06, EDIT-07, UI-01, UI-02
**Success Criteria** (what must be TRUE):
  1. User can fill in contact information (name, title, email, phone, location, website/LinkedIn) and see the values saved
  2. User can add, edit, and remove work experience entries including employer, title, date range, and bullet points
  3. User can add, edit, and remove education entries (degree, institution, year, GPA) and skill entries (tags or list)
  4. User can add optional sections — certifications, projects, languages, volunteer work — and add/remove entries within each
  5. The interface is usable on both desktop and mobile, with clear section navigation and an intuitive form layout
**Plans**: TBD

Plans:
- [ ] 02-01: Contact and summary section forms (react-hook-form + Zod, shadcn/ui components)
- [ ] 02-02: Experience, education, and skills forms with add/remove entry controls
- [ ] 02-03: Optional sections (certifications, projects, languages, volunteer), responsive layout, section navigation

### Phase 3: Templates, Preview and Export
**Goal**: Users can see a live preview of their resume and export it in the formats they need
**Depends on**: Phase 2
**Requirements**: TMPL-01, TMPL-02, TMPL-03, PREV-01, PREV-02, EXPT-01, EXPT-02, PERS-02
**Success Criteria** (what must be TRUE):
  1. Three distinct, ATS-safe resume templates are selectable and switch without losing any entered data
  2. The live preview updates in real time as the user edits any form field
  3. The preview accurately represents the final PDF — no layout differences between what the user sees and what downloads
  4. User can export the resume as a PDF with selectable (not image) text
  5. User can export the resume as a DOCX file and as a JSON backup of their data
**Plans**: TBD

Plans:
- [ ] 03-01: Template renderer architecture (pure React components, template registry), Classic template, PDF export via @react-pdf/renderer (validate fidelity before proceeding)
- [ ] 03-02: Modern and Minimal templates, template switcher UI, split-panel live preview
- [ ] 03-03: DOCX export (/api/export/docx, docx 9.6.x), JSON backup export, export menu component

### Phase 4: Import
**Goal**: Users who already have a resume can import it and edit it rather than starting from scratch
**Depends on**: Phase 3
**Requirements**: IMPT-01, IMPT-02, IMPT-03
**Success Criteria** (what must be TRUE):
  1. User can upload a PDF file and receive a best-effort parse of their resume content into structured sections
  2. User can upload a plain text file and have it mapped into the resume section structure
  3. After upload, user reviews and corrects parsed sections before they are committed to the editor — no "import complete" state that bypasses review
**Plans**: TBD

Plans:
- [ ] 04-01: Server-side PDF parser (pdfjs-dist in /api/parse route), MIME/magic-byte validation, file dropzone UI
- [ ] 04-02: Client-side section mapper (heuristics), mandatory review/correction UI, plain text import, scanned-PDF detection

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete | 2026-03-01 |
| 2. Editor | 3/3 | Complete | 2026-03-01 |
| 3. Templates, Preview and Export | 3/3 | Complete | 2026-03-01 |
| 4. Import | 0/2 | Not started | - |
