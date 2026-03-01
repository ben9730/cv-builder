import { describe, it, expect } from 'vitest'
import { parseText, cleanLines } from '@/lib/import/text-parser'

describe('parseText', () => {
  it('returns empty array for empty input', () => {
    expect(parseText('')).toEqual([])
  })

  it('returns empty array for whitespace-only input', () => {
    expect(parseText('   \n  \n  ')).toEqual([])
  })

  it('splits single line', () => {
    expect(parseText('Hello World')).toEqual(['Hello World'])
  })

  it('splits multiple lines and trims whitespace', () => {
    const input = '  John Doe  \n  Software Engineer  \n  john@example.com  '
    expect(parseText(input)).toEqual([
      'John Doe',
      'Software Engineer',
      'john@example.com',
    ])
  })

  it('removes empty lines', () => {
    const input = 'Line 1\n\n\nLine 2\n\nLine 3'
    expect(parseText(input)).toEqual(['Line 1', 'Line 2', 'Line 3'])
  })

  it('handles CRLF line endings', () => {
    const input = 'Line 1\r\nLine 2\r\nLine 3'
    expect(parseText(input)).toEqual(['Line 1', 'Line 2', 'Line 3'])
  })

  it('handles CR-only line endings', () => {
    const input = 'Line 1\rLine 2\rLine 3'
    expect(parseText(input)).toEqual(['Line 1', 'Line 2', 'Line 3'])
  })

  it('handles mixed line endings', () => {
    const input = 'Line 1\r\nLine 2\nLine 3\rLine 4'
    expect(parseText(input)).toEqual(['Line 1', 'Line 2', 'Line 3', 'Line 4'])
  })

  it('preserves bullet points', () => {
    const input = '- Item 1\n- Item 2\n* Item 3'
    expect(parseText(input)).toEqual(['- Item 1', '- Item 2', '* Item 3'])
  })

  it('preserves long single lines', () => {
    const longLine = 'A'.repeat(500)
    expect(parseText(longLine)).toEqual([longLine])
  })
})

describe('cleanLines', () => {
  it('returns empty array for empty input', () => {
    expect(cleanLines([])).toEqual([])
  })

  it('normalizes bullet characters to dashes', () => {
    const input = ['\u2022 First item', '* Second item', '- Third item']
    const result = cleanLines(input)
    expect(result[0]).toBe('- First item')
    expect(result[1]).toBe('- Second item')
    expect(result[2]).toBe('- Third item')
  })

  it('preserves standalone lines', () => {
    const input = ['Experience', 'Software Engineer at Acme Corp', '2020 - 2023']
    const result = cleanLines(input)
    expect(result).toEqual(['Experience', 'Software Engineer at Acme Corp', '2020 - 2023'])
  })

  it('handles lines with dates as new entries', () => {
    const input = [
      'Software Engineer',
      'Acme Corp | 2020 - 2023',
      'Built web applications',
    ]
    const result = cleanLines(input)
    // Date lines should stay separate
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result.some((l) => l.includes('2020'))).toBe(true)
  })
})
