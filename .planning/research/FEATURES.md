# Feature Research

**Domain:** Resume / CV Builder Web App
**Researched:** 2026-03-01
**Confidence:** MEDIUM-HIGH (competitor analysis from multiple sources; specific implementation details LOW where unverified)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Contact info section | First thing on every resume — name, email, phone, location, LinkedIn | LOW | Fields: name, title, email, phone, location, website/LinkedIn |
| Work experience section | Core of any resume — employer, title, dates, bullet points | LOW | Multiple entries, reverse-chronological order assumed |
| Education section | Required for nearly all job applications | LOW | Degree, institution, graduation year, GPA (optional) |
| Skills section | ATS systems scan for skills; recruiters expect to see them | LOW | Freeform tags or structured list; categories optional |
| Summary / objective section | Hiring managers read this first after name | LOW | Freeform textarea |
| Live preview | Users need to see layout as they type — editing blind is unusable | MEDIUM | Real-time or near-real-time; major differentiator if fast |
| PDF export | Employers expect PDF; it preserves layout across devices | MEDIUM | Must produce a selectable-text PDF (not image-based) for ATS |
| Multiple templates (3+) | Every competitor offers this; one template = no real product | MEDIUM | 3-5 curated, clean, ATS-safe templates for v1 |
| Template switching | Users want to try templates without re-entering data | MEDIUM | Switching must preserve all entered data |
| Works without login | Modern SaaS norm; users won't sign up just to try | LOW | localStorage persistence for anonymous users |
| Responsive web UI | Job seekers use mobile; must be usable on phone | LOW | Form-based editing is naturally responsive |
| Section reordering | Users optimize section order by industry/experience level | MEDIUM | Drag-and-drop or up/down buttons; order persists to export |
| Multiple resume entries per section | Multiple jobs, degrees, skills groups | LOW | Add/remove entries within each section |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued and noted positively by users.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| PDF import with parsing | Users have existing resumes; re-entering everything is a major pain point | HIGH | Core to this project's value prop — parse into structured sections. Accuracy matters enormously; partial parsing with user correction is acceptable |
| DOCX / Word export | Some employers, recruiters, and ATS systems require .docx; many regions default to Word | MEDIUM | Not universally expected but frequently requested; true differentiator vs. PDF-only builders |
| Plain text export | Copy-paste into online application forms; low-friction | LOW | Strip formatting, preserve structure with labels |
| Optional user accounts | Save and sync across devices; return to edit later | MEDIUM | Auth layer with cloud persistence on top of localStorage fallback |
| Optional sections (Certifications, Projects, Languages, Volunteer) | Professionals in tech, academia, and NGOs need these | MEDIUM | Certifications, Projects, Languages, Volunteer Work, Awards — add as optional blocks |
| Per-section show/hide toggle | Users want to hide sections (e.g., "Objective") without deleting content | LOW | Toggle visibility per section; content preserved |
| Color / font customization | Within-template personalization; "make it mine" | MEDIUM | Limit to a constrained palette and 2-3 font pairs per template to prevent ugly output |
| ATS-safe template design | 99% of Fortune 500 use ATS; templates that break parsing hurt users invisibly | LOW | Design concern, not a feature per se — single-column layouts, no tables/columns/headers/footers for text |
| Section-level undo within session | Mistakes happen; losing work is deeply frustrating | MEDIUM | Full undo history is hard; last-value undo per field is acceptable for v1 |
| Resume sharing link | Allow users to share a public URL to their resume (optional) | MEDIUM | Requires accounts; read-only public link tied to a saved resume |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems. Deliberately excluded from v1.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| AI content generation (bullet points, summary writing) | "Write my resume for me" is a common ask; competitors use it as a selling point | Requires LLM integration, API costs, latency, and prompt engineering. Generic AI output produces indistinguishable resumes and is flagged by some employers. Out-of-scope per PROJECT.md | Provide placeholder/example text in fields to guide users without generating content |
| WYSIWYG drag-and-drop editor (Canva-style) | Visual editing feels powerful and intuitive | Produces inconsistent layout data, breaks ATS parsing, is hard to implement reliably for export to PDF/DOCX, and encourages poor formatting choices. Form-based is more reliable | Form-based editor with live preview chosen instead — simpler to build, more predictable |
| Freemium paywall on export | Revenue model used by Resume.io, Zety, Novoresume | Deeply hated by users; top complaint across Trustpilot/Reddit. Locks users out after they've invested time. Destroys trust | Keep export free; monetize via optional features (accounts, premium templates) if needed later |
| Real-time collaboration | Multiple people editing at once | Single-user tool for v1; collaborative editing adds websocket complexity and conflict resolution. Out-of-scope per PROJECT.md | Save/share via link for reviewer feedback is enough |
| Cover letter builder | Natural pairing with resume | Doubles scope; different document structure, different templates, different export logic. Dilutes focus for v1 | Out of scope per PROJECT.md; tackle in v2 if validated |
| Job board integration / one-click apply | Connects resume to job listings | Requires third-party API partnerships, deeply changing the product's scope from "tool" to "platform." High complexity, low build value | Out of scope per PROJECT.md |
| Drag-and-drop section reordering via visual canvas | Feels intuitive | Implementation complexity for a form-based app is high; simpler up/down button reordering achieves the same user goal | Up/down reorder buttons in form panel |
| Unlimited custom sections with free-form fields | Power-user appeal | Breaks structured data model, makes import/export unpredictable, and complicates template rendering | Support a defined set of optional section types (Certifications, Projects, Languages, Volunteer, Awards) |

---

## Feature Dependencies

```
[PDF / Text Import]
    └──requires──> [Section Data Model] (structured schema: contact, experience, education, skills, etc.)
                       └──requires──> [Form Editor]
                       └──requires──> [PDF Export]
                       └──requires──> [DOCX Export]
                       └──requires──> [Plain Text Export]
                       └──requires──> [Template Renderer]

[Template Switching]
    └──requires──> [Section Data Model]
    └──requires──> [Template Renderer]

[Live Preview]
    └──requires──> [Template Renderer]
    └──requires──> [Section Data Model]

[Optional Sections (Certs, Projects, Languages)]
    └──requires──> [Section Data Model] (must support variable section list)
    └──requires──> [Form Editor] (per-section form panels)

[User Accounts]
    └──requires──> [Section Data Model] (data must be serializable)
    └──enhances──> [Resume Sharing Link] (account = identity for share link)

[Section Reordering]
    └──requires──> [Section Data Model] (sections must be ordered list, not fixed schema)

[Resume Sharing Link]
    └──requires──> [User Accounts]

[Color / Font Customization]
    └──enhances──> [Template Renderer]
    └──requires──> [Section Data Model] (customization stored per-resume)
```

### Dependency Notes

- **Section Data Model is the foundational dependency:** Every feature depends on a well-structured, ordered, serializable data schema. This must be designed first and designed well. Retrofitting it later causes rewrites.
- **PDF Import requires Section Data Model to exist first:** The parser needs a target schema to map extracted text into. Build the schema and form editor before attempting import parsing.
- **Live Preview requires Template Renderer:** Renderer must be fast enough for near-real-time updates. React-pdf or similar must re-render on state changes without full page reload.
- **Resume Sharing Link requires User Accounts:** A share URL needs a stable identity. Anonymous localStorage data has no stable identity to share from.
- **DOCX Export is independent of PDF Export:** Both read from the same data model but use entirely different generation libraries (e.g., docx.js vs. @react-pdf/renderer). Build separately.
- **Section Reordering requires sections to be stored as an ordered array:** A fixed-key object schema (e.g., `{ contact: ..., experience: ..., education: ... }`) cannot support reordering without a schema redesign.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — validates the core use case: import, edit, preview, export.

- [ ] **Section Data Model** — Ordered, serializable schema with all standard sections (contact, summary, experience, education, skills) plus optional section types (certifications, projects, languages, volunteer)
- [ ] **Form-based editor** — Per-section form panels, add/remove entries within sections, show/hide toggle per section
- [ ] **Live preview** — Real-time or near-real-time rendering of the selected template
- [ ] **3 professional templates** — ATS-safe single-column layouts; clean, modern, distinct from each other
- [ ] **Template switching** — Switch template without losing data
- [ ] **PDF export** — Selectable text (not image-based), ATS-parseable
- [ ] **DOCX export** — Clean .docx output matching resume structure
- [ ] **Plain text export** — Structured, labeled plain text for copy-paste into forms
- [ ] **PDF / text import with parsing** — Parse uploaded file into section data model; handle partial parsing gracefully with user correction
- [ ] **localStorage persistence** — Works fully without login; state survives page refresh
- [ ] **Section reordering** — Up/down controls per section in the editor panel
- [ ] **Responsive UI** — Usable on mobile (form-based approach handles this naturally)

### Add After Validation (v1.x)

Add once core is working and users have validated the core loop.

- [ ] **Optional user accounts** — Trigger: users request cross-device sync or ask "how do I save my resume?"
- [ ] **Color / font customization within templates** — Trigger: user feedback that templates feel "too rigid" or "not mine"
- [ ] **Resume sharing link** — Trigger: accounts are live; shares need a stable identity
- [ ] **Additional templates (4th and 5th)** — Trigger: user research shows demand for a specific style not covered by initial 3

### Future Consideration (v2+)

Defer until product-market fit is established.

- [ ] **AI content suggestions** — Requires LLM integration and API cost model; out of scope per PROJECT.md
- [ ] **ATS score checker / keyword matching** — Useful but requires significant analysis logic; separate product focus
- [ ] **Cover letter builder** — Natural v2 extension once resume builder is validated
- [ ] **Multi-language UI** — Internationalization adds complexity; English-first for v1
- [ ] **LinkedIn / JSON resume import** — Additional import vector; validate demand first
- [ ] **Collaboration / share for feedback** — Requires accounts; niche use case for v1

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Section Data Model | HIGH | MEDIUM | P1 |
| Form-based editor | HIGH | MEDIUM | P1 |
| Live preview | HIGH | MEDIUM | P1 |
| PDF export | HIGH | MEDIUM | P1 |
| PDF import with parsing | HIGH | HIGH | P1 |
| 3 templates | HIGH | MEDIUM | P1 |
| Template switching | HIGH | LOW | P1 |
| localStorage persistence | HIGH | LOW | P1 |
| DOCX export | MEDIUM | MEDIUM | P1 |
| Plain text export | MEDIUM | LOW | P1 |
| Section reordering | MEDIUM | MEDIUM | P1 |
| Responsive UI | HIGH | LOW | P1 |
| Optional sections (certs, projects) | MEDIUM | MEDIUM | P1 |
| Per-section show/hide toggle | MEDIUM | LOW | P1 |
| User accounts | MEDIUM | HIGH | P2 |
| Color / font customization | LOW | MEDIUM | P2 |
| Resume sharing link | LOW | MEDIUM | P2 |
| 4th / 5th templates | LOW | LOW | P2 |
| ATS score checker | MEDIUM | HIGH | P3 |
| AI content generation | HIGH | HIGH | P3 |
| Cover letter builder | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Novoresume | Enhancv | Reactive Resume (OSS) | Our Approach |
|---------|------------|---------|-----------------------|--------------|
| Templates | 16 (8 free) | 20 | 12 (all free) | 3-5 curated, all unlocked |
| Live preview | Yes, real-time | Yes | Yes | Yes, real-time |
| PDF export | Yes | Yes | Yes | Yes |
| DOCX export | No | No | No | Yes — differentiator |
| Plain text export | No | No | No | Yes — differentiator |
| PDF import | No | No | Yes (parser) | Yes — core feature |
| Section reordering | Premium only | Yes | Yes | Yes, free |
| Optional sections | Premium only | 26 sections | Yes | Defined set (certs, projects, languages, volunteer) |
| User accounts | Required | Required | Optional | Optional, localStorage fallback |
| AI features | Yes | Yes | Bring-your-own-key | Deferred to v2 |
| Pricing model | Freemium (export paywalled) | Freemium | Free / self-host | Free (no paywall on export) |
| ATS checker | No | Yes | No | Deferred to v2 |

**Key takeaway:** Most established competitors paywall export and section customization. An open, no-paywall approach with DOCX + plain text export and PDF import is a genuine gap in the market. The Reactive Resume open-source project is the closest functional analog but lacks DOCX/plain text export.

---

## Sources

- [TechRadar: Best resume builder of 2025](https://www.techradar.com/best/best-resume-builder) — feature comparison across major builders
- [Kickresume: Top 10 Best Resume Builders](https://www.kickresume.com/en/help-center/10-best-resume-builders/) — feature table for 10 builders
- [Teal HQ: 11 Best Resume Builders 2026](https://www.tealhq.com/post/best-resume-builders) — competitor analysis
- [OpenResume on GitHub](https://github.com/xitanggg/open-resume) — open-source reference for PDF parsing and builder implementation
- [Reactive Resume on GitHub](https://github.com/AmruthPillai/Reactive-Resume) — open-source reference for full-featured builder
- [Novoresume review (Enhancv)](https://enhancv.com/blog/novoresume-review/) — feature detail for Novoresume
- [Zety review and feature breakdown](https://zety.com/blog/best-online-resume-builders) — competitor features
- [The Truth About Free Resume Builders (Hirective)](https://www.hirective.com/learn/avoid-hidden-costs-in-free-resume-builders) — freemium dark patterns
- [Resume parsing 2026 overview (MokaHR)](https://www.mokahr.io/articles/en/the-best-resume-parsing-for-pdf-and-images) — PDF parsing accuracy expectations
- [10 Essential Resume Sections (Novoresume)](https://novoresume.com/career-blog/resume-sections) — standard section taxonomy
- [Resume Sections (Enhancv)](https://enhancv.com/blog/resume-sections/) — optional sections taxonomy
- [Reactive Resume changelog](https://docs.rxresu.me/changelog) — undo/redo as recognized UX need

---

*Feature research for: Resume / CV Builder Web App*
*Researched: 2026-03-01*
