import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { TEMPLATES } from '@/components/templates/template-registry'
import type { ResumeData } from '@/types/resume'
import type { TemplateId } from '@/components/templates/template-registry'
import React from 'react'

export async function exportPdf(
  resume: ResumeData,
  templateId: TemplateId
): Promise<void> {
  const TemplateComponent = TEMPLATES[templateId].component
  const element = React.createElement(TemplateComponent, { resume })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = await pdf(element as any).toBlob()
  const filename = `${resume.basics.name || 'resume'}.pdf`
  saveAs(blob, filename)
}
