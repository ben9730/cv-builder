import type { z } from 'zod'
import type {
  ResumeDataSchema,
  ContactSchema,
  WorkEntrySchema,
  EducationEntrySchema,
  SkillEntrySchema,
  CertificateEntrySchema,
  ProjectEntrySchema,
  LanguageEntrySchema,
  VolunteerEntrySchema,
  ProfileSchema,
  LocationSchema,
} from '@/lib/schema/resume-schema'

export type ResumeData = z.infer<typeof ResumeDataSchema>
export type ContactInfo = z.infer<typeof ContactSchema>
export type WorkEntry = z.infer<typeof WorkEntrySchema>
export type EducationEntry = z.infer<typeof EducationEntrySchema>
export type SkillEntry = z.infer<typeof SkillEntrySchema>
export type CertificateEntry = z.infer<typeof CertificateEntrySchema>
export type ProjectEntry = z.infer<typeof ProjectEntrySchema>
export type LanguageEntry = z.infer<typeof LanguageEntrySchema>
export type VolunteerEntry = z.infer<typeof VolunteerEntrySchema>
export type Profile = z.infer<typeof ProfileSchema>
export type Location = z.infer<typeof LocationSchema>
export type { TemplateId } from '@/components/templates/template-registry'
