import { saveAs } from 'file-saver'
import type { ResumeData } from '@/types/resume'

export function exportJson(resume: ResumeData, selectedTemplate: string): void {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    template: selectedTemplate,
    resume,
  }

  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const filename = `${resume.basics.name || 'resume'}-backup.json`
  saveAs(blob, filename)
}
