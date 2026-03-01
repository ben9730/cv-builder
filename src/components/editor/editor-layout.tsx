'use client'

import { useResumeStore } from '@/lib/store/resume-store'
import { useHydration } from '@/hooks/use-hydration'
import { useSectionNav, SECTION_LABELS, type SectionId } from '@/hooks/use-section-nav'
import { Sidebar } from '@/components/editor/sidebar'
import { SectionForm } from '@/components/editor/section-form'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function EditorLayout() {
  const hydrated = useHydration()
  const resume = useResumeStore((s) => s.resume)
  const enableSection = useResumeStore((s) => s.enableSection)
  const {
    activeSection,
    setActiveSection,
    visibleSections,
    availableOptionalSections,
    enableOptionalSection,
  } = useSectionNav()

  const handleAddOptionalSection = (section: string) => {
    enableSection(section as 'certificates' | 'projects' | 'languages' | 'volunteer')
    enableOptionalSection(section)
    setActiveSection(section as SectionId)
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen animate-pulse">
        <div className="hidden md:block w-64 border-r bg-muted/20" />
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-40 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 border-r shrink-0">
        <div className="sticky top-0">
          <Sidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            visibleSections={visibleSections}
            availableOptionalSections={availableOptionalSections}
            onAddOptionalSection={handleAddOptionalSection}
            resume={resume}
          />
        </div>
      </aside>

      {/* Mobile tabs */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-background border-b">
        <div className="overflow-x-auto flex gap-1 p-2">
          {visibleSections.map((section) => (
            <Button
              key={section}
              variant={activeSection === section ? 'default' : 'ghost'}
              size="sm"
              className="shrink-0"
              onClick={() => setActiveSection(section)}
            >
              {SECTION_LABELS[section]}
            </Button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <main className="flex-1 pt-14 md:pt-0">
        <div className="max-w-2xl mx-auto p-6">
          <SectionForm activeSection={activeSection} />
        </div>
      </main>
    </div>
  )
}
