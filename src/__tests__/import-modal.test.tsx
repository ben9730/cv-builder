import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImportButton } from '@/components/import/import-button'
import { Dropzone } from '@/components/import/dropzone'
import { TextPaste } from '@/components/import/text-paste'
import { ReviewPanel } from '@/components/import/review-panel'
import type { MappedSection } from '@/lib/import/pdf-types'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}))

// Mock the resume store
const mockSetResume = vi.fn()
const mockResume = {
  basics: { name: '', profiles: [] },
  work: [],
  education: [],
  skills: [],
}

vi.mock('@/lib/store/resume-store', () => ({
  useResumeStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      resume: mockResume,
      setResume: mockSetResume,
      selectedTemplate: 'classic',
    }),
}))

// Mock json-export
vi.mock('@/components/export/json-export', () => ({
  exportJson: vi.fn(),
}))

afterEach(() => {
  cleanup()
})

describe('Dropzone', () => {
  it('renders upload prompt text', () => {
    render(<Dropzone onFile={vi.fn()} />)
    expect(screen.getByText(/drop a file here or click to browse/i)).toBeInTheDocument()
  })

  it('renders file type hints and size limit', () => {
    render(<Dropzone onFile={vi.fn()} />)
    // Text contains both "PDF, TXT, or JSON" and "Max 5 MB" on the same line
    expect(screen.getByText(/max 5 mb/i)).toBeInTheDocument()
  })

  it('applies disabled styling when disabled', () => {
    render(<Dropzone onFile={vi.fn()} disabled />)
    const dropzone = screen.getByRole('button', { name: /upload a file/i })
    expect(dropzone.className).toContain('opacity-50')
    expect(dropzone.className).toContain('cursor-not-allowed')
  })

  it('has keyboard accessible upload trigger', () => {
    render(<Dropzone onFile={vi.fn()} />)
    const dropzone = screen.getByRole('button', { name: /upload a file/i })
    expect(dropzone).toHaveAttribute('tabindex', '0')
  })

  it('calls onFile when file is selected via input', async () => {
    const user = userEvent.setup()
    const onFile = vi.fn()
    const { container } = render(<Dropzone onFile={onFile} />)

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['test content'], 'resume.pdf', { type: 'application/pdf' })
    await user.upload(input, file)

    expect(onFile).toHaveBeenCalledWith(file)
  })

  it('rejects files over 5 MB', async () => {
    const { toast } = await import('sonner')
    const user = userEvent.setup()
    const onFile = vi.fn()
    const { container } = render(<Dropzone onFile={onFile} />)

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    // Create a file object with size > 5MB
    const bigContent = new Uint8Array(6 * 1024 * 1024)
    const file = new File([bigContent], 'big.pdf', { type: 'application/pdf' })
    await user.upload(input, file)

    expect(onFile).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith('File exceeds 5 MB limit')
  })
})

describe('TextPaste', () => {
  it('renders textarea with placeholder', () => {
    render(<TextPaste onText={vi.fn()} />)
    expect(screen.getByPlaceholderText(/paste your resume text here/i)).toBeInTheDocument()
  })

  it('renders Import Text button disabled by default', () => {
    render(<TextPaste onText={vi.fn()} />)
    expect(screen.getByRole('button', { name: /import text/i })).toBeDisabled()
  })

  it('enables button when text is entered', async () => {
    const user = userEvent.setup()
    render(<TextPaste onText={vi.fn()} />)

    const textarea = screen.getByPlaceholderText(/paste your resume text here/i)
    await user.type(textarea, 'Some resume content')

    expect(screen.getByRole('button', { name: /import text/i })).not.toBeDisabled()
  })

  it('calls onText with entered text when button clicked', async () => {
    const user = userEvent.setup()
    const onText = vi.fn()
    render(<TextPaste onText={onText} />)

    const textarea = screen.getByPlaceholderText(/paste your resume text here/i)
    await user.type(textarea, 'My resume content')
    await user.click(screen.getByRole('button', { name: /import text/i }))

    expect(onText).toHaveBeenCalledWith('My resume content')
  })

  it('disables textarea and button when disabled prop is true', () => {
    render(<TextPaste onText={vi.fn()} disabled />)
    expect(screen.getByPlaceholderText(/paste your resume text here/i)).toBeDisabled()
  })
})

describe('ReviewPanel', () => {
  const mockSections: MappedSection[] = [
    { type: 'contact', content: 'John Doe\njohn@example.com', confidence: 'high', rawLines: ['John Doe', 'john@example.com'] },
    { type: 'experience', content: 'Software Engineer at Acme', confidence: 'high', rawLines: ['Software Engineer at Acme'] },
    { type: 'education', content: 'BS Computer Science', confidence: 'medium', rawLines: ['BS Computer Science'] },
    { type: 'skills', content: 'JavaScript, React', confidence: 'low', rawLines: ['JavaScript, React'] },
  ]

  it('renders all sections with checkboxes', () => {
    render(<ReviewPanel sections={mockSections} onAccept={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('Experience')).toBeInTheDocument()
    expect(screen.getByText('Education')).toBeInTheDocument()
    expect(screen.getByText('Skills')).toBeInTheDocument()

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(4)
    // All checked by default
    checkboxes.forEach((cb) => expect(cb).toBeChecked())
  })

  it('shows selected count', () => {
    render(<ReviewPanel sections={mockSections} onAccept={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('4 of 4 sections selected')).toBeInTheDocument()
  })

  it('displays confidence badges', () => {
    render(<ReviewPanel sections={mockSections} onAccept={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getAllByText('high')).toHaveLength(2)
    expect(screen.getByText('medium')).toBeInTheDocument()
    expect(screen.getByText('low')).toBeInTheDocument()
  })

  it('applies amber styling to low confidence sections', () => {
    const { container } = render(
      <ReviewPanel sections={mockSections} onAccept={vi.fn()} onCancel={vi.fn()} />
    )
    // The skills section (low confidence) should have amber border
    const cards = container.querySelectorAll('[data-slot="card"]')
    const skillsCard = cards[3]
    expect(skillsCard.className).toContain('border-amber')
  })

  it('unchecking a section excludes it from accept', async () => {
    const user = userEvent.setup()
    const onAccept = vi.fn()
    render(<ReviewPanel sections={mockSections} onAccept={onAccept} onCancel={vi.fn()} />)

    // Uncheck the education section
    const educationCheckbox = screen.getByLabelText(/include education section/i)
    await user.click(educationCheckbox)

    expect(screen.getByText('3 of 4 sections selected')).toBeInTheDocument()

    // Click accept
    await user.click(screen.getByRole('button', { name: /accept import/i }))

    // Should only include 3 sections
    expect(onAccept).toHaveBeenCalledTimes(1)
    const accepted = onAccept.mock.calls[0][0]
    expect(accepted).toHaveLength(3)
    expect(accepted.find((s: MappedSection) => s.type === 'education')).toBeUndefined()
  })

  it('allows inline editing of section content', async () => {
    const user = userEvent.setup()
    const onAccept = vi.fn()
    render(<ReviewPanel sections={mockSections} onAccept={onAccept} onCancel={vi.fn()} />)

    // Get the contact section textarea by its label
    const contactTextarea = screen.getByLabelText(/contact content/i)
    await user.clear(contactTextarea)
    await user.type(contactTextarea, 'Jane Smith')

    await user.click(screen.getByRole('button', { name: /accept import/i }))

    const accepted = onAccept.mock.calls[0][0]
    const contact = accepted.find((s: MappedSection) => s.type === 'contact')
    expect(contact.content).toBe('Jane Smith')
  })

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ReviewPanel sections={mockSections} onAccept={vi.fn()} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('disables accept button when no sections are checked', async () => {
    const user = userEvent.setup()
    const singleSection: MappedSection[] = [
      { type: 'contact', content: 'John Doe', confidence: 'high', rawLines: ['John Doe'] },
    ]
    render(<ReviewPanel sections={singleSection} onAccept={vi.fn()} onCancel={vi.fn()} />)

    // Uncheck the only section
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(screen.getByRole('button', { name: /accept import/i })).toBeDisabled()
  })
})

describe('ImportButton', () => {
  it('renders the import button', () => {
    render(<ImportButton />)
    expect(screen.getByRole('button', { name: /import resume/i })).toBeInTheDocument()
    expect(screen.getByText('Import')).toBeInTheDocument()
  })

  it('opens modal when clicked', async () => {
    const user = userEvent.setup()
    render(<ImportButton />)

    await user.click(screen.getByRole('button', { name: /import resume/i }))

    // Modal should be open with title
    expect(screen.getByText('Import Resume')).toBeInTheDocument()
  })

  it('shows dropzone in idle state', async () => {
    const user = userEvent.setup()
    render(<ImportButton />)

    await user.click(screen.getByRole('button', { name: /import resume/i }))

    expect(screen.getByText(/drop a file here or click to browse/i)).toBeInTheDocument()
  })

  it('shows tab toggle between Upload File and Paste Text', async () => {
    const user = userEvent.setup()
    render(<ImportButton />)

    await user.click(screen.getByRole('button', { name: /import resume/i }))

    expect(screen.getByRole('tab', { name: /upload file/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /paste text/i })).toBeInTheDocument()
  })

  it('switches to paste text tab', async () => {
    const user = userEvent.setup()
    render(<ImportButton />)

    await user.click(screen.getByRole('button', { name: /import resume/i }))
    await user.click(screen.getByRole('tab', { name: /paste text/i }))

    expect(screen.getByPlaceholderText(/paste your resume text here/i)).toBeInTheDocument()
  })

  it('closes modal when close button clicked', async () => {
    const user = userEvent.setup()
    render(<ImportButton />)

    await user.click(screen.getByRole('button', { name: /import resume/i }))
    expect(screen.getByText('Import Resume')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /close/i }))

    // Modal title should no longer be visible
    expect(screen.queryByText('Import Resume')).not.toBeInTheDocument()
  })
})
