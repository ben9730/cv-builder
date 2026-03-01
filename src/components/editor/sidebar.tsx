'use client'

import { useState } from 'react'
import { Check, Plus, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { SECTION_LABELS, type SectionId } from '@/hooks/use-section-nav'
import type { ResumeData } from '@/types/resume'

interface SidebarProps {
  activeSection: SectionId
  setActiveSection: (id: SectionId) => void
  visibleSections: SectionId[]
  availableOptionalSections: readonly string[]
  onAddOptionalSection: (section: string) => void
  resume: ResumeData
}

function getSectionComplete(section: string, resume: ResumeData): boolean {
  switch (section) {
    case 'contact':
      return resume.basics.name !== ''
    case 'summary':
      return !!resume.basics.summary
    case 'experience':
      return resume.work.length > 0
    case 'education':
      return resume.education.length > 0
    case 'skills':
      return resume.skills.length > 0
    case 'certificates':
      return Array.isArray(resume.certificates) && resume.certificates.length > 0
    case 'projects':
      return Array.isArray(resume.projects) && resume.projects.length > 0
    case 'languages':
      return Array.isArray(resume.languages) && resume.languages.length > 0
    case 'volunteer':
      return Array.isArray(resume.volunteer) && resume.volunteer.length > 0
    default:
      return false
  }
}

export function Sidebar({
  activeSection,
  setActiveSection,
  visibleSections,
  availableOptionalSections,
  onAddOptionalSection,
  resume,
}: SidebarProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)

  return (
    <nav className="space-y-1 p-4" role="navigation" aria-label="Resume sections">
      {visibleSections.map((section) => {
        const isActive = activeSection === section
        const isComplete = getSectionComplete(section, resume)

        return (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={cn(
              'w-full flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors text-left',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <span>{SECTION_LABELS[section]}</span>
            {isComplete && (
              <Check className="size-4 text-green-500 shrink-0" aria-label={`${SECTION_LABELS[section]} complete`} />
            )}
          </button>
        )
      })}

      {availableOptionalSections.length > 0 && (
        <>
          <Separator className="my-2" />
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={() => setShowAddMenu(!showAddMenu)}
            >
              <Plus className="size-4 mr-2" />
              Add Section
              <ChevronDown
                className={cn(
                  'size-4 ml-auto transition-transform duration-200',
                  showAddMenu && 'rotate-180'
                )}
              />
            </Button>
            {showAddMenu && (
              <div className="mt-1 space-y-1">
                {availableOptionalSections.map((section) => (
                  <button
                    key={section}
                    onClick={() => {
                      onAddOptionalSection(section)
                      setShowAddMenu(false)
                    }}
                    className="w-full rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground text-left"
                  >
                    {SECTION_LABELS[section]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  )
}
