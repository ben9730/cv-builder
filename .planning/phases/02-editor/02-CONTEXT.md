# Phase 2: Editor - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Form-based section editing for all resume content. Users can fill in contact info, summary, work experience, education, skills, and optional sections (certifications, projects, languages, volunteer) through a clean responsive interface. Template rendering, preview, and export are Phase 3. Section reordering and show/hide are v2.

</domain>

<decisions>
## Implementation Decisions

### Form layout & flow
- Sidebar + content area layout: section list on the left, selected section's form on the right
- Sidebar shows section name + completion hint (subtle indicator like checkmark or dot showing if section has content)
- Core sections always visible in sidebar: Contact, Summary, Experience, Education, Skills
- Optional sections (Certifications, Projects, Languages, Volunteer) added via "Add section" button — not shown until user adds them
- Default selected section on load: Contact info (always, even for returning users)

### Entry management
- Expandable cards: each entry (e.g., work experience item) is a compact card showing key info (title/company). Click to expand and edit the full form inline
- "Add entry" button at the bottom of the section's entry list — adds a new empty card that auto-expands
- Delete: trash icon on each card, instant removal with undo toast ("Entry removed. Undo?") — no confirmation dialog
- Bullet points (work highlights): simple stacked text inputs, one per bullet. "+ Add bullet" button below. Delete icon on each

### Skills input style
- Grouped rows: each skill entry has a category name (e.g., "Frontend") + keyword tags (e.g., React, TypeScript)
- Level field hidden — just category name + tags. Simpler for v1
- Tag input: type + Enter to add a tag pill. Backspace removes last tag
- No preset categories or suggestions — blank slate, user creates their own groups

### Section navigation
- Sidebar always visible on desktop (not collapsible)
- Fixed section order for v1: Contact, Summary, Experience, Education, Skills, then any added optional sections
- Section order in sidebar matches resume output order

### Claude's Discretion
- Mobile layout adaptation (how sidebar + content collapses on small screens)
- Section transition animation (instant vs subtle fade)
- Exact spacing, typography, and color theming within shadcn/ui defaults
- Empty state messaging when a section has no entries
- Form validation UX (inline errors, when to validate)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ResumeDataSchema` (src/lib/schema/resume-schema.ts): Complete Zod schema with all section types — can derive form validation directly from schema
- `useResumeStore` (src/lib/store/resume-store.ts): Zustand store with `setResume`, `updateBasics`, and `reset` actions. Will need new granular update actions per section (e.g., `addWorkEntry`, `updateWorkEntry`, `removeWorkEntry`)
- `useHydration` hook (src/hooks/use-hydration.ts): SSR hydration handling for Zustand persist — already solved

### Established Patterns
- Zod 4 for validation, Zustand 5 with persist middleware for state
- Next.js 16 App Router with `'use client'` directive for client components
- Tailwind CSS 4 for styling
- No component library installed yet — roadmap plans mention shadcn/ui (needs setup)
- No form library installed yet — roadmap plans mention react-hook-form (needs setup)

### Integration Points
- Store actions: Current store only has `setResume`, `updateBasics`, `reset` — needs section-level CRUD actions
- App entry: `src/app/page.tsx` is a bare placeholder — editor becomes the main page content
- Layout: `src/app/layout.tsx` has minimal wrapper — sidebar layout needs to be integrated here or in the page

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-editor*
*Context gathered: 2026-03-01*
