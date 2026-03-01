import { NextResponse } from 'next/server'

/** Maximum file size: 5 MB */
export const MAX_FILE_SIZE = 5 * 1024 * 1024

/** PDF magic bytes: %PDF (0x25504446) */
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]

/** Minimum non-whitespace characters to consider a PDF as having extractable text */
const MIN_TEXT_LENGTH = 20

/** Validate that a buffer starts with PDF magic bytes. */
export function isValidPdf(buffer: Uint8Array): boolean {
  return (
    buffer.length >= 4 &&
    buffer[0] === PDF_MAGIC[0] &&
    buffer[1] === PDF_MAGIC[1] &&
    buffer[2] === PDF_MAGIC[2] &&
    buffer[3] === PDF_MAGIC[3]
  )
}

/** Check if extracted text indicates a scanned (image-only) PDF. */
export function isScannedPdf(text: string): boolean {
  const stripped = text.replace(/\s/g, '')
  return stripped.length < MIN_TEXT_LENGTH
}

/** Extract text from a PDF buffer using pdfjs-dist. */
export async function extractPdfText(buffer: Uint8Array): Promise<{ text: string; pages: number }> {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise

  const pageTexts: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const textContent = await page.getTextContent()
    const text = textContent.items
      .filter((item: Record<string, unknown>) => 'str' in item)
      .map((item: Record<string, unknown>) => item.str as string)
      .join(' ')
    pageTexts.push(text)
  }

  return { text: pageTexts.join('\n\n'), pages: doc.numPages }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Size validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File exceeds 5 MB limit' },
        { status: 400 }
      )
    }

    const buffer = new Uint8Array(await file.arrayBuffer())

    // PDF magic byte validation
    if (!isValidPdf(buffer)) {
      return NextResponse.json(
        { error: 'Invalid PDF file' },
        { status: 400 }
      )
    }

    const { text, pages } = await extractPdfText(buffer)

    // Scanned PDF detection
    if (isScannedPdf(text)) {
      return NextResponse.json(
        {
          error:
            'This PDF appears to be a scanned image. Try a text-based PDF or paste your resume as plain text.',
          scanned: true,
        },
        { status: 422 }
      )
    }

    return NextResponse.json({ text, pages })
  } catch (error) {
    console.error('PDF parse error:', error)
    return NextResponse.json(
      { error: 'Failed to parse PDF' },
      { status: 500 }
    )
  }
}
