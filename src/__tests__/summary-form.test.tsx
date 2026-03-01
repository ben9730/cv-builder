import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SummaryForm } from '@/components/editor/summary-form'
import { useResumeStore } from '@/lib/store/resume-store'

vi.mock('@/hooks/use-hydration', () => ({
  useHydration: () => true,
}))

describe('SummaryForm', () => {
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

  it('renders a textarea', () => {
    render(<SummaryForm />)
    expect(screen.getByLabelText(/professional summary/i)).toBeInTheDocument()
  })

  it('user can type summary text', async () => {
    const user = userEvent.setup()
    render(<SummaryForm />)
    const textarea = screen.getByLabelText(/professional summary/i)
    await user.type(textarea, 'Experienced developer')
    expect(textarea).toHaveValue('Experienced developer')
  })

  it('syncs changes back to store', async () => {
    const user = userEvent.setup()
    render(<SummaryForm />)
    const textarea = screen.getByLabelText(/professional summary/i)
    await user.type(textarea, 'Senior engineer')

    await waitFor(() => {
      expect(useResumeStore.getState().resume.basics.summary).toBe('Senior engineer')
    })
  })
})
