import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock pdfjs-dist before importing the route
const mockGetDocument = vi.fn()

vi.mock('pdfjs-dist/legacy/build/pdf.mjs', () => ({
  getDocument: mockGetDocument,
}))

// Mock the worker side-effect import (no exports needed)
vi.mock('pdfjs-dist/legacy/build/pdf.worker.mjs', () => ({}))

import {
  isValidPdf,
  isScannedPdf,
  extractPdfText,
  MAX_FILE_SIZE,
  POST,
} from '@/app/api/parse/route'

describe('isValidPdf', () => {
  it('returns true for valid PDF magic bytes', () => {
    const buffer = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x00])
    expect(isValidPdf(buffer)).toBe(true)
  })

  it('returns false for non-PDF bytes', () => {
    const buffer = new Uint8Array([0x48, 0x54, 0x4d, 0x4c])
    expect(isValidPdf(buffer)).toBe(false)
  })

  it('returns false for buffer too short', () => {
    const buffer = new Uint8Array([0x25, 0x50])
    expect(isValidPdf(buffer)).toBe(false)
  })

  it('returns false for empty buffer', () => {
    const buffer = new Uint8Array(0)
    expect(isValidPdf(buffer)).toBe(false)
  })
})

describe('isScannedPdf', () => {
  it('returns true when text has fewer than 20 non-whitespace chars', () => {
    expect(isScannedPdf('')).toBe(true)
    expect(isScannedPdf('   ')).toBe(true)
    expect(isScannedPdf('short')).toBe(true)
  })

  it('returns false when text has 20+ non-whitespace chars', () => {
    expect(isScannedPdf('This has enough text to pass the check')).toBe(false)
  })
})

describe('MAX_FILE_SIZE', () => {
  it('is 5 MB', () => {
    expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024)
  })
})

describe('extractPdfText', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('extracts text from single page PDF', async () => {
    mockGetDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn().mockResolvedValue({
          getTextContent: vi.fn().mockResolvedValue({
            items: [
              { str: 'John Doe' },
              { str: ' - Software Engineer' },
            ],
          }),
        }),
      }),
    })

    const buffer = new Uint8Array([0x25, 0x50, 0x44, 0x46])
    const result = await extractPdfText(buffer)

    expect(result.text).toContain('John Doe')
    expect(result.text).toContain('Software Engineer')
    expect(result.pages).toBe(1)
  })

  it('extracts text from multi-page PDF', async () => {
    const mockGetPage = vi.fn()
      .mockResolvedValueOnce({
        getTextContent: vi.fn().mockResolvedValue({
          items: [{ str: 'Page 1 content' }],
        }),
      })
      .mockResolvedValueOnce({
        getTextContent: vi.fn().mockResolvedValue({
          items: [{ str: 'Page 2 content' }],
        }),
      })

    mockGetDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 2,
        getPage: mockGetPage,
      }),
    })

    const buffer = new Uint8Array([0x25, 0x50, 0x44, 0x46])
    const result = await extractPdfText(buffer)

    expect(result.text).toContain('Page 1')
    expect(result.text).toContain('Page 2')
    expect(result.pages).toBe(2)
  })

  it('returns empty text for PDF with no text items', async () => {
    mockGetDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn().mockResolvedValue({
          getTextContent: vi.fn().mockResolvedValue({
            items: [],
          }),
        }),
      }),
    })

    const buffer = new Uint8Array([0x25, 0x50, 0x44, 0x46])
    const result = await extractPdfText(buffer)

    expect(result.text.trim()).toBe('')
    expect(result.pages).toBe(1)
  })
})

describe('POST /api/parse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when no file provided', async () => {
    const formData = new FormData()
    const request = new Request('http://localhost/api/parse', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('No file provided')
  })

  it('returns 400 for non-PDF file', async () => {
    const file = new File(['hello world this is plain text content'], 'test.txt', {
      type: 'text/plain',
    })
    const formData = new FormData()
    formData.append('file', file)
    const request = new Request('http://localhost/api/parse', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Invalid PDF file')
  })
})
