'use client'

import { ContactForm } from '@/components/editor/contact-form'
import { SummaryForm } from '@/components/editor/summary-form'
import { ExperienceForm } from '@/components/editor/experience-form'
import { EducationForm } from '@/components/editor/education-form'
import { SkillsForm } from '@/components/editor/skills-form'
import { CertificationsForm } from '@/components/editor/certifications-form'
import { ProjectsForm } from '@/components/editor/projects-form'
import { LanguagesForm } from '@/components/editor/languages-form'
import { VolunteerForm } from '@/components/editor/volunteer-form'

const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  contact: ContactForm,
  summary: SummaryForm,
  experience: ExperienceForm,
  education: EducationForm,
  skills: SkillsForm,
  certificates: CertificationsForm,
  projects: ProjectsForm,
  languages: LanguagesForm,
  volunteer: VolunteerForm,
}

interface SectionFormProps {
  activeSection: string
}

export function SectionForm({ activeSection }: SectionFormProps) {
  const Component = SECTION_COMPONENTS[activeSection]

  if (!Component) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        Unknown section: {activeSection}
      </p>
    )
  }

  return <Component />
}
