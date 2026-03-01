'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useResumeStore } from '@/lib/store/resume-store'
import { useHydration } from '@/hooks/use-hydration'
import { useSectionNav, SECTION_LABELS, type SectionId } from '@/hooks/use-section-nav'
import { Sidebar } from '@/components/editor/sidebar'
import { SectionForm } from '@/components/editor/section-form'
import { TemplateSwitcher } from '@/components/preview/template-switcher'
import { PageIndicator } from '@/components/preview/page-indicator'
import { Button } from '@/components/ui/button'
import { ExportMenu } from '@/components/export/export-menu'
import { ImportButton } from '@/components/import/import-button'
import { cn } from '@/lib/utils'
import { Eye, PenLine, FileText, Trash2 } from 'lucide-react'

// Dynamic import for PreviewPanel — @react-pdf/renderer cannot run in SSR
const PreviewPanel = dynamic(
  () => import('@/components/preview/preview-panel'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-muted/30 p-4">
        <div className="w-full h-full rounded-lg bg-muted animate-pulse" />
      </div>
    ),
  }
)

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

  // Mobile: toggle between edit and preview modes
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit')

  const reset = useResumeStore((s) => s.reset)

  const handleClear = () => {
    if (window.confirm('Clear all resume data? This cannot be undone.')) {
      reset()
    }
  }

  const handleAddOptionalSection = (section: string) => {
    enableSection(section as 'certificates' | 'projects' | 'languages' | 'volunteer')
    enableOptionalSection(section)
    setActiveSection(section as SectionId)
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen animate-pulse bg-background">
        <div className="hidden md:block w-[260px] bg-card" />
        <div className="flex-1 p-8">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="h-8 bg-muted rounded-lg w-1/3" />
            <div className="h-40 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header bar */}
      <header className="hidden md:flex items-center justify-between px-6 py-3 bg-card border-b border-border/60 shrink-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <FileText className="size-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">CV Builder</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer text-muted-foreground hover:text-destructive"
            onClick={handleClear}
            aria-label="Clear resume"
          >
            <Trash2 className="size-4 mr-1" />
            Clear
          </Button>
          <ImportButton />
          <ExportMenu />
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-[260px] bg-card border-r border-border/60 shrink-0 shadow-[1px_0_3px_0_rgba(0,0,0,0.03)]">
          <div className="flex-1 overflow-y-auto">
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

        {/* Mobile tabs + view toggle */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-card border-b border-border/60 shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary">
                <FileText className="size-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold tracking-tight">CV Builder</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer size-8 text-muted-foreground hover:text-destructive"
                onClick={handleClear}
                aria-label="Clear resume"
              >
                <Trash2 className="size-4" />
              </Button>
              <ImportButton />
              <ExportMenu />
            </div>
          </div>
          <div className="flex items-center justify-between px-2 pt-1 pb-1">
            <div className="overflow-x-auto flex gap-1 flex-1">
              {visibleSections.map((section) => (
                <Button
                  key={section}
                  variant={activeSection === section && mobileView === 'edit' ? 'default' : 'ghost'}
                  size="sm"
                  className="shrink-0 cursor-pointer text-xs"
                  onClick={() => {
                    setActiveSection(section)
                    setMobileView('edit')
                  }}
                >
                  {SECTION_LABELS[section]}
                </Button>
              ))}
            </div>
            <Button
              variant={mobileView === 'preview' ? 'default' : 'outline'}
              size="sm"
              className="shrink-0 ml-2 cursor-pointer"
              onClick={() => setMobileView(mobileView === 'preview' ? 'edit' : 'preview')}
              aria-label={mobileView === 'preview' ? 'Switch to edit mode' : 'Switch to preview mode'}
            >
              {mobileView === 'preview' ? (
                <><PenLine className="size-4 mr-1" /> Edit</>
              ) : (
                <><Eye className="size-4 mr-1" /> Preview</>
              )}
            </Button>
          </div>
        </div>

        {/* Content area: editor + preview */}
        <div className="flex flex-1 min-w-0">
          {/* Editor forms — hidden on mobile when in preview mode */}
          <main
            className={cn(
              'flex-1 min-w-0 pt-14 md:pt-0',
              mobileView === 'preview' && 'hidden md:block'
            )}
          >
            <div className="max-w-2xl mx-auto px-6 py-8">
              <SectionForm activeSection={activeSection} />
            </div>
          </main>

          {/* Preview panel — always visible on lg+, toggle on mobile */}
          <aside
            className={cn(
              'border-l border-border/40 shrink-0 flex flex-col bg-muted/40',
              // Desktop: show on lg screens
              'hidden lg:flex lg:w-[460px]',
              // Mobile: show when preview mode is active (full-width)
              mobileView === 'preview' && 'flex w-full lg:w-[460px] pt-14 lg:pt-0'
            )}
          >
            <TemplateSwitcher />
            <div className="flex-1 min-h-0">
              <PreviewPanel />
            </div>
            <PageIndicator />
          </aside>
        </div>
      </div>
    </div>
  )
}
