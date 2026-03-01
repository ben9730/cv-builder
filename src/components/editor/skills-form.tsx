'use client'

import { useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { SkillEntrySchema } from '@/lib/schema/resume-schema'
import { useResumeStore } from '@/lib/store/resume-store'
import { useHydration } from '@/hooks/use-hydration'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { TagInput } from '@/components/shared/tag-input'
import type { SkillEntry } from '@/types/resume'

const SkillsFormSchema = z.object({
  skills: z.array(SkillEntrySchema),
})

type SkillsFormValues = z.infer<typeof SkillsFormSchema>

export function SkillsForm() {
  const hydrated = useHydration()
  const resume = useResumeStore((s) => s.resume)
  const updateSkills = useResumeStore((s) => s.updateSkills)

  const form = useForm<SkillsFormValues>({
    resolver: zodResolver(SkillsFormSchema),
    defaultValues: { skills: resume.skills },
    mode: 'onBlur',
  })

  const { fields, append, remove, insert } = useFieldArray({
    control: form.control,
    name: 'skills',
  })

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.skills) {
        updateSkills(value.skills as SkillEntry[])
      }
    })
    return () => subscription.unsubscribe()
  }, [form, updateSkills])

  const handleAddGroup = () => {
    append(SkillEntrySchema.parse({}))
  }

  const handleRemoveGroup = (index: number) => {
    const removed = form.getValues(`skills.${index}`)
    remove(index)
    toast('Skill group removed', {
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
      <h2 className="text-lg font-semibold">Skills</h2>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground py-4">
          No skill groups yet. Add a category (e.g., &quot;Frontend&quot;) and tag your skills.
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Controller
                    name={`skills.${index}.name`}
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor={`skill-${index}-name`}>Category</Label>
                        <Input {...field} id={`skill-${index}-name`} placeholder="e.g., Frontend, Backend, DevOps" />
                      </div>
                    )}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-7 shrink-0"
                  onClick={() => handleRemoveGroup(index)}
                >
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </div>

              <Controller
                name={`skills.${index}.keywords`}
                control={form.control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <TagInput
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Add skill..."
                    />
                  </div>
                )}
              />
            </CardContent>
            {index < fields.length - 1 && <Separator />}
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={handleAddGroup}>
        <Plus className="size-4 mr-2" />
        Add Skill Group
      </Button>
    </div>
  )
}
