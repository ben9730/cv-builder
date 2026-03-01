'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ContactSchema } from '@/lib/schema/resume-schema'
import { useResumeStore } from '@/lib/store/resume-store'
import { useHydration } from '@/hooks/use-hydration'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { ContactInfo } from '@/types/resume'

export function ContactForm() {
  const hydrated = useHydration()
  const resume = useResumeStore((s) => s.resume)
  const updateBasics = useResumeStore((s) => s.updateBasics)

  const form = useForm<ContactInfo>({
    resolver: zodResolver(ContactSchema),
    defaultValues: resume.basics,
    mode: 'onBlur',
  })

  useEffect(() => {
    const subscription = form.watch((value) => {
      updateBasics(value as Partial<ContactInfo>)
    })
    return () => subscription.unsubscribe()
  }, [form, updateBasics])

  if (!hydrated) {
    return <div className="space-y-4 animate-pulse"><div className="h-10 bg-muted rounded" /><div className="h-10 bg-muted rounded" /><div className="h-10 bg-muted rounded" /></div>
  }

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div>
        <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
        <div className="space-y-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input {...field} id="name" placeholder="John Doe" />
              </div>
            )}
          />

          <Controller
            name="label"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="label">Title</Label>
                <Input {...field} id="label" value={field.value ?? ''} placeholder="Senior Software Engineer" />
              </div>
            )}
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Contact Details</h3>
        <div className="space-y-4">
          <Controller
            name="email"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input {...field} id="email" type="email" value={field.value ?? ''} placeholder="john@example.com" />
              </div>
            )}
          />

          <Controller
            name="phone"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input {...field} id="phone" type="tel" value={field.value ?? ''} placeholder="+1 (555) 123-4567" />
              </div>
            )}
          />

          <Controller
            name="url"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="url">Website / LinkedIn</Label>
                <Input {...field} id="url" type="url" value={field.value ?? ''} placeholder="https://linkedin.com/in/johndoe" />
              </div>
            )}
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Location</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="location.city"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input {...field} id="city" value={field.value ?? ''} placeholder="San Francisco" />
              </div>
            )}
          />

          <Controller
            name="location.region"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="region">State / Region</Label>
                <Input {...field} id="region" value={field.value ?? ''} placeholder="CA" />
              </div>
            )}
          />
        </div>
      </div>
    </form>
  )
}
