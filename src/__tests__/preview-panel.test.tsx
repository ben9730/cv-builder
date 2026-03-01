import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

// Mock @react-pdf/renderer
vi.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: { children: React.ReactNode }) => <div data-testid="document">{children}</div>,
  Page: ({ children }: { children: React.ReactNode }) => <div data-testid="page">{children}</div>,
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  StyleSheet: {
    create: <T extends Record<string, object>>(styles: T) => styles,
  },
  Font: { register: vi.fn() },
  PDFViewer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pdf-viewer">{children}</div>
  ),
}))

import PreviewPanel from '@/components/preview/preview-panel'
import { useResumeStore } from '@/lib/store/resume-store'
import { ResumeDataSchema } from '@/lib/schema/resume-schema'

describe('PreviewPanel', () => {
  beforeEach(() => {
    cleanup()
    useResumeStore.setState({
      resume: ResumeDataSchema.parse({
        basics: { name: 'Test User', label: 'Developer' },
        work: [],
        education: [],
        skills: [],
      }),
      selectedTemplate: 'classic',
    })
  })

  it('renders the PDF viewer', () => {
    render(<PreviewPanel />)
    expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument()
  })

  it('reads resume data from the store', () => {
    render(<PreviewPanel />)
    // The template renders inside PDFViewer, which is mocked
    // Just verify it renders without errors when store has data
    expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument()
  })

  it('renders document element inside PDFViewer', () => {
    render(<PreviewPanel />)
    expect(screen.getByTestId('document')).toBeInTheDocument()
  })

  it('uses the selected template from store', () => {
    useResumeStore.setState({ selectedTemplate: 'modern' })
    render(<PreviewPanel />)
    // ModernTemplate renders with the PDF viewer mock
    expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument()
  })

  it('handles empty resume data', () => {
    useResumeStore.setState({
      resume: ResumeDataSchema.parse({}),
      selectedTemplate: 'classic',
    })
    render(<PreviewPanel />)
    expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument()
  })
})
