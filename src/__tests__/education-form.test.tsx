import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EducationForm } from '@/components/editor/education-form'
import { useResumeStore } from '@/lib/store/resume-store'

vi.mock('@/hooks/use-hydration', () => ({
  useHydration: () => true,
}))

describe('EducationForm', () => {
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

  it('renders "Add Education" button', () => {
    render(<EducationForm />)
    expect(screen.getByRole('button', { name: /add education/i })).toBeInTheDocument()
  })

  it('clicking "Add Education" adds a new entry and shows fields', async () => {
    const user = userEvent.setup()
    render(<EducationForm />)
    await user.click(screen.getByRole('button', { name: /add education/i }))
    expect(screen.getByLabelText(/institution/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/degree/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/field of study/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/gpa/i)).toBeInTheDocument()
  })

  it('renders pre-populated entries from store', () => {
    useResumeStore.setState({
      resume: {
        ...useResumeStore.getState().resume,
        education: [
          { institution: 'MIT', area: 'CS', studyType: 'BS', courses: [], startDate: undefined, endDate: undefined, score: undefined, url: undefined },
        ],
      },
    })
    render(<EducationForm />)
    expect(screen.getByText('BS in CS')).toBeInTheDocument()
  })
})
