import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock docx module
vi.mock('docx', () => {
  const mockParagraph = vi.fn()
  const mockTextRun = vi.fn()
  const mockDocument = vi.fn()
  return {
    Document: mockDocument,
    Packer: {
      toBlob: vi.fn().mockResolvedValue(new Blob(['docx content'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })),
    },
    Paragraph: mockParagraph,
    TextRun: mockTextRun,
    HeadingLevel: {
      HEADING_1: 'HEADING_1',
      HEADING_2: 'HEADING_2',
    },
    AlignmentType: {
      CENTER: 'CENTER',
    },
  }
})

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}))

import { exportDocx } from '@/components/export/docx-export'
import { Packer } from 'docx'
import { saveAs } from 'file-saver'
import { ResumeDataSchema } from '@/lib/schema/resume-schema'
import type { ResumeData } from '@/types/resume'

const mockResume: ResumeData = ResumeDataSchema.parse({
  basics: {
    name: 'Jane Doe',
    label: 'Software Engineer',
    email: 'jane@example.com',
    phone: '555-9999',
    summary: 'Experienced developer',
  },
  work: [
    {
      name: 'Acme Corp',
      position: 'Lead Dev',
      startDate: '2020-01',
      endDate: '2024-01',
      highlights: ['Led team', 'Built API'],
    },
  ],
  education: [
    {
      institution: 'MIT',
      area: 'CS',
      studyType: 'BS',
      startDate: '2016',
      endDate: '2020',
      score: '3.9',
    },
  ],
  skills: [
    { name: 'Frontend', keywords: ['React', 'TypeScript'] },
  ],
})

describe('DOCX Export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls Packer.toBlob to generate the document', async () => {
    await exportDocx(mockResume)
    expect(Packer.toBlob).toHaveBeenCalledTimes(1)
  })

  it('calls saveAs with a blob and .docx filename', async () => {
    await exportDocx(mockResume)
    expect(saveAs).toHaveBeenCalledTimes(1)
    const [blob, filename] = (saveAs as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(blob).toBeInstanceOf(Blob)
    expect(filename).toBe('Jane Doe.docx')
  })

  it('uses fallback filename when name is empty', async () => {
    const emptyResume = ResumeDataSchema.parse({})
    await exportDocx(emptyResume)
    expect(saveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      'resume.docx'
    )
  })

  it('handles resume with optional sections', async () => {
    const resumeWithOptional = ResumeDataSchema.parse({
      ...mockResume,
      certificates: [{ name: 'AWS Certified', issuer: 'Amazon', date: '2023' }],
      projects: [{ name: 'Open Source', description: 'A project', highlights: ['Built it'] }],
      languages: [{ language: 'English', fluency: 'Native' }],
      volunteer: [{ organization: 'Red Cross', position: 'Volunteer', highlights: ['Helped'] }],
    })
    await expect(exportDocx(resumeWithOptional)).resolves.not.toThrow()
    expect(Packer.toBlob).toHaveBeenCalledTimes(1)
  })

  it('handles empty resume without errors', async () => {
    const emptyResume = ResumeDataSchema.parse({})
    await expect(exportDocx(emptyResume)).resolves.not.toThrow()
  })
})
