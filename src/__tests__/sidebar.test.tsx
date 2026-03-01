import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from '@/components/editor/sidebar'
import type { ResumeData } from '@/types/resume'

const emptyResume: ResumeData = {
  basics: { name: '', profiles: [] },
  work: [],
  education: [],
  skills: [],
}

const defaultProps = () => ({
  activeSection: 'contact' as const,
  setActiveSection: vi.fn(),
  visibleSections: ['contact', 'summary', 'experience', 'education', 'skills'] as any,
  availableOptionalSections: ['certificates', 'projects', 'languages', 'volunteer'] as const,
  onAddOptionalSection: vi.fn(),
  resume: emptyResume,
})

describe('Sidebar', () => {
  beforeEach(() => {
    cleanup()
  })

  it('renders all 5 core section names', () => {
    render(<Sidebar {...defaultProps()} />)
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText('Experience')).toBeInTheDocument()
    expect(screen.getByText('Education')).toBeInTheDocument()
    expect(screen.getByText('Skills')).toBeInTheDocument()
  })

  it('does NOT render optional sections by default', () => {
    render(<Sidebar {...defaultProps()} />)
    expect(screen.queryByText('Certifications')).not.toBeInTheDocument()
    expect(screen.queryByText('Projects')).not.toBeInTheDocument()
    expect(screen.queryByText('Languages')).not.toBeInTheDocument()
    expect(screen.queryByText('Volunteer')).not.toBeInTheDocument()
  })

  it('clicking a section calls setActiveSection', async () => {
    const user = userEvent.setup()
    const props = defaultProps()
    render(<Sidebar {...props} />)
    await user.click(screen.getByText('Experience'))
    expect(props.setActiveSection).toHaveBeenCalledWith('experience')
  })

  it('renders "Add Section" button when optional sections are available', () => {
    render(<Sidebar {...defaultProps()} />)
    expect(screen.getByRole('button', { name: /add section/i })).toBeInTheDocument()
  })

  it('clicking "Add Section" shows available optional sections', async () => {
    const user = userEvent.setup()
    render(<Sidebar {...defaultProps()} />)
    await user.click(screen.getByRole('button', { name: /add section/i }))
    expect(screen.getByText('Certifications')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Languages')).toBeInTheDocument()
    expect(screen.getByText('Volunteer')).toBeInTheDocument()
  })

  it('clicking an optional section calls onAddOptionalSection', async () => {
    const user = userEvent.setup()
    const props = defaultProps()
    render(<Sidebar {...props} />)
    await user.click(screen.getByRole('button', { name: /add section/i }))
    await user.click(screen.getByText('Certifications'))
    expect(props.onAddOptionalSection).toHaveBeenCalledWith('certificates')
  })

  it('shows optional sections when included in visibleSections', () => {
    const props = defaultProps()
    props.visibleSections = ['contact', 'summary', 'experience', 'education', 'skills', 'certificates'] as any
    props.availableOptionalSections = ['projects', 'languages', 'volunteer'] as any
    render(<Sidebar {...props} />)
    expect(screen.getByText('Certifications')).toBeInTheDocument()
  })

  it('shows completion hint when contact has a name', () => {
    const props = defaultProps()
    props.resume = {
      ...emptyResume,
      basics: { name: 'Jane Smith', profiles: [] },
    }
    render(<Sidebar {...props} />)
    expect(screen.getByLabelText('Contact complete')).toBeInTheDocument()
  })

  it('shows completion hint when experience has entries', () => {
    const props = defaultProps()
    props.resume = {
      ...emptyResume,
      work: [{ name: 'Acme', position: 'Dev', highlights: [] }],
    }
    render(<Sidebar {...props} />)
    expect(screen.getByLabelText('Experience complete')).toBeInTheDocument()
  })

  it('does not show "Add Section" button when all optional sections are added', () => {
    const props = defaultProps()
    props.availableOptionalSections = [] as any
    render(<Sidebar {...props} />)
    expect(screen.queryByRole('button', { name: /add section/i })).not.toBeInTheDocument()
  })
})
