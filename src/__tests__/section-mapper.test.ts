import { describe, it, expect } from 'vitest'
import { mapSections, extractContact } from '@/lib/import/section-mapper'

describe('mapSections', () => {
  it('returns empty array for empty input', () => {
    expect(mapSections([])).toEqual([])
  })

  it('maps a realistic resume with clear section headers', () => {
    const lines = [
      'John Doe',
      'john.doe@example.com',
      '(555) 123-4567',
      'Summary',
      'Experienced software engineer with 5 years of experience.',
      'Experience',
      'Software Engineer at Acme Corp',
      'January 2020 - Present',
      '- Built scalable web applications',
      '- Led team of 3 developers',
      'Education',
      'BS Computer Science',
      'MIT, 2019',
      'Skills',
      'JavaScript, TypeScript, React, Node.js',
    ]

    const sections = mapSections(lines)

    expect(sections.length).toBeGreaterThanOrEqual(4)

    const types = sections.map((s) => s.type)
    expect(types).toContain('contact')
    expect(types).toContain('summary')
    expect(types).toContain('experience')
    expect(types).toContain('education')
    expect(types).toContain('skills')
  })

  it('identifies contact section as first block before headers', () => {
    const lines = [
      'Jane Smith',
      'jane@example.com',
      '555-987-6543',
      'Experience',
      'Manager at BigCo',
    ]

    const sections = mapSections(lines)
    expect(sections[0].type).toBe('contact')
    expect(sections[0].rawLines).toContain('jane@example.com')
  })

  it('assigns high confidence for clear header matches', () => {
    const lines = [
      'John Doe',
      'Experience',
      'Developer at Corp',
    ]

    const sections = mapSections(lines)
    const experienceSection = sections.find((s) => s.type === 'experience')
    expect(experienceSection).toBeDefined()
    expect(experienceSection!.confidence).toBe('high')
  })

  it('handles text with no recognizable sections', () => {
    const lines = [
      'This is just some random text',
      'that does not look like a resume',
      'at all really',
    ]

    const sections = mapSections(lines)
    // Should return something, likely contact or unknown
    expect(sections.length).toBeGreaterThan(0)
  })

  it('detects ALL-CAPS section headers', () => {
    const lines = [
      'John Doe',
      'EXPERIENCE',
      'Software Engineer',
      'EDUCATION',
      'BS Computer Science',
    ]

    const sections = mapSections(lines)
    const types = sections.map((s) => s.type)
    expect(types).toContain('experience')
    expect(types).toContain('education')
  })

  it('assigns high confidence to contact section with email', () => {
    const lines = [
      'John Doe',
      'john@example.com',
      '(555) 123-4567',
      'Summary',
      'A developer.',
    ]

    const sections = mapSections(lines)
    const contact = sections.find((s) => s.type === 'contact')
    expect(contact).toBeDefined()
    expect(contact!.confidence).toBe('high')
  })

  it('handles alternative header names', () => {
    const lines = [
      'Jane Doe',
      'Professional Summary',
      'Experienced manager.',
      'Employment History',
      'Manager at BigCo 2020 - 2023',
      'Qualifications',
      'MBA, Harvard, 2019',
      'Technical Skills',
      'Python, SQL, Tableau',
    ]

    const sections = mapSections(lines)
    const types = sections.map((s) => s.type)
    expect(types).toContain('summary')
    expect(types).toContain('experience')
    expect(types).toContain('education')
    expect(types).toContain('skills')
  })

  it('detects certifications section', () => {
    const lines = [
      'John Doe',
      'Certifications',
      'AWS Solutions Architect - 2023',
      'PMP - 2022',
    ]

    const sections = mapSections(lines)
    const certs = sections.find((s) => s.type === 'certificates')
    expect(certs).toBeDefined()
  })

  it('detects projects section', () => {
    const lines = [
      'John Doe',
      'Projects',
      'Open Source CLI Tool - Built with Rust',
    ]

    const sections = mapSections(lines)
    const projects = sections.find((s) => s.type === 'projects')
    expect(projects).toBeDefined()
  })

  it('detects languages section', () => {
    const lines = [
      'John Doe',
      'Languages',
      'English - Native',
      'Spanish - Fluent',
    ]

    const sections = mapSections(lines)
    const languages = sections.find((s) => s.type === 'languages')
    expect(languages).toBeDefined()
  })

  it('detects volunteer section', () => {
    const lines = [
      'John Doe',
      'Volunteer Experience',
      'Mentor at Code.org 2021 - Present',
    ]

    const sections = mapSections(lines)
    const volunteer = sections.find((s) => s.type === 'volunteer')
    expect(volunteer).toBeDefined()
  })
})

describe('extractContact', () => {
  it('extracts email address', () => {
    const result = extractContact(['John Doe', 'john@example.com', '555-123-4567'])
    expect(result.email).toBe('john@example.com')
  })

  it('extracts phone number', () => {
    const result = extractContact(['John Doe', '(555) 123-4567'])
    expect(result.phone).toBeTruthy()
    expect(result.phone).toContain('555')
  })

  it('extracts name as first non-contact line', () => {
    const result = extractContact(['John Doe', 'john@example.com', '555-123-4567'])
    expect(result.name).toBe('John Doe')
  })

  it('extracts URL', () => {
    const result = extractContact([
      'John Doe',
      'https://github.com/johndoe',
      'john@example.com',
    ])
    expect(result.url).toBe('https://github.com/johndoe')
  })

  it('handles missing fields gracefully', () => {
    const result = extractContact(['John Doe'])
    expect(result.name).toBe('John Doe')
    expect(result.email).toBe('')
    expect(result.phone).toBe('')
  })

  it('extracts location with city/state pattern', () => {
    const result = extractContact([
      'John Doe',
      'San Francisco, CA',
      'john@example.com',
    ])
    expect(result.location).toBe('San Francisco, CA')
  })
})
