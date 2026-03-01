'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { VolunteerEntrySchema } from '@/lib/schema/resume-schema'
import { useResumeStore } from '@/lib/store/resume-store'
import { useHydration } from '@/hooks/use-hydration'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { EntryCard } from '@/components/editor/entry-card'

const VolunteerFormSchema = z.object({
  volunteer: z.array(VolunteerEntrySchema),
})

type VolunteerFormValues = z.infer<typeof VolunteerFormSchema>

export function VolunteerForm() {
  const hydrated = useHydration()
  const resume = useResumeStore((s) => s.resume)
  const updateSection = useResumeStore((s) => s.updateSection)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const form = useForm<VolunteerFormValues>({
    defaultValues: { volunteer: resume.volunteer ?? [] },
    mode: 'onBlur',
  })

  const { fields, append, remove, insert } = useFieldArray({
    control: form.control,
    name: 'volunteer',
  })

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.volunteer) updateSection('volunteer', value.volunteer as any[])
    })
    return () => subscription.unsubscribe()
  }, [form, updateSection])

  const handleAdd = () => {
    append(VolunteerEntrySchema.parse({}))
    setExpandedIndex(fields.length)
  }

  const handleRemove = (index: number) => {
    const removed = form.getValues(`volunteer.${index}`)
    remove(index)
    if (expandedIndex === index) setExpandedIndex(null)
    else if (expandedIndex !== null && expandedIndex > index) setExpandedIndex(expandedIndex - 1)
    toast('Volunteer entry removed', {
      action: { label: 'Undo', onClick: () => insert(index, removed) },
      duration: 5000,
    })
  }

  const addHighlight = (entryIndex: number) => {
    const current = form.getValues(`volunteer.${entryIndex}.highlights`) || []
    form.setValue(`volunteer.${entryIndex}.highlights`, [...current, ''])
  }

  const removeHighlight = (entryIndex: number, bulletIndex: number) => {
    const current = form.getValues(`volunteer.${entryIndex}.highlights`) || []
    form.setValue(
      `volunteer.${entryIndex}.highlights`,
      current.filter((_, i) => i !== bulletIndex)
    )
  }

  if (!hydrated) return <div className="animate-pulse h-20 bg-muted rounded" />

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Volunteer Experience</h2>
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground py-4">No volunteer experience yet.</p>
      )}
      <div className="space-y-3">
        {fields.map((field, index) => {
          const values = form.watch(`volunteer.${index}`)
          const summary = values?.position && values?.organization
            ? `${values.position} at ${values.organization}`
            : values?.position || values?.organization || ''
          return (
            <EntryCard
              key={field.id}
              expanded={expandedIndex === index}
              onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
              onRemove={() => handleRemove(index)}
              summary={summary}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Controller
                    name={`volunteer.${index}.organization`}
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor={`vol-${index}-org`}>Organization</Label>
                        <Input {...field} id={`vol-${index}-org`} placeholder="Red Cross" />
                      </div>
                    )}
                  />
                  <Controller
                    name={`volunteer.${index}.position`}
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor={`vol-${index}-pos`}>Position</Label>
                        <Input {...field} id={`vol-${index}-pos`} value={field.value ?? ''} placeholder="Volunteer Coordinator" />
                      </div>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Controller
                    name={`volunteer.${index}.startDate`}
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor={`vol-${index}-start`}>Start Date</Label>
                        <Input {...field} id={`vol-${index}-start`} value={field.value ?? ''} placeholder="2022-06" />
                      </div>
                    )}
                  />
                  <Controller
                    name={`volunteer.${index}.endDate`}
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor={`vol-${index}-end`}>End Date</Label>
                        <Input {...field} id={`vol-${index}-end`} value={field.value ?? ''} placeholder="Present" />
                      </div>
                    )}
                  />
                </div>
                <Controller
                  name={`volunteer.${index}.url`}
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor={`vol-${index}-url`}>URL</Label>
                      <Input {...field} id={`vol-${index}-url`} value={field.value ?? ''} placeholder="https://..." />
                    </div>
                  )}
                />

                <Separator />

                <div className="space-y-2">
                  <Label>Highlights</Label>
                  {(values?.highlights || []).map((_, bulletIndex) => (
                    <div key={bulletIndex} className="flex gap-2">
                      <Controller
                        name={`volunteer.${index}.highlights.${bulletIndex}`}
                        control={form.control}
                        render={({ field }) => (
                          <Input {...field} placeholder="Describe an achievement or contribution..." className="flex-1" />
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
                  <Button variant="outline" size="sm" onClick={() => addHighlight(index)} className="mt-1">
                    <Plus className="size-4 mr-1" />
                    Add bullet
                  </Button>
                </div>
              </div>
            </EntryCard>
          )
        })}
      </div>
      <Button variant="outline" onClick={handleAdd}>
        <Plus className="size-4 mr-2" />
        Add Volunteer Entry
      </Button>
    </div>
  )
}
