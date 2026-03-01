# Stack Research

**Domain:** Resume/CV Builder Web Application
**Researched:** 2026-03-01
**Confidence:** MEDIUM-HIGH (core stack HIGH; PDF parsing/generation MEDIUM due to known Next.js compatibility quirks)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.2.x (latest stable) | Fullstack framework — App Router, API routes, SSR | Project constraint; v16 is the current stable release with Turbopack default and React Compiler stable. App Router is the correct choice for new projects. |
| React | 19.2.x (bundled with Next.js 16) | UI layer | Shipped with Next.js 16; React Compiler auto-memoizes — no manual useMemo/useCallback needed. |
| TypeScript | 5.1+ | Type safety across full stack | Required by Next.js 16 minimum. Zod 4 requires TS 5.5+; use 5.5+ to unlock full ecosystem compatibility. |
| Tailwind CSS | 4.1.x | Styling | Dominant choice in the Next.js/resume builder ecosystem. v4 uses CSS-native variables, no config file required, 5x faster builds. shadcn/ui requires it. |

### PDF Parsing (Import)

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| pdfjs-dist | 5.4.x (latest stable) | Parse uploaded PDF files to extract raw text | Mozilla's official PDF.js distribution — the most reliable text extraction with positional data. Suitable for server-side API route usage. Handles complex PDFs better than pdf-parse. |

**How to use it in Next.js:** Run exclusively in an API route (server-side, Node.js runtime). Do NOT import in client components. The worker setup requires pointing `GlobalWorkerOptions.workerSrc` to a CDN-hosted worker — or disabling the worker entirely for server-side Node.js use (no worker needed in Node).

**Why not pdf-parse:** pdf-parse (v2.4.x) is simpler but wraps an older version of PDF.js and has less maintenance activity. For a product where PDF parsing quality directly affects UX, use the source (pdfjs-dist) directly.

**Why not pdf2json:** Coordinate-based JSON output is useful for layout analysis but adds parsing complexity you don't need for resume section extraction.

### PDF Generation (Export)

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| @react-pdf/renderer | 4.3.x (latest stable) | Generate downloadable PDF from resume data | React-component API matches the project's template/rendering model. You define resume templates as React components with JSX + inline styles; the same component renders preview and PDF output. 860K+ weekly downloads, actively maintained. |

**Critical integration note:** `PDFDownloadLink` and `PDFViewer` are browser-only APIs. In Next.js App Router you MUST use dynamic import with `ssr: false`:

```typescript
// components/PDFExportButton.tsx
"use client";
import dynamic from "next/dynamic";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span>Preparing PDF...</span> }
);
```

Server-side PDF generation via API route (renderToBuffer) has unresolved issues in Next.js App Router — use client-side download only.

**Why not jsPDF:** Imperative drawing API (not component-based) makes it hard to maintain 3–5 styled templates. No React integration.

**Why not pdfmake:** JSON document definition model doesn't compose as naturally with React component templates.

### DOCX Generation (Export)

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| docx | 9.6.x (latest stable, published days ago) | Generate downloadable DOCX from resume data | Declarative JS/TS API, works in browser and Node.js, 445K weekly downloads, actively maintained. Define document structure programmatically — no template file required, which avoids the docxtemplater template management problem. |

**Why not docxtemplater:** Template-file approach (embed tags in a .docx template) adds an asset management burden and requires shipping binary template files. Fine for business docs, overkill here.

**Why not docx-templates:** Similar template-file approach; less popular.

### Form Handling

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| react-hook-form | 7.71.x (latest stable) | Form state management for resume editor | Uncontrolled-by-default approach is ideal for multi-field resume forms — avoids re-rendering the entire form on each keystroke. Pairs with Zod via @hookform/resolvers. |
| zod | 4.3.x (latest stable) | Schema validation, TypeScript type inference | Zod 4 is 14x faster than v3, 57% smaller bundle. Define resume data schema once, get TypeScript types and validation for free. Share schema between client and server (API route validation). |
| @hookform/resolvers | latest | Bridge between react-hook-form and Zod | Official resolver — no manual wiring. |

### UI Components

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| shadcn/ui | Latest (copy-paste model, no version pin) | Form inputs, buttons, dialogs, tabs | Copy-paste components built on Radix UI primitives + Tailwind CSS. You own the code — easy to customize for resume-specific UI. Built-in accessibility. The standard choice for Next.js + Tailwind projects in 2025–2026. |

### Template Rendering (Live Preview)

No additional library needed. Resume templates are standard React components styled with Tailwind CSS (or inline styles where precise control is needed for the PDF renderer). The same component serves both the browser preview and the @react-pdf/renderer output via a shared data structure.

**Pattern:** One `ResumeData` Zod schema → one form → live preview React component → PDF/DOCX export function. Templates are just different React component implementations of the same data shape.

### Database

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Drizzle ORM | 0.45.x (latest stable; v1 beta available) | Type-safe database queries | Lightweight (7.4kb, zero dependencies), SQL-close API, excellent TypeScript inference, serverless-ready. Significantly faster cold starts than Prisma. Ideal for this scale. |
| PostgreSQL (via Supabase or Neon) | — | User account data, saved resumes | Supabase and Neon both offer generous free tiers with connection pooling compatible with Drizzle. Anonymous users use localStorage only — no DB required for them. |

**If you want the absolute simplest setup:** Use Supabase (managed Postgres + auth). But then Better Auth becomes redundant. Choose one or the other.

### Authentication

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| Better Auth | 1.4.x (latest stable, v1.0 released) | Optional user accounts | The new standard for TypeScript-first authentication in Next.js. Auth.js (NextAuth) v5 never exited beta officially, and Auth.js is now being absorbed into the Better Auth project. Lucia Auth was deprecated March 2025. Better Auth 1.x is stable, actively maintained, and supports email/password + OAuth providers out of the box. |

**Anonymous user flow:** No auth interaction at all. Resume data lives in `localStorage`. Prompt users to create an account only when they try to access from a second device or explicitly request sync.

**Why not Clerk:** Vendor lock-in, per-MAU pricing. For a project where auth is optional and expected to be low-volume initially, self-hosted auth (Better Auth + your own DB) avoids future billing surprises.

**Why not NextAuth v5:** Still beta-tagged as of March 2026; v5 releases are absorbed into Better Auth going forward.

---

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @hookform/resolvers | latest | Connects Zod schemas to react-hook-form | Every form in the app |
| file-saver | 2.x | Trigger browser file download for DOCX | DOCX export — `saveAs(blob, 'resume.docx')` |
| mammoth | 1.x | Parse uploaded .docx files to extract text | If implementing DOCX import (optional v2 feature) |
| lucide-react | latest | Icon set compatible with shadcn/ui | All UI icons |
| clsx + tailwind-merge | latest | Conditional className utility | Required by shadcn/ui components |

---

## Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Drizzle Kit | Database migrations and schema push | `drizzle-kit generate` + `drizzle-kit migrate` |
| drizzle-kit studio | Local database browser | Run `npx drizzle-kit studio` for GUI |
| ESLint (flat config) | Linting | Next.js 16 defaults to ESLint flat config. Do NOT use `next lint` (removed in v16 — run eslint directly). |
| Biome (alternative) | Linting + formatting | Faster than ESLint+Prettier; consider if build performance matters. |

---

## Installation

```bash
# Bootstrap
npx create-next-app@latest cv-builder --typescript --tailwind --eslint --app

# PDF parsing (server-side only, in API route)
npm install pdfjs-dist

# PDF generation (client-side)
npm install @react-pdf/renderer

# DOCX generation
npm install docx file-saver
npm install -D @types/file-saver

# Form handling + validation
npm install react-hook-form @hookform/resolvers zod

# UI
npx shadcn@latest init
npx shadcn@latest add button input label textarea select tabs card dialog

# Database
npm install drizzle-orm postgres
npm install -D drizzle-kit

# Auth (optional accounts feature)
npm install better-auth

# Utilities
npm install lucide-react clsx tailwind-merge
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| pdfjs-dist | pdf-parse | If you only need dead-simple text extraction from plain PDFs and don't need positional data |
| @react-pdf/renderer | Puppeteer/headless browser | If pixel-perfect HTML-to-PDF rendering is required and server-side generation is a hard requirement (adds infra complexity) |
| docx | docxtemplater | If non-developers need to manage DOCX templates via Word — not applicable here |
| Better Auth | Supabase Auth | If you're already using Supabase for the database — consolidate auth there and drop Better Auth |
| Drizzle ORM | Prisma | If the team prefers schema-first workflow and abstracted queries; Prisma v7 is now pure TypeScript but bundle is still heavier |
| Drizzle + Postgres | SQLite (better-sqlite3) | For a local-first or offline-capable build; unnecessary complexity for a web app with sync accounts |
| Tailwind CSS + shadcn/ui | CSS Modules | If you want zero runtime CSS; for resume templates specifically, inline styles work better with @react-pdf/renderer anyway |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Lucia Auth | Officially deprecated March 2025 | Better Auth |
| NextAuth.js v5 (next-auth@5) | Still beta-tagged; being absorbed into Better Auth ecosystem | Better Auth |
| jsPDF | Imperative canvas API — cannot use React components as templates; no good styling story | @react-pdf/renderer |
| styled-components / emotion | CSS-in-JS adds runtime overhead; not compatible with @react-pdf/renderer's own styling system; not the ecosystem direction in 2026 | Tailwind CSS (for preview), inline styles (for PDF templates) |
| pdf-parse (for production) | Wraps older PDF.js; less maintained; version 2.x rewrite changes API | pdfjs-dist directly |
| next lint command | Removed in Next.js 16 | Run `eslint` directly |
| TypeScript < 5.5 | Zod 4 only tested against TS 5.5+; missing inference improvements | TypeScript 5.5+ |
| Webpack as bundler | Turbopack is default in Next.js 16; only revert to webpack if you have a custom webpack plugin with no Turbopack equivalent | Turbopack (default, no config needed) |

---

## Stack Patterns by Variant

**For anonymous users (no login):**
- Use `localStorage` for resume persistence — no database, no auth, no session
- Keep all resume data in a single Zustand store (or React state lifted to root) serialized to localStorage on change
- Export works entirely client-side: @react-pdf/renderer (PDF), docx (DOCX)

**For authenticated users:**
- Better Auth session validates API routes
- Drizzle + Postgres stores resume documents as JSONB column (schema-flexible)
- Resume data syncs on save via a debounced Server Action

**For resume template rendering:**
- Preview component: standard React + Tailwind CSS in the browser
- PDF export: same data → @react-pdf/renderer Document/Page/View components (separate component file, uses @react-pdf/renderer's own style API, NOT Tailwind)
- DOCX export: same data → docx library's Document/Paragraph/TextRun API

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| @react-pdf/renderer@4.x | React 19 (since 4.1.0) | Confirmed compatible with React 19.2 shipped in Next.js 16 |
| pdfjs-dist@5.x | Node.js 18+ | Use in API routes (server-side) only; ESM-only from v4+, import accordingly |
| better-auth@1.x | Next.js 16, Node.js 20.9+ | Next.js 16 requires Node 20.9+; better-auth runs in Node runtime (not edge) |
| drizzle-orm@0.45.x | Node.js 18+, Next.js 16 | Works in Server Actions and API routes; do NOT use in edge middleware |
| zod@4.x | TypeScript 5.5+ | Explicitly tested against TS 5.5; use TS 5.5 or later |
| docx@9.6.x | Browser + Node.js | Works client-side; pair with file-saver for download trigger |
| react-hook-form@7.x | React 18, React 19 | No issues with App Router or React 19 |

---

## Sources

- [Next.js 16 official blog post](https://nextjs.org/blog/next-16) — version confirmed (16.2.x stable as of Feb 2026), Turbopack default, React Compiler stable, Node 20.9+ minimum (HIGH confidence)
- [pdfjs-dist on Libraries.io](https://libraries.io/npm/pdfjs-dist) — version 5.4.624 confirmed current (MEDIUM confidence — version from search result)
- [pdf-parse npm](https://www.npmjs.com/package/pdf-parse) — v2.4.5 latest; noted as alternative (MEDIUM confidence)
- [@react-pdf/renderer npm search result](https://www.npmjs.com/package/@react-pdf/renderer) — v4.3.2 confirmed current; React 19 support since 4.1.0 (HIGH confidence)
- [docx npm](https://www.npmjs.com/package/docx) — v9.6.0 confirmed, 445K weekly downloads (HIGH confidence)
- [react-hook-form releases](https://github.com/react-hook-form/react-hook-form/releases) — v7.71.2 confirmed current (HIGH confidence)
- [Zod v4 InfoQ announcement](https://www.infoq.com/news/2025/08/zod-v4-available/) — v4.3.6 stable; 14x faster, TS 5.5+ required (HIGH confidence)
- [better-auth npm](https://www.npmjs.com/package/better-auth) — v1.4.20 confirmed, v1.0 stable, actively maintained (HIGH confidence)
- [Auth.js absorbed by Better Auth discussion](https://github.com/nextauthjs/next-auth/discussions/13252) — confirmed ecosystem consolidation (MEDIUM confidence — single source, GitHub discussion)
- [Drizzle ORM npm](https://www.npmjs.com/drizzle-orm) — v0.45.1 confirmed current (HIGH confidence)
- [Tailwind CSS v4 blog](https://tailwindcss.com/blog/tailwindcss-v4) — v4.1.x confirmed stable, CSS-native variables (HIGH confidence)
- [Lucia Auth deprecation](https://github.com/lucia-auth/lucia) — deprecated March 2025 (MEDIUM confidence — from multiple community sources)
- [react-pdf App Router issues](https://github.com/diegomura/react-pdf/issues/2460) — SSR incompatibility confirmed; dynamic import workaround documented (HIGH confidence — official GitHub issues)
- [Drizzle vs Prisma 2026](https://designrevision.com/blog/prisma-vs-drizzle) — Drizzle recommended for serverless/small-team projects (MEDIUM confidence — editorial comparison)
- [Tailwind CSS in resume builder ecosystem](https://github.com/olyaiy/resume-lm) — confirmed as dominant styling approach in resume builder projects (MEDIUM confidence — GitHub ecosystem survey)

---

*Stack research for: Resume/CV Builder Web Application (Next.js fullstack)*
*Researched: 2026-03-01*
