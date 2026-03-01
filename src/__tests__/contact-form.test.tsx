import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from '@/components/editor/contact-form'
import { useResumeStore } from '@/lib/store/resume-store'

// Mock useHydration to always return true in tests
vi.mock('@/hooks/use-hydration', () => ({
  useHydration: () => true,
}))

describe('ContactForm', () => {
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

  it('renders all contact fields', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument()
  })

  it('user can type in name field', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    const nameInput = screen.getByLabelText(/full name/i)
    await user.type(nameInput, 'John Doe')
    expect(nameInput).toHaveValue('John Doe')
  })

  it('loads initial values from store', () => {
    useResumeStore.setState({
      resume: {
        ...useResumeStore.getState().resume,
        basics: {
          name: 'Jane Smith',
          email: 'jane@test.com',
          profiles: [],
        },
      },
    })
    render(<ContactForm />)
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Jane Smith')
    expect(screen.getByLabelText(/email/i)).toHaveValue('jane@test.com')
  })

  it('syncs changes back to store', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    const nameInput = screen.getByLabelText(/full name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Test User')

    await waitFor(() => {
      expect(useResumeStore.getState().resume.basics.name).toBe('Test User')
    })
  })
})
