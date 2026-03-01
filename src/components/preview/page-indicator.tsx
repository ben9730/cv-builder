'use client'

interface PageIndicatorProps {
  currentPage?: number
  totalPages?: number
}

export function PageIndicator({ currentPage = 1, totalPages = 1 }: PageIndicatorProps) {
  return (
    <div className="text-center py-1">
      <span className="text-xs text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  )
}
