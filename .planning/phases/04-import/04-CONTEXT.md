# Phase 4: Import - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Users who already have a resume can upload a PDF or plain text file, review the parsed results, and commit them to the editor. Covers PDF parsing, plain text parsing, scanned-PDF detection, mandatory section review, and data replacement. AI-powered parsing, OCR, and merge logic are out of scope.

</domain>

<decisions>
## Implementation Decisions

### Upload entry point
- Import button in the header bar, next to the existing Export menu
- Clicking opens a modal dialog with a drag-and-drop dropzone + file picker button
- Single dropzone accepts .pdf, .txt, and .json files — auto-detect type and route to correct handler
- 5 MB file size limit shown in the dropzone ("Max 5 MB")

### Review experience
- All-at-once review page: all parsed sections shown on a single scrollable view
- Review page appears inside the import modal (modal expands/transitions after parsing completes)
- Each section has a checkbox — user can deselect sections they don't want imported
- Inline editing enabled — user can click into any field and correct it directly in the review page

### Parse feedback
- Uncertain fields highlighted with yellow/amber border/background — user knows where to double-check
- Scanned PDFs detected (check for extractable text); if no text found, show friendly error: "This PDF appears to be a scanned image. Try a text-based PDF or paste your resume as plain text."
- Loading state: spinner in the modal with status text updates ("Extracting text..." → "Mapping sections..." → "Review ready")
- Plain text: both paste textarea and .txt file upload supported (tabs or toggle in the modal)

### Existing data handling
- If user has existing resume data, show warning: "You have existing resume data. Importing will replace it." with Continue/Cancel
- Warning dialog includes a "Download backup first" link to export current data as JSON before replacing
- After import accepted: close modal, load data into editor, show success toast
- JSON backup files (.json from Export feature) accepted in the import modal — validate against Zod schema and load directly, skip parsing

### Claude's Discretion
- Exact modal sizing and transition animations
- Dropzone visual design (icon, border style, hover states)
- Review page section ordering and layout
- Field highlight color intensity
- Loading spinner implementation
- How the paste textarea tab/toggle is styled

</decisions>

<specifics>
## Specific Ideas

- Import button placement mirrors Export menu — left-right symmetry in the header
- JSON import is the natural companion to the existing JSON export feature — same modal, no separate flow
- Scanned PDF detection should fail gracefully with a helpful message, not a generic error

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ExportMenu` (src/components/export/export-menu.tsx): Pattern for header button with dropdown — Import button can follow similar placement
- `Button`, `Card`, `Input`, `Label` (src/components/ui/): shadcn/ui components for building the modal and review forms
- `toast` from sonner: For success/error notifications during import flow
- `exportJson` (src/components/export/json-export.ts): Can be reused for the "Download backup first" link in the data conflict warning
- `ResumeDataSchema` (src/lib/schema/resume-schema.ts): Zod schema for validating JSON imports and structuring parsed data

### Established Patterns
- Lazy imports for heavy dependencies (see `export-menu.tsx` line 35: dynamic import of pdf-export)
- Toast-based loading/success/error feedback for async operations (PDF/DOCX export pattern)
- Zustand store `setResume()` replaces entire resume data — direct path for import commit
- `cn()` utility for conditional Tailwind classes

### Integration Points
- Header bar in `EditorLayout` (src/components/editor/editor-layout.tsx:68-71): Import button goes next to `<ExportMenu />`
- `useResumeStore.setResume()`: Commits imported data to the store
- `/api/parse` route (new): Server-side PDF text extraction with pdfjs-dist
- Section mapper: Client-side heuristics to map extracted text into `ResumeData` structure

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-import*
*Context gathered: 2026-03-01*
