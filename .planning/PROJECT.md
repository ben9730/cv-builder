# CV Builder

## What This Is

A web-based resume/CV builder and editor that lets users create professional resumes from scratch or import existing ones from PDF and text files. The app parses uploaded documents into structured, editable sections and offers multiple professional templates with export to PDF, DOCX, and plain text.

## Core Value

Users can quickly produce a polished, professional resume — whether starting fresh or importing an existing document — and export it in the format they need.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Import PDF and text files, parse into structured resume sections
- [ ] Form-based editor with fields for each resume section (contact, summary, experience, education, skills, etc.)
- [ ] 3-5 professional resume templates to choose from
- [ ] Live preview showing how the resume looks with the selected template
- [ ] Export to PDF, DOCX, and plain text formats
- [ ] Optional user accounts for saving and syncing resumes
- [ ] Works without login using browser localStorage
- [ ] Responsive web interface

### Out of Scope

- AI/LLM-powered content suggestions — complexity, defer to v2
- Drag-and-drop visual editor — form-based approach chosen instead
- Mobile native app — web-first, responsive design covers mobile
- Real-time collaboration — single-user tool for v1
- Cover letter builder — focus on resume only for v1
- Job board integration — not core to resume building

## Context

- Next.js fullstack application
- PDF parsing needed for import (library TBD via research)
- PDF/DOCX generation needed for export (library TBD via research)
- No accounts required to use core features — localStorage for anonymous users
- Accounts add save/sync capability across devices

## Constraints

- **Tech stack**: Next.js fullstack (React frontend + API routes)
- **Templates**: 3-5 curated templates for v1, expandable later
- **Auth**: Optional — core features must work without login

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js fullstack | Single framework for frontend + API, good DX, built-in SSR | — Pending |
| Form-based editor over WYSIWYG | Simpler to build, more reliable parsing, structured data | — Pending |
| Optional auth over required | Lower friction, users can try before committing | — Pending |
| Parse into sections (not raw text) | Better UX, structured data enables templates | — Pending |

---
*Last updated: 2026-03-01 after initialization*
