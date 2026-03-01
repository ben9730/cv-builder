'use client'

import { useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { LanguageEntrySchema } from '@/lib/schema/resume-schema'
import { useResumeStore } from '@/lib/store/resume-store'
import { useHydration } from '@/hooks/use-hydration'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const LanguagesFormSchema = z.object({
  languages: z.array(LanguageEntrySchema),
})

type LanguagesFormValues = z.infer<typeof LanguagesFormSchema>

export function LanguagesForm() {
  const hydrated = useHydration()
  const resume = useResumeStore((s) => s.resume)
  const updateSection = useResumeStore((s) => s.updateSection)

  const form = useForm<LanguagesFormValues>({
    defaultValues: { languages: resume.languages ?? [] },
    mode: 'onBlur',
  })

  const { fields, append, remove, insert } = useFieldArray({
    control: form.control,
    name: 'languages',
  })

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.languages) updateSection('languages', value.languages as any[])
    })
    return () => subscription.unsubscribe()
  }, [form, updateSection])

  const handleAdd = () => {
    append(LanguageEntrySchema.parse({}))
  }

  const handleRemove = (index: number) => {
    const removed = form.getValues(`languages.${index}`)
    remove(index)
    toast('Language removed', {
      action: { label: 'Undo', onClick: () => insert(index, removed) },
      duration: 5000,
    })
  }

  if (!hydrated) return <div className="animate-pulse h-20 bg-muted rounded" />

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Languages</h2>
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground py-4">No languages added yet.</p>
      )}
      <div className="space-y-3">
        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardContent className="pt-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Controller
                    name={`languages.${index}.language`}
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor={`lang-${index}-name`}>Language</Label>
                        <Input {...field} id={`lang-${index}-name`} placeholder="English" />
                      </div>
                    )}
                  />
                </div>
                <div className="flex-1">
                  <Controller
                    name={`languages.${index}.fluency`}
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor={`lang-${index}-fluency`}>Fluency</Label>
                        <Input {...field} id={`lang-${index}-fluency`} value={field.value ?? ''} placeholder="Native speaker" />
                      </div>
                    )}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 mb-0.5"
                  onClick={() => handleRemove(index)}
                >
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button variant="outline" onClick={handleAdd}>
        <Plus className="size-4 mr-2" />
        Add Language
      </Button>
    </div>
  )
}
