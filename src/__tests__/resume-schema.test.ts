import { describe, it, expect } from 'vitest'
import {
  ResumeDataSchema,
  ContactSchema,
  WorkEntrySchema,
  EducationEntrySchema,
  SkillEntrySchema,
  CertificateEntrySchema,
  ProjectEntrySchema,
  LanguageEntrySchema,
  VolunteerEntrySchema,
} from '@/lib/schema/resume-schema'

describe('ResumeDataSchema', () => {
  it('parses empty object to valid ResumeData with all defaults', () => {
    const result = ResumeDataSchema.safeParse({})
    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.basics.name).toBe('')
    expect(result.data.work).toEqual([])
    expect(result.data.education).toEqual([])
    expect(result.data.skills).toEqual([])
  })

  it('has required core sections — basics, work, education, skills', () => {
    const result = ResumeDataSchema.parse({})
    expect(result).toHaveProperty('basics')
    expect(result).toHaveProperty('work')
    expect(result).toHaveProperty('education')
    expect(result).toHaveProperty('skills')
  })

  it('accepts optional sections — certificates, projects, languages, volunteer', () => {
    const result = ResumeDataSchema.safeParse({
      certificates: [{ name: 'AWS Certified' }],
      projects: [{ name: 'Open Source Tool' }],
      languages: [{ language: 'English' }],
      volunteer: [{ organization: 'Red Cross' }],
    })
    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.certificates).toHaveLength(1)
    expect(result.data.projects).toHaveLength(1)
    expect(result.data.languages).toHaveLength(1)
    expect(result.data.volunteer).toHaveLength(1)
  })

  it('optional sections are undefined when omitted', () => {
    const result = ResumeDataSchema.parse({})
    expect(result.certificates).toBeUndefined()
    expect(result.projects).toBeUndefined()
    expect(result.languages).toBeUndefined()
    expect(result.volunteer).toBeUndefined()
  })

  it('roundtrips through JSON.stringify/JSON.parse without data loss', () => {
    const original = ResumeDataSchema.parse({
      basics: {
        name: 'Jane Doe',
        label: 'Software Engineer',
        email: 'jane@example.com',
        phone: '+1-555-0100',
        url: 'https://jane.dev',
        summary: 'Experienced developer',
        location: {
          city: 'San Francisco',
          region: 'CA',
          countryCode: 'US',
        },
        profiles: [{ network: 'GitHub', username: 'janedoe', url: 'https://github.com/janedoe' }],
      },
      work: [
        {
          name: 'Acme Corp',
          position: 'Senior Engineer',
          startDate: '2020-01',
          endDate: '2023-06',
          summary: 'Led platform team',
          highlights: ['Built CI/CD pipeline', 'Reduced deploy time by 50%'],
          url: 'https://acme.com',
          location: 'Remote',
        },
      ],
      education: [
        {
          institution: 'MIT',
          area: 'Computer Science',
          studyType: 'Bachelor',
          startDate: '2016-09',
          endDate: '2020-05',
          score: '3.9',
          courses: ['Algorithms', 'Machine Learning'],
          url: 'https://mit.edu',
        },
      ],
      skills: [{ name: 'TypeScript', level: 'Expert', keywords: ['React', 'Node.js'] }],
      certificates: [{ name: 'AWS Certified', issuer: 'Amazon', date: '2022-03', url: 'https://aws.com/cert' }],
      projects: [
        {
          name: 'Resume Builder',
          description: 'Open source tool',
          highlights: ['10k users'],
          keywords: ['react', 'typescript'],
          startDate: '2023-01',
          endDate: '2023-12',
          url: 'https://example.com',
          roles: ['Lead Developer'],
        },
      ],
      languages: [{ language: 'English', fluency: 'Native' }],
      volunteer: [
        {
          organization: 'Code.org',
          position: 'Mentor',
          startDate: '2021-06',
          endDate: '2022-12',
          summary: 'Taught coding basics',
          highlights: ['Mentored 50 students'],
          url: 'https://code.org',
        },
      ],
    })

    const json = JSON.stringify(original)
    const parsed = ResumeDataSchema.parse(JSON.parse(json))
    expect(parsed).toEqual(original)
  })

  it('rejects invalid data with safeParse returning success === false', () => {
    const result = ResumeDataSchema.safeParse({
      basics: { name: 123 }, // name should be string
    })
    expect(result.success).toBe(false)
  })

  it('work entry accepts highlights as string array, defaults to []', () => {
    const result = WorkEntrySchema.parse({})
    expect(result.highlights).toEqual([])

    const withHighlights = WorkEntrySchema.parse({
      highlights: ['Led team of 5', 'Shipped v2.0'],
    })
    expect(withHighlights.highlights).toEqual(['Led team of 5', 'Shipped v2.0'])
  })

  it('education entry accepts courses as string array, defaults to []', () => {
    const result = EducationEntrySchema.parse({})
    expect(result.courses).toEqual([])

    const withCourses = EducationEntrySchema.parse({
      courses: ['Algorithms', 'Data Structures'],
    })
    expect(withCourses.courses).toEqual(['Algorithms', 'Data Structures'])
  })

  it('contact profiles array accepts {network, username, url} objects', () => {
    const result = ContactSchema.parse({
      profiles: [
        { network: 'GitHub', username: 'janedoe', url: 'https://github.com/janedoe' },
        { network: 'LinkedIn', username: 'janedoe' },
      ],
    })
    expect(result.profiles).toHaveLength(2)
    expect(result.profiles[0]).toEqual({
      network: 'GitHub',
      username: 'janedoe',
      url: 'https://github.com/janedoe',
    })
    expect(result.profiles[1].network).toBe('LinkedIn')
  })
})
