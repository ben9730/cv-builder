/** Client-side PDF text extraction using pdfjs-dist (browser environment). */

export class ScannedPdfError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ScannedPdfError'
  }
}

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]
const MIN_TEXT_LENGTH = 20

/**
 * Extract text from a PDF file in the browser using pdfjs-dist.
 * Throws ScannedPdfError if the PDF has no extractable text.
 */
export async function extractPdfTextClient(
  file: File
): Promise<{ text: string; pages: number }> {
  const pdfjsLib = await import('pdfjs-dist')

  // Set worker source (CDN) if not already configured
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
  }

  const buffer = new Uint8Array(await file.arrayBuffer())

  // Validate PDF magic bytes
  if (
    buffer.length < 4 ||
    buffer[0] !== PDF_MAGIC[0] ||
    buffer[1] !== PDF_MAGIC[1] ||
    buffer[2] !== PDF_MAGIC[2] ||
    buffer[3] !== PDF_MAGIC[3]
  ) {
    throw new Error('Invalid PDF file')
  }

  const doc = await pdfjsLib.getDocument({ data: buffer }).promise

  const pageTexts: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const textContent = await page.getTextContent()
    const parts: string[] = []

    for (const item of textContent.items) {
      if (!('str' in item)) continue
      const textItem = item as Record<string, unknown>
      parts.push(textItem.str as string)
      if (textItem.hasEOL) {
        parts.push('\n')
      }
    }

    pageTexts.push(parts.join(''))
  }

  const text = pageTexts.join('\n\n')

  // Detect scanned/image-only PDFs
  const stripped = text.replace(/\s/g, '')
  if (stripped.length < MIN_TEXT_LENGTH) {
    throw new ScannedPdfError(
      'This PDF appears to be a scanned image. Try a text-based PDF or paste your resume as plain text.'
    )
  }

  return { text, pages: doc.numPages }
}
