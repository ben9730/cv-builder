import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExperienceForm } from '@/components/editor/experience-form'
import { useResumeStore } from '@/lib/store/resume-store'

vi.mock('@/hooks/use-hydration', () => ({
  useHydration: () => true,
}))

describe('ExperienceForm', () => {
  beforeEach(() => {
    cleanup()
    useResumeStore.setState({
      resume: {
        basics: { name: '', profiles: [] },
        work: [],
        education: [],
        skills: [],
      },
    })
  })

  it('renders "Add Experience" button', () => {
    render(<ExperienceForm />)
    expect(screen.getByRole('button', { name: /add experience/i })).toBeInTheDocument()
  })

  it('clicking "Add Experience" adds a new entry card', async () => {
    const user = userEvent.setup()
    render(<ExperienceForm />)
    await user.click(screen.getByRole('button', { name: /add experience/i }))
    expect(screen.getByText(/employer/i)).toBeInTheDocument()
  })

  it('shows employer and position fields when expanded', async () => {
    const user = userEvent.setup()
    render(<ExperienceForm />)
    await user.click(screen.getByRole('button', { name: /add experience/i }))
    expect(screen.getByLabelText(/employer/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument()
  })

  it('renders pre-populated entries from store', () => {
    useResumeStore.setState({
      resume: {
        ...useResumeStore.getState().resume,
        work: [
          { name: 'Acme Corp', position: 'Developer', highlights: [], startDate: undefined, endDate: undefined, summary: undefined, url: undefined, location: undefined },
        ],
      },
    })
    render(<ExperienceForm />)
    expect(screen.getByText('Developer at Acme Corp')).toBeInTheDocument()
  })

  it('can add and see highlight bullet', async () => {
    const user = userEvent.setup()
    render(<ExperienceForm />)
    await user.click(screen.getByRole('button', { name: /add experience/i }))
    await user.click(screen.getByRole('button', { name: /add bullet/i }))
    const bullets = screen.getAllByPlaceholderText(/describe an achievement/i)
    expect(bullets).toHaveLength(1)
  })
})
