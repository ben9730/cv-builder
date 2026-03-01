# Phase 3: Templates, Preview and Export - Research

**Researched:** 2026-03-01
**Domain:** React PDF rendering, DOCX generation, template architecture
**Confidence:** HIGH

## Summary

Phase 3 delivers three ATS-safe resume templates, a live preview panel, and multi-format export (PDF, DOCX, JSON). The core technical challenge is achieving WYSIWYG fidelity between the browser preview and the exported PDF. The recommended approach uses `@react-pdf/renderer` (v4.x, React 19 compatible) for both preview and PDF export, ensuring pixel-perfect match since the same rendering engine produces both outputs. DOCX export uses the `docx` library (v9.6.x) with client-side `Packer.toBlob()`. JSON export is trivial since resume data is already Zod-validated and serializable.

The key architectural insight: templates must be built as `@react-pdf/renderer` components (using `Document`, `Page`, `View`, `Text` primitives) — NOT as regular React/HTML components. This ensures the preview IS the PDF. The browser preview uses `@react-pdf/renderer`'s `PDFViewer` component or the `usePDF` hook to render the same document component inline. This eliminates the dual-rendering fidelity problem entirely.

**Primary recommendation:** Build all three templates as `@react-pdf/renderer` Document components. Use `PDFViewer` for the live preview panel. Use `pdf().toBlob()` or `PDFDownloadLink` for export. This single-source-of-truth approach guarantees PREV-02 (preview matches PDF).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Classic:** Clean professional style. Sans-serif font (e.g., Inter or Calibri family), subtle gray accents, generous whitespace. Modern but conservative.
- **Modern:** Bold header with accent color bar/background block + two-column layout. Skills/contact in narrow sidebar column, experience/education in main column.
- **Minimal:** Elegant understated style. Thin hairline separators, small caps for section headers, tight typography.
- **Colors:** Fixed accent color per template, baked into the design. No user color picker.
- **Desktop:** Side-by-side split. Three-panel layout: sidebar | editor | preview. All visible simultaneously.
- **Mobile:** Bottom tab toggle between "Edit" and "Preview" tabs. Full-screen editor or full-screen preview.
- **Preview rendering:** Paper page simulation — white A4/Letter page with shadow, centered in preview panel. Page count indicator.
- **Export access:** Dropdown button in the top header bar with PDF, DOCX, JSON options.
- **Export feedback:** Toast notifications (Sonner already installed).
- **JSON backup scope:** Includes resume data + settings (template choice, preferences).
- **Template switcher placement:** Above the preview panel. Thumbnail previews.
- **Template switcher behavior:** Instant switch, no confirmation dialog.
- **Mobile template switcher:** Thumbnails above preview in Preview tab.

### Claude's Discretion
- PDF export approach (client-side @react-pdf/renderer vs server-side) — optimize for preview-PDF fidelity (PREV-02)
- Exact font choices within the style directions above
- Spacing, margins, and typography scale for each template
- Loading states and skeleton designs for preview panel
- Error handling for export failures
- Exact thumbnail generation approach for template switcher

### Deferred Ideas (OUT OF SCOPE)
- Color/font customization (EDENH-03) — deferred to v2
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TMPL-01 | 3 professional, ATS-safe resume templates with distinct visual styles | @react-pdf/renderer components with registered fonts, three distinct StyleSheet configurations |
| TMPL-02 | Templates render resume data without internal state (pure renderers) | Templates are pure functions: (resume: ResumeData) => Document component. No hooks, no state |
| TMPL-03 | User can switch between templates without losing entered data | Templates read from Zustand store; switching only changes which template component renders |
| PREV-01 | Live preview updates in real-time as user edits form fields | PDFViewer or usePDF hook re-renders when Zustand store changes; React reactivity handles this |
| PREV-02 | Preview accurately represents the final exported PDF layout | Same @react-pdf/renderer Document component used for both preview and export — identical output |
| EXPT-01 | User can export resume as PDF with selectable text (ATS-friendly) | @react-pdf/renderer produces native PDF text elements, not images. Text is selectable by default |
| EXPT-02 | User can export resume as DOCX file matching resume structure | docx library Packer.toBlob() generates structured DOCX with paragraphs, headings, tables |
| PERS-02 | User can export resume data as JSON file | JSON.stringify of Zustand store state + template preference, trigger download via Blob URL |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-pdf/renderer | ^4.3.2 | PDF document creation + browser preview | React 19 compatible (since v4.1.0), 860K weekly downloads, creates PDFs with React components |
| docx | ^9.6.0 | DOCX file generation | 445K weekly downloads, declarative API, works in browser with Packer.toBlob() |
| file-saver | ^2.0.5 | Client-side file download trigger | Standard companion to docx for browser downloads, 2.5M weekly downloads |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-pdf | ^9.x | PDF page rendering in viewer (optional) | Only if PDFViewer iframe approach causes issues; alternative is usePDF + canvas |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @react-pdf/renderer | Puppeteer server-side | Better CSS fidelity but requires server, not viable on serverless (already ruled out in STATE.md) |
| @react-pdf/renderer | jsPDF + html2canvas | Image-based PDF — fails ATS requirement (EXPT-01 needs selectable text) |
| docx | html-to-docx | Converts HTML to DOCX but less control over structure; docx gives declarative control |
| file-saver | Manual Blob + anchor tag | file-saver handles edge cases (Safari, iOS) that manual approach misses |

**Installation:**
```bash
npm install @react-pdf/renderer docx file-saver
npm install -D @types/file-saver
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── templates/
│   │   ├── template-registry.ts      # Maps template IDs to components + metadata
│   │   ├── classic-template.tsx       # @react-pdf/renderer Document component
│   │   ├── modern-template.tsx        # @react-pdf/renderer Document component
│   │   ├── minimal-template.tsx       # @react-pdf/renderer Document component
│   │   └── shared/                    # Shared PDF primitives (SectionTitle, DateRange, etc.)
│   ├── preview/
│   │   ├── preview-panel.tsx          # PDFViewer wrapper with loading state
│   │   ├── template-switcher.tsx      # Thumbnail grid above preview
│   │   └── page-indicator.tsx         # "Page 1 of 2" display
│   ├── export/
│   │   ├── export-menu.tsx            # Dropdown with PDF/DOCX/JSON options
│   │   ├── pdf-export.ts             # pdf().toBlob() wrapper
│   │   ├── docx-export.ts            # docx Packer.toBlob() wrapper
│   │   └── json-export.ts            # JSON serialization + download
│   └── editor/
│       └── editor-layout.tsx          # Modified: sidebar | editor | preview three-panel
├── lib/
│   └── store/
│       └── resume-store.ts            # Extended: add selectedTemplate field
└── hooks/
    └── use-pdf-document.ts            # Memoized PDF document from store data
```

### Pattern 1: Template Registry
**What:** Central registry mapping template IDs to their renderer components, metadata, and thumbnail info
**When to use:** Template selection, switcher UI, rendering
**Example:**
```typescript
// template-registry.ts
import { ClassicTemplate } from './classic-template'
import { ModernTemplate } from './modern-template'
import { MinimalTemplate } from './minimal-template'
import type { ResumeData } from '@/types/resume'

export type TemplateId = 'classic' | 'modern' | 'minimal'

export interface TemplateDefinition {
  id: TemplateId
  name: string
  description: string
  component: React.FC<{ resume: ResumeData }>
  accentColor: string
}

export const TEMPLATES: Record<TemplateId, TemplateDefinition> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Clean professional style',
    component: ClassicTemplate,
    accentColor: '#4A5568',
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Bold header with two-column layout',
    component: ModernTemplate,
    accentColor: '#2B6CB0',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Elegant understated typography',
    component: MinimalTemplate,
    accentColor: '#1A202C',
  },
}
```

### Pattern 2: Pure Template Component
**What:** Template as pure function of ResumeData — no state, no hooks, no side effects
**When to use:** All three templates follow this pattern
**Example:**
```typescript
// classic-template.tsx
import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer'
import type { ResumeData } from '@/types/resume'

Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Inter', fontSize: 10, color: '#1A202C' },
  name: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  // ... more styles
})

export function ClassicTemplate({ resume }: { resume: ResumeData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{resume.basics.name}</Text>
          {/* ... render all sections */}
        </View>
      </Page>
    </Document>
  )
}
```

### Pattern 3: Dynamic Import for PDF Components
**What:** Next.js dynamic import with `ssr: false` for all @react-pdf/renderer usage
**When to use:** Any component that imports from @react-pdf/renderer
**Example:**
```typescript
import dynamic from 'next/dynamic'

const PreviewPanel = dynamic(() => import('./preview-panel'), {
  ssr: false,
  loading: () => <PreviewSkeleton />,
})
```

### Pattern 4: DOCX Template Mapping
**What:** Map ResumeData to docx library's declarative API
**When to use:** DOCX export
**Example:**
```typescript
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'

export async function exportDocx(resume: ResumeData) {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ children: [new TextRun({ text: resume.basics.name, bold: true, size: 28 })] }),
        // ... map all resume sections to docx paragraphs
      ]
    }]
  })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${resume.basics.name || 'resume'}.docx`)
}
```

### Anti-Patterns to Avoid
- **Dual rendering engines:** Don't build HTML templates AND PDF templates separately — they will drift. Use @react-pdf/renderer for both preview and export.
- **Template state:** Don't store rendering state inside templates. Templates receive ResumeData as props, nothing else.
- **Server-side PDF generation:** Don't use Puppeteer or server-rendered PDFs — already ruled out for serverless deployment.
- **Image-based PDF:** Don't use html2canvas + jsPDF — produces image-based PDFs that fail ATS parsing (EXPT-01).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF generation | Custom PDF byte manipulation | @react-pdf/renderer | PDF spec is enormous; rendering engines handle font embedding, text layout, page breaks |
| DOCX generation | Custom XML manipulation | docx library | OOXML format has hundreds of edge cases; docx handles them |
| File downloads | Manual Blob + anchor tricks | file-saver | Cross-browser download (Safari, iOS, Edge) has many edge cases |
| Font registration | Manual @font-face in PDF | Font.register() from @react-pdf/renderer | PDF font embedding requires specific format handling |

**Key insight:** PDF and DOCX are complex binary/XML formats with extensive specs. Even "simple" documents require proper font embedding, encoding, and structure. Libraries exist because the edge cases are enormous.

## Common Pitfalls

### Pitfall 1: @react-pdf/renderer Style Subset
**What goes wrong:** Developers write CSS-like styles and expect full browser CSS support. @react-pdf/renderer supports a SUBSET of CSS — flexbox-based layout only. No CSS Grid, no `position: absolute` (limited), no `float`, no `overflow: hidden` (limited).
**Why it happens:** The style API looks like CSS but is actually a yoga-layout (flexbox) engine.
**How to avoid:** Use only flexbox for layout. Think in terms of `flexDirection`, `flexGrow`, `flexShrink`, `alignItems`, `justifyContent`. Test every template against the actual PDF output early.
**Warning signs:** Styles that work in browser but produce broken PDF layout.

### Pitfall 2: Font Registration Timing
**What goes wrong:** Fonts fail to load or render as fallback in PDF. Font.register() must be called before any Document render.
**Why it happens:** Font registration is global and must happen at module load time, not inside components.
**How to avoid:** Call Font.register() at the top level of template files, outside any component function. Use .ttf files (most compatible). Store fonts in `public/fonts/`.
**Warning signs:** PDF shows wrong font, squares instead of characters, or default serif font.

### Pitfall 3: Next.js SSR Crash with @react-pdf/renderer
**What goes wrong:** Server-side rendering crashes because @react-pdf/renderer depends on browser APIs.
**Why it happens:** @react-pdf/renderer uses canvas and other browser-only APIs.
**How to avoid:** Always use `dynamic(() => import(...), { ssr: false })` for any component that imports from @react-pdf/renderer. This is mandatory in Next.js App Router.
**Warning signs:** "window is not defined" or "document is not defined" errors during build.

### Pitfall 4: Re-render Performance with PDFViewer
**What goes wrong:** PDFViewer re-renders on every keystroke, causing lag in the preview panel.
**Why it happens:** Zustand store updates trigger React re-renders, which trigger full PDF re-generation.
**How to avoid:** Debounce the preview update (300-500ms delay after last keystroke). Use `useMemo` or `useCallback` to memoize the Document component. Consider using `usePDF` hook for more control over render timing.
**Warning signs:** Typing in forms causes visible lag or preview flicker.

### Pitfall 5: Page Break Handling
**What goes wrong:** Content overflows the page without proper breaks, or breaks in awkward places (splitting a section header from its content).
**Why it happens:** PDF pages have fixed dimensions unlike scrolling web pages.
**How to avoid:** Use `break` and `wrap` props on View components. Test with realistic data that fills 2+ pages. Add `minPresenceAhead` to keep headers with their content.
**Warning signs:** Text cut off at bottom of page, orphaned section headers.

### Pitfall 6: DOCX Formatting Mismatch
**What goes wrong:** DOCX export looks nothing like the PDF template.
**Why it happens:** DOCX and PDF are fundamentally different formats. DOCX is flow-based (like HTML), PDF is position-based.
**How to avoid:** DOCX export should focus on structure and readability, not pixel-perfect template matching. Use proper heading levels, paragraph spacing, and bullet lists. Don't try to replicate the exact visual layout of the Modern two-column template in DOCX.
**Warning signs:** Trying to create two-column layouts in DOCX (complex and fragile).

## Code Examples

### PDF Preview with Dynamic Import
```typescript
// preview-panel.tsx (loaded with ssr: false)
'use client'

import { PDFViewer } from '@react-pdf/renderer'
import { useResumeStore } from '@/lib/store/resume-store'
import { TEMPLATES } from '@/components/templates/template-registry'

export default function PreviewPanel() {
  const resume = useResumeStore((s) => s.resume)
  const templateId = useResumeStore((s) => s.selectedTemplate)
  const template = TEMPLATES[templateId]
  const TemplateComponent = template.component

  return (
    <PDFViewer width="100%" height="100%" showToolbar={false}>
      <TemplateComponent resume={resume} />
    </PDFViewer>
  )
}
```

### PDF Export
```typescript
// pdf-export.ts
import { pdf } from '@react-pdf/renderer'
import { TEMPLATES } from '@/components/templates/template-registry'
import { saveAs } from 'file-saver'
import type { ResumeData } from '@/types/resume'
import type { TemplateId } from '@/components/templates/template-registry'

export async function exportPdf(resume: ResumeData, templateId: TemplateId) {
  const TemplateComponent = TEMPLATES[templateId].component
  const blob = await pdf(<TemplateComponent resume={resume} />).toBlob()
  saveAs(blob, `${resume.basics.name || 'resume'}.pdf`)
}
```

### JSON Export
```typescript
// json-export.ts
import { saveAs } from 'file-saver'
import type { ResumeData } from '@/types/resume'

export function exportJson(resume: ResumeData, selectedTemplate: string) {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    template: selectedTemplate,
    resume,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  saveAs(blob, `${resume.basics.name || 'resume'}-backup.json`)
}
```

### Store Extension for Template Selection
```typescript
// Addition to resume-store.ts
import type { TemplateId } from '@/components/templates/template-registry'

// Add to interface:
selectedTemplate: TemplateId
setSelectedTemplate: (id: TemplateId) => void

// Add to create:
selectedTemplate: 'classic',
setSelectedTemplate: (id) => set({ selectedTemplate: id }),
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| html2canvas + jsPDF | @react-pdf/renderer | 2020+ | Native text PDFs vs image-based PDFs |
| Server-side Puppeteer PDF | Client-side @react-pdf/renderer | 2022+ | No server dependency, works on serverless/edge |
| PDFKit (Node only) | @react-pdf/renderer (browser + Node) | 2019+ | Browser-native PDF generation with React |
| officegen (DOCX) | docx library | 2020+ | Declarative API, TypeScript support, active maintenance |

**Deprecated/outdated:**
- `pdfmake`: Still maintained but not React-native; requires custom JSON syntax instead of JSX
- `officegen`: Largely unmaintained; docx library is the standard replacement

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 + jsdom + @testing-library/react |
| Config file | vitest.config.mts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TMPL-01 | 3 templates render without errors | unit | `npx vitest run src/__tests__/templates.test.tsx -t "renders"` | Wave 0 |
| TMPL-02 | Templates are pure renderers (no state) | unit | `npx vitest run src/__tests__/templates.test.tsx -t "pure"` | Wave 0 |
| TMPL-03 | Switching templates preserves data | unit | `npx vitest run src/__tests__/template-switcher.test.tsx` | Wave 0 |
| PREV-01 | Preview updates when store changes | integration | `npx vitest run src/__tests__/preview-panel.test.tsx` | Wave 0 |
| PREV-02 | Preview uses same component as PDF export | unit | `npx vitest run src/__tests__/pdf-export.test.ts -t "same component"` | Wave 0 |
| EXPT-01 | PDF export produces valid blob | unit | `npx vitest run src/__tests__/pdf-export.test.ts` | Wave 0 |
| EXPT-02 | DOCX export produces valid blob | unit | `npx vitest run src/__tests__/docx-export.test.ts` | Wave 0 |
| PERS-02 | JSON export includes resume + template | unit | `npx vitest run src/__tests__/json-export.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before verification

### Wave 0 Gaps
- [ ] `src/__tests__/templates.test.tsx` — covers TMPL-01, TMPL-02
- [ ] `src/__tests__/template-switcher.test.tsx` — covers TMPL-03
- [ ] `src/__tests__/preview-panel.test.tsx` — covers PREV-01
- [ ] `src/__tests__/pdf-export.test.ts` — covers PREV-02, EXPT-01
- [ ] `src/__tests__/docx-export.test.ts` — covers EXPT-02
- [ ] `src/__tests__/json-export.test.ts` — covers PERS-02
- [ ] Font files in `public/fonts/` (Inter Regular + Bold .ttf)

**Note:** @react-pdf/renderer components cannot render in jsdom. Template tests should verify component structure and props, not visual output. PDF/DOCX blob generation tests should mock the rendering pipeline or test in a limited capacity. Visual fidelity is verified manually.

## Open Questions

1. **PDFViewer iframe vs usePDF + canvas**
   - What we know: PDFViewer renders in an iframe (simple but limited styling control). usePDF hook returns blob URL that can be displayed via react-pdf's Document/Page components for more control.
   - What's unclear: Which approach provides better UX for the live preview panel. PDFViewer is simpler but the iframe may not integrate well with the three-panel layout.
   - Recommendation: Start with PDFViewer for simplicity. If iframe causes layout/scrolling issues, switch to usePDF + BlobProvider approach.

2. **Font licensing for Inter**
   - What we know: Inter is an open-source font (SIL Open Font License). It must be bundled as .ttf files for @react-pdf/renderer.
   - What's unclear: Exact file size impact on initial page load.
   - Recommendation: Store in public/fonts/, load lazily with the preview panel (since preview is dynamically imported anyway).

## Sources

### Primary (HIGH confidence)
- @react-pdf/renderer npm page — React 19 compatibility confirmed since v4.1.0, latest v4.3.2
- react-pdf.org/styling — Flexbox-based CSS subset documentation
- react-pdf.org/advanced — usePDF hook, PDFViewer component documentation
- docx.js.org — Packer API, browser usage with toBlob()
- react-pdf.org/compatibility — Next.js compatibility notes

### Secondary (MEDIUM confidence)
- GitHub Issues #2756, #2912 — React 19 support timeline and resolution
- GitHub Discussion #2475 — Live preview patterns with usePDF + react-pdf viewer
- LogRocket blog — Comprehensive react-pdf tutorial patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - @react-pdf/renderer v4.x confirmed React 19 compatible, actively maintained
- Architecture: HIGH - PDFViewer + pure template pattern is well-documented and widely used
- Pitfalls: HIGH - SSR crash, font registration, style subset are well-known issues with documented solutions

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable libraries, unlikely to change significantly)
