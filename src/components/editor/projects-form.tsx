'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ProjectEntrySchema } from '@/lib/schema/resume-schema'
import { useResumeStore } from '@/lib/store/resume-store'
import { useHydration } from '@/hooks/use-hydration'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { EntryCard } from '@/components/editor/entry-card'
import { TagInput } from '@/components/shared/tag-input'

const ProjectsFormSchema = z.object({
  projects: z.array(ProjectEntrySchema),
})

type ProjectsFormValues = z.infer<typeof ProjectsFormSchema>

export function ProjectsForm() {
  const hydrated = useHydration()
  const resume = useResumeStore((s) => s.resume)
  const updateSection = useResumeStore((s) => s.updateSection)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const form = useForm<ProjectsFormValues>({
    defaultValues: { projects: resume.projects ?? [] },
    mode: 'onBlur',
  })

  const { fields, append, remove, insert } = useFieldArray({
    control: form.control,
    name: 'projects',
  })

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.projects) updateSection('projects', value.projects as any[])
    })
    return () => subscription.unsubscribe()
  }, [form, updateSection])

  const handleAdd = () => {
    append(ProjectEntrySchema.parse({}))
    setExpandedIndex(fields.length)
  }

  const handleRemove = (index: number) => {
    const removed = form.getValues(`projects.${index}`)
    remove(index)
    if (expandedIndex === index) setExpandedIndex(null)
    else if (expandedIndex !== null && expandedIndex > index) setExpandedIndex(expandedIndex - 1)
    toast('Project removed', {
      action: { label: 'Undo', onClick: () => insert(index, removed) },
      duration: 5000,
    })
  }

  const addHighlight = (entryIndex: number) => {
    const current = form.getValues(`projects.${entryIndex}.highlights`) || []
    form.setValue(`projects.${entryIndex}.highlights`, [...current, ''])
  }

  const removeHighlight = (entryIndex: number, bulletIndex: number) => {
    const current = form.getValues(`projects.${entryIndex}.highlights`) || []
    form.setValue(
      `projects.${entryIndex}.highlights`,
      current.filter((_, i) => i !== bulletIndex)
    )
  }

  if (!hydrated) return <div className="animate-pulse h-20 bg-muted rounded" />

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Projects</h2>
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground py-4">No projects yet.</p>
      )}
      <div className="space-y-3">
        {fields.map((field, index) => {
          const values = form.watch(`projects.${index}`)
          return (
            <EntryCard
              key={field.id}
              expanded={expandedIndex === index}
              onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
              onRemove={() => handleRemove(index)}
              summary={values?.name || ''}
            >
              <div className="space-y-4">
                <Controller
                  name={`projects.${index}.name`}
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor={`proj-${index}-name`}>Project Name</Label>
                      <Input {...field} id={`proj-${index}-name`} placeholder="My Open Source Project" />
                    </div>
                  )}
                />
                <Controller
                  name={`projects.${index}.description`}
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor={`proj-${index}-desc`}>Description</Label>
                      <Textarea
                        {...field}
                        id={`proj-${index}-desc`}
                        value={field.value ?? ''}
                        placeholder="Brief description of the project..."
                        rows={3}
                      />
                    </div>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Controller
                    name={`projects.${index}.startDate`}
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor={`proj-${index}-start`}>Start Date</Label>
                        <Input {...field} id={`proj-${index}-start`} value={field.value ?? ''} placeholder="2023-01" />
                      </div>
                    )}
                  />
                  <Controller
                    name={`projects.${index}.endDate`}
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor={`proj-${index}-end`}>End Date</Label>
                        <Input {...field} id={`proj-${index}-end`} value={field.value ?? ''} placeholder="Present" />
                      </div>
                    )}
                  />
                </div>
                <Controller
                  name={`projects.${index}.url`}
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor={`proj-${index}-url`}>URL</Label>
                      <Input {...field} id={`proj-${index}-url`} value={field.value ?? ''} placeholder="https://github.com/..." />
                    </div>
                  )}
                />

                <Separator />

                <Controller
                  name={`projects.${index}.keywords`}
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label>Technologies</Label>
                      <TagInput
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="Add technology..."
                      />
                    </div>
                  )}
                />

                <Separator />

                <div className="space-y-2">
                  <Label>Highlights</Label>
                  {(values?.highlights || []).map((_, bulletIndex) => (
                    <div key={bulletIndex} className="flex gap-2">
                      <Controller
                        name={`projects.${index}.highlights.${bulletIndex}`}
                        control={form.control}
                        render={({ field }) => (
                          <Input {...field} placeholder="Describe an achievement..." className="flex-1" />
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
        Add Project
      </Button>
    </div>
  )
}
