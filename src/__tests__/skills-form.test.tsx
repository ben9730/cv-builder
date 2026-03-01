import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SkillsForm } from '@/components/editor/skills-form'
import { useResumeStore } from '@/lib/store/resume-store'

vi.mock('@/hooks/use-hydration', () => ({
  useHydration: () => true,
}))

describe('SkillsForm', () => {
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

  it('renders "Add Skill Group" button', () => {
    render(<SkillsForm />)
    expect(screen.getByRole('button', { name: /add skill group/i })).toBeInTheDocument()
  })

  it('clicking "Add Skill Group" creates a new card with category input', async () => {
    const user = userEvent.setup()
    render(<SkillsForm />)
    await user.click(screen.getByRole('button', { name: /add skill group/i }))
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
  })

  it('user can type category name', async () => {
    const user = userEvent.setup()
    render(<SkillsForm />)
    await user.click(screen.getByRole('button', { name: /add skill group/i }))
    const categoryInput = screen.getByLabelText(/category/i)
    await user.type(categoryInput, 'Frontend')
    expect(categoryInput).toHaveValue('Frontend')
  })

  it('renders pre-populated skills from store', () => {
    useResumeStore.setState({
      resume: {
        ...useResumeStore.getState().resume,
        skills: [
          { name: 'Frontend', keywords: ['React', 'TypeScript'] },
        ],
      },
    })
    render(<SkillsForm />)
    expect(screen.getByDisplayValue('Frontend')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })
})
