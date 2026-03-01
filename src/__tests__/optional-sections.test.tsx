import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CertificationsForm } from '@/components/editor/certifications-form'
import { ProjectsForm } from '@/components/editor/projects-form'
import { LanguagesForm } from '@/components/editor/languages-form'
import { VolunteerForm } from '@/components/editor/volunteer-form'
import { useResumeStore } from '@/lib/store/resume-store'

vi.mock('@/hooks/use-hydration', () => ({
  useHydration: () => true,
}))

const baseResume = () => ({
  basics: { name: '', profiles: [] },
  work: [],
  education: [],
  skills: [],
})

describe('CertificationsForm', () => {
  beforeEach(() => {
    cleanup()
    useResumeStore.setState({ resume: { ...baseResume(), certificates: [] } })
  })

  it('renders "Add Certification" button', () => {
    render(<CertificationsForm />)
    expect(screen.getByRole('button', { name: /add certification/i })).toBeInTheDocument()
  })

  it('clicking "Add Certification" shows name and issuer fields', async () => {
    const user = userEvent.setup()
    render(<CertificationsForm />)
    await user.click(screen.getByRole('button', { name: /add certification/i }))
    expect(screen.getByLabelText(/certification name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/issuer/i)).toBeInTheDocument()
  })

  it('renders pre-populated entries from store', () => {
    useResumeStore.setState({
      resume: {
        ...baseResume(),
        certificates: [{ name: 'AWS SAA', issuer: 'Amazon', date: undefined, url: undefined }],
      },
    })
    render(<CertificationsForm />)
    expect(screen.getByText('AWS SAA')).toBeInTheDocument()
  })
})

describe('ProjectsForm', () => {
  beforeEach(() => {
    cleanup()
    useResumeStore.setState({ resume: { ...baseResume(), projects: [] } })
  })

  it('renders "Add Project" button', () => {
    render(<ProjectsForm />)
    expect(screen.getByRole('button', { name: /add project/i })).toBeInTheDocument()
  })

  it('clicking "Add Project" shows name and description fields', async () => {
    const user = userEvent.setup()
    render(<ProjectsForm />)
    await user.click(screen.getByRole('button', { name: /add project/i }))
    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('shows technologies (TagInput) and highlights fields', async () => {
    const user = userEvent.setup()
    render(<ProjectsForm />)
    await user.click(screen.getByRole('button', { name: /add project/i }))
    expect(screen.getByText(/technologies/i)).toBeInTheDocument()
    expect(screen.getByText(/highlights/i)).toBeInTheDocument()
  })

  it('renders pre-populated entries from store', () => {
    useResumeStore.setState({
      resume: {
        ...baseResume(),
        projects: [
          { name: 'CV Builder', description: 'A resume builder', highlights: [], keywords: ['React'], startDate: undefined, endDate: undefined, url: undefined, roles: [] },
        ],
      },
    })
    render(<ProjectsForm />)
    expect(screen.getByText('CV Builder')).toBeInTheDocument()
  })
})

describe('LanguagesForm', () => {
  beforeEach(() => {
    cleanup()
    useResumeStore.setState({ resume: { ...baseResume(), languages: [] } })
  })

  it('renders "Add Language" button', () => {
    render(<LanguagesForm />)
    expect(screen.getByRole('button', { name: /add language/i })).toBeInTheDocument()
  })

  it('clicking "Add Language" shows language and fluency fields', async () => {
    const user = userEvent.setup()
    render(<LanguagesForm />)
    await user.click(screen.getByRole('button', { name: /add language/i }))
    expect(screen.getByLabelText(/language/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fluency/i)).toBeInTheDocument()
  })

  it('renders pre-populated entries from store', () => {
    useResumeStore.setState({
      resume: {
        ...baseResume(),
        languages: [{ language: 'English', fluency: 'Native' }],
      },
    })
    render(<LanguagesForm />)
    expect(screen.getByDisplayValue('English')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Native')).toBeInTheDocument()
  })
})

describe('VolunteerForm', () => {
  beforeEach(() => {
    cleanup()
    useResumeStore.setState({ resume: { ...baseResume(), volunteer: [] } })
  })

  it('renders "Add Volunteer Entry" button', () => {
    render(<VolunteerForm />)
    expect(screen.getByRole('button', { name: /add volunteer entry/i })).toBeInTheDocument()
  })

  it('clicking "Add Volunteer Entry" shows organization and position fields', async () => {
    const user = userEvent.setup()
    render(<VolunteerForm />)
    await user.click(screen.getByRole('button', { name: /add volunteer entry/i }))
    expect(screen.getByLabelText(/organization/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/position/i)).toBeInTheDocument()
  })

  it('renders pre-populated entries from store', () => {
    useResumeStore.setState({
      resume: {
        ...baseResume(),
        volunteer: [
          { organization: 'Red Cross', position: 'Coordinator', highlights: [], startDate: undefined, endDate: undefined, summary: undefined, url: undefined },
        ],
      },
    })
    render(<VolunteerForm />)
    expect(screen.getByText('Coordinator at Red Cross')).toBeInTheDocument()
  })

  it('can add highlight bullets', async () => {
    const user = userEvent.setup()
    render(<VolunteerForm />)
    await user.click(screen.getByRole('button', { name: /add volunteer entry/i }))
    await user.click(screen.getByRole('button', { name: /add bullet/i }))
    const bullets = screen.getAllByPlaceholderText(/describe an achievement/i)
    expect(bullets).toHaveLength(1)
  })
})
