# Phase 4: Import - Research

**Researched:** 2026-03-01
**Domain:** PDF/text parsing, file upload UX, section mapping heuristics
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Import button in the header bar, next to the existing Export menu
- Clicking opens a modal dialog with a drag-and-drop dropzone + file picker button
- Single dropzone accepts .pdf, .txt, and .json files — auto-detect type and route to correct handler
- 5 MB file size limit shown in the dropzone ("Max 5 MB")
- All-at-once review page: all parsed sections shown on a single scrollable view
- Review page appears inside the import modal (modal expands/transitions after parsing completes)
- Each section has a checkbox — user can deselect sections they don't want imported
- Inline editing enabled — user can click into any field and correct it directly in the review page
- Uncertain fields highlighted with yellow/amber border/background
- Scanned PDFs detected; if no text found, show friendly error
- Loading state: spinner with status text updates
- Plain text: both paste textarea and .txt file upload supported (tabs or toggle in the modal)
- If user has existing resume data, show warning with Continue/Cancel and "Download backup first" link
- JSON backup files validated against Zod schema and loaded directly, skip parsing

### Claude's Discretion
- Exact modal sizing and transition animations
- Dropzone visual design (icon, border style, hover states)
- Review page section ordering and layout
- Field highlight color intensity
- Loading spinner implementation
- How the paste textarea tab/toggle is styled

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| IMPT-01 | User can upload a PDF file and have it parsed into structured resume sections | pdfjs-dist server-side extraction via Next.js route handler + client-side section mapper heuristics |
| IMPT-02 | User can upload a text file and have it parsed into structured resume sections | Client-side text parsing with same section mapper heuristics — no server round-trip needed |
| IMPT-03 | After import, user can review and correct parsed sections before accepting | Review UI in modal with checkboxes, inline editing, and confidence highlighting |
</phase_requirements>

## Summary

Phase 4 adds resume import capability: upload a PDF or text file, parse it into structured sections matching the existing `ResumeData` schema, let the user review/correct, then commit to the editor. The technical challenge is primarily in PDF text extraction (server-side) and section mapping heuristics (client-side).

**PDF text extraction** should use `pdfjs-dist` (v5.x) in a Next.js App Router route handler (`/api/parse`). The route handler receives the file via `request.formData()`, extracts text using `getDocument` + `getTextContent`, and returns raw text lines with position metadata. No third-party middleware needed — Next.js natively parses multipart form data.

**Section mapping** uses client-side heuristics to classify text blocks into resume sections (contact, summary, experience, education, skills, etc.). This is inherently imprecise (~13% structure recovery per STATE.md), so the UX must frame it as best-effort with mandatory review. The heuristics detect section headers via keyword matching and use positional/formatting cues.

**Primary recommendation:** Keep PDF parsing on the server (pdfjs-dist in route handler), section mapping on the client (no server dependency for heuristics), and make the review step non-skippable.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pdfjs-dist | ^5.4 | Server-side PDF text extraction | Mozilla's PDF.js — the standard for JS PDF processing, actively maintained |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | (existing) | Upload/file icons | Already in project for icon needs |
| sonner | (existing) | Toast notifications for import status | Already used in export flow |
| zod | (existing) | JSON import validation | Already used for ResumeData schema |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| pdfjs-dist | unpdf | Lighter serverless bundle but less ecosystem support; pdfjs-dist is more proven |
| pdfjs-dist | pdf-parse | Wraps pdfjs-dist but is unmaintained (last update 2019); use pdfjs-dist directly |
| Custom dropzone | react-dropzone | Adds dependency; a simple native HTML5 drag-and-drop + input is sufficient for single-file upload |

**Installation:**
```bash
npm install pdfjs-dist
```

**Note:** No `react-dropzone` needed — a custom dropzone with native HTML5 drag-and-drop events (`onDragOver`, `onDrop`) + hidden file input is simple enough for single-file upload and avoids an extra dependency. The project already uses Tailwind for styling and lucide-react for icons.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/api/parse/
│   └── route.ts          # POST handler: PDF -> raw text extraction
├── lib/import/
│   ├── section-mapper.ts  # Heuristic section classification
│   ├── text-parser.ts     # Plain text parsing (line splitting, cleanup)
│   └── pdf-types.ts       # Types for parse API response
├── components/import/
│   ├── import-button.tsx   # Header bar button (mirrors ExportMenu)
│   ├── import-modal.tsx    # Modal container with tabs/states
│   ├── dropzone.tsx        # Drag-and-drop file upload area
│   ├── text-paste.tsx      # Paste textarea tab
│   └── review-panel.tsx    # Section review with checkboxes + inline edit
└── __tests__/
    ├── section-mapper.test.ts
    ├── text-parser.test.ts
    ├── import-modal.test.tsx
    └── api-parse.test.ts
```

### Pattern 1: Server-Side PDF Text Extraction (Route Handler)
**What:** Next.js App Router route handler that receives a PDF file, extracts text with pdfjs-dist, returns structured text lines
**When to use:** PDF upload — client sends FormData, server returns extracted text

```typescript
// src/app/api/parse/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validate MIME type and magic bytes
  const buffer = new Uint8Array(await file.arrayBuffer())

  // PDF magic bytes: %PDF (0x25504446)
  if (buffer[0] !== 0x25 || buffer[1] !== 0x50 || buffer[2] !== 0x44 || buffer[3] !== 0x46) {
    return NextResponse.json({ error: 'Invalid PDF file' }, { status: 400 })
  }

  // Dynamic import pdfjs-dist for server-side use
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise

  const pages: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const textContent = await page.getTextContent()
    const text = textContent.items
      .filter((item: any) => 'str' in item)
      .map((item: any) => item.str)
      .join(' ')
    pages.push(text)
  }

  const fullText = pages.join('\n\n')

  // Scanned PDF detection: check if extracted text is meaningful
  const stripped = fullText.replace(/\s/g, '')
  if (stripped.length < 20) {
    return NextResponse.json({
      error: 'This PDF appears to be a scanned image. Try a text-based PDF or paste your resume as plain text.',
      scanned: true
    }, { status: 422 })
  }

  return NextResponse.json({ text: fullText, pages: pages.length })
}
```

### Pattern 2: Client-Side Section Mapping Heuristics
**What:** Classify text lines into resume sections using keyword matching
**When to use:** After PDF text extraction or plain text input

```typescript
// src/lib/import/section-mapper.ts
type SectionType = 'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'unknown'

interface MappedSection {
  type: SectionType
  content: string
  confidence: 'high' | 'medium' | 'low'
}

const SECTION_HEADERS: Record<SectionType, RegExp[]> = {
  contact: [],  // First block is typically contact
  summary: [/summary/i, /objective/i, /profile/i, /about\s*me/i],
  experience: [/experience/i, /employment/i, /work\s*history/i, /professional/i],
  education: [/education/i, /academic/i, /qualifications/i, /degrees?/i],
  skills: [/skills/i, /technologies/i, /competenc/i, /proficienc/i, /technical/i],
  unknown: [],
}
```

### Pattern 3: JSON Import (Direct Load)
**What:** Validate JSON backup files against Zod schema and load directly
**When to use:** When user uploads a .json file from the Export feature

```typescript
import { ResumeDataSchema } from '@/lib/schema/resume-schema'

function importJson(content: string): { success: true; data: ResumeData } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(content)
    // Validate backup format
    if (parsed.version && parsed.resume) {
      const result = ResumeDataSchema.safeParse(parsed.resume)
      if (result.success) return { success: true, data: result.data }
      return { success: false, error: 'Invalid resume data in backup file' }
    }
    // Try direct resume data
    const result = ResumeDataSchema.safeParse(parsed)
    if (result.success) return { success: true, data: result.data }
    return { success: false, error: 'File does not match resume data format' }
  } catch {
    return { success: false, error: 'Invalid JSON file' }
  }
}
```

### Anti-Patterns to Avoid
- **Client-side PDF parsing:** pdfjs-dist in the browser adds ~1.5MB to bundle; keep it server-side
- **Overly confident section mapping:** Never present heuristic results as "done" — always require review
- **Blocking the main thread:** PDF parsing must be async; show loading states throughout
- **Replacing data silently:** Always warn when existing data will be overwritten

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF text extraction | Custom PDF parser | pdfjs-dist | PDFs are incredibly complex; font encoding, CMap tables, text positioning |
| File type detection | Extension-only check | Magic byte validation + MIME type | Extensions can be wrong; magic bytes are authoritative |
| JSON validation | Manual field checking | Zod schema (.safeParse) | Already have ResumeDataSchema; reuse it |
| File download | Manual blob creation | Existing exportJson function | Already implemented in json-export.ts for backup download |

**Key insight:** PDF parsing is a solved problem (pdfjs-dist), but section mapping from flat text to structured resume data is inherently heuristic. Don't try to make it perfect — make the review UX good instead.

## Common Pitfalls

### Pitfall 1: pdfjs-dist Worker Configuration in Next.js
**What goes wrong:** pdfjs-dist requires a worker for PDF processing; in a Next.js server-side route handler, the worker setup differs from browser usage
**Why it happens:** pdfjs-dist's default import paths assume browser environment
**How to avoid:** Use the legacy build path: `pdfjs-dist/legacy/build/pdf.mjs` which works in Node.js without a separate worker. Alternatively, disable the worker explicitly.
**Warning signs:** "Cannot find module" or worker-related errors at runtime

### Pitfall 2: File Size and Memory on Serverless
**What goes wrong:** Large PDFs can exceed serverless function memory limits
**Why it happens:** PDF parsing loads entire document into memory
**How to avoid:** Enforce 5MB client-side limit before upload (per user decision); validate server-side too. Next.js route handlers have a default body size limit — may need to configure `bodyParser` limit.
**Warning signs:** 413 or memory timeout errors

### Pitfall 3: Section Header Detection False Positives
**What goes wrong:** Words like "Education" in a job description trigger section splits
**Why it happens:** Naive keyword matching without context awareness
**How to avoid:** Require headers to appear at line start, potentially in larger/bold font (if position data available), and be standalone lines (not part of a sentence)
**Warning signs:** Sections split in wrong places; experience descriptions ending up in education

### Pitfall 4: Encoding Issues in Text Files
**What goes wrong:** Non-UTF-8 text files display garbled characters
**Why it happens:** User pastes or uploads text with Windows-1252 or other encodings
**How to avoid:** Use TextDecoder with fallback: try UTF-8 first, fall back to ISO-8859-1
**Warning signs:** Special characters (em dashes, smart quotes) appear as gibberish

### Pitfall 5: Race Conditions in Modal State
**What goes wrong:** User clicks import multiple times; stale parse results appear
**Why it happens:** Async operations complete out of order
**How to avoid:** Use AbortController for fetch requests; disable buttons during processing; track request identity
**Warning signs:** Wrong file's data appearing in review panel

## Code Examples

### Next.js Route Handler File Upload
```typescript
// Client-side: send file to API route
async function uploadPdf(file: File): Promise<{ text: string; pages: number }> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/parse', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Parse failed')
  }

  return response.json()
}
```

### Native HTML5 Dropzone (No Library Needed)
```typescript
function Dropzone({ onFile }: { onFile: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn('border-2 border-dashed rounded-lg p-8 text-center cursor-pointer',
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
      )}
    >
      <input ref={inputRef} type="file" accept=".pdf,.txt,.json" className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      {/* Icon, text, "Max 5 MB" */}
    </div>
  )
}
```

### Scanned PDF Detection
```typescript
function isScannedPdf(extractedText: string): boolean {
  const stripped = extractedText.replace(/\s/g, '')
  // If less than 20 non-whitespace characters across entire PDF, likely scanned
  return stripped.length < 20
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| pdf-parse wrapper | Direct pdfjs-dist | 2023+ | pdf-parse unmaintained since 2019; use pdfjs-dist directly |
| formidable/multer for uploads | Native request.formData() | Next.js 13+ App Router | No middleware needed; built-in FormData parsing |
| react-dropzone for file uploads | Native HTML5 drag-and-drop | Always available | One less dependency; sufficient for single-file upload |
| Client-side PDF.js with worker | Server-side pdfjs-dist legacy build | pdfjs-dist v3+ | Keeps bundle small; server has more memory for parsing |

**Deprecated/outdated:**
- pdf-parse: Last published 2019; wraps an old pdfjs-dist version
- formidable/multer in App Router: Unnecessary; use native request.formData()

## Open Questions

1. **pdfjs-dist ESM import path in Next.js serverless**
   - What we know: `pdfjs-dist/legacy/build/pdf.mjs` works in Node.js
   - What's unclear: Exact import that works in Next.js serverless runtime without worker issues
   - Recommendation: Test the import during implementation; may need `import('pdfjs-dist/legacy/build/pdf.mjs')` dynamic import

2. **Section mapper accuracy threshold**
   - What we know: STATE.md notes ~13% structure recovery; heuristics are inherently limited
   - What's unclear: What confidence threshold triggers the yellow/amber highlight
   - Recommendation: Start conservative — highlight everything below HIGH confidence; adjust after testing

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
| IMPT-01 | PDF upload and parse into sections | integration | `npx vitest run src/__tests__/api-parse.test.ts -t "pdf" --reporter=verbose` | No - Wave 0 |
| IMPT-01 | Section mapper produces structured data from text | unit | `npx vitest run src/__tests__/section-mapper.test.ts --reporter=verbose` | No - Wave 0 |
| IMPT-02 | Text file/paste mapped into sections | unit | `npx vitest run src/__tests__/text-parser.test.ts --reporter=verbose` | No - Wave 0 |
| IMPT-02 | Text input tab in modal works | unit | `npx vitest run src/__tests__/import-modal.test.tsx -t "text" --reporter=verbose` | No - Wave 0 |
| IMPT-03 | Review panel shows parsed sections with checkboxes | unit | `npx vitest run src/__tests__/import-modal.test.tsx -t "review" --reporter=verbose` | No - Wave 0 |
| IMPT-03 | User can deselect and edit sections before accepting | unit | `npx vitest run src/__tests__/import-modal.test.tsx -t "edit" --reporter=verbose` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before verification

### Wave 0 Gaps
- [ ] `src/__tests__/section-mapper.test.ts` — covers IMPT-01, IMPT-02 (heuristic mapping logic)
- [ ] `src/__tests__/text-parser.test.ts` — covers IMPT-02 (text cleanup and line splitting)
- [ ] `src/__tests__/api-parse.test.ts` — covers IMPT-01 (PDF route handler, scanned detection)
- [ ] `src/__tests__/import-modal.test.tsx` — covers IMPT-03 (review panel, checkboxes, inline edit)

## Sources

### Primary (HIGH confidence)
- Project codebase: existing schema (resume-schema.ts), store (resume-store.ts), export patterns (export-menu.tsx, json-export.ts)
- Next.js docs: Route Handlers with formData() support
- pdfjs-dist npm: v5.4.624 (Feb 2026), actively maintained

### Secondary (MEDIUM confidence)
- Web search verified: pdfjs-dist legacy build works server-side without worker
- Web search verified: Native HTML5 drag-and-drop sufficient for file upload
- Web search verified: request.formData() is the standard App Router file upload pattern

### Tertiary (LOW confidence)
- Section mapping accuracy estimates (~13% from STATE.md) — actual accuracy depends on implementation quality

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - pdfjs-dist is the de facto standard for JS PDF processing
- Architecture: MEDIUM - route handler + client heuristics pattern is sound but import path details need validation
- Pitfalls: MEDIUM - common issues documented from multiple sources

**Research date:** 2026-03-01
**Valid until:** 2026-03-31 (stable domain, no fast-moving changes)
