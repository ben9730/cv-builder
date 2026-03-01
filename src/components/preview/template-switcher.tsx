'use client'

import { useResumeStore } from '@/lib/store/resume-store'
import { TEMPLATES } from '@/components/templates/template-registry'
import type { TemplateId } from '@/components/templates/template-registry'
import { cn } from '@/lib/utils'

export function TemplateSwitcher() {
  const selectedTemplate = useResumeStore((s) => s.selectedTemplate)
  const setSelectedTemplate = useResumeStore((s) => s.setSelectedTemplate)

  const templateEntries = Object.values(TEMPLATES)

  return (
    <div className="flex gap-2 p-3 border-b border-border/40 bg-card/60">
      {templateEntries.map((template) => {
        const isActive = selectedTemplate === template.id
        return (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template.id as TemplateId)}
            className={cn(
              'flex-1 rounded-lg border px-3 py-2 text-center transition-all duration-200 cursor-pointer',
              'hover:shadow-sm',
              isActive
                ? 'border-primary/30 bg-card shadow-sm'
                : 'border-transparent bg-muted/50 hover:border-border/60 hover:bg-card/80'
            )}
            aria-label={`Select ${template.name} template`}
            aria-pressed={isActive}
          >
            {/* Accent color indicator */}
            <div
              className="h-1 w-full rounded-full mb-1.5"
              style={{ backgroundColor: template.accentColor }}
            />
            <span className={cn(
              'text-xs font-medium',
              isActive ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {template.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
