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
const KNOWN_NETWORKS = ['linkedin', 'github', 'twitter', 'gitlab', 'stackoverflow', 'dribbble', 'behance', 'medium']

export function extractContact(lines: string[]): {
  name: string
  email: string
  phone: string
  url: string
  location: string
  profiles: Array<{ network: string; username: string }>
} {
  let name = ''
  let email = ''
  let phone = ''
  let url = ''
  let location = ''
  const profiles: Array<{ network: string; username: string }> = []

  for (const line of lines) {
    const emailMatch = line.match(EMAIL_PATTERN)
    if (emailMatch && !email) email = emailMatch[0]

    const phoneMatch = line.match(/(?:\+?\d[\d\s\-().]{6,}\d)/)
    if (phoneMatch && !phone) phone = phoneMatch[0].trim()

    const urlMatch = line.match(URL_PATTERN)
    if (urlMatch && !url) url = urlMatch[0]

    // Detect social network keywords (LinkedIn, GitHub, etc.)
    for (const net of KNOWN_NETWORKS) {
      if (new RegExp(`\\b${net}\\b`, 'i').test(line) && !profiles.some(p => p.network.toLowerCase() === net)) {
        const netUrlRe = new RegExp(`(https?://)?(?:www\\.)?${net}\\.com/[\\w\\-./]+`, 'i')
        const netUrlMatch = line.match(netUrlRe)
        profiles.push({
          network: net.charAt(0).toUpperCase() + net.slice(1),
          username: netUrlMatch ? netUrlMatch[0] : '',
        })
      }
    }
  }

  // Name: first line not dominated by contact info
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

  // Fallback: extract name from mixed lines by stripping known patterns
  if (!name) {
    for (const line of lines) {
      const cleaned = line
        .replace(EMAIL_PATTERN, '')
        .replace(URL_PATTERN, '')
        .replace(/(?:\+?\d[\d\s\-().]{6,}\d)/, '')
        .replace(/[|,;]+/g, ' ')
        .trim()
      if (cleaned.length > 1 && cleaned.length < 60 && /[a-zA-Z]/.test(cleaned)) {
        name = cleaned
        break
      }
    }
  }

  // Location: US format (City, ST or zip code)
  for (const line of lines) {
    if (/\b[A-Z][a-z]+,\s*[A-Z]{2}\b/.test(line) || /\b\d{5}\b/.test(line)) {
      if (line !== name) {
        location = line
        break
      }
    }
  }

  // Fallback location: strip known fields from contact lines, remainder is location
  if (!location) {
    for (const line of lines) {
      if (line === name) continue
      let remaining = line
      remaining = remaining.replace(EMAIL_PATTERN, '')
      remaining = remaining.replace(/(?:\+?\d[\d\s\-().]{6,}\d)/, '')
      remaining = remaining.replace(URL_PATTERN, '')
      for (const p of profiles) {
        remaining = remaining.replace(new RegExp(`\\b${p.network}\\b`, 'gi'), '')
      }
      remaining = remaining.replace(/\s{2,}/g, ' ').trim()
      if (remaining.length > 2 && remaining.length < 50 && /[a-zA-Z]/.test(remaining)) {
        location = remaining
        break
      }
    }
  }

  return { name, email, phone, url, location, profiles }
}

// --- Section content parsers ---

/** Bullet prefix (after cleanLines normalization) */
const BULLET_RE = /^-\s+/

/** Check if a line is primarily a standalone date range */
function isDateOnlyLine(line: string): boolean {
  return /^(?:(?:\d{1,2}\/)?(?:\d{4}))\s*[-–—]\s*(?:Present|Current|(?:\d{1,2}\/)?\d{4})$/i.test(line.trim())
}

/** Extract start/end from a date range string */
function parseDateStr(text: string): { start: string; end: string } | null {
  const m = text.match(/((?:\d{1,2}\/)?(\d{4}))\s*[-–—]\s*(Present|Current|(?:\d{1,2}\/)?\d{4})/i)
  if (!m) return null
  return { start: m[1], end: m[3] }
}

/** Parse "Title, Subtitle DateRange" header line */
function parseEntryHeader(line: string): {
  title: string; subtitle: string; startDate?: string; endDate?: string
} {
  let rest = line
  let startDate: string | undefined
  let endDate: string | undefined

  // Extract trailing date range
  const dateMatch = rest.match(/\s+((?:\d{1,2}\/)?(?:\d{4})\s*[-–—]\s*(?:Present|Current|(?:\d{1,2}\/)?(?:\d{4})))\s*$/i)
  if (dateMatch) {
    const dates = parseDateStr(dateMatch[1])
    if (dates) { startDate = dates.start; endDate = dates.end }
    rest = rest.substring(0, dateMatch.index!).trim()
  }

  const idx = rest.indexOf(',')
  if (idx > 0) {
    return { title: rest.substring(0, idx).trim(), subtitle: rest.substring(idx + 1).trim(), startDate, endDate }
  }
  return { title: rest.trim(), subtitle: '', startDate, endDate }
}

/** Parse experience section lines into structured work entries. */
export function parseExperienceLines(lines: string[]) {
  const entries: Array<{
    position: string; name: string; startDate?: string; endDate?: string; highlights: string[]
  }> = []
  let current: (typeof entries)[0] | null = null

  for (const line of lines) {
    if (!line.trim()) continue

    if (BULLET_RE.test(line)) {
      if (current) current.highlights.push(line.replace(BULLET_RE, ''))
    } else if (isDateOnlyLine(line)) {
      if (current && !current.startDate) {
        const dates = parseDateStr(line)
        if (dates) { current.startDate = dates.start; current.endDate = dates.end }
      }
    } else {
      if (current) entries.push(current)
      const h = parseEntryHeader(line)
      current = { position: h.title, name: h.subtitle, startDate: h.startDate, endDate: h.endDate, highlights: [] }
    }
  }

  if (current) entries.push(current)
  return entries
}

/** Parse education section lines into structured entries. */
export function parseEducationLines(lines: string[]) {
  const entries: Array<{
    institution: string; area?: string; studyType?: string; startDate?: string; endDate?: string
  }> = []

  for (const line of lines) {
    if (!line.trim() || BULLET_RE.test(line)) continue

    // Skip standalone date lines
    if (isDateOnlyLine(line)) continue

    const h = parseEntryHeader(line)
    const degreeRe = /^(B\.?S\.?c?\.?|M\.?S\.?c?\.?|Bachelor'?s?|Master'?s?|Ph\.?D\.?|MBA|Associate'?s?|Diploma)(?:\s+(?:in|of)\s+(.+))?$/i
    const dm = h.title.match(degreeRe)

    if (dm) {
      entries.push({ studyType: dm[1], area: dm[2], institution: h.subtitle, startDate: h.startDate, endDate: h.endDate })
    } else {
      entries.push({
        institution: h.subtitle || h.title,
        area: h.subtitle ? h.title : undefined,
        startDate: h.startDate,
        endDate: h.endDate,
      })
    }
  }

  return entries
}

/** Parse skills section lines into category + keywords entries. */
export function parseSkillLines(lines: string[]) {
  const entries: Array<{ name: string; keywords: string[] }> = []
  let category = ''

  for (const line of lines) {
    if (!line.trim()) continue

    const hasKeywords = line.includes('|') || line.split(',').length > 3

    if (hasKeywords) {
      const kw = line.includes('|')
        ? line.split('|').map(k => k.trim()).filter(Boolean)
        : line.split(',').map(k => k.trim()).filter(Boolean)

      if (category) {
        entries.push({ name: category, keywords: kw })
        category = ''
      } else if (entries.length > 0) {
        // No category — continuation of previous entry's keywords
        entries[entries.length - 1].keywords.push(...kw)
      } else {
        entries.push({ name: '', keywords: kw })
      }
    } else {
      category = line.trim()
    }
  }

  if (category) entries.push({ name: category, keywords: [] })
  return entries
}

/** Parse project section lines into structured entries. */
export function parseProjectLines(lines: string[]) {
  const entries: Array<{ name: string; description?: string; highlights: string[] }> = []
  let current: (typeof entries)[0] | null = null

  for (const line of lines) {
    if (!line.trim()) continue

    if (BULLET_RE.test(line)) {
      if (current) current.highlights.push(line.replace(BULLET_RE, ''))
    } else {
      if (current) entries.push(current)
      const h = parseEntryHeader(line)
      current = { name: h.title, description: h.subtitle || undefined, highlights: [] }
    }
  }

  if (current) entries.push(current)
  return entries
}

/** Parse language section lines. */
export function parseLanguageLines(lines: string[]) {
  return lines
    .filter(l => l.trim() && !BULLET_RE.test(l))
    .map(line => {
      const parts = line.split(/\s*[-–—:]\s*/)
      return { language: parts[0]?.trim() || line, fluency: parts[1]?.trim() }
    })
}

/** Parse certificate section lines. */
export function parseCertificateLines(lines: string[]) {
  return lines
    .filter(l => l.trim() && !BULLET_RE.test(l))
    .map(line => {
      const h = parseEntryHeader(line)
      return { name: h.title, issuer: h.subtitle || undefined, date: h.startDate }
    })
}
