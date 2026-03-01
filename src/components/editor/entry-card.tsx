'use client'

import { ChevronDown, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EntryCardProps {
  expanded: boolean
  onToggle: () => void
  onRemove: () => void
  summary: string
  children: React.ReactNode
}

export function EntryCard({ expanded, onToggle, onRemove, summary, children }: EntryCardProps) {
  return (
    <Card>
      <CardHeader
        className="cursor-pointer py-3 px-4"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium truncate">
            {summary || 'New Entry'}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <ChevronDown
              className={cn(
                'size-4 text-muted-foreground transition-transform duration-200',
                expanded && 'rotate-180'
              )}
            />
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
            >
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 px-4 pb-4">
          {children}
        </CardContent>
      )}
    </Card>
  )
}
