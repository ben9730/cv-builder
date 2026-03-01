'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { EducationEntrySchema } from '@/lib/schema/resume-schema'
import { useResumeStore } from '@/lib/store/resume-store'
import { useHydration } from '@/hooks/use-hydration'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { EntryCard } from '@/components/editor/entry-card'
import type { EducationEntry } from '@/types/resume'

const EducationFormSchema = z.object({
  education: z.array(EducationEntrySchema),
})

type EducationFormValues = z.infer<typeof EducationFormSchema>

export function EducationForm() {
  const hydrated = useHydration()
  const resume = useResumeStore((s) => s.resume)
  const updateEducation = useResumeStore((s) => s.updateEducation)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const form = useForm<EducationFormValues>({
    defaultValues: { education: resume.education },
    mode: 'onBlur',
  })

  const { fields, append, remove, insert } = useFieldArray({
    control: form.control,
    name: 'education',
  })

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.education) {
        updateEducation(value.education as EducationEntry[])
      }
    })
    return () => subscription.unsubscribe()
  }, [form, updateEducation])

  const handleAddEntry = () => {
    append(EducationEntrySchema.parse({}))
    setExpandedIndex(fields.length)
  }

  const handleRemoveEntry = (index: number) => {
    const removed = form.getValues(`education.${index}`)
    remove(index)
    if (expandedIndex === index) setExpandedIndex(null)
    else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1)
    }
    toast('Education entry removed', {
      action: {
        label: 'Undo',
        onClick: () => insert(index, removed),
      },
      duration: 5000,
    })
  }

  if (!hydrated) {
    return <div className="space-y-4 animate-pulse"><div className="h-20 bg-muted rounded" /></div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Education</h2>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground py-4">
          No education entries yet. Add your first degree or certification below.
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const values = form.watch(`education.${index}`)
          const summary = values?.studyType && values?.area
            ? `${values.studyType} in ${values.area}`
            : values?.institution || ''

          return (
            <EntryCard
              key={field.id}
              expanded={expandedIndex === index}
              onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
              onRemove={() => handleRemoveEntry(index)}
              summary={summary}
            >
              <div className="space-y-4">
                <Controller
                  name={`education.${index}.institution`}
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor={`edu-${index}-institution`}>Institution</Label>
                      <Input {...field} id={`edu-${index}-institution`} placeholder="University name" />
                    </div>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Controller
                    name={`education.${index}.studyType`}
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor={`edu-${index}-type`}>Degree</Label>
                        <Input {...field} id={`edu-${index}-type`} value={field.value ?? ''} placeholder="Bachelor's" />
                      </div>
                    )}
                  />
                  <Controller
                    name={`education.${index}.area`}
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor={`edu-${index}-area`}>Field of Study</Label>
                        <Input {...field} id={`edu-${index}-area`} value={field.value ?? ''} placeholder="Computer Science" />
                      </div>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Controller
                    name={`education.${index}.startDate`}
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor={`edu-${index}-start`}>Start Date</Label>
                        <Input {...field} id={`edu-${index}-start`} value={field.value ?? ''} placeholder="2016-09" />
                      </div>
                    )}
                  />
                  <Controller
                    name={`education.${index}.endDate`}
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor={`edu-${index}-end`}>End Date</Label>
                        <Input {...field} id={`edu-${index}-end`} value={field.value ?? ''} placeholder="2020-06" />
                      </div>
                    )}
                  />
                </div>

                <Controller
                  name={`education.${index}.score`}
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor={`edu-${index}-score`}>GPA</Label>
                      <Input {...field} id={`edu-${index}-score`} value={field.value ?? ''} placeholder="3.8" />
                    </div>
                  )}
                />
              </div>
            </EntryCard>
          )
        })}
      </div>

      <Button variant="outline" onClick={handleAddEntry}>
        <Plus className="size-4 mr-2" />
        Add Education
      </Button>
    </div>
  )
}
