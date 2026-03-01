'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { MappedSection } from '@/lib/import/pdf-types'

/** Capitalize the section type for display. */
function formatSectionType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

interface ReviewPanelProps {
  sections: MappedSection[]
  onAccept: (selectedSections: MappedSection[]) => void
  onCancel: () => void
}

interface SectionState {
  checked: boolean
  content: string
}

export function ReviewPanel({ sections, onAccept, onCancel }: ReviewPanelProps) {
  const [sectionStates, setSectionStates] = useState<SectionState[]>(() =>
    sections.map((s) => ({ checked: true, content: s.content }))
  )

  const toggleSection = (index: number) => {
    setSectionStates((prev) =>
      prev.map((s, i) => (i === index ? { ...s, checked: !s.checked } : s))
    )
  }

  const updateContent = (index: number, content: string) => {
    setSectionStates((prev) =>
      prev.map((s, i) => (i === index ? { ...s, content } : s))
    )
  }

  const handleAccept = () => {
    const selected = sections
      .map((section, i) => ({
        ...section,
        content: sectionStates[i].content,
        rawLines: sectionStates[i].content.split('\n'),
      }))
      .filter((_, i) => sectionStates[i].checked)

    onAccept(selected)
  }

  const selectedCount = sectionStates.filter((s) => s.checked).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedCount} of {sections.length} sections selected
        </p>
      </div>

      <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
        {sections.map((section, index) => (
          <Card
            key={`${section.type}-${index}`}
            className={cn(
              'py-3 transition-colors',
              !sectionStates[index].checked && 'opacity-50',
              section.confidence === 'low' && 'border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-950/20'
            )}
          >
            <CardHeader className="px-4 py-0">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={sectionStates[index].checked}
                    onChange={() => toggleSection(index)}
                    className="size-4 rounded border-input"
                    aria-label={`Include ${formatSectionType(section.type)} section`}
                  />
                  <CardTitle className="text-sm">
                    {formatSectionType(section.type)}
                  </CardTitle>
                </label>
                <ConfidenceBadge confidence={section.confidence} />
              </div>
            </CardHeader>
            <CardContent className="px-4 pt-2 pb-0">
              <Textarea
                value={sectionStates[index].content}
                onChange={(e) => updateContent(index, e.target.value)}
                disabled={!sectionStates[index].checked}
                className="text-xs min-h-[60px] resize-y"
                aria-label={`${formatSectionType(section.type)} content`}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleAccept} disabled={selectedCount === 0}>
          Accept Import
        </Button>
      </div>
    </div>
  )
}

function ConfidenceBadge({ confidence }: { confidence: 'high' | 'medium' | 'low' }) {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'outline'; className?: string }> = {
    high: { variant: 'default', className: 'bg-green-600 text-white' },
    medium: { variant: 'secondary' },
    low: { variant: 'outline', className: 'border-amber-400 text-amber-700 dark:text-amber-400' },
  }

  const config = variants[confidence]

  return (
    <Badge variant={config.variant} className={cn('text-[10px] px-1.5', config.className)}>
      {confidence}
    </Badge>
  )
}
