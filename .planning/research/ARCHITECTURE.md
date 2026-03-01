# Architecture Research

**Domain:** Resume/CV builder web application
**Researched:** 2026-03-01
**Confidence:** MEDIUM (WebSearch verified against multiple open-source projects; no single authoritative spec)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                            │
├───────────────────┬────────────────────┬────────────────────────────┤
│   Import Layer    │   Editor Layer     │   Preview/Export Layer     │
│  ┌─────────────┐  │  ┌──────────────┐  │  ┌──────────────────────┐  │
│  │ File Upload │  │  │ Section Forms│  │  │  Template Renderer   │  │
│  │ (PDF/TXT)   │  │  │ (Contact,    │  │  │  (React component    │  │
│  └──────┬──────┘  │  │  Experience, │  │  │   per template)      │  │
│         │         │  │  Education,  │  │  └──────────┬───────────┘  │
│  ┌──────▼──────┐  │  │  Skills...)  │  │             │              │
│  │ PDF Parser  │  │  └──────┬───────┘  │  ┌──────────▼───────────┐  │
│  │ (pdfjs-dist)│  │         │          │  │  Export Dispatcher   │  │
│  └──────┬──────┘  │         │          │  │  (PDF / DOCX / TXT)  │  │
│         │         │         │          │  └──────────────────────┘  │
│  ┌──────▼──────┐  │         │          │                            │
│  │ Section     │  │         │          │                            │
│  │ Mapper      │  │         │          │                            │
│  └──────┬──────┘  │         │          │                            │
│         │         │         │          │                            │
├─────────┴─────────┴─────────┴──────────┴────────────────────────────┤
│                     Resume Data Store (Zustand)                      │
│   { basics, summary, experience[], education[], skills[], ... }      │
├─────────────────────────────────────────────────────────────────────┤
│                      Persistence Layer                               │
│   ┌────────────────────┐        ┌──────────────────────────────┐    │
│   │ localStorage       │        │ Database (via API Routes)    │    │
│   │ (anonymous users)  │        │ (authenticated users)        │    │
│   └────────────────────┘        └──────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────┤
│                      Next.js API Routes (Server)                     │
│   /api/parse        /api/resumes        /api/export/docx            │
│   (PDF text         (CRUD for           (DOCX generation —          │
│    extraction)       saved resumes)      server-side only)           │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| File Upload | Accept PDF/TXT drag-drop or file picker input | PDF Parser |
| PDF Parser | Extract raw text from uploaded PDF using pdfjs-dist via API route | Section Mapper |
| Section Mapper | Heuristically assign raw text blocks to resume sections (experience, education, etc.) | Resume Data Store |
| Section Forms | Form UI for each resume section; validates and submits user edits | Resume Data Store |
| Resume Data Store | Single source of truth for all resume content; Zustand store | All components |
| Template Renderer | Pure React component that reads store state and renders a styled resume layout | Export Dispatcher, Preview pane |
| Export Dispatcher | Routes export requests to correct handler (PDF client-side, DOCX server, TXT inline) | Template Renderer, API Route |
| Persistence Layer | Auto-saves to localStorage (anonymous) or DB via API (authenticated) | Resume Data Store |
| API Routes | PDF text extraction, resume CRUD, DOCX generation | Parser, DB, Export |

## Recommended Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing / home page
│   ├── builder/
│   │   └── page.tsx              # Main editor page (split panel)
│   ├── import/
│   │   └── page.tsx              # PDF/TXT import flow
│   └── api/
│       ├── parse/route.ts        # PDF text extraction endpoint
│       ├── resumes/route.ts      # CRUD for saved resumes (auth users)
│       └── export/
│           └── docx/route.ts     # Server-side DOCX generation
│
├── components/
│   ├── editor/                   # Form-based editor components
│   │   ├── ResumeEditor.tsx      # Section switcher / tab container
│   │   ├── sections/
│   │   │   ├── BasicsForm.tsx
│   │   │   ├── ExperienceForm.tsx
│   │   │   ├── EducationForm.tsx
│   │   │   ├── SkillsForm.tsx
│   │   │   └── SummaryForm.tsx
│   │   └── shared/
│   │       ├── DateRangePicker.tsx
│   │       └── ReorderableList.tsx
│   │
│   ├── preview/                  # Live preview pane
│   │   └── ResumePreview.tsx     # Iframe or react-pdf BlobProvider wrapper
│   │
│   ├── templates/                # One component per template
│   │   ├── TemplateClassic.tsx
│   │   ├── TemplateModern.tsx
│   │   ├── TemplateMinimal.tsx
│   │   └── index.ts              # Template registry (id → component map)
│   │
│   ├── import/
│   │   ├── FileDropzone.tsx      # Drag-and-drop upload UI
│   │   └── SectionReview.tsx     # Parsed section review/correction UI
│   │
│   └── export/
│       └── ExportMenu.tsx        # PDF / DOCX / TXT export buttons
│
├── store/
│   ├── resumeStore.ts            # Zustand store: resume data + actions
│   └── uiStore.ts                # Zustand store: active template, active section, preview mode
│
├── lib/
│   ├── parser/
│   │   ├── extractText.ts        # pdfjs-dist wrapper (server-side)
│   │   └── sectionMapper.ts      # Heuristic text → section assignment
│   ├── export/
│   │   ├── exportPdf.ts          # react-pdf/renderer client PDF generation
│   │   ├── exportDocx.ts         # docx library DOCX builder (server)
│   │   └── exportTxt.ts          # Plain text serializer (client)
│   └── persistence/
│       ├── localStorageAdapter.ts # Save/load resume from localStorage
│       └── dbAdapter.ts           # Save/load resume from DB via API
│
├── types/
│   └── resume.ts                 # ResumeData, Section, Experience, etc. interfaces
│
└── hooks/
    ├── useResumePersistence.ts   # Auto-save logic (localStorage vs DB)
    └── useExport.ts              # Export trigger + loading state
```

### Structure Rationale

- **components/templates/:** Each template is a standalone React component receiving `ResumeData` as props. Adding a new template means dropping one file here and registering it — no other changes needed.
- **store/:** Zustand is kept flat in two stores (resume data, UI state) to avoid cross-store coupling. Forms write directly; templates read directly.
- **lib/parser/ and lib/export/:** Logic is separated from UI so API routes and client code can share the same functions without importing React components.
- **types/resume.ts:** A single shared type file prevents drift between the editor, templates, and export logic.

## Architectural Patterns

### Pattern 1: Shared Data Model as Contract

**What:** A single `ResumeData` TypeScript interface is the contract between the editor (writes), templates (reads), and exporters (reads). All three depend on this type — nothing else.

**When to use:** Always. Without this, templates and exporters will slowly diverge from what the editor can produce.

**Trade-offs:** Requires discipline to evolve the schema carefully; adding a field means updating editor forms, templates, and potentially exporters simultaneously.

**Example:**
```typescript
// types/resume.ts
export interface ResumeData {
  basics: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
  };
  summary?: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillGroup[];
  certifications?: CertificationEntry[];
}

export interface ExperienceEntry {
  id: string;           // uuid — for React key and reordering
  company: string;
  title: string;
  startDate: string;    // ISO format: YYYY-MM
  endDate?: string;     // undefined = "Present"
  bullets: string[];
}
```

### Pattern 2: Template as Pure Renderer

**What:** Each template component is a pure function of `ResumeData`. It receives props, renders output. No internal state, no store access, no side effects.

**When to use:** For all templates. Purity means the same template component can render in the preview pane, in the PDF exporter, and in a server-side render — with zero modification.

**Trade-offs:** Template-specific layout controls (column widths, font size) must live in the store and be passed as props, not internal state.

**Example:**
```typescript
// components/templates/TemplateClassic.tsx
interface TemplateClassicProps {
  data: ResumeData;
  settings?: TemplateSettings;  // font size, color accent, etc.
}

export function TemplateClassic({ data, settings }: TemplateClassicProps) {
  return (
    <div className="template-classic" style={{ fontSize: settings?.fontSize }}>
      <header>{data.basics.name}</header>
      {data.experience.map(exp => <ExperienceSection key={exp.id} entry={exp} />)}
      {/* ... */}
    </div>
  );
}
```

### Pattern 3: Two-Tier Persistence with Transparent Switching

**What:** An auto-save hook checks whether the user is authenticated. If anonymous, it writes to `localStorage`. If authenticated, it sends to the API. On sign-in, local data is merged/uploaded and localStorage is cleared.

**When to use:** Any time optional auth is a requirement. Avoids requiring users to sign in before experiencing core value.

**Trade-offs:** Merge conflict logic on sign-in needs careful UX ("You have an existing resume saved — do you want to use it or replace it?").

**Example:**
```typescript
// hooks/useResumePersistence.ts
export function useResumePersistence() {
  const { data, userId } = useResumeStore();

  useEffect(() => {
    if (userId) {
      debouncedSaveToDb(userId, data);  // 1.5s debounce
    } else {
      localStorageAdapter.save(data);   // synchronous, immediate
    }
  }, [data, userId]);
}
```

## Data Flow

### Import Flow (PDF/TXT → Editor)

```
User drops file
    ↓
FileDropzone (client)
    ↓ multipart POST
/api/parse (Next.js API route, server)
    ↓ pdfjs-dist text extraction
Raw text string returned to client
    ↓
sectionMapper.ts (client-side heuristics)
    ↓ pattern matching (dates, section headers, bullet chars)
Structured ResumeData (partial — low-confidence fields left blank)
    ↓
SectionReview UI (user confirms/corrects each section)
    ↓ user confirms
resumeStore.setAll(parsedData)
    ↓
Editor forms populated, persistence auto-save triggered
```

### Edit Flow (Form → Live Preview)

```
User types in ExperienceForm
    ↓ onChange
resumeStore.updateExperience(id, field, value)  [Zustand action]
    ↓ store state updates (synchronous)
Template component re-renders (subscribed via useStore selector)
    ↓
Preview pane shows updated layout in <1 frame
    ↓ (simultaneously, debounced)
Persistence auto-save (localStorage or DB)
```

### Export Flow

```
User clicks "Export PDF"
    ↓
ExportMenu dispatches exportPdf()
    ↓
react-pdf/renderer BlobProvider receives current ResumeData
    ↓ renders PDF in browser (same template component reused)
Blob URL created → browser download triggered
    ↓
No server round-trip — entirely client-side

User clicks "Export DOCX"
    ↓
ExportMenu POSTs ResumeData to /api/export/docx
    ↓
Server builds DOCX using docx library, streams response
    ↓
Browser receives file download
```

### State Management

```
Zustand resumeStore
    ↓ (direct selector subscriptions)
SectionForms     ← reads own section, writes on change
TemplateRenderer ← reads full ResumeData, re-renders on any change
ExportMenu       ← reads ResumeData snapshot on export trigger
PersistenceHook  ← watches full state, debounces saves
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Monolith is fine. localStorage + simple DB table. No queue. Vercel hobby tier handles export. |
| 1k-100k users | PDF export can stay client-side (no server load). DOCX endpoint may need rate limiting. Add caching headers for static template assets. |
| 100k+ users | Move PDF generation fully client-side for all users to eliminate server load. Consider edge functions for /api/parse. Add job queue for DOCX if export volume is high. |

### Scaling Priorities

1. **First bottleneck:** DOCX export API route — it's server-rendered per request, can be slow under load. Mitigation: move to background job or cache generated files by content hash.
2. **Second bottleneck:** PDF parsing for large or complex PDFs — pdfjs-dist on serverless has cold-start cost. Mitigation: move to dedicated worker or increase serverless timeout.

## Anti-Patterns

### Anti-Pattern 1: Template Logic Inside the Editor

**What people do:** Put template-specific rendering decisions (font size, column count) inside the form components or the main editor page.

**Why it's wrong:** When a new template is added, the editor must be modified. Template and editor become tightly coupled, making adding templates a risky change.

**Do this instead:** Templates are self-contained components. Template-specific settings live in `uiStore` and are passed as props. Editor knows nothing about template internals.

### Anti-Pattern 2: Generating PDF by Screenshot / Print Window

**What people do:** Use `window.print()` or html2canvas to capture the preview pane as a PDF.

**Why it's wrong:** Output quality is screen-resolution-dependent, fonts may not embed correctly, and the file is not selectable text. Results look pixelated on print.

**Do this instead:** Use react-pdf/renderer to generate the PDF from the same ResumeData using a PDF-native template component. The preview pane and the PDF output are separate renders of the same data — not the same DOM element.

### Anti-Pattern 3: Parsing PDF on the Client with pdfjs-dist Directly

**What people do:** Bundle pdfjs-dist into the browser bundle and parse PDFs client-side.

**Why it's wrong:** pdfjs-dist is ~2MB. It bloats the initial JS bundle significantly for a feature that is rarely used (once per resume, at import time). Also, server-side parsing can handle edge cases and larger PDFs more reliably.

**Do this instead:** Upload the PDF to a Next.js API route, parse server-side, return structured text. The client bundle stays lean.

### Anti-Pattern 4: Storing Full Resume HTML in the Database

**What people do:** Serialize the rendered HTML of the resume and save it to the database.

**Why it's wrong:** HTML output is template-specific. If you change or add a template, stored resumes are locked to their original template and cannot switch. Output must be regenerated on every template update.

**Do this instead:** Store only the `ResumeData` JSON and `templateId`. Re-render HTML/PDF on demand from the stored data. This is what allows "try a different template" to work without data loss.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Auth provider (NextAuth / Clerk) | Session cookie → API route middleware checks session | Must be optional — all API routes must also serve unauthenticated users for localStorage path |
| Database (PostgreSQL / SQLite) | Next.js API routes via Prisma or Drizzle ORM | Only needed for authenticated resume save/load |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Editor forms → Store | Zustand actions (synchronous writes) | Never write to DB directly from forms |
| Store → Templates | Zustand selectors (read-only) | Templates must never mutate store |
| Store → Persistence | Zustand subscribe / useEffect (debounced) | Persistence hook is the only writer to localStorage/DB |
| API routes → Parser/Exporter | Direct function import (lib/) | No HTTP between API routes — shared library functions |
| Client → API /api/parse | POST with FormData (multipart) | PDF bytes on wire; text returned as JSON |
| Client → API /api/export/docx | POST with JSON body (ResumeData) | Binary DOCX streamed back as response |

## Build Order Implications

Based on dependencies between components, phases should proceed in this order:

1. **Types + Store** — Define `ResumeData` schema and Zustand store first. Everything else depends on these. Changing the schema later cascades everywhere.
2. **Editor Forms** — Form components write to the store; can be built and tested without templates by logging store state.
3. **One Template + Preview Pane** — Proves the store → template read path works. Validate live preview works before building more templates.
4. **PDF Export** — Requires at least one working template. Build PDF-native version of the template using react-pdf/renderer components.
5. **Additional Templates** — Once the template contract is proven, new templates are additive and low-risk.
6. **PDF Import + Parsing** — The section mapper heuristics are complex and benefit from having the full section schema defined (step 1) and forms ready (step 2) to test against.
7. **DOCX + TXT Export** — Lower priority than PDF. DOCX needs server API route; TXT is trivial.
8. **Persistence + Auth** — localStorage can be added at any phase. DB persistence and auth should be added after core editor/export is stable — they add deployment complexity.

## Sources

- OpenResume architecture (open-source): https://github.com/xitanggg/open-resume (MEDIUM confidence — inspected via GitHub)
- Reactive Resume architecture (open-source): https://github.com/AmruthPillai/Reactive-Resume (MEDIUM confidence — inspected via GitHub)
- JSON Resume standard schema: https://jsonresume.org/schema (HIGH confidence — official spec)
- react-pdf vs Puppeteer comparison: https://npm-compare.com/html-pdf,pdfkit,pdfmake,puppeteer,react-pdf,wkhtmltopdf (MEDIUM confidence — multiple sources agree)
- docx library (DOCX generation): https://github.com/dolanmiu/docx (MEDIUM confidence — npm page verified)
- Zustand for form editor state: https://isitdev.com/zustand-vs-redux-toolkit-2025/ (MEDIUM confidence — multiple comparison articles agree)
- Next.js PDF parsing patterns: https://tuffstuff9.hashnode.dev/how-to-upload-and-parse-a-pdf-in-nextjs (LOW confidence — single tutorial source)
- DEV Community CV Builder guide: https://dev.to/ahmadfarazcrypto/building-a-modern-cv-builder-with-react-19-typescript-and-firebase-a-complete-guide-ldk (LOW confidence — single community post)

---
*Architecture research for: Resume/CV Builder Web App*
*Researched: 2026-03-01*
