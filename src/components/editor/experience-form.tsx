'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { WorkEntrySchema } from '@/lib/schema/resume-schema'
import { useResumeStore } from '@/lib/store/resume-store'
import { useHydration } from '@/hooks/use-hydration'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { EntryCard } from '@/components/editor/entry-card'
import type { WorkEntry } from '@/types/resume'

const ExperienceFormSchema = z.object({
  work: z.array(WorkEntrySchema),
})

type ExperienceFormValues = z.infer<typeof ExperienceFormSchema>

export function ExperienceForm() {
  const hydrated = useHydration()
  const resume = useResumeStore((s) => s.resume)
  const updateWork = useResumeStore((s) => s.updateWork)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(ExperienceFormSchema),
    defaultValues: { work: resume.work },
    mode: 'onBlur',
  })

  const { fields, append, remove, insert } = useFieldArray({
    control: form.control,
    name: 'work',
  })

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.work) {
        updateWork(value.work as WorkEntry[])
      }
    })
    return () => subscription.unsubscribe()
  }, [form, updateWork])

  const handleAddEntry = () => {
    append(WorkEntrySchema.parse({}))
    setExpandedIndex(fields.length)
  }

  const handleRemoveEntry = (index: number) => {
    const removed = form.getValues(`work.${index}`)
    remove(index)
    if (expandedIndex === index) setExpandedIndex(null)
    else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1)
    }
    toast('Experience removed', {
      action: {
        label: 'Undo',
        onClick: () => insert(index, removed),
      },
      duration: 5000,
    })
  }

  const addHighlight = (entryIndex: number) => {
    const current = form.getValues(`work.${entryIndex}.highlights`) || []
    form.setValue(`work.${entryIndex}.highlights`, [...current, ''])
  }

  const removeHighlight = (entryIndex: number, bulletIndex: number) => {
    const current = form.getValues(`work.${entryIndex}.highlights`) || []
    form.setValue(
      `work.${entryIndex}.highlights`,
      current.filter((_, i) => i !== bulletIndex)
    )
  }

  if (!hydrated) {
    return <div className="space-y-4 animate-pulse"><div className="h-20 bg-muted rounded" /></div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Work Experience</h2>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground py-4">
          No work experience entries yet. Add your first position below.
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const values = form.watch(`work.${index}`)
          const summary = values?.position && values?.name
            ? `${values.position} at ${values.name}`
            : values?.position || values?.name || ''

          return (
            <EntryCard
              key={field.id}
              expanded={expandedIndex === index}
              onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
              onRemove={() => handleRemoveEntry(index)}
              summary={summary}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Controller
                    name={`work.${index}.name`}
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor={`work-${index}-name`}>Employer</Label>
                        <Input {...field} id={`work-${index}-name`} placeholder="Company name" />
                      </div>
                    )}
                  />
                  <Controller
                    name={`work.${index}.position`}
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor={`work-${index}-position`}>Job Title</Label>
                        <Input {...field} id={`work-${index}-position`} placeholder="Software Engineer" />
                      </div>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Controller
                    name={`work.${index}.startDate`}
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor={`work-${index}-start`}>Start Date</Label>
                        <Input {...field} id={`work-${index}-start`} value={field.value ?? ''} placeholder="2020-01" />
                      </div>
                    )}
                  />
                  <Controller
                    name={`work.${index}.endDate`}
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor={`work-${index}-end`}>End Date</Label>
                        <Input {...field} id={`work-${index}-end`} value={field.value ?? ''} placeholder="Present" />
                      </div>
                    )}
                  />
                </div>

                <Controller
                  name={`work.${index}.location`}
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor={`work-${index}-location`}>Location</Label>
                      <Input {...field} id={`work-${index}-location`} value={field.value ?? ''} placeholder="San Francisco, CA" />
                    </div>
                  )}
                />

                <Separator />

                <div className="space-y-2">
                  <Label>Highlights</Label>
                  {(values?.highlights || []).map((_, bulletIndex) => (
                    <div key={bulletIndex} className="flex gap-2">
                      <Controller
                        name={`work.${index}.highlights.${bulletIndex}`}
                        control={form.control}
                        render={({ field }) => (
                          <Input {...field} placeholder="Describe an achievement or responsibility..." className="flex-1" />
                        )}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => removeHighlight(index, bulletIndex)}
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addHighlight(index)}
                    className="mt-1"
                  >
                    <Plus className="size-4 mr-1" />
                    Add bullet
                  </Button>
                </div>
              </div>
            </EntryCard>
          )
        })}
      </div>

      <Button variant="outline" onClick={handleAddEntry}>
        <Plus className="size-4 mr-2" />
        Add Experience
      </Button>
    </div>
  )
}
