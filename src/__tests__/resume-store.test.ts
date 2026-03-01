import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import { useResumeStore } from '@/lib/store/resume-store'
import { ResumeDataSchema } from '@/lib/schema/resume-schema'

const STORAGE_KEY = 'cv-builder-resume'
const DEFAULT_RESUME = ResumeDataSchema.parse({})

describe('useResumeStore', () => {
  beforeEach(() => {
    // Clear localStorage and reset store before each test
    localStorage.clear()
    act(() => {
      useResumeStore.setState({ resume: DEFAULT_RESUME })
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('initializes with default empty resume', () => {
    const { resume } = useResumeStore.getState()
    expect(resume.basics.name).toBe('')
    expect(resume.work).toEqual([])
    expect(resume.education).toEqual([])
    expect(resume.skills).toEqual([])
  })

  it('setResume replaces entire resume and the new value is readable', () => {
    const newResume = ResumeDataSchema.parse({
      basics: { name: 'John Doe', email: 'john@example.com' },
      work: [{ name: 'Acme Corp', position: 'Engineer' }],
    })

    act(() => {
      useResumeStore.getState().setResume(newResume)
    })

    const { resume } = useResumeStore.getState()
    expect(resume.basics.name).toBe('John Doe')
    expect(resume.basics.email).toBe('john@example.com')
    expect(resume.work).toHaveLength(1)
    expect(resume.work[0].name).toBe('Acme Corp')
  })

  it('updateBasics merges partial basics without overwriting other fields', () => {
    // Set initial data
    const initial = ResumeDataSchema.parse({
      basics: { name: 'Jane Doe', email: 'jane@example.com', phone: '+1-555-0100' },
    })
    act(() => {
      useResumeStore.getState().setResume(initial)
    })

    // Update only email — name and phone should remain
    act(() => {
      useResumeStore.getState().updateBasics({ email: 'jane.new@example.com' })
    })

    const { resume } = useResumeStore.getState()
    expect(resume.basics.name).toBe('Jane Doe')
    expect(resume.basics.email).toBe('jane.new@example.com')
    expect(resume.basics.phone).toBe('+1-555-0100')
  })

  it('reset restores the default empty resume', () => {
    // Set some data first
    act(() => {
      useResumeStore.getState().setResume(
        ResumeDataSchema.parse({
          basics: { name: 'Test User' },
          work: [{ name: 'Test Corp' }],
        })
      )
    })

    // Reset
    act(() => {
      useResumeStore.getState().reset()
    })

    const { resume } = useResumeStore.getState()
    expect(resume.basics.name).toBe('')
    expect(resume.work).toEqual([])
  })

  it('persists state to localStorage under key cv-builder-resume after setResume', async () => {
    act(() => {
      useResumeStore.getState().setResume(
        ResumeDataSchema.parse({
          basics: { name: 'Persisted User' },
        })
      )
    })

    // Zustand persist middleware writes to localStorage asynchronously
    // Wait a tick for the persist to flush
    await new Promise((resolve) => setTimeout(resolve, 50))

    const stored = localStorage.getItem(STORAGE_KEY)
    expect(stored).not.toBeNull()

    const parsed = JSON.parse(stored!)
    expect(parsed.state.resume.basics.name).toBe('Persisted User')
  })

  it('reads persisted state from localStorage on creation (simulating page refresh)', async () => {
    // Write data to localStorage as if a previous session saved it
    const persistedData = {
      state: {
        resume: ResumeDataSchema.parse({
          basics: { name: 'Returning User' },
          skills: [{ name: 'TypeScript' }],
        }),
      },
      version: 1,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedData))

    // Force rehydration
    await act(async () => {
      await useResumeStore.persist.rehydrate()
    })

    const { resume } = useResumeStore.getState()
    expect(resume.basics.name).toBe('Returning User')
    expect(resume.skills).toHaveLength(1)
    expect(resume.skills[0].name).toBe('TypeScript')
  })

  it('persist config has version: 1', () => {
    const options = useResumeStore.persist.getOptions()
    expect(options.version).toBe(1)
  })
})
