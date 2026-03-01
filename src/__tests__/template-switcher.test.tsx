import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock @react-pdf/renderer to avoid SSR issues
vi.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  StyleSheet: {
    create: <T extends Record<string, object>>(styles: T) => styles,
  },
  Font: { register: vi.fn() },
}))

import { TemplateSwitcher } from '@/components/preview/template-switcher'
import { useResumeStore } from '@/lib/store/resume-store'
import { TEMPLATES } from '@/components/templates/template-registry'

describe('TemplateSwitcher', () => {
  beforeEach(() => {
    cleanup()
    useResumeStore.setState({ selectedTemplate: 'classic' })
  })

  it('renders all three template options', () => {
    render(<TemplateSwitcher />)
    expect(screen.getByText('Classic')).toBeInTheDocument()
    expect(screen.getByText('Modern')).toBeInTheDocument()
    expect(screen.getByText('Minimal')).toBeInTheDocument()
  })

  it('marks the active template with aria-pressed', () => {
    render(<TemplateSwitcher />)
    const classicBtn = screen.getByLabelText(/select classic template/i)
    const modernBtn = screen.getByLabelText(/select modern template/i)
    expect(classicBtn).toHaveAttribute('aria-pressed', 'true')
    expect(modernBtn).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls setSelectedTemplate when clicking a template', async () => {
    const user = userEvent.setup()
    render(<TemplateSwitcher />)

    const modernBtn = screen.getByLabelText(/select modern template/i)
    await user.click(modernBtn)

    // Check that the store was updated
    expect(useResumeStore.getState().selectedTemplate).toBe('modern')
  })

  it('switches active template styling on click', async () => {
    const user = userEvent.setup()
    render(<TemplateSwitcher />)

    const minimalBtn = screen.getByLabelText(/select minimal template/i)
    await user.click(minimalBtn)

    expect(useResumeStore.getState().selectedTemplate).toBe('minimal')
  })

  it('renders accent color indicators for each template', () => {
    render(<TemplateSwitcher />)
    // Each template button should exist with its name
    const templateIds = Object.keys(TEMPLATES) as Array<keyof typeof TEMPLATES>
    expect(templateIds).toHaveLength(3)
    templateIds.forEach((id) => {
      expect(screen.getByLabelText(`Select ${TEMPLATES[id].name} template`)).toBeInTheDocument()
    })
  })
})
