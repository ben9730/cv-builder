'use client'

import { useState, useRef, useEffect } from 'react'
import { useResumeStore } from '@/lib/store/resume-store'
import { exportJson } from '@/components/export/json-export'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Download, ChevronDown, FileText, FileType, FileJson } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ExportMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const resume = useResumeStore((s) => s.resume)
  const selectedTemplate = useResumeStore((s) => s.selectedTemplate)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleExportPdf = async () => {
    setIsOpen(false)
    try {
      toast.loading('Generating PDF...', { id: 'pdf-export' })
      // Lazy import to avoid SSR issues with @react-pdf/renderer
      const { exportPdf } = await import('@/components/export/pdf-export')
      await exportPdf(resume, selectedTemplate)
      toast.success('PDF downloaded!', { id: 'pdf-export' })
    } catch {
      toast.error('PDF export failed', { id: 'pdf-export' })
    }
  }

  const handleExportDocx = async () => {
    setIsOpen(false)
    try {
      toast.loading('Generating DOCX...', { id: 'docx-export' })
      const { exportDocx } = await import('@/components/export/docx-export')
      await exportDocx(resume)
      toast.success('DOCX downloaded!', { id: 'docx-export' })
    } catch {
      toast.error('DOCX export failed', { id: 'docx-export' })
    }
  }

  const handleExportJson = () => {
    setIsOpen(false)
    try {
      exportJson(resume, selectedTemplate)
      toast.success('JSON backup downloaded!')
    } catch {
      toast.error('JSON export failed')
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Export resume"
        aria-expanded={isOpen}
      >
        <Download className="size-4 mr-2" />
        Export
        <ChevronDown
          className={cn(
            'size-4 ml-1 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 rounded-md border bg-popover p-1 shadow-md z-50">
          <button
            onClick={handleExportPdf}
            className="w-full flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
          >
            <FileText className="size-4" />
            PDF
          </button>
          <button
            onClick={handleExportDocx}
            className="w-full flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
          >
            <FileType className="size-4" />
            Word (DOCX)
          </button>
          <button
            onClick={handleExportJson}
            className="w-full flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
          >
            <FileJson className="size-4" />
            JSON Backup
          </button>
        </div>
      )}
    </div>
  )
}
