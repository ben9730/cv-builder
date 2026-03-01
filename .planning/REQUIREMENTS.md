# Requirements: CV Builder

**Defined:** 2026-03-01
**Core Value:** Users can quickly produce a polished, professional resume — whether starting fresh or importing an existing document — and export it in the format they need.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUN-01**: Resume data model supports ordered sections with structured fields (contact, summary, experience, education, skills)
- [x] **FOUN-02**: Data model supports optional section types (certifications, projects, languages, volunteer)
- [x] **FOUN-03**: Resume data persists in localStorage for anonymous users across page refreshes
- [x] **FOUN-04**: Resume data is serializable to JSON for storage and export

### Editor

- [x] **EDIT-01**: User can fill in contact information (name, title, email, phone, location, website/LinkedIn)
- [x] **EDIT-02**: User can write a professional summary in a text area
- [ ] **EDIT-03**: User can add, edit, and remove work experience entries (employer, title, dates, bullet points)
- [ ] **EDIT-04**: User can add, edit, and remove education entries (degree, institution, year, GPA)
- [ ] **EDIT-05**: User can add, edit, and remove skills (freeform tags or structured list)
- [ ] **EDIT-06**: User can add optional sections: certifications, projects, languages, volunteer work
- [ ] **EDIT-07**: User can add and remove multiple entries within each section

### Templates

- [ ] **TMPL-01**: 3 professional, ATS-safe resume templates with distinct visual styles
- [ ] **TMPL-02**: Templates render resume data without internal state (pure renderers)
- [ ] **TMPL-03**: User can switch between templates without losing entered data

### Preview

- [ ] **PREV-01**: Live preview updates in real-time as user edits form fields
- [ ] **PREV-02**: Preview accurately represents the final exported PDF layout

### Import

- [ ] **IMPT-01**: User can upload a PDF file and have it parsed into structured resume sections
- [ ] **IMPT-02**: User can upload a text file and have it parsed into structured resume sections
- [ ] **IMPT-03**: After import, user can review and correct parsed sections before accepting

### Export

- [ ] **EXPT-01**: User can export resume as a PDF with selectable text (ATS-friendly)
- [ ] **EXPT-02**: User can export resume as a DOCX file matching the resume structure

### Persistence

- [x] **PERS-01**: Anonymous user data saved to localStorage automatically
- [ ] **PERS-02**: User can export resume data as JSON file (backup for localStorage volatility)

### UI

- [ ] **UI-01**: Responsive web interface usable on desktop and mobile
- [ ] **UI-02**: Clean, intuitive form layout with clear section navigation

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Accounts

- **ACCT-01**: User can create an account to save resumes to the cloud
- **ACCT-02**: User can sync resumes across devices via account
- **ACCT-03**: User can log in and access previously saved resumes

### Editor Enhancements

- **EDENH-01**: User can reorder sections via up/down controls
- **EDENH-02**: User can show/hide sections without deleting content
- **EDENH-03**: Color and font customization within templates

### Export Enhancements

- **EXENH-01**: Plain text export for copy-paste into application forms
- **EXENH-02**: Resume sharing via public URL (requires account)

### Templates

- **TMENH-01**: Additional templates (4th and 5th)

## Out of Scope

| Feature | Reason |
|---------|--------|
| AI content generation | API costs, latency, prompt engineering complexity; defer to v2+ |
| WYSIWYG drag-and-drop editor | Unreliable for export, breaks ATS; form-based chosen instead |
| Export paywall / freemium gating | Destroys user trust; top complaint about competitors |
| Real-time collaboration | WebSocket complexity; single-user tool for v1 |
| Cover letter builder | Doubles scope; different document structure entirely |
| Job board integration | Changes product from tool to platform; out of scope |
| ATS score checker | Significant analysis logic; separate product focus |
| Mobile native app | Web-first with responsive design covers mobile |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1 | Complete |
| FOUN-02 | Phase 1 | Complete |
| FOUN-03 | Phase 1 | Complete |
| FOUN-04 | Phase 1 | Complete |
| PERS-01 | Phase 1 | Complete |
| EDIT-01 | Phase 2 | Complete |
| EDIT-02 | Phase 2 | Complete |
| EDIT-03 | Phase 2 | Pending |
| EDIT-04 | Phase 2 | Pending |
| EDIT-05 | Phase 2 | Pending |
| EDIT-06 | Phase 2 | Pending |
| EDIT-07 | Phase 2 | Pending |
| UI-01 | Phase 2 | Pending |
| UI-02 | Phase 2 | Pending |
| TMPL-01 | Phase 3 | Pending |
| TMPL-02 | Phase 3 | Pending |
| TMPL-03 | Phase 3 | Pending |
| PREV-01 | Phase 3 | Pending |
| PREV-02 | Phase 3 | Pending |
| EXPT-01 | Phase 3 | Pending |
| EXPT-02 | Phase 3 | Pending |
| PERS-02 | Phase 3 | Pending |
| IMPT-01 | Phase 4 | Pending |
| IMPT-02 | Phase 4 | Pending |
| IMPT-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0

---
*Requirements defined: 2026-03-01*
*Last updated: 2026-03-01 after roadmap creation — all 25 requirements mapped*
