'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useResumeStore } from '@/lib/store/resume-store'
import { useHydration } from '@/hooks/use-hydration'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ContactInfo } from '@/types/resume'

export function ContactForm() {
  const hydrated = useHydration()
  const resume = useResumeStore((s) => s.resume)
  const updateBasics = useResumeStore((s) => s.updateBasics)

  const form = useForm<ContactInfo>({
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
    return <div className="space-y-4 animate-pulse"><div className="h-10 bg-muted rounded-lg" /><div className="h-10 bg-muted rounded-lg" /><div className="h-10 bg-muted rounded-lg" /></div>
  }

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Contact Information</h2>
        <p className="text-sm text-muted-foreground mb-5">Your name and professional title</p>
        <div className="space-y-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">Full Name</Label>
                <Input {...field} id="name" placeholder="John Doe" className="bg-card" />
              </div>
            )}
          />

          <Controller
            name="label"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label htmlFor="label" className="text-xs font-medium text-muted-foreground">Title</Label>
                <Input {...field} id="label" value={field.value ?? ''} placeholder="Senior Software Engineer" className="bg-card" />
              </div>
            )}
          />
        </div>
      </div>

      <div className="border-t border-border/50 pt-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">Contact Details</h3>
        <p className="text-xs text-muted-foreground mb-4">How employers can reach you</p>
        <div className="space-y-4">
          <Controller
            name="email"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</Label>
                <Input {...field} id="email" type="email" value={field.value ?? ''} placeholder="john@example.com" className="bg-card" />
              </div>
            )}
          />

          <Controller
            name="phone"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">Phone</Label>
                <Input {...field} id="phone" type="tel" value={field.value ?? ''} placeholder="+1 (555) 123-4567" className="bg-card" />
              </div>
            )}
          />

          <Controller
            name="url"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label htmlFor="url" className="text-xs font-medium text-muted-foreground">Website / LinkedIn</Label>
                <Input {...field} id="url" type="url" value={field.value ?? ''} placeholder="https://linkedin.com/in/johndoe" className="bg-card" />
              </div>
            )}
          />
        </div>
      </div>

      <div className="border-t border-border/50 pt-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">Location</h3>
        <p className="text-xs text-muted-foreground mb-4">Where you are based</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="location.city"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-medium text-muted-foreground">City</Label>
                <Input {...field} id="city" value={field.value ?? ''} placeholder="San Francisco" className="bg-card" />
              </div>
            )}
          />

          <Controller
            name="location.region"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label htmlFor="region" className="text-xs font-medium text-muted-foreground">State / Region</Label>
                <Input {...field} id="region" value={field.value ?? ''} placeholder="CA" className="bg-card" />
              </div>
            )}
          />
        </div>
      </div>
    </form>
  )
}
