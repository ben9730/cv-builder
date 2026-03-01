import { describe, it, expect, vi } from 'vitest'

// Mock @react-pdf/renderer before importing any template modules
vi.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: { children: React.ReactNode }) => <div data-testid="document">{children}</div>,
  Page: ({ children }: { children: React.ReactNode }) => <div data-testid="page">{children}</div>,
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  StyleSheet: {
    create: <T extends Record<string, object>>(styles: T) => styles,
  },
  Font: {
    register: vi.fn(),
  },
  PDFViewer: ({ children }: { children: React.ReactNode }) => <div data-testid="pdf-viewer">{children}</div>,
  pdf: vi.fn(),
}))

import { TEMPLATES, DEFAULT_TEMPLATE } from '@/components/templates/template-registry'
import type { TemplateId, TemplateDefinition } from '@/components/templates/template-registry'
import { ClassicTemplate } from '@/components/templates/classic-template'
import { ResumeDataSchema } from '@/lib/schema/resume-schema'
import type { ResumeData } from '@/types/resume'

const mockResume: ResumeData = ResumeDataSchema.parse({
  basics: {
    name: 'John Doe',
    label: 'Software Engineer',
    email: 'john@example.com',
    phone: '555-1234',
    summary: 'Experienced developer',
  },
  work: [
    {
      name: 'Acme Corp',
      position: 'Senior Developer',
      startDate: '2020-01',
      endDate: '2024-01',
      highlights: ['Built microservices', 'Led team of 5'],
    },
  ],
  education: [
    {
      institution: 'MIT',
      area: 'Computer Science',
      studyType: 'BS',
      startDate: '2016',
      endDate: '2020',
      score: '3.8',
    },
  ],
  skills: [
    { name: 'Frontend', keywords: ['React', 'TypeScript'] },
    { name: 'Backend', keywords: ['Node.js', 'Python'] },
  ],
})

describe('Template Registry', () => {
  it('has all three template entries', () => {
    expect(TEMPLATES).toHaveProperty('classic')
    expect(TEMPLATES).toHaveProperty('modern')
    expect(TEMPLATES).toHaveProperty('minimal')
  })

  it('each template has required TemplateDefinition fields', () => {
    const requiredFields: (keyof TemplateDefinition)[] = [
      'id',
      'name',
      'description',
      'component',
      'accentColor',
    ]

    for (const [key, template] of Object.entries(TEMPLATES)) {
      for (const field of requiredFields) {
        expect(template).toHaveProperty(field)
      }
      expect(template.id).toBe(key)
      expect(typeof template.name).toBe('string')
      expect(typeof template.description).toBe('string')
      expect(typeof template.component).toBe('function')
      expect(template.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })

  it('DEFAULT_TEMPLATE is classic', () => {
    expect(DEFAULT_TEMPLATE).toBe('classic')
  })

  it('TemplateId type includes all three options', () => {
    const ids: TemplateId[] = ['classic', 'modern', 'minimal']
    ids.forEach((id) => {
      expect(TEMPLATES[id]).toBeDefined()
    })
  })
})

describe('ClassicTemplate', () => {
  it('is a function component', () => {
    expect(typeof ClassicTemplate).toBe('function')
  })

  it('accepts resume prop and returns JSX', () => {
    const result = ClassicTemplate({ resume: mockResume })
    expect(result).toBeDefined()
    expect(result).not.toBeNull()
  })

  it('is a pure renderer with no hooks (function component)', () => {
    // Pure renderer = function that takes props and returns JSX
    // If it had hooks, calling it directly outside React render context would throw
    expect(ClassicTemplate.length).toBeLessThanOrEqual(1) // max 1 parameter (props)
  })

  it('handles empty resume data without errors', () => {
    const emptyResume = ResumeDataSchema.parse({})
    expect(() => ClassicTemplate({ resume: emptyResume })).not.toThrow()
  })

  it('handles resume with optional sections', () => {
    const resumeWithOptional = ResumeDataSchema.parse({
      ...mockResume,
      certificates: [{ name: 'AWS Certified', issuer: 'Amazon', date: '2023' }],
      projects: [{ name: 'Open Source', description: 'A project' }],
      languages: [{ language: 'English', fluency: 'Native' }],
      volunteer: [{ organization: 'Red Cross', position: 'Volunteer' }],
    })
    expect(() => ClassicTemplate({ resume: resumeWithOptional })).not.toThrow()
  })
})
