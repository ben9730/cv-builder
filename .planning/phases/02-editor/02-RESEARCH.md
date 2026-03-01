# Phase 2: Editor - Research

**Researched:** 2026-03-01
**Domain:** Form-based resume editing with React Hook Form, shadcn/ui, Zustand
**Confidence:** HIGH

## Summary

Phase 2 builds a form-based editor UI for all resume sections. The standard approach is react-hook-form v7 with Zod 4 validation (via @hookform/resolvers), shadcn/ui for accessible UI components, and Zustand for state management (already in place from Phase 1). The key patterns are: Controller-based form fields with shadcn Field components, useFieldArray for dynamic entry management (work experience, education, skills, etc.), and sonner for undo toasts on delete actions.

shadcn/ui now supports Tailwind CSS v4 and React 19. The CLI can initialize into an existing project. Components are copied into the codebase (not imported from node_modules), providing full control over styling and behavior. The form integration pattern uses React Hook Form's Controller with shadcn's Field/FieldLabel/FieldError components for accessible, validated forms.

**Primary recommendation:** Install shadcn/ui via CLI, add react-hook-form + @hookform/resolvers, build section forms using Controller + useFieldArray pattern, extend Zustand store with per-section CRUD actions.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Sidebar + content area layout: section list on the left, selected section's form on the right
- Sidebar shows section name + completion hint (subtle indicator like checkmark or dot showing if section has content)
- Core sections always visible in sidebar: Contact, Summary, Experience, Education, Skills
- Optional sections (Certifications, Projects, Languages, Volunteer) added via "Add section" button — not shown until user adds them
- Default selected section on load: Contact info (always, even for returning users)
- Expandable cards: each entry (e.g., work experience item) is a compact card showing key info (title/company). Click to expand and edit the full form inline
- "Add entry" button at the bottom of the section's entry list — adds a new empty card that auto-expands
- Delete: trash icon on each card, instant removal with undo toast ("Entry removed. Undo?") — no confirmation dialog
- Bullet points (work highlights): simple stacked text inputs, one per bullet. "+ Add bullet" button below. Delete icon on each
- Grouped rows: each skill entry has a category name (e.g., "Frontend") + keyword tags (e.g., React, TypeScript)
- Level field hidden — just category name + tags. Simpler for v1
- Tag input: type + Enter to add a tag pill. Backspace removes last tag
- No preset categories or suggestions — blank slate, user creates their own groups
- Sidebar always visible on desktop (not collapsible)
- Fixed section order for v1: Contact, Summary, Experience, Education, Skills, then any added optional sections
- Section order in sidebar matches resume output order

### Claude's Discretion
- Mobile layout adaptation (how sidebar + content collapses on small screens)
- Section transition animation (instant vs subtle fade)
- Exact spacing, typography, and color theming within shadcn/ui defaults
- Empty state messaging when a section has no entries
- Form validation UX (inline errors, when to validate)

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EDIT-01 | User can fill in contact information (name, title, email, phone, location, website/LinkedIn) | ContactSchema already exists; react-hook-form with zodResolver validates against it; shadcn Input/Field components |
| EDIT-02 | User can write a professional summary in a text area | Textarea component from shadcn/ui; single field bound to basics.summary |
| EDIT-03 | User can add, edit, and remove work experience entries (employer, title, dates, bullet points) | useFieldArray for work entries; expandable cards pattern; bullet points as nested field array |
| EDIT-04 | User can add, edit, and remove education entries (degree, institution, year, GPA) | useFieldArray for education entries; same expandable card pattern |
| EDIT-05 | User can add, edit, and remove skills (freeform tags or structured list) | useFieldArray for skill groups; custom tag input component for keywords array |
| EDIT-06 | User can add optional sections: certifications, projects, languages, volunteer work | "Add section" button adds section to sidebar; optional arrays initialized when section added |
| EDIT-07 | User can add and remove multiple entries within each section | useFieldArray provides append/remove; undo toast via sonner on remove |
| UI-01 | Responsive web interface usable on desktop and mobile | shadcn/ui responsive primitives; sidebar collapses to mobile nav on small screens |
| UI-02 | Clean, intuitive form layout with clear section navigation | Sidebar + content area layout with section completion hints |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | ^7.71 | Form state management, validation | Industry standard for React forms; uncontrolled by default for performance; extensive ecosystem |
| @hookform/resolvers | ^5.2 | Zod schema-to-form-validation bridge | Official resolver package; auto-detects Zod v3/v4 at runtime |
| shadcn/ui | latest (CLI) | Accessible UI component primitives | Copy-to-codebase model; full Tailwind v4 + React 19 support; includes Field, Input, Card, Button, Badge, Sonner |
| sonner | latest | Toast notifications with undo actions | shadcn/ui recommended replacement for deprecated Toast component; supports action buttons for undo pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | latest | Icon library | Icons for sidebar, add/remove buttons, trash icons — shadcn/ui default icon library |
| tw-animate-css | latest | Animation utilities for Tailwind v4 | Replaces deprecated tailwindcss-animate; card expand/collapse animations |
| clsx + tailwind-merge | latest | Conditional class merging | shadcn/ui cn() utility dependency — already included by shadcn init |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-hook-form | Formik | RHF is more performant (uncontrolled), better TypeScript support, smaller bundle |
| shadcn/ui | Radix primitives directly | shadcn provides pre-styled components; saves significant styling effort |
| sonner | react-hot-toast | sonner is shadcn/ui's recommended toast; has built-in undo action pattern |

**Installation:**
```bash
npx shadcn@latest init
npx shadcn@latest add button input textarea card badge sonner separator field label
npm install react-hook-form @hookform/resolvers
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── layout.tsx          # Add Toaster from sonner
│   └── page.tsx            # Editor page (sidebar + content)
├── components/
│   ├── ui/                 # shadcn/ui components (auto-generated)
│   ├── editor/
│   │   ├── sidebar.tsx             # Section navigation sidebar
│   │   ├── editor-layout.tsx       # Sidebar + content area wrapper
│   │   ├── section-form.tsx        # Section form router (renders correct form for selected section)
│   │   ├── contact-form.tsx        # Contact info form
│   │   ├── summary-form.tsx        # Summary textarea form
│   │   ├── experience-form.tsx     # Work experience with useFieldArray
│   │   ├── education-form.tsx      # Education entries with useFieldArray
│   │   ├── skills-form.tsx         # Skills with tag input
│   │   ├── certifications-form.tsx # Optional section
│   │   ├── projects-form.tsx       # Optional section
│   │   ├── languages-form.tsx      # Optional section
│   │   ├── volunteer-form.tsx      # Optional section
│   │   └── entry-card.tsx          # Reusable expandable card component
│   └── shared/
│       └── tag-input.tsx           # Tag input component for skills keywords
├── hooks/
│   ├── use-hydration.ts            # Existing
│   └── use-section-nav.ts          # Section selection state
├── lib/
│   ├── schema/
│   │   └── resume-schema.ts        # Existing Zod schemas
│   ├── store/
│   │   └── resume-store.ts         # Extended with per-section CRUD actions
│   └── utils.ts                    # cn() utility (shadcn generates this)
└── types/
    └── resume.ts                   # Existing TypeScript types
```

### Pattern 1: Form-to-Store Sync
**What:** Each section form reads from Zustand store and writes back on change via debounced auto-save
**When to use:** Every form component
**Example:**
```typescript
// Form reads from store, syncs back on change
const resume = useResumeStore((s) => s.resume)
const updateWork = useResumeStore((s) => s.updateWork)

const form = useForm<WorkFormValues>({
  resolver: zodResolver(WorkFormSchema),
  defaultValues: { work: resume.work },
  mode: 'onBlur',
})

// Watch for changes and sync to store
useEffect(() => {
  const subscription = form.watch((value) => {
    if (value.work) updateWork(value.work as WorkEntry[])
  })
  return () => subscription.unsubscribe()
}, [form, updateWork])
```

### Pattern 2: Expandable Entry Card
**What:** Collapsible card showing summary when collapsed, full form when expanded
**When to use:** Work experience, education, certifications, projects, volunteer entries
**Example:**
```typescript
function EntryCard({ index, expanded, onToggle, onRemove, summary, children }) {
  return (
    <Card>
      <CardHeader onClick={onToggle} className="cursor-pointer">
        <div className="flex items-center justify-between">
          <span>{summary || 'New Entry'}</span>
          <div className="flex gap-2">
            <ChevronDown className={cn("transition-transform", expanded && "rotate-180")} />
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onRemove() }}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {expanded && <CardContent>{children}</CardContent>}
    </Card>
  )
}
```

### Pattern 3: Controller + Field Pattern (shadcn/ui forms)
**What:** React Hook Form Controller wrapping shadcn Field for accessible validated inputs
**When to use:** Every form field
**Example:**
```typescript
<Controller
  name="basics.name"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

### Pattern 4: Tag Input for Skills
**What:** Custom input that converts typed text into tag pills on Enter, removes on Backspace
**When to use:** Skills keywords field
**Example:**
```typescript
function TagInput({ value = [], onChange }) {
  const [input, setInput] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      onChange([...value, input.trim()])
      setInput('')
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-wrap gap-1 rounded-md border p-2">
      {value.map((tag, i) => (
        <Badge key={i} variant="secondary">
          {tag}
          <button onClick={() => onChange(value.filter((_, j) => j !== i))}>
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-20 bg-transparent outline-none"
        placeholder="Type and press Enter..."
      />
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Controlled inputs for every field:** React Hook Form is uncontrolled by default — only use Controller when integrating with UI libraries like shadcn, not raw `<input>` elements
- **Full re-render on every keystroke:** Never pass the entire Zustand state as form defaultValues if you're watching all fields — use selective subscriptions
- **Form state as source of truth:** Zustand store is the source of truth. Forms read from store, sync back. Don't try to derive store from form.
- **Index as key in useFieldArray:** Always use `field.id` (auto-generated by RHF), never array index, or fields will break on reorder/remove
- **Missing accessibility attributes:** Always include aria-invalid on inputs, data-invalid on Field wrapper, and id matching label htmlFor

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form state management | Custom useState per field | react-hook-form useForm | Validation, dirty tracking, error handling, performance |
| Array field management | Manual array state + splice | useFieldArray | Handles ids, focus management, validation per item |
| Toast with undo | Custom toast system | sonner with action button | Undo pattern built-in, auto-dismiss, stacking |
| Tag/chip input | Full custom with focus traps | Custom TagInput with shadcn Badge | Simple enough to build, but use Badge for consistent styling |
| Responsive sidebar | CSS-only media query toggle | Tailwind responsive classes + mobile Sheet | shadcn Sheet component for mobile overlay |
| Form validation | Manual validation logic | zodResolver + existing Zod schemas | Reuse Phase 1 schemas directly; type-safe; consistent |

**Key insight:** react-hook-form and shadcn/ui solve 90% of form complexity. The only custom component needed is TagInput for skills keywords. Everything else composes from existing primitives.

## Common Pitfalls

### Pitfall 1: Zustand Hydration Mismatch
**What goes wrong:** SSR renders default state, client hydrates with localStorage data, React throws hydration error
**Why it happens:** Zustand persist loads async; server and client render different content
**How to avoid:** useHydration hook already exists (from Phase 1). Every client component that reads from store MUST check `if (!hydrated) return <Skeleton />` before rendering store data
**Warning signs:** Console warnings about hydration mismatches; flickering on page load

### Pitfall 2: useFieldArray + defaultValues Stale Reference
**What goes wrong:** Form shows stale data after store update because defaultValues are only read on mount
**Why it happens:** react-hook-form caches defaultValues; useFieldArray doesn't auto-sync with external state
**How to avoid:** Use `form.reset(newValues)` when store data changes externally, or design so forms are the input mechanism and store is the persistence layer (one-way: form -> store via watch)
**Warning signs:** Adding an entry in one tab, switching sections, coming back shows old data

### Pitfall 3: Missing field.id as Key
**What goes wrong:** Removing an entry causes the wrong entry's data to appear in remaining fields
**Why it happens:** Using array index as React key; React reuses DOM nodes by index position
**How to avoid:** Always use `key={field.id}` from useFieldArray's fields array
**Warning signs:** Delete middle entry → last entry's data appears in the slot above

### Pitfall 4: Zod 4 Default Nested Objects
**What goes wrong:** Nested .default({}) returns raw empty object instead of parsed defaults
**Why it happens:** Zod 4 changed default behavior for nested objects (documented in Phase 1 decisions)
**How to avoid:** Use pre-parsed constants for nested defaults (pattern already established in resume-schema.ts with DEFAULT_BASICS)
**Warning signs:** Contact form fields undefined on first render

### Pitfall 5: shadcn/ui Init Overwrites globals.css
**What goes wrong:** Running `npx shadcn@latest init` replaces your globals.css with its template
**Why it happens:** The CLI assumes fresh project setup
**How to avoid:** Back up globals.css before running init, or manually merge the CSS variables it needs
**Warning signs:** All existing Tailwind styles disappear after running init

### Pitfall 6: Form Submission vs Auto-Save
**What goes wrong:** Building a submit button when auto-save is the desired behavior
**Why it happens:** Tutorial code always shows form.handleSubmit; auto-save is different pattern
**How to avoid:** Use form.watch() subscription to sync to store on change, not onSubmit. No submit button needed — forms auto-persist via Zustand + localStorage
**Warning signs:** Users clicking "Save" button that doesn't exist; data loss on navigation

## Code Examples

### Zustand Store Extension (per-section CRUD)
```typescript
// Additional actions for resume-store.ts
interface ResumeStore {
  // ... existing
  updateWork: (work: WorkEntry[]) => void
  addWorkEntry: () => void
  removeWorkEntry: (index: number) => void
  updateEducation: (education: EducationEntry[]) => void
  addEducationEntry: () => void
  removeEducationEntry: (index: number) => void
  updateSkills: (skills: SkillEntry[]) => void
  addSkillEntry: () => void
  removeSkillEntry: (index: number) => void
  // Optional sections
  enableSection: (section: 'certificates' | 'projects' | 'languages' | 'volunteer') => void
  disableSection: (section: 'certificates' | 'projects' | 'languages' | 'volunteer') => void
}
```

### Undo Toast on Delete
```typescript
import { toast } from 'sonner'

function handleRemoveEntry(index: number) {
  const removed = fields[index]  // capture before removing
  remove(index)  // useFieldArray remove

  toast('Entry removed', {
    action: {
      label: 'Undo',
      onClick: () => {
        insert(index, removed)  // useFieldArray insert
      },
    },
    duration: 5000,
  })
}
```

### Mobile-Responsive Sidebar Layout
```typescript
// Desktop: sidebar always visible
// Mobile: sidebar becomes top tabs or Sheet overlay
<div className="flex min-h-screen">
  {/* Desktop sidebar */}
  <aside className="hidden md:block w-64 border-r p-4">
    <SectionNav sections={sections} active={active} onSelect={setActive} />
  </aside>

  {/* Mobile: horizontal scroll tabs or Sheet */}
  <div className="md:hidden border-b p-2">
    <div className="flex gap-2 overflow-x-auto">
      {sections.map(s => (
        <Button key={s.id} variant={active === s.id ? 'default' : 'ghost'} size="sm"
          onClick={() => setActive(s.id)}>
          {s.label}
        </Button>
      ))}
    </div>
  </div>

  {/* Content area */}
  <main className="flex-1 p-6 max-w-2xl mx-auto">
    <SectionForm section={active} />
  </main>
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwindcss-animate | tw-animate-css | March 2025 | Must use tw-animate-css with Tailwind v4 |
| shadcn Toast component | sonner | 2025 | Toast is deprecated; use Sonner for all toasts |
| React.forwardRef | React.ComponentProps | React 19 | shadcn components no longer use forwardRef |
| HSL color format | OKLCH color format | March 2025 | shadcn/ui v4 themes use OKLCH; better color accuracy |
| tailwind.config.js | CSS-first @theme | Tailwind v4 | No JS config file; use @theme inline in CSS |
| react-hook-form v8 beta | react-hook-form v7.71 stable | Jan 2026 | v8 is beta with breaking changes; stick with v7 stable |
| @hookform/resolvers Zod v3 only | Auto-detects Zod v3/v4 | resolvers v5.2 | No special config needed for Zod 4 |

**Deprecated/outdated:**
- tailwindcss-animate: Use tw-animate-css for Tailwind v4
- shadcn Toast: Use sonner
- React.forwardRef: Use React.ComponentProps in React 19

## Open Questions

1. **shadcn/ui init with existing Tailwind v4 project**
   - What we know: shadcn CLI supports Tailwind v4 init; project already has Tailwind v4 configured via @tailwindcss/postcss
   - What's unclear: Exact behavior of `npx shadcn@latest init` when globals.css already has custom content
   - Recommendation: Run init, then manually verify globals.css wasn't clobbered; merge CSS variables if needed

2. **Form validation mode**
   - What we know: Options are onChange, onBlur, onSubmit, onTouched, all
   - What's unclear: Best UX for resume forms (user discretion area)
   - Recommendation: Use `mode: 'onBlur'` — validates when user leaves field, doesn't interrupt typing. Less aggressive than onChange, more responsive than onSubmit

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 + @testing-library/react 16.3.2 |
| Config file | vitest.config.mts (exists) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EDIT-01 | Contact form renders, accepts input, saves to store | integration | `npx vitest run src/__tests__/contact-form.test.tsx -x` | No - Wave 0 |
| EDIT-02 | Summary textarea renders, accepts input, saves to store | integration | `npx vitest run src/__tests__/summary-form.test.tsx -x` | No - Wave 0 |
| EDIT-03 | Work entries: add, edit, remove with expandable cards | integration | `npx vitest run src/__tests__/experience-form.test.tsx -x` | No - Wave 0 |
| EDIT-04 | Education entries: add, edit, remove | integration | `npx vitest run src/__tests__/education-form.test.tsx -x` | No - Wave 0 |
| EDIT-05 | Skills: add groups, add/remove tags | integration | `npx vitest run src/__tests__/skills-form.test.tsx -x` | No - Wave 0 |
| EDIT-06 | Optional sections: add section, add entries | integration | `npx vitest run src/__tests__/optional-sections.test.tsx -x` | No - Wave 0 |
| EDIT-07 | Multi-entry add/remove across all sections | integration | `npx vitest run src/__tests__/entry-management.test.tsx -x` | No - Wave 0 |
| UI-01 | Responsive layout renders on mobile and desktop viewports | integration | `npx vitest run src/__tests__/editor-layout.test.tsx -x` | No - Wave 0 |
| UI-02 | Section navigation works, sidebar shows completion hints | integration | `npx vitest run src/__tests__/sidebar.test.tsx -x` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before verification

### Wave 0 Gaps
- [ ] Install shadcn/ui, react-hook-form, @hookform/resolvers
- [ ] Extend Zustand store with per-section CRUD actions
- [ ] Test files for each form component (listed above)
- [ ] Store extension tests for new CRUD actions

## Sources

### Primary (HIGH confidence)
- shadcn/ui official docs: ui.shadcn.com/docs/installation/next — installation steps
- shadcn/ui Tailwind v4 docs: ui.shadcn.com/docs/tailwind-v4 — v4 compatibility
- shadcn/ui forms docs: ui.shadcn.com/docs/forms/react-hook-form — Controller + Field pattern
- react-hook-form official docs: react-hook-form.com/docs/useform — useForm API
- react-hook-form useFieldArray: react-hook-form.com/docs/usefieldarray — dynamic fields

### Secondary (MEDIUM confidence)
- @hookform/resolvers npm: npmjs.com/package/@hookform/resolvers — Zod v4 auto-detection confirmed
- sonner docs via shadcn/ui: ui.shadcn.com/docs/components/radix/sonner — toast with undo

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries are well-documented, stable, widely used
- Architecture: HIGH - Controller + useFieldArray + shadcn Field is the documented pattern
- Pitfalls: HIGH - documented in official sources and Phase 1 experience

**Research date:** 2026-03-01
**Valid until:** 2026-03-31 (stable ecosystem, no breaking changes expected)
