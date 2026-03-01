---
status: diagnosed
phase: 01-to-04-full
source: 01-01-SUMMARY.md, 01-02-SUMMARY.md, 02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 04-01-SUMMARY.md, 04-02-SUMMARY.md
started: 2026-03-01T18:00:00Z
updated: 2026-03-01T18:50:00Z
---

## Current Test

[testing complete]

## Tests

### 1. App Loads with Editor Layout
expected: App shows header with "CV Builder" title, sidebar with section names and completion hints, Contact form in editor, and PDF preview panel on desktop
result: pass

### 2. Contact Form Auto-Save
expected: Fill in name, email, phone, URL, and location fields in the Contact form. Data should auto-save as you type (no save button). Refreshing the page should preserve all entered data.
result: pass

### 3. Summary Form
expected: Click "Summary" in sidebar. A text area appears for entering a professional summary. Typing text auto-saves to store.
result: pass

### 4. Add Work Experience
expected: Click "Experience" in sidebar. Click "Add" button. An expandable card appears with fields: company, position, start date, end date, and bullet points. Fill in details, add bullet points with add/remove buttons. Only one entry expanded at a time (accordion-style).
result: pass

### 5. Add Education Entry
expected: Click "Education" in sidebar. Click "Add". Card with fields: institution, area/degree, start date, end date. Fill in and auto-saves.
result: pass

### 6. Skills with Tag Input
expected: Click "Skills" in sidebar. Click "Add" to create a skill group. Enter a skill group name and add keywords using the tag input (type and press Enter). Tags appear as removable chips/badges.
result: pass

### 7. Add Optional Section via Sidebar
expected: Sidebar shows an "Add Section" button. Clicking it reveals dropdown with optional sections (Certifications, Projects, Languages, Volunteer). Selecting one adds it to the sidebar and navigates to its form.
result: pass

### 8. Sidebar Completion Hints
expected: Sections with data entered show a green checkmark or completion indicator in the sidebar. Empty sections show no indicator.
result: pass

### 9. Live PDF Preview
expected: On desktop (lg+ screen), the right panel shows a live PDF preview of the resume using the current template. As you edit fields, the preview updates to reflect changes.
result: pass

### 10. Template Switcher
expected: Below the PDF preview, template switcher buttons appear for Classic, Modern, and Minimal. Each shows an accent color indicator. Clicking a different template instantly re-renders the preview in the new layout/style.
result: pass

### 11. Export PDF
expected: Click the export menu in the header bar. Select "PDF". A PDF file downloads with your resume data rendered in the selected template. Text in the PDF should be selectable (not image).
result: issue
reported: "pass but the headline in the pdf itself overlay with title"
severity: cosmetic

### 12. Export DOCX
expected: Click export menu, select "DOCX". A Word document downloads with structured content (headings, bullet points). Toast notification shows loading/success.
result: pass

### 13. Export JSON Backup
expected: Click export menu, select "JSON". A .json file downloads containing your resume data, template preference, version number, and export timestamp.
result: pass

### 14. Import Button and Modal
expected: An "Import" button with upload icon appears in the header bar (before the export menu). Clicking it opens a modal dialog with tabs: "Upload File" and "Paste Text". A dropzone area is visible for file drag-and-drop.
result: pass

### 15. Text Paste Import
expected: In import modal, switch to "Paste Text" tab. Paste resume text into the textarea. Click "Import Text". Sections are parsed and displayed in a review panel with section cards, confidence badges (green/amber), and checkboxes.
result: issue
reported: "pass but didnt give me option to see all the info i past"
severity: major

### 16. Review and Accept Import
expected: In the review panel, all sections are checked by default. You can uncheck sections to exclude them. Section content is editable inline via textarea. A selected count is shown. Clicking "Accept" loads the data into the editor. If existing data present, a warning appears with backup download link.
result: pass

### 17. Data Persistence Across Reload
expected: After entering data in multiple sections, close the browser tab and reopen http://localhost:3000. All previously entered data should be preserved (loaded from localStorage). Template selection should also persist.
result: pass

### 18. PDF Upload Import (added post-testing)
expected: Upload a PDF file via the import dropzone. Text should be extracted and sections displayed in the review panel.
result: issue
reported: "big problem with upload pdf - shows Failed to parse PDF error"
severity: blocker

## Summary

total: 18
passed: 15
issues: 3
pending: 0
skipped: 0

## Gaps

- truth: "PDF header should display name and headline without overlapping text"
  status: fixed
  reason: "User reported: pass but the headline in the pdf itself overlay with title"
  severity: cosmetic
  test: 11
  root_cause: "Modern template name style has marginBottom: 4 too small for 24pt font, causing label to overlap"
  artifacts:
    - path: "src/components/templates/modern-template.tsx"
      issue: "marginBottom: 4 on name style too small"
  missing:
    - "Increase marginBottom to 8 for proper spacing"

- truth: "Review panel should display all parsed sections from pasted text so user can see/verify all imported content"
  status: fixed
  reason: "User reported: pass but didnt give me option to see all the info i past"
  severity: major
  test: 15
  root_cause: "Review panel textareas have min-h-[60px] too small to see pasted content"
  artifacts:
    - path: "src/components/import/review-panel.tsx"
      issue: "Textarea min-height 60px too small"
  missing:
    - "Increase textarea min-height to 120px"

- truth: "PDF upload should extract text and display in review panel"
  status: fixed
  reason: "User reported: big problem with upload pdf - shows Failed to parse PDF error"
  severity: blocker
  test: 18
  root_cause: "pdfjs-dist worker file not found when bundled by Turbopack. Next.js bundles into .next/dev/server/chunks/ but worker relative path breaks."
  artifacts:
    - path: "next.config.ts"
      issue: "pdfjs-dist not excluded from server bundling"
  missing:
    - "Add serverExternalPackages: ['pdfjs-dist'] to next.config.ts"
