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
    <div className="flex gap-2 p-2">
      {templateEntries.map((template) => {
        const isActive = selectedTemplate === template.id
        return (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template.id as TemplateId)}
            className={cn(
              'flex-1 rounded-lg border-2 p-2 text-center transition-all cursor-pointer',
              'hover:border-primary/50 hover:shadow-sm',
              isActive
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-muted bg-background'
            )}
            aria-label={`Select ${template.name} template`}
            aria-pressed={isActive}
          >
            {/* Accent color indicator */}
            <div
              className="h-1.5 w-full rounded-full mb-2"
              style={{ backgroundColor: template.accentColor }}
            />
            <span className={cn(
              'text-xs font-medium',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}>
              {template.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
