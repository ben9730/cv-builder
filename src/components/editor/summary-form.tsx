'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useResumeStore } from '@/lib/store/resume-store'
import { useHydration } from '@/hooks/use-hydration'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface SummaryFormValues {
  summary: string
}

export function SummaryForm() {
  const hydrated = useHydration()
  const resume = useResumeStore((s) => s.resume)
  const updateBasics = useResumeStore((s) => s.updateBasics)

  const form = useForm<SummaryFormValues>({
    defaultValues: { summary: resume.basics.summary ?? '' },
    mode: 'onBlur',
  })

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.summary !== undefined) {
        updateBasics({ summary: value.summary })
      }
    })
    return () => subscription.unsubscribe()
  }, [form, updateBasics])

  if (!hydrated) {
    return <div className="space-y-4 animate-pulse"><div className="h-32 bg-muted rounded" /></div>
  }

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <h2 className="text-lg font-semibold">Summary</h2>
      <Controller
        name="summary"
        control={form.control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="summary">Professional Summary</Label>
            <Textarea
              {...field}
              id="summary"
              rows={6}
              placeholder="A brief summary of your professional background, key skills, and career objectives..."
              className="resize-y"
            />
            <p className="text-xs text-muted-foreground">
              2-4 sentences highlighting your experience and what you bring to a role.
            </p>
          </div>
        )}
      />
    </form>
  )
}
