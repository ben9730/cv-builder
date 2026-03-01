import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditorLayout } from '@/components/editor/editor-layout'
import { useResumeStore } from '@/lib/store/resume-store'

vi.mock('@/hooks/use-hydration', () => ({
  useHydration: () => true,
}))

// Mock @react-pdf/renderer to avoid SSR issues in tests
vi.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: { children: React.ReactNode }) => <div data-testid="document">{children}</div>,
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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

// Mock next/dynamic to render the component directly (no SSR gating in test)
vi.mock('next/dynamic', () => ({
  default: (loader: () => Promise<{ default: React.ComponentType }>) => {
    // Eagerly resolve the dynamic import for testing
    let Component: React.ComponentType | null = null
    const promise = loader()
    promise.then((mod) => {
      Component = mod.default
    })
    return function DynamicComponent(props: Record<string, unknown>) {
      if (Component) return <Component {...props} />
      return <div data-testid="preview-loading">Loading preview...</div>
    }
  },
}))

describe('EditorLayout', () => {
  beforeEach(() => {
    cleanup()
    useResumeStore.setState({
      resume: {
        basics: { name: '', profiles: [] },
        work: [],
        education: [],
        skills: [],
      },
      selectedTemplate: 'classic',
    })
  })

  it('renders sidebar with core sections', () => {
    render(<EditorLayout />)
    expect(screen.getByRole('navigation', { name: /resume sections/i })).toBeInTheDocument()
    // Both sidebar and mobile tabs render section names, so use getAllByText
    expect(screen.getAllByText('Contact').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Summary').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Experience').length).toBeGreaterThanOrEqual(1)
  })

  it('defaults to Contact section on load', () => {
    render(<EditorLayout />)
    // ContactForm renders a "Name" label
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
  })

  it('switches sections when clicking sidebar items', async () => {
    const user = userEvent.setup()
    render(<EditorLayout />)
    // Click on Experience in the sidebar (find the sidebar nav button, not mobile tab)
    const navButtons = screen.getAllByText('Experience')
    await user.click(navButtons[0])
    // Experience form shows "Add Experience" button
    expect(screen.getByRole('button', { name: /add experience/i })).toBeInTheDocument()
  })

  it('can add and navigate to an optional section', async () => {
    const user = userEvent.setup()
    render(<EditorLayout />)
    // Click "Add Section"
    const addButtons = screen.getAllByRole('button', { name: /add section/i })
    await user.click(addButtons[0])
    // Click "Certifications"
    await user.click(screen.getByText('Certifications'))
    // Should now see the certifications form
    expect(screen.getByRole('button', { name: /add certification/i })).toBeInTheDocument()
  })

  it('renders all section forms when navigated to', async () => {
    const user = userEvent.setup()
    render(<EditorLayout />)

    // Navigate to Summary
    const summaryButtons = screen.getAllByText('Summary')
    await user.click(summaryButtons[0])
    expect(screen.getByLabelText(/professional summary/i)).toBeInTheDocument()

    // Navigate to Skills
    const skillsButtons = screen.getAllByText('Skills')
    await user.click(skillsButtons[0])
    expect(screen.getByRole('button', { name: /add skill group/i })).toBeInTheDocument()

    // Navigate to Education
    const educationButtons = screen.getAllByText('Education')
    await user.click(educationButtons[0])
    expect(screen.getByRole('button', { name: /add education/i })).toBeInTheDocument()
  })

  it('renders template switcher with all three templates', () => {
    render(<EditorLayout />)
    expect(screen.getByText('Classic')).toBeInTheDocument()
    expect(screen.getByText('Modern')).toBeInTheDocument()
    expect(screen.getByText('Minimal')).toBeInTheDocument()
  })

  it('renders page indicator', () => {
    render(<EditorLayout />)
    expect(screen.getByText(/page 1 of 1/i)).toBeInTheDocument()
  })

  it('has a mobile preview toggle button', () => {
    render(<EditorLayout />)
    expect(screen.getByLabelText(/switch to preview mode/i)).toBeInTheDocument()
  })
})
