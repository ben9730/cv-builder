# Phase 3: Templates, Preview and Export - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Render resume data as styled templates with live preview and multi-format export. Delivers: 3 ATS-safe templates (Classic, Modern, Minimal), real-time split-panel preview, PDF export with selectable text, DOCX export, and JSON backup. Templates are pure renderers — no internal state, no data loss on switch. Color/font customization is deferred to v2 (EDENH-03).

</domain>

<decisions>
## Implementation Decisions

### Template visual styles
- **Classic:** Clean professional style. Sans-serif font (e.g., Inter or Calibri family), subtle gray accents, generous whitespace. Modern but conservative — works across all industries.
- **Modern:** Bold header with accent color bar/background block + two-column layout. Skills/contact in narrow sidebar column, experience/education in main column. Maximum visual differentiation from Classic.
- **Minimal:** Elegant understated style. Thin hairline separators, small caps for section headers, tight typography. Sophisticated restraint — not empty, not cluttered.
- **Colors:** Fixed accent color per template, baked into the design. No user color picker in this phase — customization deferred to v2 (EDENH-03).

### Preview layout
- **Desktop:** Side-by-side split. Three-panel layout: sidebar | editor | preview. All visible simultaneously. Sidebar stays visible for section navigation.
- **Mobile:** Bottom tab toggle between "Edit" and "Preview" tabs. Full-screen editor or full-screen preview, one at a time.
- **Preview rendering:** Paper page simulation — white A4/Letter page with shadow, centered in the preview panel. Shows exact page boundaries and margins (WYSIWYG fidelity for PREV-02). Includes a page count indicator (e.g., "1 of 2") so users know if their resume fits on one page.

### Export experience
- **Access:** Dropdown button in the top header bar. Opens dropdown with PDF, DOCX, and JSON options. Minimal UI footprint, quick access.
- **Feedback:** Toast notifications for export progress. "Generating PDF..." then "Download ready!" Non-blocking — user can keep editing. (Sonner toast library already installed.)
- **JSON backup scope:** Includes resume data + settings (template choice, preferences). Full state backup, not just content.

### Template switcher
- **Placement:** Above the preview panel. Contextually close to where templates render.
- **Presentation:** Thumbnail previews of each template showing the actual layout style. Users see what they'll get before clicking.
- **Behavior:** Instant switch on click — no confirmation dialog needed (templates are pure renderers, no data loss risk per TMPL-03).
- **Mobile:** Template thumbnails appear above the preview when in the Preview tab. Consistent with desktop placement.

### Claude's Discretion
- PDF export approach (client-side @react-pdf/renderer vs server-side rendering) — optimize for preview-PDF fidelity (PREV-02)
- Exact font choices within the style directions above
- Spacing, margins, and typography scale for each template
- Loading states and skeleton designs for preview panel
- Error handling for export failures
- Exact thumbnail generation approach for template switcher

</decisions>

<specifics>
## Specific Ideas

- Classic should feel like a polished LinkedIn-ready resume — professional without being stuffy
- Modern two-column layout should put contact info and skills in the sidebar, experience and education in the main column
- Minimal's small caps section headers and hairline separators should create visual hierarchy through typography alone, not color or weight
- Page count indicator helps users keep their resume to one page — this is a core usability feature, not a nice-to-have
- Toast notifications match the existing Sonner pattern already used in the editor

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Card component** (src/components/ui/card.tsx): Rounded-xl, shadow-sm, border — could wrap preview panel
- **Button component** (src/components/ui/button.tsx): Used for template switcher thumbnails and export dropdown
- **Sonner toasts** (src/components/ui/sonner.tsx): Already installed for export progress notifications
- **Badge component** (src/components/ui/badge.tsx): Could indicate active template or page count
- **Separator component** (src/components/ui/separator.tsx): Panel dividers
- **Lucide React icons**: Export/download icons for the export dropdown

### Established Patterns
- **Zustand store with persist** (src/lib/store/resume-store.ts): Template selection state should extend this store (same localStorage persistence pattern)
- **react-hook-form + Zod validation**: Editor forms pattern — not directly used by templates but establishes the form architecture
- **shadcn/ui components**: All UI built on shadcn primitives with Tailwind + cn() utility
- **Tailwind CSS 4** with class-variance-authority for component variants
- **next-themes**: Dark mode support already available — templates may need to handle light-only rendering for PDF fidelity
- **Section-based navigation** (useSectionNav hook): Preview panel integrates alongside this pattern

### Integration Points
- **EditorLayout** (src/components/editor/editor-layout.tsx): Must be modified to add preview panel. Currently renders sidebar + full-width forms — needs to become sidebar + editor + preview three-panel layout
- **useResumeStore**: Templates read resume data from this store. Template selection state needs to be added here or in a new store
- **page.tsx**: Currently renders EditorLayout directly — may need layout changes for header export button
- **No API routes exist yet**: DOCX export will need a /api/export/docx route (or client-side generation)
- **ResumeData schema** (src/lib/schema/resume-schema.ts): Templates consume this type — all section types (including optional) must be rendered

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-templates-preview-and-export*
*Context gathered: 2026-03-01*
