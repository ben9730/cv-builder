'use client'

import { useMemo } from 'react'
import { PDFViewer } from '@react-pdf/renderer'
import { useResumeStore } from '@/lib/store/resume-store'
import { TEMPLATES } from '@/components/templates/template-registry'

export default function PreviewPanel() {
  const resume = useResumeStore((s) => s.resume)
  const templateId = useResumeStore((s) => s.selectedTemplate)
  const template = TEMPLATES[templateId]
  const TemplateComponent = template.component

  const documentElement = useMemo(
    () => <TemplateComponent resume={resume} />,
    [resume, TemplateComponent]
  )

  return (
    <div className="h-full w-full flex flex-col items-center bg-muted/30 p-4">
      <div className="w-full h-full rounded-lg overflow-hidden shadow-lg border bg-white">
        <PDFViewer width="100%" height="100%" showToolbar={false}>
          {documentElement}
        </PDFViewer>
      </div>
    </div>
  )
}
