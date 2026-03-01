/**
 * Section mapper: classifies text lines into resume sections using heuristics.
 * Produces MappedSection[] for the review panel.
 */

import type { MappedSection, SectionType } from './pdf-types'

/** Regex patterns for detecting section headers. */
const SECTION_HEADERS: Record<Exclude<SectionType, 'contact' | 'unknown'>, RegExp[]> = {
  summary: [/^summary$/i, /^objective$/i, /^profile$/i, /^about\s*me$/i, /^professional\s*summary$/i, /^career\s*summary$/i, /^personal\s*statement$/i],
  experience: [/^(work\s*)?experience$/i, /^employment(\s*history)?$/i, /^work\s*history$/i, /^professional\s*experience$/i, /^career\s*history$/i],
  education: [/^education$/i, /^academic(\s*background)?$/i, /^qualifications?$/i, /^degrees?$/i, /^education\s*&\s*training$/i],
  skills: [/^skills?$/i, /^technologies$/i, /^technical\s*skills?$/i, /^competenc(ies|e)$/i, /^proficienc(ies|y)$/i, /^core\s*skills$/i, /^areas?\s*of\s*expertise$/i],
  certificates: [/^certifications?$/i, /^certificates?$/i, /^licenses?(\s*&\s*certifications?)?$/i, /^professional\s*certifications?$/i],
  projects: [/^projects?$/i, /^personal\s*projects?$/i, /^key\s*projects?$/i, /^notable\s*projects?$/i],
  languages: [/^languages?$/i, /^language\s*skills?$/i],
  volunteer: [/^volunteer(ing)?(\s*experience)?$/i, /^community\s*(service|involvement)$/i],
}

/** Email regex pattern. */
const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.]+/

/** Phone regex pattern. */
const PHONE_PATTERN = /[\d\s\-().+]{7,}/

/** URL/LinkedIn pattern. */
const URL_PATTERN = /https?:\/\/\S+|linkedin\.com\/\S+|github\.com\/\S+/i

/** Date range pattern (for experience/education entries). */
const DATE_PATTERN = /\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+)?\d{4}\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+)?\d{0,4}\s*(?:Present|Current)?/i

/**
 * Map an array of text lines into structured resume sections.
 */
export function mapSections(lines: string[]): MappedSection[] {
  if (lines.length === 0) return []

  const sections: MappedSection[] = []
  let currentType: SectionType = 'contact'
  let currentLines: string[] = []
  let currentConfidence: 'high' | 'medium' | 'low' = 'medium'
  let foundFirstHeader = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const detected = detectSectionHeader(line)

    if (detected) {
      // Save the current section before starting a new one
      if (currentLines.length > 0 || foundFirstHeader) {
        sections.push(buildSection(currentType, currentLines, currentConfidence))
      }

      currentType = detected.type
      currentConfidence = detected.confidence
      currentLines = []
      foundFirstHeader = true
    } else {
      // If we haven't found a header yet, this is contact/preamble
      if (!foundFirstHeader) {
        currentType = 'contact'
        currentConfidence = hasContactInfo(line) ? 'high' : 'medium'
      }
      currentLines.push(line)
    }
  }

  // Push the last section
  if (currentLines.length > 0) {
    sections.push(buildSection(currentType, currentLines, currentConfidence))
  }

  // If no sections were identified, return everything as unknown
  if (sections.length === 0 && lines.length > 0) {
    return [{
      type: 'unknown',
      content: lines.join('\n'),
      confidence: 'low',
      rawLines: lines,
    }]
  }

  return sections
}

/**
 * Detect if a line is a section header.
 * Returns the section type and confidence, or null if not a header.
 */
function detectSectionHeader(line: string): { type: SectionType; confidence: 'high' | 'medium' | 'low' } | null {
  const trimmed = line.trim()

  // Skip lines that are too long to be headers
  if (trimmed.length > 50) return null

  // Skip lines that look like content (have lots of words or contain common sentence patterns)
  if (trimmed.split(/\s+/).length > 6) return null

  for (const [type, patterns] of Object.entries(SECTION_HEADERS)) {
    for (const pattern of patterns) {
      if (pattern.test(trimmed)) {
        // Exact match + standalone line = high confidence
        const confidence = trimmed.length < 40 ? 'high' : 'medium'
        return { type: type as SectionType, confidence }
      }
    }
  }

  // Check for ALL-CAPS lines that might be section headers
  if (/^[A-Z\s&]{3,30}$/.test(trimmed)) {
    const lowerTrimmed = trimmed.toLowerCase()
    for (const [type, patterns] of Object.entries(SECTION_HEADERS)) {
      for (const pattern of patterns) {
        if (pattern.test(lowerTrimmed)) {
          return { type: type as SectionType, confidence: 'high' }
        }
      }
    }
  }

  return null
}

/** Check if a line contains contact information. */
function hasContactInfo(line: string): boolean {
  return EMAIL_PATTERN.test(line) || PHONE_PATTERN.test(line) || URL_PATTERN.test(line)
}

/** Build a MappedSection from accumulated lines. */
function buildSection(
  type: SectionType,
  lines: string[],
  headerConfidence: 'high' | 'medium' | 'low'
): MappedSection {
  // Adjust confidence based on content quality
  let confidence = headerConfidence

  if (type === 'contact') {
    const hasEmail = lines.some((l) => EMAIL_PATTERN.test(l))
    const hasPhone = lines.some((l) => PHONE_PATTERN.test(l))
    confidence = hasEmail || hasPhone ? 'high' : 'medium'
  } else if (type === 'experience' || type === 'education') {
    const hasDates = lines.some((l) => DATE_PATTERN.test(l))
    if (!hasDates && headerConfidence === 'medium') confidence = 'low'
  } else if (type === 'skills') {
    // Skills sections often have comma-separated lists
    const hasLists = lines.some((l) => l.includes(',') || l.includes('|'))
    if (!hasLists && lines.length < 2) confidence = 'low'
  }

  return {
    type,
    content: lines.join('\n'),
    confidence,
    rawLines: [...lines],
  }
}

/**
 * Extract structured contact information from contact section lines.
 */
export function extractContact(lines: string[]): {
  name: string
  email: string
  phone: string
  url: string
  location: string
} {
  let name = ''
  let email = ''
  let phone = ''
  let url = ''
  let location = ''

  for (const line of lines) {
    // Extract email
    const emailMatch = line.match(EMAIL_PATTERN)
    if (emailMatch && !email) {
      email = emailMatch[0]
    }

    // Extract phone
    const phoneMatch = line.match(/(?:\+?\d[\d\s\-().]{6,}\d)/)
    if (phoneMatch && !phone) {
      phone = phoneMatch[0].trim()
    }

    // Extract URL
    const urlMatch = line.match(URL_PATTERN)
    if (urlMatch && !url) {
      url = urlMatch[0]
    }
  }

  // Name is typically the first prominent line (not email, phone, URL, or location)
  for (const line of lines) {
    if (
      !EMAIL_PATTERN.test(line) &&
      !URL_PATTERN.test(line) &&
      !/^\+?\d[\d\s\-().]{6,}/.test(line) &&
      line.length > 1 &&
      line.length < 60
    ) {
      name = line
      break
    }
  }

  // Location: look for city/state patterns
  for (const line of lines) {
    if (/\b[A-Z][a-z]+,\s*[A-Z]{2}\b/.test(line) || /\b\d{5}\b/.test(line)) {
      if (line !== name) {
        location = line
        break
      }
    }
  }

  return { name, email, phone, url, location }
}
