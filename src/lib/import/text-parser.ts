/**
 * Text parser utilities for resume import.
 * Splits raw text into cleaned lines suitable for section mapping.
 */

/**
 * Parse raw text into cleaned, non-empty lines.
 * Handles CRLF/LF normalization, trimming, and empty line removal.
 */
export function parseText(raw: string): string[] {
  if (!raw || !raw.trim()) return []

  // Normalize line endings: CRLF -> LF
  const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Split on newlines, trim each line, filter empty
  return normalized
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

/**
 * Clean lines by merging continuation lines and normalizing bullet prefixes.
 * A continuation line is one that appears to be a sentence fragment
 * following a non-header line (no bullet, no all-caps, etc.).
 */
export function cleanLines(lines: string[]): string[] {
  if (lines.length === 0) return []

  const result: string[] = []
  const bulletPattern = /^[\-\*\u2022\u25E6\u25AA\u2023\u2043]\s/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Normalize common bullet characters to standard dash
    const normalizedLine = line
      .replace(/^[\u2022\u25E6\u25AA\u2023\u2043]\s/, '- ')
      .replace(/^\*\s/, '- ')

    // Check if this line looks like a continuation of the previous
    if (
      result.length > 0 &&
      !bulletPattern.test(line) &&
      !isSectionHeader(line) &&
      !looksLikeNewEntry(line) &&
      looksLikeContinuation(line, result[result.length - 1])
    ) {
      // Merge with previous line
      result[result.length - 1] = result[result.length - 1] + ' ' + normalizedLine
    } else {
      result.push(normalizedLine)
    }
  }

  return result
}

/** Check if a line looks like a section header (short, possibly all-caps or title case). */
function isSectionHeader(line: string): boolean {
  if (line.length > 60) return false
  // All caps line (2+ words)
  if (/^[A-Z\s&,/]+$/.test(line) && line.length >= 3) return true
  // Common section keywords
  const headerKeywords = /^(experience|education|skills|summary|objective|profile|certifications?|projects?|languages?|volunteer|work\s*history|employment|qualifications?|technical|professional|about\s*me|contact)/i
  return headerKeywords.test(line.trim())
}

/** Check if a line looks like a new entry (date, company, role). */
function looksLikeNewEntry(line: string): boolean {
  // Lines with dates often start new entries
  const datePattern = /\b(19|20)\d{2}\b/
  // Lines with pipes or dashes separating fields
  const fieldSeparator = /\s[|–—-]\s/
  return datePattern.test(line) || fieldSeparator.test(line)
}

/** Check if a line is likely a continuation of the previous line. */
function looksLikeContinuation(current: string, previous: string): boolean {
  // Short fragments that start with lowercase are often continuations
  if (/^[a-z]/.test(current) && current.length < 80) return true
  // Previous line ends with a conjunction or preposition
  if (/\b(and|or|with|for|to|in|of|the|a)\s*$/i.test(previous)) return true
  return false
}
