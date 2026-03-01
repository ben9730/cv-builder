import { z } from 'zod'

// --- Individual Entry Schemas ---

export const ProfileSchema = z.object({
  network: z.string(),
  username: z.string(),
  url: z.string().optional(),
})

export const LocationSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  countryCode: z.string().optional(),
  postalCode: z.string().optional(),
})

export const ContactSchema = z.object({
  name: z.string().default(''),
  label: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  url: z.string().optional(),
  summary: z.string().optional(),
  location: LocationSchema.optional(),
  profiles: z.array(ProfileSchema).default([]),
})

export const WorkEntrySchema = z.object({
  name: z.string().default(''),
  position: z.string().default(''),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  url: z.string().optional(),
  location: z.string().optional(),
})

export const EducationEntrySchema = z.object({
  institution: z.string().default(''),
  area: z.string().optional(),
  studyType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  score: z.string().optional(),
  courses: z.array(z.string()).default([]),
  url: z.string().optional(),
})

export const SkillEntrySchema = z.object({
  name: z.string().default(''),
  level: z.string().optional(),
  keywords: z.array(z.string()).default([]),
})

// --- Optional Section Entry Schemas ---

export const CertificateEntrySchema = z.object({
  name: z.string().default(''),
  issuer: z.string().optional(),
  date: z.string().optional(),
  url: z.string().optional(),
})

export const ProjectEntrySchema = z.object({
  name: z.string().default(''),
  description: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  url: z.string().optional(),
  roles: z.array(z.string()).default([]),
})

export const LanguageEntrySchema = z.object({
  language: z.string().default(''),
  fluency: z.string().optional(),
})

export const VolunteerEntrySchema = z.object({
  organization: z.string().default(''),
  position: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  url: z.string().optional(),
})

// --- Pre-parsed defaults for nested objects ---
// Zod 4 .default() returns raw values without parsing nested defaults.
// We pre-parse to ensure all nested .default() values are applied.
const DEFAULT_BASICS = ContactSchema.parse({})

// --- Composite Resume Schema ---

export const ResumeDataSchema = z.object({
  basics: ContactSchema.default(DEFAULT_BASICS),
  work: z.array(WorkEntrySchema).default([]),
  education: z.array(EducationEntrySchema).default([]),
  skills: z.array(SkillEntrySchema).default([]),
  // Optional sections (FOUN-02)
  certificates: z.array(CertificateEntrySchema).optional(),
  projects: z.array(ProjectEntrySchema).optional(),
  languages: z.array(LanguageEntrySchema).optional(),
  volunteer: z.array(VolunteerEntrySchema).optional(),
})
