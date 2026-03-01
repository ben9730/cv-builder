# Project Research Summary

**Project:** CV Builder — Resume/CV Builder Web Application
**Domain:** Full-stack web app / document productivity tool
**Researched:** 2026-03-01
**Confidence:** MEDIUM-HIGH

## Executive Summary

A resume/CV builder is a well-understood product category with established open-source references (OpenResume, Reactive Resume) that validate the core architecture. The recommended approach is a Next.js 16 App Router fullstack app with a form-based editor, Zustand state store, live preview, and client-side PDF export via `@react-pdf/renderer`. The distinguishing technical decision is treating the data model as the primary contract: a single `ResumeData` TypeScript schema (aligned with JSON Resume v1 standard) is the source of truth that the editor writes, templates read, and exporters consume. Every other component is downstream of this schema, so it must be defined first and defined correctly.

The biggest competitive opportunity is genuine: most established builders (Novoresume, Enhancv, Zety) paywall PDF export and section reordering behind subscriptions, and none offer DOCX or plain text export. This product can ship all exports free, add PDF import as a core feature (not a premium add-on), and operate without requiring account creation — a combination that no major competitor currently offers. The closest analog is Reactive Resume (open-source), which lacks DOCX and plain text export.

The three critical risks are: (1) PDF export fidelity diverging from the live preview — this must be caught on the first template, before building templates 2–5; (2) PDF import accuracy being fundamentally unreliable for structured extraction (~13% structure recovery rate) — the UX must frame import as "best-effort assistance with mandatory review," never "import complete"; and (3) the data schema becoming either too rigid (breaks edge cases) or too loose (makes templates unpredictable) — using the JSON Resume standard as the canonical internal model and validating with Zod from day one resolves both failure modes.

---

## Key Findings

### Recommended Stack

The core stack is Next.js 16 (App Router) + React 19 + TypeScript 5.5+ + Tailwind CSS 4, which is the clear consensus choice for this domain in 2026. Turbopack is the default bundler — no configuration needed. For state management, Zustand is recommended over Redux or Context due to its simplicity and direct selector subscriptions that avoid unnecessary re-renders in a multi-form editor.

PDF parsing uses `pdfjs-dist` 5.4.x server-side in a Next.js API route (not client-side, to avoid a ~2 MB bundle hit). PDF generation uses `@react-pdf/renderer` 4.3.x client-side only — it must be loaded with `dynamic(..., { ssr: false })` in App Router. DOCX generation uses the `docx` 9.6.x library, which can run server-side in an API route. Forms use `react-hook-form` + `zod` 4 (14x faster than Zod 3, TypeScript 5.5+ required). UI components are `shadcn/ui` on Tailwind CSS 4. Auth (optional) is `Better Auth` 1.4.x — NextAuth v5 is still beta-tagged and being absorbed by Better Auth; Lucia Auth was deprecated March 2025.

**Core technologies:**
- **Next.js 16 (App Router):** Fullstack framework — project constraint; Turbopack default, React Compiler stable, SSR + API routes in one deployment
- **React 19 + TypeScript 5.5+:** UI layer + type safety — React Compiler auto-memoizes; TS 5.5+ required for Zod 4 compatibility
- **Tailwind CSS 4 + shadcn/ui:** Styling + components — dominant ecosystem choice; CSS-native, no config file; shadcn/ui is copy-paste, fully customizable
- **Zustand:** Resume data store — flat, selector-based, no re-render overhead vs. full Context re-renders
- **react-hook-form + Zod 4:** Form state + validation — uncontrolled inputs avoid per-keystroke full-form re-render; Zod schema shared client/server
- **pdfjs-dist 5.4.x:** PDF text extraction — run server-side only in API route; most reliable positional extraction available
- **@react-pdf/renderer 4.3.x:** PDF generation — React component API matches template model; client-side only, no server binary needed
- **docx 9.6.x:** DOCX generation — declarative JS/TS API; works browser + Node.js
- **Drizzle ORM 0.45.x + PostgreSQL (Supabase/Neon):** Persistence for authenticated users — lightweight, serverless-ready, fast cold starts
- **Better Auth 1.4.x:** Optional user authentication — current TypeScript-first standard; self-hosted avoids vendor lock-in

### Expected Features

The core loop users expect is: import or fill → edit with live preview → export. Missing any part of this loop is a broken product. Template switching without data loss is table stakes, not a differentiator. Works-without-login is now a baseline expectation.

**Must have (table stakes):**
- Contact, experience, education, skills, summary sections — core resume content
- Live preview — editing blind is unusable; near-real-time required
- PDF export — must produce selectable text (not image), not a screengrab
- 3+ distinct templates — one template is not a product
- Template switching without data loss — data is template-agnostic
- localStorage persistence — anonymous users must be able to work without account
- Section reordering — users optimize section order by context; this is paywalled at competitors
- Add/remove entries within sections — multiple jobs, degrees, skill groups
- Responsive UI — mobile form-based editing works naturally

**Should have (competitive differentiators):**
- PDF import with parsing — core value prop; no major competitor ships this free; must include mandatory review step
- DOCX export — no major competitor offers this; frequently requested by users and recruiters
- Plain text export — ATS form copy-paste; trivially implementable
- Optional sections (Certifications, Projects, Languages, Volunteer) — covers tech, academic, NGO professionals
- Per-section show/hide toggle — non-destructive hiding without data loss
- Optional user accounts — cross-device sync; trigger only when user asks "how do I save?"
- Color/font customization within templates — constrained palette to prevent ugly output

**Defer to v2+:**
- AI content generation — LLM integration costs and scope exceed v1
- ATS score checker — separate product focus; high complexity
- Cover letter builder — doubles document scope; validate resume builder first
- Resume sharing link — requires accounts to be live first; niche v1 use case
- LinkedIn/JSON resume import — validate demand before building additional parsers
- Multi-language UI — English-first for v1

### Architecture Approach

The architecture is a split-panel editor: left pane is form-based section editing, right pane is live template preview. A central Zustand store holds `ResumeData` as the single source of truth. All form components write to the store; all template components read from it. Export is dispatched from the preview pane and routes to the appropriate handler (PDF client-side, DOCX server-side via API route, TXT inline). Persistence is two-tier: anonymous users auto-save to localStorage; authenticated users auto-save to PostgreSQL via a debounced Server Action. The key architectural discipline is that templates are pure renderers — they receive `ResumeData` as props and have no internal state, store access, or side effects. This purity allows the same template component to serve the browser preview and the PDF export data path.

**Major components:**
1. **Resume Data Store (Zustand):** Single source of truth for all resume content and UI state (active template, section order); all other components derive from it
2. **Section Forms (react-hook-form + Zod):** Per-section form panels that validate and write to the store; independent of template rendering
3. **Template Renderer:** Pure React components receiving `ResumeData` as props; one component per template; registered in a template registry (id → component map)
4. **Export Dispatcher:** Routes export requests — PDF via `@react-pdf/renderer` client-side, DOCX via `/api/export/docx` server route, TXT inline
5. **PDF Parser (server-side):** `pdfjs-dist` in `/api/parse` API route; extracts text from uploaded PDF; returns raw text for client-side section mapping
6. **Section Mapper (client-side):** Heuristic text-to-section assignment using positional analysis and keyword matching; produces partial `ResumeData` for user review
7. **Persistence Layer:** `useResumePersistence` hook; writes to localStorage (anonymous) or DB via API (authenticated); switches transparently on sign-in
8. **Two-tier Database:** `ResumeData` stored as JSONB in PostgreSQL via Drizzle ORM; only activated for authenticated users

### Critical Pitfalls

1. **PDF export / preview mismatch** — Catch this on template 1 by generating an actual PDF immediately; do not build templates 2–5 before PDF output is validated. Use `@react-pdf/renderer` (not Puppeteer), build print-first CSS from day one, apply `break-inside: avoid` to all experience/education entries.

2. **PDF import accuracy is fundamentally unreliable** — Parsers recover ~13% of structure from complex PDFs. Frame import as "best-effort assistance" in UI copy; implement a mandatory section-by-section review step before committing parsed data to the store. Never show an "import complete" success state.

3. **Data schema too rigid or too loose** — Align with JSON Resume v1 standard; validate with Zod from day one; make all fields optional at the type level so templates render gracefully with missing data. Section data must be stored as ordered arrays (not fixed-key objects) to support reordering.

4. **localStorage data loss** — localStorage is device-specific, quota-capped (5 MB), and not backed up. Ship a "Export to JSON" backup option before the first real user; show a persistent "Saved" / "Unsaved changes" indicator; warn when approaching quota. Provide a one-click migration path when users sign up.

5. **Puppeteer on serverless = deployment blocker** — Puppeteer's Chromium binary (~170–280 MB) exceeds Vercel's 50 MB function limit. This decision must be made before any template code is written. The chosen stack (`@react-pdf/renderer`) avoids this entirely — do not revisit Puppeteer unless deploying to Docker/VPS with no size constraints.

---

## Implications for Roadmap

Based on combined research findings and the explicit build order implied by component dependencies, the following phase structure is recommended. The architecture research provides a tested build order that the roadmap should follow closely.

### Phase 1: Foundation — Data Model and Project Setup

**Rationale:** Every component in the system depends on the `ResumeData` schema. Schema changes after features are built cascade everywhere. Changing an ordered array to a fixed-key object after section reordering is built requires a full rewrite. This must be first.

**Delivers:** Working Next.js project scaffold with `ResumeData` TypeScript schema (Zod-validated, JSON Resume-aligned), Zustand store with typed actions, and `localStorage` auto-save. No visible UI — foundation only.

**Addresses:** Section Data Model (FEATURES.md P1), localStorage persistence (FEATURES.md P1)

**Avoids:** Schema too rigid/too loose (Pitfall 4), localStorage data loss (Pitfall 5)

**Stack used:** Next.js 16, TypeScript 5.5+, Zod 4, Zustand, Tailwind CSS 4

**Research flag:** Standard patterns — skip phase research. JSON Resume schema is well-documented; Zustand + Zod integration is established.

---

### Phase 2: Editor — Form-Based Section Editing

**Rationale:** Editor forms are the primary write path for the store. They can be built and tested against the store without any template rendering — log store state to verify correctness. This validates the data model before rendering is layered on top.

**Delivers:** Complete form-based editor with per-section panels (contact, summary, experience, education, skills), add/remove entries within sections, per-section show/hide toggle, and section reordering (up/down controls).

**Addresses:** Form-based editor (FEATURES.md P1), section reordering (FEATURES.md P1), optional sections (FEATURES.md P1), per-section show/hide (FEATURES.md P1)

**Avoids:** Template logic inside editor components (Architecture Anti-Pattern 1)

**Stack used:** react-hook-form 7.71.x, Zod 4, shadcn/ui, lucide-react

**Research flag:** Standard patterns — skip phase research. react-hook-form + Zod patterns are well-documented.

---

### Phase 3: Templates and Live Preview

**Rationale:** Templates are pure renderers of the store state established in Phases 1–2. Build one template first and validate both the browser preview and the PDF export before building additional templates. PDF export fidelity must be confirmed on template 1 — all subsequent templates share the same CSS constraints.

**Delivers:** 3 ATS-safe resume templates (Classic, Modern, Minimal) as pure React components; live preview pane (split-panel layout); template switching that preserves all data; PDF export (`@react-pdf/renderer` client-side with `dynamic(..., { ssr: false })`).

**Addresses:** Live preview (FEATURES.md P1), 3 templates (FEATURES.md P1), template switching (FEATURES.md P1), PDF export (FEATURES.md P1)

**Avoids:** PDF export / preview mismatch (Pitfall 1) — validate PDF output on first template before proceeding; Puppeteer serverless blocker (Pitfall 2) — use `@react-pdf/renderer` throughout

**Stack used:** @react-pdf/renderer 4.3.x (dynamic import, ssr: false), Tailwind CSS 4 (preview), react-pdf inline styles (PDF templates), Zustand selectors

**Research flag:** Needs deeper research. `@react-pdf/renderer` style subset is limited and does not support all CSS; specific layout patterns for ATS-safe single-column templates may need investigation. Also validate Zod 4 + react-hook-form `@hookform/resolvers` integration for the current version.

---

### Phase 4: Export — DOCX and Plain Text

**Rationale:** DOCX and plain text export are independent of PDF export — they read from the same `ResumeData` but use entirely different generation libraries. They are lower priority than PDF but are key differentiators vs. competitors. DOCX runs server-side (API route); TXT is trivial client-side.

**Delivers:** DOCX export via `/api/export/docx` (docx 9.6.x, streamed binary response); plain text export (client-side serializer); `ExportMenu` component with all three export options; format explanations in UI (PDF = visual fidelity, DOCX = recruiter-editable, TXT = ATS safe).

**Addresses:** DOCX export (FEATURES.md P1), plain text export (FEATURES.md P1)

**Avoids:** DOCX incompatibility with Google Docs — test in both Word and Google Docs from day one (Pitfall: Integration Gotchas)

**Stack used:** docx 9.6.x, file-saver 2.x

**Research flag:** Standard patterns for TXT. DOCX generation via the `docx` library has known Google Docs rendering differences — validate with real output early.

---

### Phase 5: PDF Import with Parsing

**Rationale:** PDF import is the most complex feature and depends on having the full schema (Phase 1) and all form sections (Phase 2) implemented to map parsed text into. The section mapper heuristics are easiest to tune when the target data structure is already complete and validated. Build last among core features to leverage everything already in place.

**Delivers:** File dropzone (drag-and-drop or file picker); server-side PDF text extraction (`pdfjs-dist` in `/api/parse`); client-side section mapper (heuristics: positional + keyword); mandatory section review/correction UI before committing to store; explicit handling for scanned/image-only PDFs (detect no-text case and surface clear message).

**Addresses:** PDF import with parsing (FEATURES.md P1 differentiator)

**Avoids:** PDF import accuracy misrepresentation (Pitfall 3) — mandatory review step is non-negotiable; security: malicious PDF XSS (PITFALLS.md) — extract text only, never render uploaded PDFs inline; validate MIME type and magic bytes server-side

**Stack used:** pdfjs-dist 5.4.x (API route, server-side only), custom sectionMapper.ts heuristics

**Research flag:** Needs deeper research. PDF section mapping heuristics for resume content are complex and domain-specific. Research open-source implementations (OpenResume's parser, Reactive Resume's approach) before implementing the section mapper. Plan for multiple real-world PDF test cases covering multi-column, scanned, and non-standard formats.

---

### Phase 6: Optional User Accounts and Cloud Persistence

**Rationale:** Accounts add deployment complexity (auth layer, database schema, session management) that should not block the core product. Add only after core editor/export is stable and working. The localStorage + JSON export fallback ensures users are not blocked without accounts. Trigger this phase when user feedback confirms cross-device sync demand.

**Delivers:** Optional account creation (email/password + OAuth); cloud resume persistence via Drizzle + PostgreSQL (resume stored as JSONB); localStorage-to-account migration on sign-in (with user-prompted conflict resolution); resume list (multiple saved resumes per account).

**Addresses:** Optional user accounts (FEATURES.md P2)

**Avoids:** Merge conflict data loss on sign-in — explicit UX prompt required; auth token in localStorage (PITFALLS.md Security) — use httpOnly cookies for session tokens

**Stack used:** Better Auth 1.4.x, Drizzle ORM 0.45.x, PostgreSQL (Supabase or Neon)

**Research flag:** Needs deeper research. Better Auth 1.x integration with Next.js 16 App Router (Server Actions, route handlers) has limited tutorials. Research the specific session/cookie setup before implementation.

---

### Phase Ordering Rationale

- Schema must precede all other features — it is the contract that prevents costly rewrites (confirmed by both ARCHITECTURE.md build order and PITFALLS.md Pitfall 4).
- Editor must precede templates — forms validate the data model against real user input before rendering is added.
- First template must include PDF export validation — catching print/PDF CSS issues after all templates are styled requires reworking all of them.
- Additional export formats (DOCX, TXT) are independent of PDF and can follow as a group since they share no library dependencies with PDF export.
- PDF import comes after forms are complete — the section mapper needs the full schema as a mapping target and form components to populate with parsed data.
- Auth/accounts come last — they add infrastructure complexity without blocking any core feature; localStorage provides a working fallback throughout.

---

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Templates + Live Preview):** `@react-pdf/renderer` style constraints differ significantly from browser CSS; specific ATS-safe layout patterns need validation against real ATS systems. Also confirm `@hookform/resolvers` compatibility with Zod 4.3.x.
- **Phase 5 (PDF Import):** Section mapping heuristics for resume content are complex and poorly documented. Study OpenResume and Reactive Resume parser implementations. Plan for test suite with 10+ real-world PDFs (multi-column, scanned, creatively formatted).
- **Phase 6 (Accounts):** Better Auth 1.x + Next.js 16 App Router integration is relatively new; limited implementation examples available.

Phases with standard patterns (skip research):
- **Phase 1 (Foundation):** JSON Resume schema is a published standard; Zustand + Zod integration is well-documented.
- **Phase 2 (Editor Forms):** react-hook-form 7.x + shadcn/ui patterns are extensively documented; no novel integrations.
- **Phase 4 (DOCX + TXT Export):** `docx` 9.x has clear API docs; TXT serialization is trivial. Test output compatibility as a verification step, not a research step.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core framework choices verified against official sources (Next.js 16 blog, npm pages with download counts, GitHub changelogs). Key constraint: `@react-pdf/renderer` SSR incompatibility is confirmed from GitHub issues — dynamic import workaround is the documented solution. |
| Features | MEDIUM-HIGH | Competitor analysis drawn from multiple review sources (TechRadar, TealHQ, Kickresume). Open-source reference projects (OpenResume, Reactive Resume) validate what the full feature set looks like in practice. Specific implementation complexity estimates are inferred. |
| Architecture | MEDIUM | Validated against two open-source resume builder codebases. No single authoritative architecture spec exists for this domain. Patterns (pure template renderers, two-tier persistence, shared data model) are confirmed by multiple sources agreeing independently. |
| Pitfalls | MEDIUM-HIGH | Critical pitfalls (PDF/preview mismatch, Puppeteer serverless, import accuracy) are verified from primary sources (GitHub issues, documented CVEs, published benchmarks). Performance and security gotchas are partly training-data-inference — treat as high-probability rather than confirmed. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **`@react-pdf/renderer` style coverage:** The library's supported CSS subset is documented but not exhaustive. During Phase 3, test all layout properties used in templates against actual PDF output before marking any template complete. Do not trust browser preview as a proxy for PDF output.

- **PDF section mapper accuracy targets:** Research establishes that structural accuracy from PDF parsing is low (~13% in benchmarks), but it does not quantify what "good enough for assisted import" looks like in practice. Define an acceptable accuracy threshold during Phase 5 planning and design the review UX around the realistic worst case, not the best case.

- **Better Auth + Next.js 16 App Router session handling:** The integration is confirmed stable, but specific implementation patterns (Server Action session validation, route handler middleware, cookie configuration) have limited public examples as of March 2026. Budget extra investigation time in Phase 6.

- **DOCX rendering parity between Word and Google Docs:** Known to differ. During Phase 4, establish a minimum compatibility baseline early — build, open in both, adjust — rather than discovering discrepancies late.

- **ATS compatibility of templates:** Templates are designed with ATS principles (single-column, no tables, no text boxes) but have not been tested against real ATS systems. During Phase 3, run templates through an ATS checker (Jobscan or similar) before marking as complete.

---

## Sources

### Primary (HIGH confidence)
- [Next.js 16 official blog](https://nextjs.org/blog/next-16) — version, Turbopack defaults, React Compiler stability, Node 20.9+ minimum
- [@react-pdf/renderer npm + GitHub issues](https://github.com/diegomura/react-pdf/issues/2460) — React 19 compatibility, SSR dynamic import requirement
- [JSON Resume schema spec](https://jsonresume.org/schema) — canonical data model reference
- [Zod v4 InfoQ announcement](https://www.infoq.com/news/2025/08/zod-v4-available/) — 14x performance, TS 5.5+ requirement
- [Stored XSS via PDF upload CVE 2025](https://www.thehackerwire.com/publiccms-stored-xss-via-pdf-upload/) — PDF security requirement validation
- [docx npm](https://www.npmjs.com/package/docx) — v9.6.0, browser + Node.js confirmed
- [Better Auth npm](https://www.npmjs.com/package/better-auth) — v1.4.20, v1.0 stable confirmed
- [Tailwind CSS v4 blog](https://tailwindcss.com/blog/tailwindcss-v4) — v4.1.x stable, CSS-native

### Secondary (MEDIUM confidence)
- [OpenResume GitHub](https://github.com/xitanggg/open-resume) — architecture validation, PDF parser approach
- [Reactive Resume GitHub](https://github.com/AmruthPillai/Reactive-Resume) — feature completeness reference, PDF generation via separate Docker service
- [Applied AI PDF parsing benchmark (2025)](https://www.applied-ai.com/briefings/pdf-parsing-benchmark/) — ~13% structure recovery rate
- [TechRadar, TealHQ, Kickresume competitor analyses](https://www.techradar.com/best/best-resume-builder) — feature table stakes and competitor gaps
- [Enabling Puppeteer on Vercel — Stefan Judis](https://www.stefanjudis.com/blog/how-to-use-headless-chrome-in-serverless-functions/) — serverless binary size constraints
- [Lucia Auth deprecation (GitHub)](https://github.com/lucia-auth/lucia) — auth ecosystem consolidation
- [Drizzle vs Prisma 2026 comparison](https://designrevision.com/blog/prisma-vs-drizzle) — Drizzle recommendation for serverless/small-team

### Tertiary (LOW confidence)
- [Next.js PDF parsing tutorial — Hashnode](https://tuffstuff9.hashnode.dev/how-to-upload-and-parse-a-pdf-in-nextjs) — server-side pdfjs-dist pattern (single tutorial source; validate against official docs)
- [DEV Community CV Builder guide](https://dev.to/ahmadfarazcrypto/building-a-modern-cv-builder-with-react-19-typescript-and-firebase-a-complete-guide-ldk) — general implementation reference only

---

*Research completed: 2026-03-01*
*Ready for roadmap: yes*
