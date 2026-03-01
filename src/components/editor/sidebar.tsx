'use client'

import { useState } from 'react'
import {
  Check,
  Plus,
  ChevronDown,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  FolderOpen,
  Languages,
  Heart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SECTION_LABELS, type SectionId } from '@/hooks/use-section-nav'
import type { ResumeData } from '@/types/resume'

const SECTION_ICONS: Record<string, React.ElementType> = {
  contact: User,
  summary: FileText,
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
  certificates: Award,
  projects: FolderOpen,
  languages: Languages,
  volunteer: Heart,
}

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
    <nav className="p-3 space-y-1" role="navigation" aria-label="Resume sections">
      <div className="px-3 py-2 mb-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Sections</p>
      </div>
      {visibleSections.map((section) => {
        const isActive = activeSection === section
        const isComplete = getSectionComplete(section, resume)
        const Icon = SECTION_ICONS[section]

        return (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 text-left cursor-pointer',
              isActive
                ? 'bg-primary/8 text-primary border border-primary/15 shadow-sm'
                : 'text-foreground/70 hover:bg-accent hover:text-foreground border border-transparent'
            )}
          >
            {Icon && (
              <div className={cn(
                'flex items-center justify-center w-7 h-7 rounded-md shrink-0 transition-colors',
                isActive ? 'bg-primary/12 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                <Icon className="size-3.5" />
              </div>
            )}
            <span className="flex-1 truncate">{SECTION_LABELS[section]}</span>
            {isComplete && (
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 shrink-0">
                <Check className="size-3 text-emerald-600" aria-label={`${SECTION_LABELS[section]} complete`} />
              </div>
            )}
          </button>
        )
      })}

      {availableOptionalSections.length > 0 && (
        <>
          <div className="pt-3 pb-1 px-3">
            <div className="border-t border-border/60" />
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground cursor-pointer px-3"
              onClick={() => setShowAddMenu(!showAddMenu)}
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-muted shrink-0">
                <Plus className="size-3.5" />
              </div>
              <span className="ml-3 text-sm">Add Section</span>
              <ChevronDown
                className={cn(
                  'size-4 ml-auto transition-transform duration-200',
                  showAddMenu && 'rotate-180'
                )}
              />
            </Button>
            {showAddMenu && (
              <div className="mt-1 mx-1 space-y-0.5 rounded-lg border border-border/60 bg-accent/50 p-1.5">
                {availableOptionalSections.map((section) => {
                  const Icon = SECTION_ICONS[section]
                  return (
                    <button
                      key={section}
                      onClick={() => {
                        onAddOptionalSection(section)
                        setShowAddMenu(false)
                      }}
                      className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground hover:shadow-sm text-left cursor-pointer transition-all duration-150"
                    >
                      {Icon && (
                        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted shrink-0">
                          <Icon className="size-3" />
                        </div>
                      )}
                      {SECTION_LABELS[section]}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  )
}
