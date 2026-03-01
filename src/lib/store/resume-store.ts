'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  ResumeDataSchema,
  WorkEntrySchema,
  EducationEntrySchema,
  SkillEntrySchema,
  CertificateEntrySchema,
  ProjectEntrySchema,
  LanguageEntrySchema,
  VolunteerEntrySchema,
} from '@/lib/schema/resume-schema'
import type { ResumeData, WorkEntry, EducationEntry, SkillEntry } from '@/types/resume'

type OptionalSection = 'certificates' | 'projects' | 'languages' | 'volunteer'

const SECTION_SCHEMAS = {
  certificates: CertificateEntrySchema,
  projects: ProjectEntrySchema,
  languages: LanguageEntrySchema,
  volunteer: VolunteerEntrySchema,
} as const

interface ResumeStore {
  resume: ResumeData
  setResume: (data: ResumeData) => void
  updateBasics: (basics: Partial<ResumeData['basics']>) => void
  reset: () => void
  // Work experience
  updateWork: (work: WorkEntry[]) => void
  addWorkEntry: () => void
  removeWorkEntry: (index: number) => void
  // Education
  updateEducation: (education: EducationEntry[]) => void
  addEducationEntry: () => void
  removeEducationEntry: (index: number) => void
  // Skills
  updateSkills: (skills: SkillEntry[]) => void
  addSkillEntry: () => void
  removeSkillEntry: (index: number) => void
  // Optional sections
  enableSection: (section: OptionalSection) => void
  disableSection: (section: OptionalSection) => void
  updateSection: (section: OptionalSection, entries: unknown[]) => void
  addSectionEntry: (section: OptionalSection) => void
  removeSectionEntry: (section: OptionalSection, index: number) => void
}

const DEFAULT_RESUME: ResumeData = ResumeDataSchema.parse({})

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      resume: DEFAULT_RESUME,
      setResume: (data) => set({ resume: data }),
      updateBasics: (basics) =>
        set((state) => ({
          resume: {
            ...state.resume,
            basics: { ...state.resume.basics, ...basics },
          },
        })),
      reset: () => set({ resume: DEFAULT_RESUME }),

      // Work experience
      updateWork: (work) =>
        set((state) => ({ resume: { ...state.resume, work } })),
      addWorkEntry: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            work: [...state.resume.work, WorkEntrySchema.parse({})],
          },
        })),
      removeWorkEntry: (index) =>
        set((state) => ({
          resume: {
            ...state.resume,
            work: state.resume.work.filter((_, i) => i !== index),
          },
        })),

      // Education
      updateEducation: (education) =>
        set((state) => ({ resume: { ...state.resume, education } })),
      addEducationEntry: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            education: [...state.resume.education, EducationEntrySchema.parse({})],
          },
        })),
      removeEducationEntry: (index) =>
        set((state) => ({
          resume: {
            ...state.resume,
            education: state.resume.education.filter((_, i) => i !== index),
          },
        })),

      // Skills
      updateSkills: (skills) =>
        set((state) => ({ resume: { ...state.resume, skills } })),
      addSkillEntry: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            skills: [...state.resume.skills, SkillEntrySchema.parse({})],
          },
        })),
      removeSkillEntry: (index) =>
        set((state) => ({
          resume: {
            ...state.resume,
            skills: state.resume.skills.filter((_, i) => i !== index),
          },
        })),

      // Optional sections
      enableSection: (section) =>
        set((state) => ({
          resume: { ...state.resume, [section]: [] },
        })),
      disableSection: (section) =>
        set((state) => ({
          resume: { ...state.resume, [section]: undefined },
        })),
      updateSection: (section, entries) =>
        set((state) => ({
          resume: { ...state.resume, [section]: entries },
        })),
      addSectionEntry: (section) =>
        set((state) => {
          const current = (state.resume[section] as unknown[]) ?? []
          const schema = SECTION_SCHEMAS[section]
          return {
            resume: {
              ...state.resume,
              [section]: [...current, schema.parse({})],
            },
          }
        }),
      removeSectionEntry: (section, index) =>
        set((state) => {
          const current = (state.resume[section] as unknown[]) ?? []
          return {
            resume: {
              ...state.resume,
              [section]: current.filter((_, i) => i !== index),
            },
          }
        }),
    }),
    {
      name: 'cv-builder-resume',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
