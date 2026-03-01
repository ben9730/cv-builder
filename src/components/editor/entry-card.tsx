'use client'

import { ChevronDown, Trash2 } from 'lucide-react'
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
    <div className={cn(
      'rounded-lg border transition-all duration-200',
      expanded
        ? 'border-primary/20 bg-card shadow-sm'
        : 'border-border/60 bg-card/80 hover:border-border hover:shadow-sm'
    )}>
      <div
        className="cursor-pointer py-3 px-4"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={cn(
              'w-1.5 h-1.5 rounded-full shrink-0',
              summary ? 'bg-emerald-500' : 'bg-border'
            )} />
            <span className="text-sm font-medium truncate text-foreground">
              {summary || 'New Entry'}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <ChevronDown
              className={cn(
                'size-4 text-muted-foreground transition-transform duration-200',
                expanded && 'rotate-180'
              )}
            />
            <Button
              variant="ghost"
              size="icon"
              className="size-7 cursor-pointer hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
            >
              <Trash2 className="size-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border/40">
          {children}
        </div>
      )}
    </div>
  )
}
