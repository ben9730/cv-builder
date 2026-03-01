'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { CertificateEntrySchema } from '@/lib/schema/resume-schema'
import { useResumeStore } from '@/lib/store/resume-store'
import { useHydration } from '@/hooks/use-hydration'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { EntryCard } from '@/components/editor/entry-card'

const CertificationsFormSchema = z.object({
  certificates: z.array(CertificateEntrySchema),
})

type CertificationsFormValues = z.infer<typeof CertificationsFormSchema>

export function CertificationsForm() {
  const hydrated = useHydration()
  const resume = useResumeStore((s) => s.resume)
  const updateSection = useResumeStore((s) => s.updateSection)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const form = useForm<CertificationsFormValues>({
    defaultValues: { certificates: resume.certificates ?? [] },
    mode: 'onBlur',
  })

  const { fields, append, remove, insert } = useFieldArray({
    control: form.control,
    name: 'certificates',
  })

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.certificates) updateSection('certificates', value.certificates as any[])
    })
    return () => subscription.unsubscribe()
  }, [form, updateSection])

  const handleAdd = () => { append(CertificateEntrySchema.parse({})); setExpandedIndex(fields.length) }
  const handleRemove = (index: number) => {
    const removed = form.getValues(`certificates.${index}`)
    remove(index)
    if (expandedIndex === index) setExpandedIndex(null)
    else if (expandedIndex !== null && expandedIndex > index) setExpandedIndex(expandedIndex - 1)
    toast('Certification removed', { action: { label: 'Undo', onClick: () => insert(index, removed) }, duration: 5000 })
  }

  if (!hydrated) return <div className="animate-pulse h-20 bg-muted rounded" />

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Certifications</h2>
      {fields.length === 0 && <p className="text-sm text-muted-foreground py-4">No certifications yet.</p>}
      <div className="space-y-3">
        {fields.map((field, index) => {
          const values = form.watch(`certificates.${index}`)
          return (
            <EntryCard key={field.id} expanded={expandedIndex === index} onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)} onRemove={() => handleRemove(index)} summary={values?.name || ''}>
              <div className="space-y-4">
                <Controller name={`certificates.${index}.name`} control={form.control} render={({ field }) => (<div className="space-y-2"><Label htmlFor={`cert-${index}-name`}>Certification Name</Label><Input {...field} id={`cert-${index}-name`} placeholder="AWS Solutions Architect" /></div>)} />
                <Controller name={`certificates.${index}.issuer`} control={form.control} render={({ field }) => (<div className="space-y-2"><Label htmlFor={`cert-${index}-issuer`}>Issuer</Label><Input {...field} id={`cert-${index}-issuer`} value={field.value ?? ''} placeholder="Amazon Web Services" /></div>)} />
                <Controller name={`certificates.${index}.date`} control={form.control} render={({ field }) => (<div className="space-y-2"><Label htmlFor={`cert-${index}-date`}>Date</Label><Input {...field} id={`cert-${index}-date`} value={field.value ?? ''} placeholder="2023-06" /></div>)} />
                <Controller name={`certificates.${index}.url`} control={form.control} render={({ field }) => (<div className="space-y-2"><Label htmlFor={`cert-${index}-url`}>URL</Label><Input {...field} id={`cert-${index}-url`} value={field.value ?? ''} placeholder="https://..." /></div>)} />
              </div>
            </EntryCard>
          )
        })}
      </div>
      <Button variant="outline" onClick={handleAdd}><Plus className="size-4 mr-2" />Add Certification</Button>
    </div>
  )
}
