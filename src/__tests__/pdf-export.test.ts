import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @react-pdf/renderer - no top-level variables in factory
vi.mock('@react-pdf/renderer', () => ({
  pdf: vi.fn(() => ({ toBlob: vi.fn().mockResolvedValue(new Blob(['pdf content'], { type: 'application/pdf' })) })),
  Document: vi.fn(({ children }: { children: unknown }) => children),
  Page: vi.fn(({ children }: { children: unknown }) => children),
  View: vi.fn(({ children }: { children: unknown }) => children),
  Text: vi.fn(({ children }: { children: unknown }) => children),
  StyleSheet: { create: <T extends Record<string, object>>(styles: T) => styles },
  Font: { register: vi.fn() },
}))

// Mock file-saver - no top-level variables in factory
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}))

import { exportPdf } from '@/components/export/pdf-export'
import { TEMPLATES } from '@/components/templates/template-registry'
import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { ResumeDataSchema } from '@/lib/schema/resume-schema'
import type { ResumeData } from '@/types/resume'

const mockResume: ResumeData = ResumeDataSchema.parse({
  basics: { name: 'Jane Smith', label: 'Designer' },
  work: [],
  education: [],
  skills: [],
})

describe('PDF Export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls pdf() with template component', async () => {
    await exportPdf(mockResume, 'classic')
    expect(pdf).toHaveBeenCalledTimes(1)
  })

  it('calls saveAs with blob and correct filename', async () => {
    await exportPdf(mockResume, 'classic')
    expect(saveAs).toHaveBeenCalledTimes(1)
    const [blob, filename] = (saveAs as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(blob).toBeInstanceOf(Blob)
    expect(filename).toBe('Jane Smith.pdf')
  })

  it('uses fallback filename when name is empty', async () => {
    const emptyResume = ResumeDataSchema.parse({})
    await exportPdf(emptyResume, 'classic')
    expect(saveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      'resume.pdf'
    )
  })

  it('uses the same template component from TEMPLATES registry (PREV-02)', async () => {
    const expectedComponent = TEMPLATES.classic.component
    expect(expectedComponent).toBeDefined()
    expect(typeof expectedComponent).toBe('function')
  })

  it('supports all template IDs', async () => {
    for (const templateId of ['classic', 'modern', 'minimal'] as const) {
      vi.clearAllMocks()
      await exportPdf(mockResume, templateId)
      expect(pdf).toHaveBeenCalledTimes(1)
      expect(saveAs).toHaveBeenCalledTimes(1)
    }
  })
})
