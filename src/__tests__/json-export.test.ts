import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}))

import { exportJson } from '@/components/export/json-export'
import { saveAs } from 'file-saver'
import { ResumeDataSchema } from '@/lib/schema/resume-schema'
import type { ResumeData } from '@/types/resume'

const mockResume: ResumeData = ResumeDataSchema.parse({
  basics: {
    name: 'Jane Doe',
    label: 'Designer',
  },
  work: [],
  education: [],
  skills: [],
})

describe('JSON Export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls saveAs with a JSON blob', () => {
    exportJson(mockResume, 'classic')
    expect(saveAs).toHaveBeenCalledTimes(1)
    const [blob] = (saveAs as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('application/json')
  })

  it('uses correct filename with -backup.json suffix', () => {
    exportJson(mockResume, 'classic')
    const [, filename] = (saveAs as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(filename).toBe('Jane Doe-backup.json')
  })

  it('uses fallback filename when name is empty', () => {
    const emptyResume = ResumeDataSchema.parse({})
    exportJson(emptyResume, 'classic')
    const [, filename] = (saveAs as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(filename).toBe('resume-backup.json')
  })

  it('includes version, exportedAt, template, and resume in JSON content', async () => {
    exportJson(mockResume, 'modern')
    const [blob] = (saveAs as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    const text = await blob.text()
    const data = JSON.parse(text)
    expect(data.version).toBe(1)
    expect(data.exportedAt).toBeDefined()
    expect(typeof data.exportedAt).toBe('string')
    expect(data.template).toBe('modern')
    expect(data.resume).toBeDefined()
    expect(data.resume.basics.name).toBe('Jane Doe')
  })

  it('includes template selection in backup (PERS-02)', async () => {
    exportJson(mockResume, 'minimal')
    const [blob] = (saveAs as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    const text = await blob.text()
    const data = JSON.parse(text)
    expect(data.template).toBe('minimal')
  })

  it('produces valid ISO 8601 timestamp', async () => {
    exportJson(mockResume, 'classic')
    const [blob] = (saveAs as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    const text = await blob.text()
    const data = JSON.parse(text)
    // Valid ISO 8601 string should parse to a valid date
    const date = new Date(data.exportedAt)
    expect(date.getTime()).not.toBeNaN()
  })
})
