'use client'

import { useState, useCallback, useMemo } from 'react'

export const CORE_SECTIONS = ['contact', 'summary', 'experience', 'education', 'skills'] as const
export const OPTIONAL_SECTIONS = ['certificates', 'projects', 'languages', 'volunteer'] as const

export const SECTION_LABELS: Record<string, string> = {
  contact: 'Contact',
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  certificates: 'Certifications',
  projects: 'Projects',
  languages: 'Languages',
  volunteer: 'Volunteer',
}

export type SectionId = (typeof CORE_SECTIONS)[number] | (typeof OPTIONAL_SECTIONS)[number]

export function useSectionNav() {
  const [activeSection, setActiveSection] = useState<SectionId>('contact')
  const [enabledOptionalSections, setEnabledOptionalSections] = useState<Set<string>>(new Set())

  const enableOptionalSection = useCallback((section: string) => {
    setEnabledOptionalSections((prev) => new Set([...prev, section]))
  }, [])

  const disableOptionalSection = useCallback((section: string) => {
    setEnabledOptionalSections((prev) => {
      const next = new Set(prev)
      next.delete(section)
      return next
    })
  }, [])

  const visibleSections = useMemo<SectionId[]>(() => [
    ...CORE_SECTIONS,
    ...OPTIONAL_SECTIONS.filter((s) => enabledOptionalSections.has(s)),
  ], [enabledOptionalSections])

  const availableOptionalSections = useMemo(() =>
    OPTIONAL_SECTIONS.filter((s) => !enabledOptionalSections.has(s)),
  [enabledOptionalSections])

  return {
    activeSection,
    setActiveSection,
    enabledOptionalSections,
    enableOptionalSection,
    disableOptionalSection,
    visibleSections,
    availableOptionalSections,
    SECTION_LABELS,
    OPTIONAL_SECTIONS,
  }
}
