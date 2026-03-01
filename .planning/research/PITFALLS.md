# Pitfalls Research

**Domain:** Resume/CV Builder Web App (Next.js fullstack)
**Researched:** 2026-03-01
**Confidence:** MEDIUM-HIGH (multiple verified sources, some findings training-data-only at LOW)

---

## Critical Pitfalls

### Pitfall 1: PDF Export Does Not Match Live Preview

**What goes wrong:**
The live preview renders via React in the browser DOM using screen CSS. When export runs — via Puppeteer headless Chromium, react-pdf, or window.print() — font metrics, color values, spacing, and page-break positions differ from the preview. Users see a polished preview, export a PDF, and find misaligned sections, truncated text, missing colors, or content split mid-sentence across pages.

**Why it happens:**
Browser screen rendering and print/PDF rendering use different box models and CSS cascades. Properties like `overflow: hidden`, flexbox, and CSS Grid behave inconsistently in print contexts. Custom web fonts may not embed or load in headless Chrome's minimal environment. Colors requiring `-webkit-print-color-adjust: exact` are silently dropped without it. Page-break logic (`break-inside: avoid` / legacy `page-break-inside: avoid`) is ignored on floated elements.

**How to avoid:**
- Build templates with a "print-first" CSS approach from day one. Use `@page { size: A4; margin: ... }` for all templates.
- Prefer simple layouts (block-flow, single or limited flex) over complex CSS Grid in template rendering.
- Apply `break-inside: avoid` to experience entries, education entries, and bullet-point sections — never rely on automatic breaks.
- Set `-webkit-print-color-adjust: exact; color-adjust: exact;` globally in print stylesheets.
- Test export early (milestone 1 of template work), not after all templates are styled.
- If using Puppeteer: use absolute URLs for all assets; fonts loaded from relative paths fail in headless context.

**Warning signs:**
- Preview looks correct but PDF has extra blank pages or truncated lines
- Template uses `overflow: hidden` anywhere in the layout
- Template relies on `position: fixed` or `position: sticky` elements
- Custom fonts load from relative paths

**Phase to address:** Template implementation phase (when first template is built). Must be caught before building templates 2-5 or all will need CSS rework.

---

### Pitfall 2: Puppeteer Is Incompatible with Standard Serverless Deployment

**What goes wrong:**
Teams choose Puppeteer for "pixel-perfect" PDF export, build locally (where it works perfectly), then deploy to Vercel or a similar serverless platform and discover Puppeteer's full Chrome binary (~170-280 MB) vastly exceeds the 50 MB serverless function limit. The feature simply does not deploy.

**Why it happens:**
Puppeteer bundles Chromium. Standard serverless runtimes have strict binary size caps. Developers test locally where no cap exists and don't discover the deployment constraint until after building the feature. Docker-based self-hosting routes around this (Reactive Resume runs Chrome as a separate container) but adds substantial infrastructure complexity.

**How to avoid:**
- Decide the PDF generation approach before writing template code. The choice affects template architecture.
- If targeting serverless (Vercel/Railway/Render): use `@react-pdf/renderer` (pure JS, no binary, renders to PDF natively) or `jsPDF` + `html2canvas` (client-side, no server needed). Do NOT use Puppeteer.
- If Puppeteer quality is required: plan for a dedicated render service (separate Docker container or VM), not serverless. Budget infrastructure accordingly.
- `@sparticuz/chromium` + `puppeteer-core` is the workaround for Lambda/Vercel but adds fragility (version coupling, cold-start timeouts).

**Warning signs:**
- PDF generation planned for Next.js API routes on Vercel
- `puppeteer` (not `puppeteer-core`) in dependencies
- No serverless deployment size check in CI

**Phase to address:** Architecture / stack selection phase (before any template code is written). This is a go/no-go decision for deployment model.

---

### Pitfall 3: PDF Import Parsing Accuracy Is Fundamentally Unreliable

**What goes wrong:**
Teams treat PDF import as "parse the text and split it into sections" — a seemingly straightforward text-extraction task. In practice, PDF parsing accuracy for structure recovery is catastrophically low. Research from 2025 shows parsers achieving ~75% text accuracy while recovering structure at only ~13%. Complex layouts (two-column, tables, text boxes) cause parsers to read content out of order. Image-based or scanned PDFs extract nothing at all. Users import their existing resume and get garbled, reordered, or missing content.

**Why it happens:**
PDF is a visual format, not a semantic one. Text streams in a PDF have no guaranteed reading order, and multi-column layouts produce interleaved text during extraction. Libraries like pdf-parse and pdfjs-dist extract text characters in draw order, not reading order. Scanned PDFs are images with no extractable text — OCR is required, which is a separate, expensive problem.

**How to avoid:**
- Frame PDF import as "best-effort assistance, not reliable migration." Always send the user directly to the form editor after import — never show a "your import is complete" final state.
- Implement a mandatory review step: after parsing, show a diff/comparison of what was extracted vs. the original, section by section, requiring user confirmation.
- Handle the scanned/image-only PDF case explicitly: detect when extraction returns little/no text and surface a clear message rather than silently producing empty fields.
- Do not attempt section classification with regex alone. Use positional heuristics (text near the top = contact info, bold/caps lines = section headers) combined with a validated keyword list.
- Set user expectations in the UI: "Import saves time but requires review — fields may need correction."

**Warning signs:**
- Import shows a success state without a review/confirmation step
- Parser silently returns empty strings for image-based PDFs
- Section parsing using only regex keyword matching
- No test coverage with real-world, non-standard resume PDFs

**Phase to address:** PDF import feature phase. Define the "best-effort + review" UX contract before implementing the parser, not after seeing bad results.

---

### Pitfall 4: Resume Data Schema Is Too Rigid or Too Loose

**What goes wrong:**
Two failure modes exist, both discovered late:

1. **Too rigid**: Schema locks sections to a fixed structure (e.g., experience entries always have `company`, `title`, `startDate`, `endDate`). Users with non-standard resumes — freelancers, academics, career changers — can't represent their history. Template rendering breaks when optional fields are absent.

2. **Too loose**: Schema is a freeform JSON blob. Templates that consume data become spaghetti of null-checks. Export, import, and parsing all interpret data differently. Adding a new template requires understanding undocumented field assumptions.

**Why it happens:**
Developers model the schema from their own resume or the first template, then discover real diversity in user data. The JSON Resume open standard (jsonresume.org) exists and is battle-tested, but teams reinvent their own schema without consulting it.

**How to avoid:**
- Adopt the JSON Resume schema (v1.0.0) as the canonical internal data model. It covers `basics`, `work`, `education`, `skills`, `projects`, `certificates`, `languages`, `volunteer`, `awards`, `publications`, `references`, and `interests`.
- All sections should be arrays (even if a section has one item) with fields defined and optional rather than missing.
- Make all fields optional at the type level — templates must render gracefully with any combination of absent fields.
- Do not add custom top-level sections in v1. Custom fields can go in a `meta` or `extra` object if needed.
- Validate the schema with Zod or similar from day one. Every form save should validate before storing.

**Warning signs:**
- Data model designed as part of the first template build (schema should precede templates)
- Template code with deeply nested null-checks like `resume?.work?.[0]?.company`
- Fields named differently between form, database, and export (e.g., `jobTitle` vs `position` vs `role`)
- No schema version field in stored data

**Phase to address:** Foundation / data model phase — must be first, before any form, template, or parser code. Schema changes after features are built cascade everywhere.

---

### Pitfall 5: localStorage-Only Storage Causes Silent Data Loss

**What goes wrong:**
Users build a resume over multiple sessions using localStorage. Then one of the following happens: they clear browser storage (intentional or via "clear site data"), switch browsers, open a private/incognito window, use a different device, or the localStorage quota (5 MB per origin) is reached. All resume data is gone with no warning and no recovery path.

**Why it happens:**
localStorage feels persistent to developers (data survives page reload) but is volatile from a user perspective. It is device-specific, browser-specific, origin-scoped, and not backed up. The 5 MB limit can be hit by users with large resumes or multiple saved drafts. There is no "deleted" event developers can listen for.

**How to avoid:**
- Implement auto-save with visible confirmation ("Saved locally" indicator with timestamp).
- Add an explicit Export to File (JSON) option from day one — this is the user's only backup for non-account data.
- Warn users clearly (not buried in onboarding) that localStorage data is device-specific and can be lost.
- When optional accounts are added, implement a one-click "Save to account" migration path for existing localStorage data.
- Check storage quota before save; surface a warning if approaching limits.
- Do not store large binary data (images, uploaded PDFs) in localStorage — use object URLs or indexedDB.

**Warning signs:**
- No visible "last saved" indicator in the UI
- No JSON export option for non-logged-in users
- Profile photos or uploaded files stored as base64 in localStorage

**Phase to address:** Core editor phase (localStorage implementation). Address before users can meaningfully use the app. Export to JSON is table stakes, not a nice-to-have.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Build templates with screen CSS, fix print/PDF later | Faster visual iteration | All 3-5 templates need CSS rework; print bugs found late | Never — establish print CSS baseline on template 1 |
| Store resume data as untyped JSON object | No schema work up front | Every template, parser, and exporter makes different assumptions; runtime errors | Never — add Zod schema from day one |
| Use Puppeteer for PDF "just to get it working" | Best visual fidelity quickly | Serverless deployment blocker discovered at deploy time | Only if deploying to Docker/VPS where binary size is not constrained |
| Skip review step in PDF import ("it mostly works") | Simpler import UX | Users lose trust when garbled data appears as "imported successfully" | Never — best-effort parsing requires a mandatory review step |
| Hardcode template field assumptions (e.g., always show dates) | Faster template build | Renders broken UI when optional fields absent; forces schema coupling to templates | Never — all template fields must be optional |
| Use `any` types for resume data in TypeScript | No type errors while building | Schema mismatches invisible until runtime; template rendering crashes | Only in rapid prototyping, replace before first complete feature |

---

## Integration Gotchas

Common mistakes when connecting to external services or libraries.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `@react-pdf/renderer` | Using web CSS features (flexbox gap, CSS variables, calc()) that react-pdf does not support | Use only the documented react-pdf style subset; test early with actual PDF output, not just browser preview |
| `pdfjs-dist` (import) | Importing without the worker file configured; breaks silently in Next.js App Router | Set `GlobalWorkerOptions.workerSrc` via dynamic import; use the PDFJS CDN worker URL for simplicity |
| `docx` (JS library) | Generating DOCX structure that looks correct but differs from Word's XML format; Google Drive renders it incorrectly | Test generated DOCX files in both Microsoft Word and Google Docs from day one; they have different rendering behavior |
| Puppeteer on Vercel | Importing `puppeteer` instead of `puppeteer-core` + `@sparticuz/chromium` | Use puppeteer-core; pin chromium version to the exact rev that sparticuz supports; cold starts add 5-10s latency |
| File upload (PDF) | Rendering uploaded PDF content directly in an iframe or HTML without sanitization | Never render user-uploaded PDFs in a controlled iframe — use pdfjs-dist to extract text only; do not execute embedded scripts |

---

## Performance Traps

Patterns that work at small scale but degrade as resume complexity or user count grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-rendering full preview on every keypress | Preview lags; typing feels sluggish | Debounce preview updates (300-500ms delay); use `useDeferredValue` for preview state | Immediately for users on slow machines; universally on mobile |
| Generating PDF on-demand synchronously in API route | API timeouts; blocked response | Use async generation with a loading state; consider client-side PDF generation to remove server load entirely | At 10+ concurrent users generating PDFs |
| Loading all template CSS at once | Initial page load bloat | Code-split template styles; load template CSS only when template is selected | Noticeable above 5 templates |
| Storing full resume history in localStorage for undo | Hits 5 MB quota with large resumes | Limit undo history depth (10-20 steps); use structural sharing (Immer) to minimize state size | With 1+ year of edit history or large resumes |
| Parsing PDF on the server for every import request | Server memory spikes from concurrent imports | Stream PDF bytes; process in worker threads; rate-limit imports | At ~20 concurrent imports |

---

## Security Mistakes

Domain-specific security issues for a resume builder with file upload.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Rendering uploaded PDFs inline (iframe/embed) | XSS via malicious PDF with embedded JavaScript — CVEs exist for this pattern (2025: stored XSS via PDF upload) | Extract text only using pdfjs-dist; never render user-uploaded PDFs directly as embedded documents |
| Accepting any file extension as PDF | Disguised malicious file execution | Validate MIME type server-side (`application/pdf`) AND magic bytes (first 5 bytes: `%PDF-`); reject mismatches |
| Storing JWT/auth tokens in localStorage | XSS attacker can steal tokens | Use httpOnly cookies for auth tokens; localStorage is appropriate for resume data but not credentials |
| No file size limit on PDF upload | Server memory exhaustion / DoS | Enforce 10 MB max on client and server; most resumes are under 2 MB |
| Serving user-uploaded files from same origin | Stored XSS if file serving is misconfigured | Serve uploaded files from a separate domain/CDN origin with `Content-Disposition: attachment` and `X-Content-Type-Options: nosniff` |

---

## UX Pitfalls

Common user experience mistakes specific to resume builders.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No indication that templates produce ATS-incompatible output | Users get fewer callbacks; blame the tool | Label templates clearly as "ATS-Optimized" or "Design/Creative" with an explanation; default to ATS-friendly |
| Import shows "success" immediately after parsing | Users trust bad data; discover errors only when applying for jobs | Show parsed data in a review/comparison view before committing; let users correct field assignments |
| Switching templates loses custom content | Users feel data is lost; afraid to try templates | Template is purely a renderer — switching must be instant and lossless (data model is template-agnostic) |
| No visible save state | Users don't know if work is persisted; refresh and lose work | Persistent "Saved" / "Unsaved changes" indicator; autosave every 30 seconds |
| PDF/DOCX exports have different visual output | Users confused about which format to send | Explain format differences (PDF = visual fidelity, DOCX = recruiter editable, TXT = ATS safe); show preview before download |
| Resume locked to one page regardless of content | Content overflow is invisible until export | Show a page-count indicator in live preview; surface a warning when content overflows the first page |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **PDF Export:** Looks correct in browser preview — verify it also looks correct as a downloaded PDF file on multiple OS PDF viewers (Adobe, macOS Preview, Chrome PDF viewer)
- [ ] **PDF Import:** Successfully extracts text — verify it handles image-only/scanned PDFs and surfaces an appropriate error rather than showing empty fields
- [ ] **Template switching:** Displays correctly in new template — verify all optional fields (no company URL, no end date, no summary) render without broken layout
- [ ] **DOCX Export:** Opens in Microsoft Word — verify it also opens and renders correctly in Google Docs (they differ significantly)
- [ ] **localStorage persistence:** Resume saves on keypress — verify it also survives browser restart, and that approaching the 5 MB quota surfaces a warning
- [ ] **Account-based save:** Resume saved to account — verify localStorage data migrates to account on login (user doesn't lose pre-login work)
- [ ] **Live preview:** Renders correctly at full width — verify it renders correctly at mobile widths and in the scaled-down preview panel
- [ ] **Plain text export:** Exports text — verify the export is actually ATS-parseable (no special characters, logical reading order, no tab indentation that becomes formatting artifacts)

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| PDF export / preview mismatch discovered after all templates built | HIGH | Audit all template CSS for print-incompatible properties; add a print stylesheet layer to each template; retest all exports |
| Schema too rigid — can't represent freelancer/academic resumes | HIGH | Design migration: add optional fields, write a migration for stored data, update all templates to handle new shape |
| Puppeteer deployment blocker discovered at go-live | HIGH | Switch to `@react-pdf/renderer` (requires rebuilding template rendering layer) or migrate to Docker-based deployment |
| localStorage data loss (user reports missing resume) | MEDIUM | Implement JSON export immediately as a mitigation; fast-track optional account sign-up feature |
| PDF import accuracy complaints | LOW-MEDIUM | Improve the review/confirmation step UX; add field-by-field accuracy indicators; these complaints are expected — manage expectations in UI copy |
| DOCX export incompatible with Google Docs | MEDIUM | Switch from programmatic DOCX generation to a template-based approach (docxtemplater); refactor export layer |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| PDF export / preview mismatch | Template Phase 1 (first template) | Generate PDF from template 1 before building templates 2-5; compare pixel-by-pixel with preview |
| Puppeteer serverless incompatibility | Architecture / stack decision (pre-coding) | Decide PDF generation approach and document serverless constraints before any template code |
| PDF import accuracy | Import Feature Phase | User-test with 10+ real-world PDFs including scanned, multi-column, and creatively formatted resumes |
| Schema too rigid / too loose | Foundation Phase (first, before forms/templates) | Validate schema covers all JSON Resume standard sections; test rendering with missing optional fields |
| localStorage data loss | Core Editor Phase | Test resume persistence after browser restart; test 5 MB quota limit; ship JSON export before first user |
| ATS template incompatibility | Template Phase (design review) | Run each template through an ATS checker (Jobscan or similar) before marking as complete |
| Security: malicious PDF XSS | Import Feature Phase | Pen-test file upload with a crafted PDF containing embedded JavaScript; verify only text is extracted |
| Preview re-render performance | Core Editor Phase | Profile keypress → render time on a mid-range device; must stay under 100ms for responsive feel |

---

## Sources

- [Avoiding Awkward Element Breaks in Print HTML — Amruth Pillai (Reactive Resume author)](https://dev.to/amruthpillai/avoiding-awkward-element-breaks-in-print-html-5goe) — MEDIUM confidence
- [Reactive Resume PDF generation Docker bug (Issue #1623)](https://github.com/AmruthPillai/Reactive-Resume/issues/1623) — HIGH confidence (primary source, confirmed unresolved)
- [Enabling Puppeteer in Vercel: Challenges and Solutions](https://lzbob.medium.com/enabling-puppeteer-in-vercel-a-journey-through-challenges-and-solutions-a727eaec8aac) — MEDIUM confidence
- [Puppeteer serverless size limits — Stefan Judis](https://www.stefanjudis.com/blog/how-to-use-headless-chrome-in-serverless-functions/) — MEDIUM confidence
- [Avoiding Common Pitfalls in PDF Generation — reportgen.io](https://reportgen.io/blog/common-pitfalls) — MEDIUM confidence
- [The State of PDF Parsing: 800+ Documents, 7 LLMs — Applied AI](https://www.applied-ai.com/briefings/pdf-parsing-benchmark/) — MEDIUM confidence (2025 benchmark)
- [Can AI Really Parse Resume PDF Well Enough? — Affinda](https://www.affinda.com/blog/parse-resume-pdf) — MEDIUM confidence
- [Stored XSS via Malicious PDF Upload — CVE 2025](https://www.thehackerwire.com/publiccms-stored-xss-via-pdf-upload/) — HIGH confidence (documented CVE)
- [XSS via uploading malicious PDF — security research](https://medium.com/@tushar_rs_/think-pdfs-are-safe-how-hackers-use-them-for-stored-xss-attacks-043f2c208c37) — MEDIUM confidence
- [Resolving hydration mismatch errors in Next.js — LogRocket](https://blog.logrocket.com/resolving-hydration-mismatch-errors-next-js/) — HIGH confidence (official-adjacent, well-sourced)
- [JSON Resume Schema (jsonresume.org)](https://jsonresume.org/schema) — HIGH confidence (official standard)
- [ATS Resume Template compatibility — The Interview Guys](https://blog.theinterviewguys.com/ats-friendly-resume-template-2025/) — MEDIUM confidence
- [React Performance Pitfalls: Fixing Re-renders — Medium (2025)](https://medium.com/@mohitpokra/react-performance-pitfalls-fixing-re-renders-6916944aca94) — MEDIUM confidence
- [docx JavaScript library issues — GitHub](https://github.com/dolanmiu/docx/issues) — MEDIUM confidence

---
*Pitfalls research for: Resume/CV Builder Web App*
*Researched: 2026-03-01*
