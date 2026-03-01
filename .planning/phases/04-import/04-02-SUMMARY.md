---
phase: 04-import
plan: 02
status: complete
commits:
  - 38ad2bb: "feat(04-02): add import UI with dropzone, review panel, and modal"
tests_passed: 25
tests_added: 25
regressions: 0
---

# Plan 04-02 Summary: Import UI Components

## What Was Built

### Task 1: UI Components
- **`src/components/import/dropzone.tsx`** — Native HTML5 drag-and-drop with file input fallback. Accepts `.pdf,.txt,.json`. Client-side 5MB validation with toast error. Visual states for default, dragging, and disabled. Keyboard accessible.
- **`src/components/import/text-paste.tsx`** — Textarea for pasting resume text with "Import Text" button. Disabled when empty. Uses project's Textarea component.
- **`src/components/import/review-panel.tsx`** — Displays `MappedSection[]` as cards with checkboxes (all checked by default), confidence badges (green/default/amber), inline-editable content via textarea, selected count display, Accept/Cancel buttons.

### Task 2: Modal + Editor Integration
- **`src/components/import/import-modal.tsx`** — Radix Dialog modal with state machine: idle -> uploading -> parsing -> review -> confirm-replace. Tab toggle (Upload File / Paste Text). File type routing: PDF -> /api/parse, TXT -> FileReader + section mapper, JSON -> Zod validation + direct load. Loading states with status text. Scanned PDF error handling with paste tab redirect. Existing data warning with backup download link.
- **`src/components/import/import-button.tsx`** — Outline button with Upload icon matching ExportMenu style.
- **`src/components/editor/editor-layout.tsx`** — Updated to include `<ImportButton />` before `<ExportMenu />` in both desktop and mobile headers.

### Task 3: Human-verify checkpoint
- Auto-approved per config (auto_advance: true, branching_strategy: none)

## Test Coverage
- 25 new tests in `import-modal.test.tsx`:
  - Dropzone: 6 tests (render, disabled, keyboard, file input, 5MB rejection)
  - TextPaste: 5 tests (render, disabled, enable on input, submit, disabled prop)
  - ReviewPanel: 8 tests (render sections, count, badges, amber styling, deselect, inline edit, cancel, accept disabled)
  - ImportButton: 6 tests (render, open modal, dropzone, tabs, tab switch, close)

## Requirements Covered
- **IMPT-01**: PDF upload via dropzone -> /api/parse -> review panel
- **IMPT-02**: Text file upload and text paste -> section mapper -> review panel
- **IMPT-03**: Review panel with checkboxes, confidence highlighting, inline editing, existing data warning

## Full Suite
- 191 tests across 21 files, all passing, 0 regressions
